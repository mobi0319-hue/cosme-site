// 動画一覧ページ
import { getVideos } from '@/lib/data'
import VideosClient from './VideosClient'
import PageHeader from '@/app/components/PageHeader'

export const metadata = {
  title: '動画一覧 | YouTuberが紹介したコスメまとめ',
  description: 'YouTuberのコスメ紹介動画一覧です。動画ごとに紹介商品をまとめています。',
  alternates: {
    canonical: 'https://cosme-ch.com/videos',
  },
  openGraph: {
    title: '動画一覧 | YouTuberが紹介したコスメまとめ',
    description: 'YouTuberのコスメ紹介動画一覧です。動画ごとに紹介商品をまとめています。',
    url: 'https://cosme-ch.com/videos',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function VideosPage() {
  const videos = getVideos()
  // チャンネル一覧（動画数の多い順）
  const channelCounts = new Map<string, number>()
  for (const v of videos) {
    channelCounts.set(v.channel, (channelCounts.get(v.channel) ?? 0) + 1)
  }
  const channels = [...channelCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([ch]) => ch)

  return (
    <div className="space-y-6">
      <PageHeader
        title="動画一覧"
        subtitle={`YouTuberのコスメ紹介動画 ${videos.length}本`}
      />
      <VideosClient videos={videos} channels={channels} />
    </div>
  )
}
