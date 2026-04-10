import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ページが見つかりません | コスメまとめ',
  description: 'お探しのページは見つかりませんでした。コスメまとめのトップページから商品やYouTuber情報をお探しください。',
}

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto text-center py-16 px-4">
      <p className="text-6xl mb-4">💄</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">ページが見つかりません</h1>
      <p className="text-sm text-gray-500 mb-8">
        お探しのページは移動・削除された可能性があります。
      </p>

      <div className="space-y-3">
        <a
          href="/"
          className="block bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          トップページへ
        </a>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="/ranking" className="text-sm text-pink-500 hover:text-pink-600">
            ランキング
          </a>
          <a href="/products" className="text-sm text-pink-500 hover:text-pink-600">
            商品一覧
          </a>
          <a href="/creators" className="text-sm text-pink-500 hover:text-pink-600">
            YouTuber
          </a>
          <a href="/articles" className="text-sm text-pink-500 hover:text-pink-600">
            記事
          </a>
        </div>
      </div>
    </div>
  )
}
