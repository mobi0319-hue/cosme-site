// 記事一覧ページ
import type { Metadata } from 'next'
import { getArticles, getChannelDisplayInfo } from '@/lib/data'

export const metadata: Metadata = {
  title: 'コスメ記事一覧 | YouTuber紹介コスメまとめ',
  description: '人気YouTuberが動画で紹介したコスメの詳細記事一覧。商品レビューやおすすめポイントをまとめてチェックできます。',
  openGraph: {
    title: 'コスメ記事一覧 | YouTuber紹介コスメまとめ',
    description: '人気YouTuberが動画で紹介したコスメの詳細記事一覧。',
    url: 'https://cosme-ch.com/articles',
    siteName: 'コスメまとめ',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function ArticlesPage() {
  const articles = getArticles()

  return (
    <div className="max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          コスメ記事一覧
        </h1>
        <p className="text-gray-400 text-sm">
          YouTuberが動画で紹介したコスメをまとめた記事 <span className="text-pink-500 font-bold">{articles.length}</span>件
        </p>
      </div>

      {/* 記事カード一覧 */}
      <div className="space-y-4">
        {articles.map((article) => {
          // YouTubeサムネイル取得
          const vidMatch = article.videoUrl?.match(/[?&]v=([^&]+)/)
          const vid = vidMatch ? vidMatch[1] : null
          // チャンネル情報
          const channelInfo = getChannelDisplayInfo(article.channel)

          return (
            <a
              key={article.slug}
              href={`/articles/${encodeURIComponent(article.slug)}`}
              className="block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-pink-200 transition-all duration-200 group"
            >
              {/* サムネイル（大きく表示） */}
              {vid && (
                <div className="relative w-full aspect-video bg-gray-50 overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* 動画アイコンオーバーレイ */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    動画あり
                  </div>
                </div>
              )}

              {/* コンテンツ部分 */}
              <div className="p-4">
                {/* 記事タイトル */}
                <h2 className="text-sm font-bold text-gray-800 line-clamp-2 mb-3 group-hover:text-pink-600 transition-colors">
                  {article.title}
                </h2>

                {/* チャンネル情報 + 日付 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* チャンネルアイコン */}
                    {channelInfo.iconUrl ? (
                      <img
                        src={channelInfo.iconUrl}
                        alt={channelInfo.displayName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-600">
                        {channelInfo.displayName.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-600">
                      {channelInfo.displayName}
                    </span>
                  </div>
                  {article.date && (
                    <span className="text-xs text-gray-400">
                      {article.date}
                    </span>
                  )}
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
