// 悩み別ページ一覧
import { CONCERNS, getProductsForConcern } from '@/lib/concerns'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '悩み別コスメまとめ | YouTuber紹介コスメ',
  description: '崩れにくいベースメイク・乾燥肌ケア・韓国コスメなど、悩みやテーマ別にYouTuberが紹介したコスメをまとめました。',
}

export default function ConcernsPage() {
  const concernsWithCount = CONCERNS.map(c => ({
    ...c,
    productCount: getProductsForConcern(c).length,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">悩み別コスメまとめ</h1>
        <p className="text-sm text-gray-500">YouTuberが紹介したコスメを、あなたの悩みや目的別にまとめました</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {concernsWithCount.map(concern => (
          <a key={concern.slug} href={`/concerns/${concern.slug}`}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-pink-200 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{concern.icon}</span>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-800 mb-1">{concern.title}</h2>
                <p className="text-xs text-gray-500 mb-2">{concern.subtitle}</p>
                <p className="text-xs text-pink-500">{concern.productCount}件の商品</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
