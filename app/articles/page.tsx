// 記事一覧ページ（ページネーション対応）
import type { Metadata } from 'next'
import { getArticles, getChannelDisplayInfo } from '@/lib/data'
import ArticlesClient from './ArticlesClient'

export const metadata: Metadata = {
  title: 'コスメ記事一覧 | YouTuber紹介コスメまとめ',
  description: '人気YouTuberが動画で紹介したコスメの詳細記事一覧。商品レビューやおすすめポイントをまとめてチェックできます。',
  alternates: {
    canonical: 'https://cosme-ch.com/articles',
  },
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

  // クライアントに渡すデータを整形（contentは不要なので除外して軽量化）
  const articleItems = articles.map((article) => {
    const vidMatch = article.videoUrl?.match(/[?&]v=([^&]+)/)
    const channelInfo = getChannelDisplayInfo(article.channel)
    return {
      slug: article.slug,
      title: article.title,
      channel: article.channel,
      date: article.date,
      videoUrl: article.videoUrl,
      displayName: channelInfo.displayName,
      iconUrl: channelInfo.iconUrl,
      videoId: vidMatch ? vidMatch[1] : null,
    }
  })

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

      <ArticlesClient articles={articleItems} />
    </div>
  )
}
