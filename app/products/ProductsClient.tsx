'use client'

import { useState } from 'react'
import type { Product } from '@/lib/data'

type Props = {
  products: Product[]
  categories: string[]
  topProduct: Product | null
}

function slugifyProduct(product: Product): string {
  const str = `${product.brand}-${product.product_name}`
  return str
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}


export default function ProductsClient({ products, categories, topProduct }: Props) {
  const [selectedCat, setSelectedCat] = useState<string>('すべて')
  const [selectedBrand, setSelectedBrand] = useState<string>('すべて')

  // 表示対象フィルタリング
  const filtered = products.filter(p => {
    const catOk = selectedCat === 'すべて' || p.category === selectedCat
    const brandOk = selectedBrand === 'すべて' || p.brand === selectedBrand
    return catOk && brandOk
  })

  // ブランド一覧（5件以上の商品を持つブランドのみ）
  const brandCounts: Record<string, number> = {}
  products.forEach(p => { brandCounts[p.brand] = (brandCounts[p.brand] ?? 0) + 1 })
  const topBrands = Object.entries(brandCounts)
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([brand]) => brand)
    .slice(0, 15)

  // 上位10件（早見リスト用）
  const top10 = products.slice(0, 10)

  // 中盤CTA挿入位置
  const midIndex = Math.floor(filtered.length / 2)

  return (
    <div className="space-y-6">

      {/* ページヘッダー */}
      <div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">商品一覧</h1>
        <p className="text-sm text-gray-500">{products.length}商品（YouTuberが動画で紹介した実商品のみ）</p>
      </div>

      {/* 早見ランキングリスト（冒頭）*/}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <h2 className="text-base font-bold text-gray-800 mb-3">🏆 人気ランキングTOP10</h2>
        <ol className="space-y-2">
          {top10.map((p, i) => {
            const slug = slugifyProduct(p)
            return (
              <li key={slug}>
                <a
                  href={`/product/${encodeURIComponent(slug)}`}
                  className="flex items-center gap-3 hover:bg-pink-50 rounded-lg px-2 py-1.5 transition-colors"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-400 text-yellow-900' :
                    i === 1 ? 'bg-gray-300 text-gray-700' :
                    i === 2 ? 'bg-orange-400 text-white' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 min-w-0 truncate">
                    <span className="text-xs text-gray-400 mr-1">{p.brand}</span>
                    <span className="text-sm text-gray-800">{p.product_name}</span>
                  </span>
                  {p.mention_count >= 2 && (
                    <span className="text-xs bg-pink-500 text-white rounded-full px-2 py-0.5 flex-shrink-0">
                      {p.mention_count}人が紹介
                    </span>
                  )}
                </a>
              </li>
            )
          })}
        </ol>
      </div>

      {/* カテゴリフィルタ */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">カテゴリで絞り込む</p>
        <div className="flex flex-wrap gap-2">
          {['すべて', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`text-xs rounded-full px-3 py-1.5 transition-colors ${
                selectedCat === cat
                  ? 'bg-pink-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ブランドフィルタ */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">ブランドで絞り込む</p>
        <div className="flex flex-wrap gap-2">
          {['すべて', ...topBrands].map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`text-xs rounded-full px-3 py-1.5 transition-colors ${
                selectedBrand === brand
                  ? 'bg-gray-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* 件数表示 */}
      {(selectedCat !== 'すべて' || selectedBrand !== 'すべて') && (
        <p className="text-sm text-gray-500">
          {filtered.length}件
          {selectedCat !== 'すべて' && ` · ${selectedCat}`}
          {selectedBrand !== 'すべて' && ` · ${selectedBrand}`}
          <button
            onClick={() => { setSelectedCat('すべて'); setSelectedBrand('すべて') }}
            className="ml-2 text-pink-500 underline text-xs"
          >
            リセット
          </button>
        </p>
      )}

      {/* 商品グリッド（中盤CTAを挟む） */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" id="products-grid">
          {filtered.slice(0, midIndex).map((product) => {
            const slug = slugifyProduct(product)
            return (
              <a
                key={slug}
                id={slug}
                href={`/product/${encodeURIComponent(slug)}`}
                className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow"
              >
                <div className="w-full aspect-square bg-pink-50 rounded-lg mb-2 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">💄</div>
                  )}
                </div>
                {product.mention_count >= 2 && (
                  <span className="text-xs bg-pink-500 text-white rounded-full px-2 py-0.5 mb-1 inline-block font-bold">
                    ★ {product.mention_count}人が紹介
                  </span>
                )}
                <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.product_name}</p>
                {product.price && (
                  <p className="text-xs font-bold text-gray-700 mt-1">{product.price}</p>
                )}
              </a>
            )
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.slice(midIndex).map((product) => {
            const slug = slugifyProduct(product)
            return (
              <a
                key={slug}
                id={`${slug}-2`}
                href={`/product/${encodeURIComponent(slug)}`}
                className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow"
              >
                <div className="w-full aspect-square bg-pink-50 rounded-lg mb-2 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">💄</div>
                  )}
                </div>
                {product.mention_count >= 2 && (
                  <span className="text-xs bg-pink-500 text-white rounded-full px-2 py-0.5 mb-1 inline-block font-bold">
                    ★ {product.mention_count}人が紹介
                  </span>
                )}
                <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.product_name}</p>
                {product.price && (
                  <p className="text-xs font-bold text-gray-700 mt-1">{product.price}</p>
                )}
              </a>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center pb-4">
        ※ 当サイトはアフィリエイトリンクを含みます
      </p>
    </div>
  )
}
