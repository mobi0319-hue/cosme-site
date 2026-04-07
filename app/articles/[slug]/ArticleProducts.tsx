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
            {/* 商品画像 + 商品名・ブランド */}
            <div className="flex gap-3 mb-3">
              {product.image_url ? (
                <a href={`/product/${encodeURIComponent(slugifyProduct(product))}`} className="flex-shrink-0">
                  <img src={product.image_url} alt={product.product_name}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100" loading="lazy" />
                </a>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <a
                  href={`/product/${encodeURIComponent(slugifyProduct(product))}`}
                  className="text-sm font-bold text-gray-800 hover:text-pink-600 transition-colors"
                >
                  {product.product_name}
                </a>
                <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
                {product.price && product.price !== '-' && (
                  <p className="text-xs text-gray-500 mt-0.5">{product.price}</p>
                )}
              </div>
            </div>

            {/* 購入ボタン */}
            <div className="flex flex-wrap gap-2">
              {/* Amazonボタン */}
              {product.amazon_url && (
                <a
                  href={product.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-colors shadow-sm flex-1 min-w-0 sm:min-w-[180px]"
                >
                  🛒 Amazonで見る
                </a>
              )}

              {/* 楽天ボタン */}
              {product.rakuten_url && (
                <a
                  href={product.rakuten_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-colors shadow-sm flex-1 min-w-0 sm:min-w-[180px]"
                >
                  🛒 楽天で見る
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
