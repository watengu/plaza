import type { Metadata } from "next";
import Link from "next/link";
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
          <Link href="/"><span className="ni">🏠</span>ホーム</Link>
          <Link href="/board/beauty"><span className="ni">💄</span>美容・コーデ</Link>
          <Link href="/board/chat"><span className="ni">🍵</span>雑談</Link>
          <Link href="/about"><span className="ni">❓</span>広場について</Link>
        </nav>
      </body>
    </html>
  );
}
