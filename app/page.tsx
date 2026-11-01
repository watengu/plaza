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

  return (
    <main>
      <header className="top">
        <h1>広場</h1>
        <span className="sub">投稿は24時間で消えます</span>
      </header>

      <p className="today-line">
        {todayCount > 0
          ? <>今日消えるカード <span className="n num">{todayCount}</span> 枚</>
          : "今日消えるカードはありません"}
      </p>

      <section className="hero">
        <p className="hero-lead">残らないから、<br />気軽に書ける。</p>
        <p className="hero-sub">アカウント登録はいりません。表示名だけで投稿できて、書いたものは24時間たつと表示から消えます。</p>
      </section>

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

      <div className="section-title">ジャンルの板</div>
      <div className="list">
        {boards.filter((b) => b.is_open).map((b) => (
          <Link key={b.slug} href={`/board/${b.slug}`} className="board">
            <div className="ic">{b.icon}</div>
            <div className="info">
              <div className="bname">{b.name}</div>
              <div className="bmeta">
                {b.live_count > 0
                  ? <>スレッド <span className="num">{b.thread_count}</span>件 ・ 最新 {agoLabel(b.latest_at!)}</>
                  : "まだ流れていません"}
              </div>
            </div>
            <div className="fresh">
              {b.live_count > 0 ? (
                <>
                  <div className="n num">{b.live_count}</div>
                  <div className="l">流れてる投稿</div>
                </>
              ) : (
                <div className="invite">最初のカードを流す →</div>
              )}
            </div>
          </Link>
        ))}

        {notice && (
          <div className="notice"><span className="pin">お知らせ</span>{notice}</div>
        )}

        {boards.some((b) => !b.is_open) && (
          <div className="soon">
            <span className="soon-label">準備中</span>
            {boards.filter((b) => !b.is_open).map((b) => (
              <span key={b.slug} className="soon-chip">{b.icon} {b.name}</span>
            ))}
          </div>
        )}
        <div className="grow-note">新しい板は、紹介者の提案が3人集まると増えます。</div>
      </div>

      <WriteFab boards={boards.filter((b) => b.is_open).map((b) => ({ slug: b.slug, name: b.name, icon: b.icon }))} />
    </main>
  );
}
