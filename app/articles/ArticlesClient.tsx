'use client'

import { useState } from 'react'

type ArticleItem = {
  slug: string
  title: string
  channel: string
  date: string
  videoUrl: string
  displayName: string
  iconUrl: string | null
  videoId: string | null
}

const ITEMS_PER_PAGE = 20

export default function ArticlesClient({ articles }: { articles: ArticleItem[] }) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const visibleArticles = articles.slice(0, visibleCount)
  const hasMore = visibleCount < articles.length

  return (
    <>
      <div className="space-y-4">
        {visibleArticles.map((article) => (
          <a
            key={article.slug}
            href={`/articles/${encodeURIComponent(article.slug)}`}
            className="block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-pink-200 transition-all duration-200 group"
          >
            {article.videoId && (
              <div className="relative w-full aspect-video bg-gray-50 overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${article.videoId}/hqdefault.jpg`}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  動画あり
                </div>
              </div>
            )}
            <div className="p-4">
              <h2 className="text-sm font-bold text-gray-800 line-clamp-2 mb-3 group-hover:text-pink-600 transition-colors">
                {article.title}
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {article.iconUrl ? (
                    <img src={article.iconUrl} alt={article.displayName} className="w-6 h-6 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-600">
                      {article.displayName.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-600">{article.displayName}</span>
                </div>
                {article.date && (
                  <span className="text-xs text-gray-400">{article.date}</span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            もっと見る（残り{articles.length - visibleCount}件）
          </button>
        </div>
      )}

      {!hasMore && articles.length > ITEMS_PER_PAGE && (
        <p className="text-center text-xs text-gray-400 mt-6">全{articles.length}件を表示中</p>
      )}
    </>
  )
}
