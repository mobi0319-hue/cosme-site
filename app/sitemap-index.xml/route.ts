import { getProducts } from '@/lib/data'

const BASE_URL = 'https://cosme-ch.com'
const PRODUCTS_PER_SITEMAP = 2000

export function GET() {
  const products = getProducts()
  const sitemapCount = Math.ceil(products.length / PRODUCTS_PER_SITEMAP)
  const now = new Date().toISOString()

  const sitemaps = [
    `${BASE_URL}/sitemap.xml`,
    ...Array.from({ length: sitemapCount }, (_, i) =>
      `${BASE_URL}/product/sitemap/${i}.xml`
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
