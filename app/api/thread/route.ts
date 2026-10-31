import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  if (!sql) return NextResponse.json({ error: "準備中です" }, { status: 503 });
  const { boardSlug, title, name, body } = await req.json().catch(() => ({}));
  const t = String(title ?? "").trim();
  const author = String(name ?? "").trim();
  const text = String(body ?? "").trim();
  if (!t || !author || !text) {
    return NextResponse.json({ error: "タイトル・表示名・内容を入れてください" }, { status: 400 });
  }
  if (t.length > 60 || author.length > 30 || text.length > 300) {
    return NextResponse.json({ error: "文字数が多すぎます" }, { status: 400 });
  }
  const boards = (await sql`
    select id from boards where slug = ${String(boardSlug)} and is_open
  `) as { id: number }[];
  if (!boards[0]) return NextResponse.json({ error: "板がありません" }, { status: 404 });

  const created = (await sql`
    insert into threads (board_id, title, starter_name)
    values (${boards[0].id}, ${t}, ${author})
    returning id
  `) as { id: number }[];
  const threadId = created[0].id;
  await sql`
    insert into posts (thread_id, author_name, body, expires_at)
    values (${threadId}, ${author}, ${text}, now() + interval '24 hours')
  `;
  return NextResponse.json({ ok: true, threadId });
}
