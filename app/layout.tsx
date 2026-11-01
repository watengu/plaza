import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://plaza-watengus-projects.vercel.app"),
  title: "広場 | マァスゥ",
  description: "ジャンル別の総合掲示板。投稿は24時間で表示から消えます。",
  openGraph: {
    title: "広場 | マァスゥ",
    description: "ジャンル別の総合掲示板。投稿は24時間で表示から消えます。",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "広場 ― 投稿は24時間で消えます" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "広場 | マァスゥ",
    description: "ジャンル別の総合掲示板。投稿は24時間で表示から消えます。",
    images: ["/og.png"],
  },
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
