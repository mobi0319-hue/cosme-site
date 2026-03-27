import type { Metadata } from "next";
import { getProducts } from "@/lib/data";
import "./globals.css";

export function generateMetadata(): Metadata {
  const productCount = getProducts().length
  // 100の位で切り捨てて「○○以上」の表現にする
  const roundedCount = Math.floor(productCount / 100) * 100
  const title = `YouTuber紹介コスメ${roundedCount}商品以上 | Amazon・楽天リンク付き`
  const description = `人気YouTuberが動画で紹介したコスメ・スキンケア${roundedCount}商品以上を掲載。Amazon・楽天の購入リンク付きで、気になる商品をすぐチェックできます。`

  return {
    title,
    description,
    verification: {
      google: "Ta7jjAJLlLrutcIayAWYc_NBz3PClBlqT1ihAEC8T5c",
    },
    openGraph: {
      title,
      description,
      url: "https://cosme-site.vercel.app",
      siteName: "コスメまとめ",
      locale: "ja_JP",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* GA4 タグ */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-F2K61BP747" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-F2K61BP747');
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 text-gray-800 min-h-screen">
        {/* ヘッダー */}
        <header className="bg-white border-b border-pink-100 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-pink-500">
              💄 コスメまとめ
            </a>
            <nav className="flex gap-4 text-sm text-gray-600">
              <a href="/products" className="hover:text-pink-500">商品一覧</a>
              <a href="/concerns" className="hover:text-pink-500">悩み別</a>
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
          <p className="mt-2"><a href="/privacy" className="hover:text-pink-500 underline">プライバシーポリシー・免責事項</a></p>
          <p className="mt-1">© 2026 コスメまとめ</p>
        </footer>
      </body>
    </html>
  );
}
