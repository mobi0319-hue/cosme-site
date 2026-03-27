// 商品詳細ページ（CV改善版）
import { getProducts, getProductBySlug, getRelatedProducts, slugifyProduct, extractVideoId } from '@/lib/data'
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
  return {
    title: `${product.brand} ${product.product_name} | ${youtuberCount}人のYouTuberが紹介`,
    description: `${product.brand}の${product.product_name}を${youtuberCount}人のYouTuberが紹介。実際の口コミ・使用感・価格・購入リンクをまとめました。`,
    openGraph: {
      title: `${product.brand} ${product.product_name} | YouTuber紹介コスメまとめ`,
      description: `${product.brand}の${product.product_name}を紹介しているYouTuber動画まとめ。口コミ・価格・購入リンクを確認できます。`,
      url: `https://cosme-site.vercel.app/product/${slug}`,
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
  const youtuberCount = new Set(product.mentioned_by.map(m => m.channel)).size
  const videoCount = new Set(product.mentioned_by.map(m => m.video_url)).size
  // コメントがある紹介だけ抽出（最大5件）
  const topContexts = product.mentioned_by
    .filter(m => m.context && m.context.length > 10)
    .slice(0, 5)

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* パンくず */}
      <nav className="text-xs text-gray-400 flex gap-1">
        <a href="/" className="hover:text-pink-500">TOP</a>
        <span>/</span>
        <a href="/products" className="hover:text-pink-500">商品一覧</a>
        <span>/</span>
        <span>{product.product_name}</span>
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
        {product.price && product.price !== '-' && (
          <p className="text-lg font-bold text-gray-800 mb-4">参考価格：{product.price}</p>
        )}

        {/* 購入ボタン（上部） */}
        <div className="flex flex-col sm:flex-row gap-3">
          {product.rakuten_url && (
            <a href={product.rakuten_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-center font-bold py-3 rounded-xl transition-colors">
              楽天で見る
            </a>
          )}
          {product.amazon_url && (
            <a href={product.amazon_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-center font-bold py-3 rounded-xl transition-colors">
              Amazonで見る
            </a>
          )}
        </div>
      </div>

      {/* YouTuberの声（コメントを購入ボタン直前に） */}
      {topContexts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-800 mb-3">💬 YouTuberの声</h2>
          <div className="space-y-3">
            {topContexts.map((mention, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-600">
                  {mention.channel.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-pink-500 font-medium mb-1">{mention.channel}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{mention.context}</p>
                </div>
              </div>
            ))}
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
        <p className="text-sm font-bold text-gray-700 mb-3 text-center">
          {youtuberCount}人が紹介した{product.brand} {product.product_name}を購入する
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {product.rakuten_url && (
            <a href={product.rakuten_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-center font-bold py-3 rounded-xl transition-colors">
              楽天で購入する
            </a>
          )}
          {product.amazon_url && (
            <a href={product.amazon_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-center font-bold py-3 rounded-xl transition-colors">
              Amazonで購入する
            </a>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          ※ 当サイトはアフィリエイトリンクを含みます
        </p>
      </div>

      {/* モバイル スティッキー購入ボタン用の余白 */}
      {product.amazon_url && (
        <div className="h-16 sm:hidden" />
      )}

      {/* モバイル スティッキー購入ボタン（画面下部に固定表示） */}
      {product.amazon_url && (
        <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
          <a href={product.amazon_url} target="_blank" rel="noopener noreferrer"
            className="block w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-center font-bold py-3 rounded-xl transition-colors text-sm">
            Amazonで購入する
          </a>
        </div>
      )}

    </div>
  )
}
