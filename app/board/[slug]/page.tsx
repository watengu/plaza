import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { agoLabel } from "@/lib/format";
import { ThreadForm } from "@/app/forms";

export const dynamic = "force-dynamic";

type ThreadRow = {
  id: number; title: string; starter_name: string;
  live_count: number; latest_at: string | null; fresh: boolean;
};

export default async function BoardPage({ params }: { params: { slug: string } }) {
  if (!sql) return <main><p className="empty-note">準備中です。</p></main>;
  const boards = (await sql`
    select id, name, icon, is_open from boards where slug = ${params.slug}
  `) as { id: number; name: string; icon: string; is_open: boolean }[];
  const board = boards[0];
  if (!board || !board.is_open) notFound();

  const threads = (await sql`
    select t.id, t.title, t.starter_name,
      count(p.id) filter (where p.expires_at > now())::int as live_count,
      max(p.created_at) as latest_at,
      (max(p.created_at) > now() - interval '1 hour') as fresh
    from threads t
    left join posts p on p.thread_id = t.id
    where t.board_id = ${board.id}
    group by t.id
    having count(p.id) filter (where p.expires_at > now()) > 0
    order by max(p.created_at) desc
  `) as ThreadRow[];

  return (
    <main>
      <Link className="back" href="/">← 広場トップ</Link>
      <header className="top">
        <h1>{board.icon} {board.name}</h1>
        <span className="sub">投稿は24時間で消えます</span>
      </header>

      <div className="list" style={{ paddingBottom: 16 }}>
        {threads.length === 0 && (
          <p className="empty-note">まだ流れていません。最初のスレッドを立ててみてください。</p>
        )}
        {threads.map((t) => (
          <Link key={t.id} href={`/thread/${t.id}`} className="thread-row">
            <div className="t">{t.fresh ? <span className="hot-mark">{t.title}</span> : t.title}</div>
            <div className="m">
              <span>{t.starter_name}</span>
              <span>カード <span className="num">{t.live_count}</span>枚</span>
              <span>最新 {agoLabel(t.latest_at!)}</span>
            </div>
          </Link>
        ))}
      </div>

      <ThreadForm boardSlug={params.slug} />
      <div style={{ height: 90 }} />
    </main>
  );
}
