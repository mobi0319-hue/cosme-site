// 動画一覧ページ
import { getVideos } from '@/lib/data'

export const metadata = {
  title: '動画一覧 | YouTuberが紹介したコスメまとめ',
  description: 'YouTuberのコスメ紹介動画一覧です。動画ごとに紹介商品をまとめています。',
}

export default function VideosPage() {
  const videos = getVideos()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">動画一覧</h1>
        <p className="text-sm text-gray-500">{videos.length}動画</p>
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
              className="w-28 h-18 object-cover rounded-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs text-pink-500 mb-1">{video.channel}</p>
              <p className="text-sm font-medium text-gray-800 line-clamp-2">{video.video_title}</p>
              <p className="text-xs text-gray-400 mt-1">{video.products.length}商品紹介</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
