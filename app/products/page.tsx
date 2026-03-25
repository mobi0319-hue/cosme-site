// 商品一覧ページ
import { getProductsSorted, getCategories } from '@/lib/data'
import ProductsClient from './ProductsClient'

export const metadata = {
  title: '商品一覧 | YouTuberが紹介したコスメまとめ',
  description: 'YouTuberが動画で紹介したコスメ・スキンケア商品の一覧です。',
}

export default function ProductsPage() {
  const products = getProductsSorted()
  const categories = getCategories()
  const topProduct = products[0] ?? null

  return (
    <ProductsClient
      products={products}
      categories={categories}
      topProduct={topProduct}
    />
  )
}
