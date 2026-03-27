import { getProducts, getVideos, getCreators, getArticles, slugifyProduct, slugifyCreator } from '@/lib/data'

const BASE_URL = 'https://cosme-site.vercel.app'

export default function sitemap() {
  const products = getProducts()
  const videos = getVideos()
  const creators = getCreators()
  const articles = getArticles()

  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${BASE_URL}/ranking`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.95 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE_URL}/videos`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE_URL}/creators`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
  ]

  const productPages = products.map(p => ({
    url: `${BASE_URL}/product/${encodeURIComponent(slugifyProduct(p))}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const videoPages = videos.map(v => ({
    url: `${BASE_URL}/video/${v.video_id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  const creatorPages = creators.map(c => ({
    url: `${BASE_URL}/creator/${encodeURIComponent(slugifyCreator(c.name))}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  const articleListPage = {
    url: `${BASE_URL}/articles`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }

  const articlePages = articles.map(a => ({
    url: `${BASE_URL}/articles/${encodeURIComponent(a.slug)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, articleListPage, ...productPages, ...videoPages, ...creatorPages, ...articlePages]
}
