import Link from "next/link";
import { sql } from "@/lib/db";
import { agoLabel, remainingLabel, ttlClass } from "@/lib/format";

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
  }

  return (
    <main>
      <header className="top">
        <h1>広場</h1>
        <span className="sub">投稿は24時間で消えます</span>
      </header>

      {notice && (
        <div className="notice"><span className="pin">お知らせ</span>{notice}</div>
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

      <div className="section-title">ジャンルの板</div>
      <div className="list">
        {boards.map((b) =>
          b.is_open ? (
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
          ) : (
            <div key={b.slug} className="board locked">
              <div className="ic">{b.icon}</div>
              <div className="info">
                <div className="bname">{b.name}</div>
                <div className="bmeta">準備中</div>
              </div>
            </div>
          )
        )}
        <div className="grow-note">新しい板は、紹介者の提案が3人集まると増えます。</div>
      </div>
    </main>
  );
}
