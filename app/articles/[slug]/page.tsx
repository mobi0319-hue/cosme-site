// 個別記事ページ
import type { Metadata } from 'next'
import { getArticles, getArticleBySlug } from '@/lib/data'
import { notFound } from 'next/navigation'
import ArticleContent from './ArticleContent'

// 全記事のスラッグを静的パスとして生成
export function generateStaticParams() {
  const articles = getArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

// メタデータ生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(decodeURIComponent(slug))
  if (!article) return { title: '記事が見つかりません' }

  // 記事本文の冒頭150文字をdescriptionに
  const plainText = article.content
    .replace(/<!--.*?-->/g, '')
    .replace(/^#.+$/m, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/[*#>\-|]/g, '')
    .trim()
    .slice(0, 150)

  return {
    title: `${article.title} | コスメまとめ`,
    description: plainText,
    openGraph: {
      title: article.title,
      description: plainText,
      url: `https://cosme-site.vercel.app/articles/${encodeURIComponent(article.slug)}`,
      siteName: 'コスメまとめ',
      locale: 'ja_JP',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: plainText,
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getArticleBySlug(decodeURIComponent(slug))
  if (!article) notFound()

  // YouTube動画IDを抽出
  const videoIdMatch = article.videoUrl.match(/[?&]v=([^&]+)/)
  const videoId = videoIdMatch ? videoIdMatch[1] : null

  // [YOUTUBE_EMBED] をプレースホルダーとして残し、クライアントで埋め込む
  // メタデータコメントとH1タイトルを除いたコンテンツを準備
  const contentForRender = article.content
    .replace(/<!--.*?-->/g, '')  // HTMLコメント除去
    .replace(/^#\s+.+$/m, '')    // H1タイトル除去（ページタイトルとして別途表示するため）
    .trim()

  // BreadcrumbList 構造化データ
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'トップ',
        item: 'https://cosme-site.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '記事一覧',
        item: 'https://cosme-site.vercel.app/articles',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://cosme-site.vercel.app/articles/${encodeURIComponent(article.slug)}`,
      },
    ],
  }

  return (
    <div>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* パンくずリスト */}
      <nav className="text-xs text-gray-400 mb-4">
        <a href="/" className="hover:text-pink-500">トップ</a>
        <span className="mx-1">/</span>
        <a href="/articles" className="hover:text-pink-500">記事一覧</a>
        <span className="mx-1">/</span>
        <span className="text-gray-600">{article.channel}</span>
      </nav>

      {/* 記事タイトル */}
      <h1 className="text-xl font-bold text-gray-800 mb-2">{article.title}</h1>

      {/* メタ情報 */}
      <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
        <span className="bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full text-xs">
          {article.channel}
        </span>
        {article.date && <span>{article.date}</span>}
      </div>

      {/* 記事本文 */}
      <ArticleContent content={contentForRender} videoId={videoId} />

      {/* 記事一覧に戻るリンク */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <a href="/articles" className="text-pink-500 hover:underline text-sm">
          ← 記事一覧に戻る
        </a>
      </div>
    </div>
  )
}
