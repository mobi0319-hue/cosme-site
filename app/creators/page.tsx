// YouTuber一覧ページ
import { getCreators, slugifyCreator } from '@/lib/data'
import PageHeader from '@/app/components/PageHeader'

export const metadata = {
  title: 'YouTuber一覧 | コスメまとめ',
  description: 'コスメを紹介しているYouTuber一覧です。各YouTuberの紹介商品をまとめています。',
  alternates: {
    canonical: 'https://cosme-ch.com/creators',
  },
  openGraph: {
    title: 'YouTuber一覧 | コスメまとめ',
    description: 'コスメを紹介しているYouTuber一覧です。各YouTuberの紹介商品をまとめています。',
    url: 'https://cosme-ch.com/creators',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function CreatorsPage() {
  const creators = getCreators()

  return (
    <div className="space-y-6">
      <PageHeader
        title="YouTuber一覧"
        subtitle={`コスメを紹介している ${creators.length}チャンネル`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {creators.map((creator) => {
          const slug = slugifyCreator(creator.name)
          return (
            <a
              key={creator.name}
              href={`/creator/${encodeURIComponent(slug)}`}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                {creator.icon_url ? (
                  <img src={creator.icon_url} alt={creator.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" loading="lazy" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-lg flex-shrink-0">
                    {creator.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-gray-800 truncate">{creator.name}</h2>
                  <p className="text-sm text-gray-500">{creator.videos.length}本の紹介動画</p>
                </div>
              </div>

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
