import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "コスメまとめ | YouTuberが紹介した商品を一覧で確認",
  description: "人気YouTuberが動画で紹介したコスメ・スキンケア商品をまとめて確認できます。",
  verification: {
    google: "Ta7jjAJLlLrutcIayAWYc_NBz3PClBlqT1ihAEC8T5c",
  },
  openGraph: {
    title: "コスメまとめ | YouTuberが紹介した商品を一覧で確認",
    description: "人気YouTuberが動画で紹介したコスメ・スキンケア商品をまとめて確認できます。",
    url: "https://cosme-site.vercel.app",
    siteName: "コスメまとめ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "コスメまとめ | YouTuberが紹介した商品を一覧で確認",
    description: "人気YouTuberが動画で紹介したコスメ・スキンケア商品をまとめて確認できます。",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-800 min-h-screen">
        {/* ヘッダー */}
        <header className="bg-white border-b border-pink-100 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-pink-500">
              💄 コスメまとめ
            </a>
            <nav className="flex gap-4 text-sm text-gray-600">
              <a href="/products" className="hover:text-pink-500">商品一覧</a>
              <a href="/videos" className="hover:text-pink-500">動画一覧</a>
              <a href="/creators" className="hover:text-pink-500">YouTuber</a>
            </nav>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>

        {/* フッター */}
        <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-400">
          <p>※ 当サイトはAmazonアソシエイト・楽天アフィリエイトプログラムに参加しています。</p>
          <p className="mt-1">© 2026 コスメまとめ</p>
        </footer>
      </body>
    </html>
  );
}
