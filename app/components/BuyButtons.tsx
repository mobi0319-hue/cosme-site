// 購入CTAボタン共通コンポーネント
// 楽天が直リンク（item.rakuten を含む URL）の場合は楽天を1番目（主役）にする
import type { Product } from '@/lib/data'

type Props = {
  product: Product
  /** 'full'=flex-col sm:flex-row 縦積み  'compact'=flex-row 横並び（スティッキー等） */
  layout?: 'full' | 'compact'
}

function isRakutenDirectLink(url: string): boolean {
  return url.includes('item.rakuten')
}

export default function BuyButtons({ product, layout = 'full' }: Props) {
  const { amazon_url, rakuten_url } = product
  if (!amazon_url && !rakuten_url) return null

  const rakutenIsDirect = rakuten_url ? isRakutenDirectLink(rakuten_url) : false

  // 楽天直リンクがある場合は楽天を主役(1番目)にする
  // 主役ボタン: 大きめのスタイル、控えめボタン: サブスタイル
  const wrapperClass =
    layout === 'full'
      ? 'flex flex-col sm:flex-row gap-3'
      : 'flex gap-2'

  const pyFull = layout === 'full' ? 'py-4' : 'py-3'
  const textSize = layout === 'full' ? 'text-base' : 'text-sm'

  // ボタン定義
  const rakutenBtn = rakuten_url ? (
    <a
      key="rakuten"
      href={rakuten_url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={`flex-1 bg-red-500 hover:bg-red-600 text-white text-center font-bold ${pyFull} rounded-xl transition-colors ${textSize} shadow-sm`}
    >
      楽天で購入する
    </a>
  ) : null

  const amazonBtn = amazon_url ? (
    <a
      key="amazon"
      href={amazon_url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={`flex-1 ${rakutenIsDirect ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'} text-center font-bold ${pyFull} rounded-xl transition-colors ${textSize} shadow-sm`}
    >
      Amazonで見る
    </a>
  ) : null

  const buttons = rakutenIsDirect
    ? [rakutenBtn, amazonBtn]
    : [amazonBtn, rakutenBtn]

  return <div className={wrapperClass}>{buttons}</div>
}
