import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "広場 | マァスゥ",
  description: "ジャンル別の総合掲示板。投稿は24時間で表示から消えます。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <footer className="foot">広場（テスト公開中）― マァスゥ本体とは連携していません</footer>
        <nav className="bottom">
          <div><span className="ni">🏠</span>ホーム</div>
          <div><span className="ni">👥</span>友人</div>
          <div className="on"><span className="ni">🧭</span>広場</div>
          <div><span className="ni">⚙️</span>設定</div>
        </nav>
      </body>
    </html>
  );
}
