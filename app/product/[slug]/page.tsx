// 商品詳細ページ
// 購入ボタンを最上部に固定（DeepResearch: 価格・購入導線を折り返し前に）
import { getProducts, getProductBySlug, slugifyProduct, extractVideoId } from '@/lib/data'
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
  return {
    title: `${product.brand} ${product.product_name} | YouTuber紹介コスメまとめ`,
    description: `${product.brand}の${product.product_name}を紹介しているYouTuber動画まとめ。口コミ・価格・購入リンクを確認できます。`,
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">

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
        {/* 商品画像 */}
        <div className="w-full max-w-xs mx-auto aspect-square bg-pink-50 rounded-xl mb-4 overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">💄</div>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-1">{product.category}</p>
        <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
        <h1 className="text-xl font-bold text-gray-800 mb-3">{product.product_name}</h1>

        {/* 複数紹介バッジ */}
        {product.mention_count >= 2 && (
          <div className="bg-pink-50 border border-pink-100 rounded-lg px-4 py-2 mb-4 text-sm text-pink-700">
            ✨ <strong>{product.mention_count}人のYouTuber</strong>が紹介しています
          </div>
        )}

        {/* 価格 */}
        {product.price && (
          <p className="text-lg font-bold text-gray-800 mb-4">参考価格：{product.price}</p>
        )}

        {/* 購入ボタン（最上部・折り返し前に配置） */}
        <div className="flex flex-col sm:flex-row gap-3">
          {product.rakuten_url && (
            <a
              href={product.rakuten_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-center font-bold py-3 rounded-xl transition-colors"
            >
              楽天で見る
            </a>
          )}
          {product.amazon_url && (
            <a
              href={product.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-center font-bold py-3 rounded-xl transition-colors"
            >
              Amazonで見る
            </a>
          )}
        </div>
      </div>

      {/* この商品が出た動画一覧 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-base font-bold text-gray-800 mb-4">🎬 この商品が紹介された動画</h2>
        <div className="space-y-4">
          {product.mentioned_by.map((mention, i) => {
            const videoId = extractVideoId(mention.video_url)
            return (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="flex gap-3 mb-3">
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                    alt={mention.video_title}
                    className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-pink-500 mb-1">{mention.channel}</p>
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">{mention.video_title}</p>
                  </div>
                </div>

                {/* 動画でのコメント */}
                {mention.context && (
                  <blockquote className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2 border-l-4 border-pink-200 mb-3">
                    {mention.context}
                  </blockquote>
                )}

                <div className="flex gap-2">
                  <a
                    href={`/video/${videoId}`}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    動画の紹介商品一覧
                  </a>
                  <a
                    href={mention.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-full transition-colors"
                  >
                    YouTubeで見る ↗
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 購入ボタン（ページ下部にも配置） */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-base font-bold text-gray-800 mb-3">購入する</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {product.rakuten_url && (
            <a
              href={product.rakuten_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-center font-bold py-3 rounded-xl transition-colors"
            >
              楽天で購入する
            </a>
          )}
          {product.amazon_url && (
            <a
              href={product.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-center font-bold py-3 rounded-xl transition-colors"
            >
              Amazonで購入する
            </a>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          ※ 当サイトはアフィリエイトリンクを含みます
        </p>
      </div>

    </div>
  )
}
