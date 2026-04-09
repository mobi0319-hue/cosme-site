// TOPページ：人気商品 + YouTuber + 動画 + 記事（悩み別はヒーロー内タグ）
import type { Metadata } from 'next'
import { getProductsSorted, getVideos, getCreators, getArticles, slugifyProduct, slugifyCreator } from '@/lib/data'
import { CONCERNS } from '@/lib/concerns'

export const metadata: Metadata = {
  title: 'コスメまとめ | YouTuberが紹介したコスメ・スキンケアを一覧でチェック',
  description: '人気YouTuberが動画で実際に使って紹介したコスメ・スキンケア商品をまとめて確認できます。複数人が選んだ商品は特におすすめ。',
  alternates: {
    canonical: 'https://cosme-ch.com',
  },
  openGraph: {
    title: 'コスメまとめ | YouTuberが紹介したコスメ・スキンケアを一覧でチェック',
    description: '人気YouTuberが動画で実際に使って紹介したコスメ・スキンケア商品をまとめて確認できます。複数人が選んだ商品は特におすすめ。',
    url: 'https://cosme-ch.com',
    siteName: 'コスメまとめ',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'コスメまとめ | YouTuberが紹介したコスメ・スキンケアを一覧でチェック',
    description: '人気YouTuberが動画で実際に使って紹介したコスメ・スキンケア商品をまとめて確認できます。',
  },
}

export default function Home() {
  const allProducts = getProductsSorted()
  const products = allProducts.slice(0, 12)
  const videos = getVideos().slice(0, 8)
  const creators = getCreators()
  const latestArticles = getArticles().slice(0, 6)

  return (
    <div className="space-y-10">

      {/* ヒーローセクション（悩み別タグ統合・コンパクト版） */}
      <section className="text-center py-5 sm:py-6 px-4 bg-white rounded-2xl border border-pink-100">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">
          YouTuberが紹介したコスメをまとめてチェック
        </h1>
        <p className="text-gray-400 text-xs mb-3">
          {creators.length}名のYouTuberが紹介した{allProducts.length}件のコスメを掲載中
        </p>
        <a href="/ranking"
          className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2 rounded-xl transition-colors text-sm mb-4">
          人気ランキングを見る
        </a>
        {/* 悩み・目的タグ */}
        <div className="flex flex-wrap justify-center gap-2 pt-3 border-t border-pink-50">
          {CONCERNS.map(concern => (
            <a
              key={concern.slug}
              href={`/concerns/${concern.slug}`}
              className="text-xs bg-pink-50 hover:bg-pink-100 text-pink-600 px-3 py-1.5 rounded-full transition-colors"
            >
              {concern.icon} {concern.title}
            </a>
          ))}
        </div>
      </section>

      {/* 人気商品 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">🔥 YouTuberイチオシのコスメ</h2>
          <a href="/products" className="text-sm text-pink-500 hover:underline">すべて見る →</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {products.map((product) => {
            const slug = slugifyProduct(product)
            return (
              <a
                key={slug}
                href={`/product/${encodeURIComponent(slug)}`}
                className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow"
              >
                {/* 商品画像 */}
                <div className="w-full aspect-square bg-pink-50 rounded-lg mb-2 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">💄</div>
                  )}
                </div>
                {product.mention_count >= 2 && (
                  <span className="text-xs bg-pink-100 text-pink-600 rounded-full px-2 py-0.5 mb-1 inline-block">
                    {product.mention_count}人が紹介
                  </span>
                )}
                <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.product_name}</p>
              </a>
            )
          })}
        </div>
      </section>

      {/* YouTuberから探す */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">👩 YouTuberから探す</h2>
          <a href="/creators" className="text-sm text-pink-500 hover:underline">すべて見る →</a>
        </div>
        <div className="flex flex-wrap gap-2">
          {creators.map((creator) => (
            <a
              key={creator.name}
              href={`/creator/${encodeURIComponent(slugifyCreator(creator.name))}`}
              className="bg-white border border-gray-100 rounded-full px-4 py-2 text-sm hover:bg-pink-50 hover:border-pink-200 transition-colors"
            >
              {creator.name}
              <span className="text-gray-400 ml-1 text-xs">({creator.videos.length}動画)</span>
            </a>
          ))}
        </div>
      </section>

      {/* 最新動画 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">🎬 動画から商品を探す</h2>
          <a href="/videos" className="text-sm text-pink-500 hover:underline">すべて見る →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map((video) => (
            <a
              key={video.video_id}
              href={`/video/${video.video_id}`}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow flex gap-3"
            >
              <img
                src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                alt={video.video_title}
                className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs text-pink-500 mb-1">{video.channel}</p>
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{video.video_title}</p>
                <p className="text-xs text-gray-400 mt-1">{video.products.length}商品紹介</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 最新記事 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">📝 最新のコスメ記事</h2>
          <a href="/articles" className="text-sm text-pink-500 hover:underline">すべて見る →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {latestArticles.map((article) => {
            const vidMatch = article.videoUrl.match(/[?&]v=([^&]+)/)
            const vid = vidMatch ? vidMatch[1] : null
            return (
              <a
                key={article.slug}
                href={`/articles/${encodeURIComponent(article.slug)}`}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow flex gap-3"
              >
                {vid && (
                  <img
                    src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                    alt={article.title}
                    className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-pink-500 mb-1">{article.channel}</p>
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">{article.title}</p>
                  {article.date && <p className="text-xs text-gray-400 mt-1">{article.date}</p>}
                </div>
              </a>
            )
          })}
        </div>
      </section>

    </div>
  )
}
