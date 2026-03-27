// 記事ページ末尾の「この記事で紹介された商品」セクション
// products.jsonとマッチした商品の購入リンクを表示する

import type { Product } from '@/lib/data'
import { slugifyProduct } from '@/lib/data'

type Props = {
  products: Product[]
}

export default function ArticleProducts({ products }: Props) {
  if (products.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 mt-4">
      {/* セクションタイトル */}
      <h2 className="text-lg font-bold text-gray-800 mb-5 pl-4 py-2.5 border-l-4 border-pink-400 bg-pink-50/60 rounded-r-lg">
        この記事で紹介された商品
      </h2>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={`${product.brand}-${product.product_name}`}
            className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-pink-200 transition-colors"
          >
            {/* 商品名・ブランド */}
            <div className="mb-3">
              <a
                href={`/products/${encodeURIComponent(slugifyProduct(product))}`}
                className="text-sm font-bold text-gray-800 hover:text-pink-600 transition-colors"
              >
                {product.product_name}
              </a>
              <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
              {product.price && product.price !== '-' && (
                <p className="text-xs text-gray-500 mt-0.5">{product.price}</p>
              )}
            </div>

            {/* 購入ボタン */}
            <div className="flex flex-wrap gap-2">
              {/* Amazonボタン（大きく表示） */}
              {product.amazon_url && (
                <a
                  href={product.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center justify-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm flex-1 min-w-[200px]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  Amazonで価格をチェック
                </a>
              )}

              {/* 楽天ボタン（小さめ） */}
              {product.rakuten_url && (
                <a
                  href={product.rakuten_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  楽天で見る
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 注意書き */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        ※ 価格は変動する場合があります。最新の価格はリンク先でご確認ください。
      </p>
    </div>
  )
}
