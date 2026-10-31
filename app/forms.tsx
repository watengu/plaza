"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PostForm({ threadId }: { threadId: number }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, name, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "送信できませんでした");
      setBody("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "送信できませんでした");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="post" onSubmit={submit}>
      <h3>カードを流す</h3>
      <label>表示名</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="例：みさき" />
      <label>内容</label>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={300} placeholder="募集・お知らせ・おすすめなど" />
      <div className="row">
        <button className="btn" type="submit" disabled={busy}>流す</button>
        <span className="note">この投稿は24時間で表示から消えます</span>
      </div>
      {err && <div className="err">{err}</div>}
    </form>
  );
}

export function ThreadForm({ boardSlug }: { boardSlug: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardSlug, title, name, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "送信できませんでした");
      router.push(`/thread/${data.threadId}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "送信できませんでした");
      setBusy(false);
    }
  }

  return (
    <form className="post" onSubmit={submit}>
      <h3>新しいスレッドを立てる</h3>
      <label>タイトル</label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="例：今日のまとめ髪の話" />
      <label>表示名</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="例：みさき" />
      <label>最初のカード</label>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={300} placeholder="募集・お知らせ・おすすめなど" />
      <div className="row">
        <button className="btn" type="submit" disabled={busy}>立てる</button>
        <span className="note">カードは24時間で表示から消えます</span>
      </div>
      {err && <div className="err">{err}</div>}
    </form>
  );
}

export function EnkaButton() {
  const [msg, setMsg] = useState("");
  return (
    <div className="enka">
      <button type="button" onClick={() => setMsg("エンカ申請は、マァスゥ本体との連携後に使えます（いまは準備中です）。")}>
        エンカ申請する
      </button>
      {msg && <div className="msg">{msg}</div>}
    </div>
  );
}
