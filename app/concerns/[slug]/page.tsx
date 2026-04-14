// 悩み別詳細ページ
import { CONCERNS, getConcernBySlug, getProductsForConcern } from '@/lib/concerns'
import { slugifyProduct, getMeaningfulMentions } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return CONCERNS.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const concern = getConcernBySlug(slug)
  if (!concern) return {}
  return {
    title: `${concern.title} | YouTuber紹介コスメまとめ`,
    description: concern.description,
    alternates: {
      canonical: `https://cosme-ch.com/concerns/${encodeURIComponent(slug)}`,
    },
    openGraph: {
      title: `${concern.title} | YouTuber紹介コスメまとめ`,
      description: concern.description,
      url: `https://cosme-ch.com/concerns/${slug}`,
    },
  }
}

export default async function ConcernPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const concern = getConcernBySlug(slug)
  if (!concern) notFound()

  // パンくず構造化データ
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "TOP", item: "https://cosme-ch.com/" },
      { "@type": "ListItem", position: 2, name: "悩み別まとめ", item: "https://cosme-ch.com/concerns" },
      { "@type": "ListItem", position: 3, name: concern.title },
    ],
  }

  const products = getProductsForConcern(concern)
  const totalYoutubers = new Set(
    products.flatMap(p => p.mentioned_by.map(m => m.channel))
  ).size

  return (
    <div className="space-y-6">

      {/* パンくず構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData).replace(/</g, '\\u003c') }}
      />

      {/* パンくず */}
      <nav className="text-xs text-gray-400 flex gap-1">
        <a href="/" className="hover:text-pink-500">TOP</a>
        <span>/</span>
        <a href="/concerns" className="hover:text-pink-500">悩み別まとめ</a>
        <span>/</span>
        <span>{concern.title}</span>
      </nav>

      {/* ヘッダー */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{concern.icon}</span>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{concern.title}</h1>
            <p className="text-sm text-gray-500">{concern.subtitle}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{concern.description}</p>

        {/* 統計 */}
        <div className="flex gap-3">
          <div className="flex-1 bg-pink-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-pink-600">{products.length}</p>
            <p className="text-xs text-pink-500 mt-0.5">件の商品</p>
          </div>
          <div className="flex-1 bg-rose-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-rose-500">{totalYoutubers}</p>
            <p className="text-xs text-rose-400 mt-0.5">人のYouTuberが紹介</p>
          </div>
        </div>
      </div>

      {/* 商品一覧 */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3">
          おすすめ商品（紹介人数順）
        </h2>
        <div className="space-y-3">
          {products.map((product, i) => (
            <div key={slugifyProduct(product)}
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-pink-200 hover:shadow-sm transition-all">
              <a href={`/product/${slugifyProduct(product)}`} className="flex gap-4">

                {/* 順位 */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${i === 0 ? 'bg-yellow-400 text-white' :
                    i === 1 ? 'bg-gray-300 text-white' :
                    i === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 text-gray-500'}`}>
                  {i + 1}
                </div>

                {/* 商品画像 */}
                {product.image_url ? (
                  <img src={product.image_url} alt={product.product_name}
                    className="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0" loading="lazy" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0" />
                )}

                {/* 商品情報 */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5 truncate">{product.category} / {product.brand}</p>
                  <p className="font-medium text-gray-800 line-clamp-1">{product.product_name}</p>
                  {product.price && product.price !== '-' && (
                    <p className="text-xs text-gray-500 mt-0.5">{product.price}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-pink-500 font-medium">
                      {product.mention_count}人が紹介
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Set(product.mentioned_by.map(m => m.video_url)).size}本の動画
                    </span>
                  </div>
                </div>

                <span className="text-gray-300 self-center">›</span>
              </a>

              {/* 購入ボタン */}
              {(product.amazon_url || product.rakuten_url) && (
                <div className="flex flex-wrap gap-2 mt-3 ml-0 sm:ml-12">
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
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 他の悩みへのリンク */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-3">他の悩み・テーマを見る</h2>
        <a href="/concerns" className="text-sm text-pink-500 hover:text-pink-600">
          悩み別まとめ一覧へ →
        </a>
      </div>

    </div>
  )
}
