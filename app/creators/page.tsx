// YouTuber一覧ページ
import { getCreators, slugifyCreator } from '@/lib/data'

export const metadata = {
  title: 'YouTuber一覧 | コスメまとめ',
  description: 'コスメを紹介しているYouTuber一覧です。各YouTuberの紹介商品をまとめています。',
}

export default function CreatorsPage() {
  const creators = getCreators()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">YouTuber一覧</h1>
        <p className="text-sm text-gray-500">{creators.length}チャンネル</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {creators.map((creator) => {
          const slug = slugifyCreator(creator.name)
          return (
            <a
              key={creator.name}
              href={`/creator/${encodeURIComponent(slug)}`}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <h2 className="text-base font-bold text-gray-800 mb-1">{creator.name}</h2>
              <p className="text-sm text-gray-500 mb-3">{creator.videos.length}本の動画を収録</p>

              {/* よく出る商品プレビュー */}
              {creator.top_products.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">よく紹介する商品：</p>
                  {creator.top_products.slice(0, 3).map((p, i) => (
                    <p key={i} className="text-xs text-gray-600">・{p.brand} {p.product_name}</p>
                  ))}
                </div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
