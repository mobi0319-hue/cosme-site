// カテゴリ別ランキングページ（SEO集客用）
// 「2026年 スキンケア おすすめ YouTuber」等のロングテール検索に対応
import { getProductsSorted, getCategories, slugifyProduct } from '@/lib/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '【2026年最新】YouTuberおすすめコスメランキング | カテゴリ別TOP商品',
  description: '35人以上のYouTuberが実際に使って紹介したコスメを、カテゴリ別にランキング形式でまとめました。スキンケア・ファンデーション・アイシャドウ・リップなど、紹介回数の多い人気商品がひと目でわかります。',
  alternates: {
    canonical: 'https://cosme-ch.com/ranking',
  },
  openGraph: {
    title: '【2026年最新】YouTuberおすすめコスメランキング',
    description: '35人以上のYouTuberが紹介したコスメをカテゴリ別にランキング。紹介回数の多い人気商品をまとめました。',
    url: 'https://cosme-ch.com/ranking',
    siteName: 'コスメまとめ',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '【2026年最新】YouTuberおすすめコスメランキング',
    description: '35人以上のYouTuberが紹介したコスメをカテゴリ別にランキング。',
  },
}

export default function RankingPage() {
  const products = getProductsSorted()
  const categories = getCategories()

  // カテゴリごとにTOP10を取得
  const categoryRankings = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat)
    return {
      category: cat,
      products: catProducts.slice(0, 10),
      total: catProducts.length,
    }
  }).filter(r => r.products.length >= 3) // 3商品以上あるカテゴリのみ

  // 全カテゴリ総合TOP30
  const overallTop30 = products.slice(0, 30)

  // 構造化データ（ItemList）
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "YouTuberおすすめコスメランキング 2026年版",
    description: "35人以上のYouTuberが紹介したコスメの総合ランキング",
    numberOfItems: overallTop30.length,
    itemListElement: overallTop30.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${p.brand} ${p.product_name}`,
      url: `https://cosme-ch.com/product/${encodeURIComponent(slugifyProduct(p))}`,
    })),
  }

  return (
    <div className="space-y-10">

      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* パンくず */}
      <nav className="text-xs text-gray-400 flex gap-1">
        <a href="/" className="hover:text-pink-500">TOP</a>
        <span>/</span>
        <span>ランキング</span>
      </nav>

      {/* ヘッダー */}
      <section className="text-center py-8 bg-white rounded-2xl border border-pink-100">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          YouTuberおすすめコスメランキング
        </h1>
        <p className="text-sm text-gray-500 mb-1">
          2026年最新 | 35人以上のYouTuberが実際に使って紹介した商品だけを掲載
        </p>
        <p className="text-xs text-gray-400">
          複数のYouTuberに紹介されている商品ほど上位にランクイン
        </p>
      </section>

      {/* カテゴリ目次 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-base font-bold text-gray-800 mb-3">カテゴリから探す</h2>
        <div className="flex flex-wrap gap-2">
          <a href="#overall" className="text-xs bg-pink-500 text-white rounded-full px-3 py-1.5 hover:bg-pink-600 transition-colors">
            総合TOP30
          </a>
          {categoryRankings.map(r => (
            <a key={r.category} href={`#${r.category}`}
              className="text-xs bg-white border border-gray-200 text-gray-600 rounded-full px-3 py-1.5 hover:border-pink-300 hover:text-pink-500 transition-colors">
              {r.category}（{r.total}件）
            </a>
          ))}
        </div>
      </section>

      {/* 総合ランキングTOP30 */}
      <section id="overall">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          総合ランキング TOP30
        </h2>
        <div className="space-y-3">
          {overallTop30.map((product, i) => {
            const slug = slugifyProduct(product)
            const youtuberCount = new Set(product.mentioned_by.map(m => m.channel)).size
            return (
              <div key={slug}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:border-pink-200 hover:shadow-sm transition-all">
                <div className="flex gap-3 items-start">
                  {/* 順位 */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    ${i === 0 ? 'bg-yellow-400 text-yellow-900' :
                      i === 1 ? 'bg-gray-300 text-gray-700' :
                      i === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-100 text-gray-500'}`}>
                    {i + 1}
                  </div>

                  {/* 商品画像 */}
                  <div className="w-16 h-16 bg-pink-50 rounded-lg overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">💄</div>
                    )}
                  </div>

                  {/* 商品情報 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5 truncate">{product.category} / {product.brand}</p>
                    <a href={`/product/${encodeURIComponent(slug)}`}
                      className="text-sm font-bold text-gray-800 hover:text-pink-500 transition-colors line-clamp-1">
                      {product.product_name}
                    </a>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs bg-pink-100 text-pink-600 rounded-full px-2 py-0.5 font-medium">
                        {youtuberCount}人が紹介
                      </span>
                      {product.price && product.price !== '-' && (
                        <span className="text-xs text-gray-500">{product.price}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 購入ボタン */}
                <div className="flex flex-wrap gap-2 mt-3 ml-0 sm:ml-[52px]">
                  {product.amazon_url && (
                    <a href={product.amazon_url} target="_blank" rel="noopener noreferrer nofollow"
                      className="text-xs bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors shadow-sm">
                      🛒 Amazonで見る
                    </a>
                  )}
                  {product.rakuten_url && (
                    <a href={product.rakuten_url} target="_blank" rel="noopener noreferrer nofollow"
                      className="text-xs bg-red-500 hover:bg-red-600 text-white font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors shadow-sm">
                      🛒 楽天で見る
                    </a>
                  )}
                  <a href={`/product/${encodeURIComponent(slug)}`}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 sm:px-4 py-1.5 rounded-lg transition-colors">
                    詳細
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* カテゴリ別ランキング */}
      {categoryRankings.map(ranking => (
        <section key={ranking.category} id={ranking.category}>
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            {ranking.category}ランキング TOP{ranking.products.length}
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            YouTuberが紹介した{ranking.category}商品 全{ranking.total}件のうち上位{ranking.products.length}件
          </p>
          <div className="space-y-3">
            {ranking.products.map((product, i) => {
              const slug = slugifyProduct(product)
              const youtuberCount = new Set(product.mentioned_by.map(m => m.channel)).size
              return (
                <div key={slug}
                  className="bg-white rounded-xl border border-gray-100 p-4 hover:border-pink-200 hover:shadow-sm transition-all">
                  <div className="flex gap-3 items-start">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      ${i === 0 ? 'bg-yellow-400 text-yellow-900' :
                        i === 1 ? 'bg-gray-300 text-gray-700' :
                        i === 2 ? 'bg-amber-600 text-white' :
                        'bg-gray-100 text-gray-500'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
                      <a href={`/product/${encodeURIComponent(slug)}`}
                        className="text-sm font-bold text-gray-800 hover:text-pink-500 transition-colors line-clamp-1">
                        {product.product_name}
                      </a>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-pink-500 font-medium">
                          {youtuberCount}人が紹介
                        </span>
                        {product.price && product.price !== '-' && (
                          <span className="text-xs text-gray-500">{product.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 ml-0 sm:ml-11">
                    {product.amazon_url && (
                      <a href={product.amazon_url} target="_blank" rel="noopener noreferrer nofollow"
                        className="text-xs bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                        🛒 Amazonで見る
                      </a>
                    )}
                    {product.rakuten_url && (
                      <a href={product.rakuten_url} target="_blank" rel="noopener noreferrer nofollow"
                        className="text-xs bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                        🛒 楽天で見る
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <a href="/products" className="block text-center text-xs text-pink-500 hover:text-pink-600 mt-3">
            {ranking.category}の全{ranking.total}商品を見る →
          </a>
        </section>
      ))}

      {/* 悩み別への誘導 */}
      <section className="bg-white rounded-2xl border border-pink-100 p-5 text-center">
        <h2 className="text-base font-bold text-gray-800 mb-2">悩みや目的で探したい方はこちら</h2>
        <p className="text-sm text-gray-500 mb-4">崩れにくいベースメイク・乾燥肌ケア・プチプラなど目的別にまとめています</p>
        <a href="/concerns"
          className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          悩み別コスメまとめを見る
        </a>
      </section>

    </div>
  )
}
