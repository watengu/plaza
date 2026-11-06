import Link from "next/link";
import { sql } from "@/lib/db";
import { agoLabel, remainingLabel, ttlClass } from "@/lib/format";
import { NewCards, WriteFab, type NewCard } from "@/app/new-cards";

export const dynamic = "force-dynamic";

type BoardRow = {
  slug: string; name: string; icon: string; is_open: boolean;
  live_count: number; latest_at: string | null; thread_count: number;
};
type ExpiringRow = {
  id: number; author_name: string; body: string; expires_at: string;
  board_name: string; thread_id: number;
};

const BOARD_PHOTO: Record<string, string> = {
  beauty: "/images/luce.jpg",
  chat: "/images/hero.jpg",
};

export default async function HomePage() {
  let boards: BoardRow[] = [];
  let expiring: ExpiringRow[] = [];
  let notice: string | null = null;
  let todayCount = 0;
  let latest: NewCard[] = [];
  if (sql) {
    boards = (await sql`
      select b.slug, b.name, b.icon, b.is_open,
        count(p.id) filter (where p.expires_at > now())::int as live_count,
        max(p.created_at) as latest_at,
        count(distinct t.id)::int as thread_count
      from boards b
      left join threads t on t.board_id = b.id
      left join posts p on p.thread_id = t.id
      group by b.id
      order by b.display_order
    `) as BoardRow[];
    expiring = (await sql`
      select p.id, p.author_name, p.body, p.expires_at, p.thread_id,
        b.name as board_name
      from posts p
      join threads t on t.id = p.thread_id
      join boards b on b.id = t.board_id
      where p.expires_at > now() and p.expires_at <= now() + interval '3 hours'
      order by p.expires_at asc
      limit 10
    `) as ExpiringRow[];
    const notices = (await sql`
      select body from notices where is_active order by id desc limit 1
    `) as { body: string }[];
    notice = notices[0]?.body ?? null;
    const today = (await sql`
      select count(*)::int as c from posts
      where expires_at > now()
        and (expires_at at time zone 'Asia/Tokyo')::date = (now() at time zone 'Asia/Tokyo')::date
    `) as { c: number }[];
    todayCount = today[0]?.c ?? 0;
    const latestRows = (await sql`
      select p.id, p.author_name, p.body, p.created_at, p.expires_at, p.thread_id,
        b.name as board_name
      from posts p
      join threads t on t.id = p.thread_id
      join boards b on b.id = t.board_id
      where p.expires_at > now()
      order by p.created_at desc
      limit 5
    `) as Omit<NewCard, "ttl_label" | "ttl_class">[];
    latest = latestRows.map((r) => ({
      ...r,
      created_at: new Date(r.created_at).toISOString(),
      expires_at: new Date(r.expires_at).toISOString(),
      ttl_label: remainingLabel(r.expires_at),
      ttl_class: ttlClass(r.expires_at),
    }));
  }

  const openBoards = boards.filter((b) => b.is_open);

  return (
    <main>
      <header className="top">
        <h1>広場</h1>
        <span className="sub">投稿は24時間で消えます</span>
      </header>

      {/* FV */}
      <section className="fv">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/salon.jpg" alt="" />
        <div className="fv-ov">
          <div className="fv-kick">マァスゥの広場</div>
          <p className="fv-claim">今日の話は、<br />今日しかできない。</p>
          <p className="fv-sub">登録はいりません。表示名だけで書けて、カードは24時間で消えます。</p>
          <a className="fv-cta" href="#boards">＋ 流す</a>
          <a className="fv-cta2" href="#flow">流れているカードを見る ↓</a>
        </div>
      </section>

      {/* 流れている実物 */}
      <div id="flow" className="proof-head">
        <h2 className="sec-h">開いた瞬間、もう流れている。</h2>
        <p className="today-line" style={{ padding: "8px 0 0" }}>
          {todayCount > 0
            ? <>今日消えるカード <span className="n num">{todayCount}</span> 枚</>
            : "今日消えるカードはありません"}
        </p>
      </div>

      {notice && (
        <div style={{ padding: "0 14px" }}>
          <div className="notice"><span className="pin">お知らせ</span>{notice}</div>
        </div>
      )}

      {expiring.length > 0 && (
        <>
          <div className="strip-title">🔥 まもなく消える</div>
          <div className="strip">
            {expiring.map((p) => (
              <Link key={p.id} href={`/thread/${p.thread_id}`} className="card">
                <div className="who">
                  <div className="avatar">🐹</div>
                  <div>
                    <div className="name">{p.author_name}</div>
                    <div className="genre">{p.board_name}</div>
                  </div>
                </div>
                <div className="body">{p.body}</div>
                <span className={ttlClass(p.expires_at)}>{remainingLabel(p.expires_at)}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <NewCards cards={latest} />
      {latest.length === 0 && expiring.length === 0 && (
        <p className="empty-note" style={{ padding: "4px 18px 0" }}>
          いま流れているカードはありません。下の板から流せます。
        </p>
      )}

      {/* 板 */}
      <div id="boards" className="proof-head" style={{ paddingTop: 26 }}>
        <h2 className="sec-h">板を選ぶ</h2>
        <p className="sec-lead">板はジャンルごとの入口です。新しい板は、紹介者の提案が3人集まると増えます。</p>
      </div>
      <div className="list" style={{ paddingBottom: 8 }}>
        {openBoards.map((b) => (
          <Link key={b.slug} href={`/board/${b.slug}`} className="board">
            {BOARD_PHOTO[b.slug]
              ? /* eslint-disable-next-line @next/next/no-img-element */ <img className="bthumb" src={BOARD_PHOTO[b.slug]} alt="" />
              : <div className="ic">{b.icon}</div>}
            <div className="info">
              <div className="bname">{b.icon} {b.name}</div>
              <div className="bmeta">
                {b.live_count > 0
                  ? <>スレッド <span className="num">{b.thread_count}</span>件 ・ 最新 {agoLabel(b.latest_at!)}</>
                  : "まだ流れていません"}
              </div>
            </div>
            <div className="fresh">
              {b.live_count > 0 && (
                <>
                  <div className="n num">{b.live_count}</div>
                  <div className="l">流れてる投稿</div>
                </>
              )}
            </div>
          </Link>
        ))}

        {boards.some((b) => !b.is_open) && (
          <div className="soon">
            <span className="soon-label">準備中</span>
            {boards.filter((b) => !b.is_open).map((b) => (
              <span key={b.slug} className="soon-chip">{b.icon} {b.name}</span>
            ))}
          </div>
        )}
        <Link className="about-link" href="/about">広場について（仕組み・約束）→</Link>
      </div>

      {/* 最終CTA */}
      <section className="fv final">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/salon.jpg" alt="" />
        <div className="fv-ov">
          <p className="fv-claim" style={{ fontSize: 25 }}>明日の広場は、<br />また別の話です。</p>
          <p className="fv-sub">今日のカードは、明日にはもうありません。</p>
          <a className="fv-cta" href="#boards">＋ 流す</a>
        </div>
      </section>
      <div style={{ height: 110 }} />

      <WriteFab boards={openBoards.map((b) => ({ slug: b.slug, name: b.name, icon: b.icon }))} />
    </main>
  );
}
