// 商品詳細ページ（CV改善版）
import { getProducts, getProductBySlug, getRelatedProducts, slugifyProduct, extractVideoId, getChannelDisplayInfo } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const products = getProducts()
  return products.map((p) => ({
    slug: slugifyProduct(p),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(decodeURIComponent(slug))
  if (!product) return {}
  const youtuberCount = new Set(product.mentioned_by.map(m => m.channel)).size
  const videoCount = new Set(product.mentioned_by.map(m => m.video_url)).size
  const now = new Date()
  const yearMonth = `${now.getFullYear()}年${now.getMonth() + 1}月`
  return {
    title: `${product.brand} ${product.product_name} 口コミ・レビュー | ${youtuberCount}人のYouTuberが紹介【${yearMonth}】`,
    description: `【${yearMonth}最新】${product.brand} ${product.product_name}を${youtuberCount}人のYouTuberが${videoCount}本の動画で紹介。実際の使用感・口コミをまとめました。Amazon・楽天の購入リンク付き。`,
    alternates: {
      canonical: `https://cosme-ch.com/product/${encodeURIComponent(slug)}`,
    },
    openGraph: {
      title: `${product.brand} ${product.product_name} | YouTuber紹介コスメまとめ`,
      description: `${product.brand}の${product.product_name}を紹介しているYouTuber動画まとめ。口コミ・価格・購入リンクを確認できます。`,
      url: `https://cosme-ch.com/product/${slug}`,
      ...(product.image_url ? { images: [{ url: product.image_url }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...(product.image_url ? { images: [product.image_url] } : {}),
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = getProductBySlug(decodeURIComponent(slug))
  if (!product) notFound()

  const relatedProducts = getRelatedProducts(product)
  // mentioned_byはdata.ts側でcontext有りのみにフィルタ済み
  const youtuberCount = new Set(product.mentioned_by.map(m => m.channel)).size
  const videoCount = new Set(product.mentioned_by.map(m => m.video_url)).size
  const topContexts = product.mentioned_by.slice(0, 5)

  // パンくず構造化データ（Googleリッチスニペット用）
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "TOP", item: "https://cosme-ch.com/" },
      { "@type": "ListItem", position: 2, name: "商品一覧", item: "https://cosme-ch.com/products" },
      { "@type": "ListItem", position: 3, name: `${product.brand} ${product.product_name}` },
    ],
  }

  // Schema.org構造化データ（Googleリッチスニペット用）
  const offers = [
    ...(product.amazon_url ? [{ "@type": "Offer" as const, url: product.amazon_url, availability: "https://schema.org/InStock" as const, seller: { "@type": "Organization" as const, name: "Amazon" } }] : []),
    ...(product.rakuten_url ? [{ "@type": "Offer" as const, url: product.rakuten_url, availability: "https://schema.org/InStock" as const, seller: { "@type": "Organization" as const, name: "楽天" } }] : []),
  ]
  // 価格文字列から数値を抽出（例: "3,850円(税込)" → 3850）
  const priceStr = product.api_price || product.price || ''
  const priceNum = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: `${product.brand} ${product.product_name}`,
    brand: { "@type": "Brand", name: product.brand },
    description: `${youtuberCount}人のYouTuberが紹介した${product.brand}の${product.product_name}。実際の口コミ・使用感をまとめました。`,
    ...(product.image_url ? { image: product.image_url } : {}),
    ...(offers.length > 0 ? {
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "JPY",
        offerCount: offers.length,
        ...(priceNum > 0 ? { lowPrice: priceNum, highPrice: priceNum } : {}),
        offers,
      },
    } : {}),
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* パンくず構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData).replace(/</g, '\\u003c') }}
      />
      {/* Schema.org構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />

      {/* パンくず */}
      <nav className="text-xs text-gray-400 flex gap-1 min-w-0">
        <a href="/" className="hover:text-pink-500 flex-shrink-0">TOP</a>
        <span className="flex-shrink-0">/</span>
        <a href="/products" className="hover:text-pink-500 flex-shrink-0">商品一覧</a>
        <span className="flex-shrink-0">/</span>
        <span className="truncate">{product.product_name}</span>
      </nav>

      {/* 商品基本情報 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        {product.image_url ? (
          <div className="w-full max-w-xs mx-auto aspect-square bg-pink-50 rounded-xl mb-4 overflow-hidden">
            <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
          </div>
        ) : null}
        <p className="text-xs text-gray-400 mb-1">{product.category}</p>
        <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
        <h1 className="text-xl font-bold text-gray-800 mb-4">{product.product_name}</h1>

        {/* 信頼シグナル：YouTuber数・動画数 */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-pink-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-pink-600">{youtuberCount}</p>
            <p className="text-xs text-pink-500 mt-0.5">人のYouTuberが紹介</p>
          </div>
          <div className="flex-1 bg-rose-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-rose-500">{videoCount}</p>
            <p className="text-xs text-rose-400 mt-0.5">本の動画に登場</p>
          </div>
        </div>

        {/* 価格 */}
        {(product.api_price || (product.price && product.price !== '-')) && (
          <div className="mb-4">
            {product.api_price ? (
              <p className="text-lg font-bold text-gray-800">Amazon価格：{product.api_price}</p>
            ) : (
              <p className="text-lg font-bold text-gray-800">参考価格：{product.price}</p>
            )}
          </div>
        )}

        {/* 購入ボタン（上部） — Amazon・楽天均等 */}
        <div className="flex flex-col sm:flex-row gap-3">
          {product.amazon_url && (
            <a href={product.amazon_url} target="_blank" rel="noopener noreferrer nofollow"
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-center font-bold py-4 rounded-xl transition-colors text-base shadow-sm">
              🛒 Amazonで見る
            </a>
          )}
          {product.rakuten_url && (
            <a href={product.rakuten_url} target="_blank" rel="noopener noreferrer nofollow"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-center font-bold py-4 rounded-xl transition-colors text-base shadow-sm">
              🛒 楽天で見る
            </a>
          )}
        </div>
      </div>

      {/* 動画で紹介されたポイント（コメントを購入ボタン直前に） */}
      {topContexts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-800 mb-3">💬 動画で紹介されたポイント</h2>
          <div className="space-y-3">
            {topContexts.map((mention, i) => {
              const channelInfo = getChannelDisplayInfo(mention.channel)
              return (
                <div key={i} className="flex gap-3 items-start">
                  {channelInfo.iconUrl ? (
                    <img
                      src={channelInfo.iconUrl}
                      alt={channelInfo.displayName}
                      className="flex-shrink-0 w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-600">
                      {channelInfo.displayName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-pink-500 font-medium mb-1">{channelInfo.displayName}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{mention.context}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 紹介された動画一覧 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-base font-bold text-gray-800 mb-4">🎬 紹介された動画</h2>
        <div className="space-y-3">
          {product.mentioned_by.map((mention, i) => {
            const videoId = extractVideoId(mention.video_url)
            return (
              <div key={i} className="flex gap-3 items-start border border-gray-100 rounded-xl p-3">
                <img
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt={mention.video_title}
                  className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-pink-500 mb-0.5">{mention.channel}</p>
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{mention.video_title}</p>
                  <div className="flex gap-2">
                    <a href={`/video/${videoId}`}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors">
                      商品一覧
                    </a>
                    <a href={mention.video_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-full transition-colors">
                      YouTube ↗
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 関連商品（同カテゴリ） */}
      {relatedProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-800 mb-3">
            同じ「{product.category}」の人気商品
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {relatedProducts.map((p) => (
              <a key={slugifyProduct(p)} href={`/product/${slugifyProduct(p)}`}
                className="border border-gray-100 rounded-xl p-3 hover:border-pink-200 hover:bg-pink-50 transition-colors">
                <p className="text-xs text-gray-400 mb-0.5">{p.brand}</p>
                <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{p.product_name}</p>
                <p className="text-xs text-pink-500">{p.mention_count}人が紹介</p>
              </a>
            ))}
          </div>
          <a href={`/products?category=${encodeURIComponent(product.category)}`}
            className="block text-center text-xs text-pink-500 hover:text-pink-600 mt-3">
            {product.category}の商品をもっと見る →
          </a>
        </div>
      )}

      {/* 購入ボタン（下部） */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs sm:text-sm font-bold text-gray-700 mb-3 text-center line-clamp-2">
          {youtuberCount}人が紹介した{product.brand} {product.product_name}を購入する
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {product.amazon_url && (
            <a href={product.amazon_url} target="_blank" rel="noopener noreferrer nofollow"
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-center font-bold py-4 rounded-xl transition-colors text-base shadow-sm">
              🛒 Amazonで見る
            </a>
          )}
          {product.rakuten_url && (
            <a href={product.rakuten_url} target="_blank" rel="noopener noreferrer nofollow"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-center font-bold py-4 rounded-xl transition-colors text-base shadow-sm">
              🛒 楽天で見る
            </a>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          ※ 当サイトはアフィリエイトリンクを含みます
        </p>
      </div>

      {/* モバイル スティッキー購入ボタン用の余白 */}
      {(product.amazon_url || product.rakuten_url) && (
        <div className="h-20 sm:hidden" />
      )}

      {/* モバイル スティッキー購入ボタン（画面下部に固定表示） */}
      {(product.amazon_url || product.rakuten_url) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
          <div className="flex gap-2">
            {product.amazon_url && (
              <a href={product.amazon_url} target="_blank" rel="noopener noreferrer nofollow"
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-center font-bold py-3 rounded-xl transition-colors text-sm shadow-sm">
                🛒 Amazonで見る
              </a>
            )}
            {product.rakuten_url && (
              <a href={product.rakuten_url} target="_blank" rel="noopener noreferrer nofollow"
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-center font-bold py-3 rounded-xl transition-colors text-sm shadow-sm">
                🛒 楽天で見る
              </a>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
