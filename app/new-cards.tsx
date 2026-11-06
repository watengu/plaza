"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export type NewCard = {
  id: number;
  author_name: string;
  body: string;
  created_at: string;
  expires_at: string;
  board_name: string;
  thread_id: number;
  ttl_label: string;
  ttl_class: string;
};

const KEY = "plaza.lastSeenAt";

/** 全板横断の新着カード。前回見た時刻（端末に保持）より新しいカードにだけ「新着」の印を付ける。 */
export function NewCards({ cards }: { cards: NewCard[] }) {
  const [lastSeen, setLastSeen] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const prev = window.localStorage.getItem(KEY);
      setLastSeen(prev ? Number(prev) : null);
      window.localStorage.setItem(KEY, String(Date.now()));
    } catch {
      setLastSeen(null);
    }
    setReady(true);
  }, []);

  if (cards.length === 0) return null;

  return (
    <>
      <div className="section-title">新着カード</div>
      <div className="stack" style={{ paddingBottom: 2 }}>
        {cards.map((c) => {
          const isNew = ready && lastSeen !== null && new Date(c.created_at).getTime() > lastSeen;
          return (
            <Link key={c.id} href={`/thread/${c.thread_id}`} className="card">
              <div className="who">
                <div className="avatar">🐹</div>
                <div>
                  <div className="name">
                    {c.author_name}
                    {isNew && <span className="new-badge">新着</span>}
                  </div>
                  <div className="genre">{c.board_name}</div>
                </div>
              </div>
              <div className="body">{c.body}</div>
              <span className={c.ttl_class}>{c.ttl_label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export type OpenBoard = { slug: string; name: string; icon: string };

/** 「流す」固定ボタン（全画面で同じ形・同じ動詞）。トップ＝板を選ぶシート、板・スレッド＝その画面のフォームへスクロール。 */
export function WriteFab({ boards, boardSlug, thread }: { boards?: OpenBoard[]; boardSlug?: string; thread?: boolean }) {
  const [open, setOpen] = useState(false);

  if (thread) {
    return (
      <a className="fab" href="#new-card">＋ 流す</a>
    );
  }

  if (boardSlug) {
    return (
      <a className="fab" href="#new-thread">＋ 流す</a>
    );
  }

  return (
    <>
      <button className="fab" type="button" onClick={() => setOpen(true)}>＋ 流す</button>
      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-title">どの板に流しますか？</div>
            {(boards ?? []).map((b) => (
              <Link key={b.slug} href={`/board/${b.slug}#new-thread`} className="sheet-row">
                <span className="ic">{b.icon}</span> {b.name}
              </Link>
            ))}
            <button className="sheet-close" type="button" onClick={() => setOpen(false)}>閉じる</button>
          </div>
        </div>
      )}
    </>
  );
}
