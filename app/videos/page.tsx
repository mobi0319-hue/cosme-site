// 動画一覧ページ
import { getVideos } from '@/lib/data'
import VideosClient from './VideosClient'

export const metadata = {
  title: '動画一覧 | YouTuberが紹介したコスメまとめ',
  description: 'YouTuberのコスメ紹介動画一覧です。動画ごとに紹介商品をまとめています。',
  openGraph: {
    title: '動画一覧 | YouTuberが紹介したコスメまとめ',
    description: 'YouTuberのコスメ紹介動画一覧です。動画ごとに紹介商品をまとめています。',
    url: 'https://cosme-site.vercel.app/videos',
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
      <div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">動画一覧</h1>
      </div>
      <VideosClient videos={videos} channels={channels} />
    </div>
  )
}
