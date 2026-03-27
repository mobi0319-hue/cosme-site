// 記事一覧ページ
import type { Metadata } from 'next'
import { getArticles } from '@/lib/data'

export const metadata: Metadata = {
  title: 'コスメ記事一覧 | YouTuber紹介コスメまとめ',
  description: '人気YouTuberが動画で紹介したコスメの詳細記事一覧。商品レビューやおすすめポイントをまとめてチェックできます。',
  openGraph: {
    title: 'コスメ記事一覧 | YouTuber紹介コスメまとめ',
    description: '人気YouTuberが動画で紹介したコスメの詳細記事一覧。',
    url: 'https://cosme-site.vercel.app/articles',
    siteName: 'コスメまとめ',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function ArticlesPage() {
  const articles = getArticles()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        コスメ記事一覧
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        YouTuberが動画で紹介したコスメをまとめた記事 {articles.length}件
      </p>

      <div className="space-y-3">
        {articles.map((article) => (
          <a
            key={article.slug}
            href={`/articles/${encodeURIComponent(article.slug)}`}
            className="block bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                  {article.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full">
                    {article.channel}
                  </span>
                  {article.date && <span>{article.date}</span>}
                </div>
              </div>
              {/* YouTube動画URLからサムネイルを取得 */}
              {article.videoUrl && (() => {
                const vidMatch = article.videoUrl.match(/[?&]v=([^&]+)/)
                const vid = vidMatch ? vidMatch[1] : null
                return vid ? (
                  <img
                    src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                    alt=""
                    className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                ) : null
              })()}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
