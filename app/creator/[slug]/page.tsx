// YouTuberページ：動画一覧 + よく出る商品
import { getCreators, getCreatorBySlug, slugifyCreator, slugifyProduct } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const creators = getCreators()
  return creators.map((c) => ({ slug: slugifyCreator(c.name) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const creator = getCreatorBySlug(decodeURIComponent(slug))
  if (!creator) return {}
  return {
    title: `${creator.name} 紹介コスメまとめ | YouTuberコスメ`,
    description: `${creator.name}が動画で紹介したコスメ・スキンケア商品${creator.top_products.length}点をまとめています。`,
    alternates: {
      canonical: `https://cosme-ch.com/creator/${slug}`,
    },
    openGraph: {
      title: `${creator.name} 紹介コスメまとめ | YouTuberコスメ`,
      description: `${creator.name}が動画で紹介したコスメ・スキンケア商品${creator.top_products.length}点をまとめています。`,
      url: `https://cosme-ch.com/creator/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
    },
  }
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const creator = getCreatorBySlug(decodeURIComponent(slug))
  if (!creator) notFound()

  // Person 構造化データ（YouTuberリッチスニペット用）
  const personData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: creator.name,
    url: creator.url,
    sameAs: [creator.url],
    ...(creator.icon_url ? { image: creator.icon_url } : {}),
    description: `${creator.name}が動画で紹介したコスメ・スキンケア商品${creator.top_products.length}点をまとめています。`,
  }

  // パンくず構造化データ
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "TOP", item: "https://cosme-ch.com/" },
      { "@type": "ListItem", position: 2, name: "YouTuber一覧", item: "https://cosme-ch.com/creators" },
      { "@type": "ListItem", position: 3, name: creator.name },
    ],
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Person 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personData) }}
      />
      {/* パンくず構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      {/* パンくず */}
      <nav className="text-xs text-gray-400 flex gap-1">
        <a href="/" className="hover:text-pink-500">TOP</a>
        <span>/</span>
        <a href="/creators" className="hover:text-pink-500">YouTuber一覧</a>
        <span>/</span>
        <span>{creator.name}</span>
      </nav>

      {/* クリエイター情報 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4 mb-4">
          {creator.icon_url ? (
            <img src={creator.icon_url} alt={creator.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-2xl flex-shrink-0">
              {creator.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800">{creator.name}</h1>
            <p className="text-sm text-gray-500">{creator.videos.length}本の紹介動画</p>
          </div>
        </div>
        <a
          href={creator.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full transition-colors inline-block"
        >
          YouTubeチャンネルを見る ↗
        </a>
      </div>

      {/* よく出る商品 */}
      {creator.top_products.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">🛍️ よく紹介する商品</h2>
          <div className="grid grid-cols-2 gap-3">
            {creator.top_products.map((product) => {
              const pSlug = slugifyProduct(product)
              return (
                <a
                  key={pSlug}
                  href={`/product/${encodeURIComponent(pSlug)}`}
                  className="border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow flex gap-3"
                >
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.product_name}
                      className="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0" loading="lazy" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.product_name}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* 動画一覧 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-base font-bold text-gray-800 mb-4">🎬 動画一覧</h2>
        {creator.videos.length === 0 ? (
          <p className="text-sm text-gray-400">動画データがまだありません</p>
        ) : (
          <div className="space-y-3">
            {creator.videos.map((video) => (
              <a
                key={video.video_id}
                href={`/video/${video.video_id}`}
                className="flex gap-3 border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                  alt={video.video_title}
                  className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">{video.video_title}</p>
                  <p className="text-xs text-gray-400 mt-1">{video.products.length}商品紹介</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
