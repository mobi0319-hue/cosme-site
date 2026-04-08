import type { Metadata } from "next";
import { getProducts, getCategories, getCreators, getArticles, slugifyCreator } from "@/lib/data";
import { CONCERNS } from "@/lib/concerns";
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
      url: "https://cosme-ch.com",
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
            <nav className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
              <a href="/ranking" className="hover:text-pink-500 font-medium flex-shrink-0">ランキング</a>
              <a href="/products" className="hover:text-pink-500 flex-shrink-0">商品一覧</a>
              <a href="/creators" className="hover:text-pink-500 flex-shrink-0">YouTuber</a>
              <a href="/videos" className="hover:text-pink-500 flex-shrink-0 hidden sm:inline">動画一覧</a>
              <a href="/concerns" className="hover:text-pink-500 flex-shrink-0 hidden sm:inline">悩み別</a>
              <a href="/articles" className="hover:text-pink-500 flex-shrink-0">記事</a>
            </nav>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>

        {/* フッター（SEO内部リンク強化） */}
        <footer className="border-t border-gray-200 mt-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-8">
            {/* フッター内部リンク集 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 text-xs sm:text-sm">

              {/* サイト案内 */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3">サイト案内</h3>
                <ul className="space-y-1.5 text-gray-500">
                  <li><a href="/ranking" className="hover:text-pink-500">ランキング</a></li>
                  <li><a href="/products" className="hover:text-pink-500">商品一覧</a></li>
                  <li><a href="/creators" className="hover:text-pink-500">YouTuber一覧</a></li>
                  <li><a href="/videos" className="hover:text-pink-500">動画一覧</a></li>
                  <li><a href="/concerns" className="hover:text-pink-500">悩み別まとめ</a></li>
                  <li><a href="/articles" className="hover:text-pink-500">記事一覧</a></li>
                </ul>
              </div>

              {/* 人気YouTuber */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3">人気YouTuber</h3>
                <ul className="space-y-1.5 text-gray-500">
                  {getCreators().slice(0, 8).map(creator => (
                    <li key={creator.name}>
                      <a href={`/creator/${encodeURIComponent(slugifyCreator(creator.name))}`} className="hover:text-pink-500">
                        {creator.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* カテゴリ別 */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3">カテゴリ別</h3>
                <ul className="space-y-1.5 text-gray-500">
                  {getCategories().slice(0, 8).map(cat => (
                    <li key={cat}>
                      <a href={`/products?category=${encodeURIComponent(cat)}`} className="hover:text-pink-500">
                        {cat}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 悩み・テーマ別 */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3">悩み・テーマ別</h3>
                <ul className="space-y-1.5 text-gray-500">
                  {CONCERNS.map(c => (
                    <li key={c.slug}>
                      <a href={`/concerns/${c.slug}`} className="hover:text-pink-500">
                        {c.icon} {c.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* サイト説明文 */}
            <div className="border-t border-gray-100 pt-6 mb-6">
              <p className="text-xs text-gray-400 leading-relaxed">
                「コスメまとめ」は、人気YouTuberが動画で紹介したコスメ・スキンケア商品の情報をまとめ、動画をより多くの方に届けるためのガイドサイトです。
                各商品ページから元の動画へのリンクを掲載しており、気になった商品の詳しいレビューは動画でご確認いただけます。
                当サイトは各YouTuber・クリエイターとは独立して運営しており、公式サイトではありません。
              </p>
            </div>

            {/* 広告表示・免責事項 */}
            <div className="text-center text-xs text-gray-400 space-y-1">
              <p>※ Amazonのアソシエイトとして、コスメまとめは適格販売により収入を得ています。また、楽天アフィリエイトを利用しています。</p>
              <p>※ 掲載クリエイターの方で掲載停止をご希望の場合は<a href="/contact" className="text-pink-500 hover:text-pink-600 underline">お問い合わせ</a>よりご連絡ください。速やかに対応いたします。</p>
              <p>
                <a href="/privacy" className="hover:text-pink-500 underline">プライバシーポリシー・免責事項</a>
                <span className="mx-2">|</span>
                <a href="/contact" className="hover:text-pink-500 underline">お問い合わせ</a>
              </p>
              <p>© 2026 コスメまとめ</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
