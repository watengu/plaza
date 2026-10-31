import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  if (!sql) return NextResponse.json({ error: "準備中です" }, { status: 503 });
  const { threadId, name, body } = await req.json().catch(() => ({}));
  const author = String(name ?? "").trim();
  const text = String(body ?? "").trim();
  if (!Number.isFinite(Number(threadId)) || !author || !text) {
    return NextResponse.json({ error: "表示名と内容を入れてください" }, { status: 400 });
  }
  if (author.length > 30 || text.length > 300) {
    return NextResponse.json({ error: "文字数が多すぎます" }, { status: 400 });
  }
  const threads = (await sql`select id from threads where id = ${Number(threadId)}`) as { id: number }[];
  if (!threads[0]) return NextResponse.json({ error: "スレッドがありません" }, { status: 404 });

  await sql`
    insert into posts (thread_id, author_name, body, expires_at)
    values (${Number(threadId)}, ${author}, ${text}, now() + interval '24 hours')
  `;
  return NextResponse.json({ ok: true });
}
