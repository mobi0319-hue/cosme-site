import type { MetadataRoute } from 'next'
import { getProducts, slugifyProduct } from '@/lib/data'

const BASE_URL = 'https://cosme-ch.com'
const PRODUCTS_PER_SITEMAP = 2000

export async function generateSitemaps() {
  const products = getProducts()
  const count = Math.ceil(products.length / PRODUCTS_PER_SITEMAP)
  return Array.from({ length: count }, (_, i) => ({ id: i }))
}

export default async function sitemap(props: {
  id: Promise<string>
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id)
  const products = getProducts()
  const start = id * PRODUCTS_PER_SITEMAP
  const end = start + PRODUCTS_PER_SITEMAP
  const slice = products.slice(start, end)

  return slice.map(p => ({
    url: `${BASE_URL}/product/${encodeURIComponent(slugifyProduct(p))}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))
}
