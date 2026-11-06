import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { remainingLabel, ttlClass } from "@/lib/format";
import { BackButton, EnkaButton, PostForm } from "@/app/forms";
import { WriteFab } from "@/app/new-cards";

export const dynamic = "force-dynamic";

type PostRow = {
  id: number; author_name: string; body: string;
  created_at: string; expires_at: string;
};

export default async function ThreadPage({ params }: { params: { id: string } }) {
  if (!sql) return <main><p className="empty-note">準備中です。</p></main>;
  const threadId = Number(params.id);
  if (!Number.isFinite(threadId)) notFound();

  const threads = (await sql`
    select t.id, t.title, t.starter_name, b.slug as board_slug, b.name as board_name, b.icon as board_icon
    from threads t join boards b on b.id = t.board_id
    where t.id = ${threadId}
  `) as { id: number; title: string; starter_name: string; board_slug: string; board_name: string; board_icon: string }[];
  const thread = threads[0];
  if (!thread) notFound();

  const posts = (await sql`
    select id, author_name, body, created_at, expires_at
    from posts
    where thread_id = ${threadId} and expires_at > now()
    order by created_at asc
  `) as PostRow[];

  return (
    <main>
      <BackButton fallback={`/board/${thread.board_slug}`} />
      <header className="top">
        <h1 style={{ fontSize: 19, lineHeight: 1.5 }}>{thread.title}</h1>
      </header>
      <p className="empty-note" style={{ paddingTop: 0 }}>
        立てた人：{thread.starter_name} ・ カードは24時間で表示から消えます
      </p>

      <EnkaButton />

      <div className="section-title">流れているカード</div>
      <div className="stack">
        {posts.length === 0 && (
          <p className="empty-note" style={{ padding: 0 }}>いま流れているカードはありません。</p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="card">
            <div className="who">
              <div className="avatar">🐹</div>
              <div>
                <div className="name">{p.author_name}</div>
                <div className="genre">{thread.board_name}</div>
              </div>
            </div>
            <div className="body">{p.body}</div>
            <span className={ttlClass(p.expires_at)}>{remainingLabel(p.expires_at)}</span>
          </div>
        ))}
      </div>

      <div id="new-card">
        <PostForm threadId={threadId} />
      </div>
      <WriteFab thread />
      <div style={{ height: 90 }} />
    </main>
  );
}
