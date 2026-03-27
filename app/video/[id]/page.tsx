// 動画ページ：タイムスタンプ + 商品一覧 + 購入ボタン
import { getVideos, getVideoById, slugifyProduct, slugifyCreator } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const videos = getVideos()
  return videos.map((v) => ({ id: v.video_id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const video = getVideoById(id)
  if (!video) return {}
  return {
    title: `${video.video_title} | 紹介コスメまとめ`,
    description: `${video.channel}の動画「${video.video_title}」で紹介されたコスメ${video.products.length}商品をまとめて確認できます。`,
    openGraph: {
      title: `${video.video_title} | 紹介コスメまとめ`,
      description: `${video.channel}の動画「${video.video_title}」で紹介されたコスメ${video.products.length}商品をまとめて確認できます。`,
      url: `https://cosme-site.vercel.app/video/${id}`,
      images: [{ url: `https://img.youtube.com/vi/${id}/hqdefault.jpg` }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`https://img.youtube.com/vi/${id}/hqdefault.jpg`],
    },
  }
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const video = getVideoById(id)
  if (!video) notFound()

  const creatorSlug = slugifyCreator(video.channel)

  // パンくず構造化データ
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "TOP", item: "https://cosme-site.vercel.app/" },
      { "@type": "ListItem", position: 2, name: "動画一覧", item: "https://cosme-site.vercel.app/videos" },
      { "@type": "ListItem", position: 3, name: video.video_title },
    ],
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* パンくず構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      {/* パンくず */}
      <nav className="text-xs text-gray-400 flex gap-1 flex-wrap">
        <a href="/" className="hover:text-pink-500">TOP</a>
        <span>/</span>
        <a href="/videos" className="hover:text-pink-500">動画一覧</a>
        <span>/</span>
        <span className="line-clamp-1">{video.video_title}</span>
      </nav>

      {/* 動画情報 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs text-pink-500 mb-1">
          <a href={`/creator/${encodeURIComponent(creatorSlug)}`} className="hover:underline">
            {video.channel}
          </a>
        </p>
        <h1 className="text-lg font-bold text-gray-800 mb-4">{video.video_title}</h1>

        {/* YouTube埋め込み */}
        <div className="relative pb-[56.25%] rounded-xl overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${video.video_id}`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allowFullScreen
            loading="lazy"
          />
        </div>

        <div className="mt-3 flex gap-2">
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-full transition-colors"
          >
            YouTubeで見る ↗
          </a>
          <a
            href={`/creator/${encodeURIComponent(creatorSlug)}`}
            className="text-xs bg-pink-50 hover:bg-pink-100 text-pink-600 px-3 py-1.5 rounded-full transition-colors"
          >
            {video.channel}の他の動画
          </a>
        </div>
      </div>

      {/* 紹介商品一覧 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-base font-bold text-gray-800 mb-4">
          🛍️ この動画で紹介された商品（{video.products.length}件）
        </h2>
        <div className="space-y-4">
          {video.products.map((product) => {
            const slug = slugifyProduct(product)
            // この動画でのコメントを取得
            const mention = product.mentioned_by.find(m => {
              const vid = m.video_url.match(/[?&]v=([^&]+)/)?.[1]
              return vid === video.video_id
            })

            return (
              <div key={slug} className="border border-gray-100 rounded-xl p-4">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{product.brand}</p>
                    <a
                      href={`/product/${encodeURIComponent(slug)}`}
                      className="text-sm font-bold text-gray-800 hover:text-pink-500 transition-colors"
                    >
                      {product.product_name}
                    </a>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  {product.mention_count >= 2 && (
                    <span className="text-xs bg-pink-100 text-pink-600 rounded-full px-2 py-0.5 flex-shrink-0">
                      {product.mention_count}人が紹介
                    </span>
                  )}
                </div>

                {/* 動画内コメント */}
                {mention?.context && (
                  <blockquote className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2 border-l-2 border-pink-200 mb-3">
                    {mention.context}
                  </blockquote>
                )}

                {/* 購入ボタン（各商品行に配置） */}
                <div className="flex gap-2 flex-wrap">
                  {product.amazon_url && (
                    <a
                      href={product.amazon_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-full font-bold transition-colors shadow-sm"
                    >
                      🛒 Amazon価格チェック
                    </a>
                  )}
                  {product.rakuten_url && (
                    <a
                      href={product.rakuten_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full font-bold transition-colors"
                    >
                      楽天
                    </a>
                  )}
                  <a
                    href={`/product/${encodeURIComponent(slug)}`}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                  >
                    詳細を見る
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
