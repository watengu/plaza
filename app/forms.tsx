"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NAME_KEY = "plaza.displayName";

function useDisplayName() {
  const [stored, setStored] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(NAME_KEY);
      if (v) { setStored(v); setDraft(v); }
    } catch { /* ignore */ }
  }, []);
  const effective = stored && !editing ? stored : draft.trim();
  function save() {
    const v = draft.trim();
    if (v) {
      try { window.localStorage.setItem(NAME_KEY, v); } catch { /* ignore */ }
      setStored(v);
    }
  }
  return { stored, editing, setEditing, draft, setDraft, effective, save };
}

function NameField({ dn }: { dn: ReturnType<typeof useDisplayName> }) {
  if (dn.stored && !dn.editing) {
    return (
      <p className="name-note">
        表示名：<b>{dn.stored}</b>
        <button type="button" className="name-change" onClick={() => dn.setEditing(true)}>変更</button>
      </p>
    );
  }
  return (
    <>
      <label>表示名{dn.stored ? "" : "（次回から自動で入ります）"}</label>
      <input type="text" value={dn.draft} onChange={(e) => dn.setDraft(e.target.value)} maxLength={30} placeholder="例：みさき" />
    </>
  );
}

export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="backbtn"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push(fallback);
      }}
    >
      ← もどる
    </button>
  );
}

export function PostForm({ threadId }: { threadId: number }) {
  const router = useRouter();
  const dn = useDisplayName();
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!dn.effective) { setErr("表示名を入力してください"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, name: dn.effective, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "送信できませんでした");
      dn.save();
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
      <NameField dn={dn} />
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
  const dn = useDisplayName();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!dn.effective) { setErr("表示名を入力してください"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardSlug, title, name: dn.effective, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "送信できませんでした");
      dn.save();
      router.push(`/thread/${data.threadId}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "送信できませんでした");
      setBusy(false);
    }
  }

  return (
    <form className="post" onSubmit={submit}>
      <h3>新しい話題をはじめる</h3>
      <p className="note" style={{ marginBottom: 4 }}>話題（スレッド）ができて、最初のカードも一緒に流れます。</p>
      <label>タイトル</label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="例：今日のまとめ髪の話" />
      <NameField dn={dn} />
      <label>最初のカード</label>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={300} placeholder="募集・お知らせ・おすすめなど" />
      <div className="row">
        <button className="btn" type="submit" disabled={busy}>流す</button>
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
