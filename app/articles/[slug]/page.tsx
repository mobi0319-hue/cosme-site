// 個別記事ページ
import type { Metadata } from 'next'
import { getArticles, getArticleBySlug, getChannelDisplayInfo, getMatchedProductsForArticle } from '@/lib/data'
import { notFound } from 'next/navigation'
import ArticleContent from './ArticleContent'
import ArticleProducts from './ArticleProducts'

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
    alternates: {
      canonical: `https://cosme-ch.com/articles/${encodeURIComponent(article.slug)}`,
    },
    openGraph: {
      title: article.title,
      description: plainText,
      url: `https://cosme-ch.com/articles/${encodeURIComponent(article.slug)}`,
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

  // メタデータコメントとH1タイトルを除いたコンテンツを準備
  const contentForRender = article.content
    .replace(/<!--.*?-->/g, '')  // HTMLコメント除去
    .replace(/^#\s+.+$/m, '')    // H1タイトル除去（ページタイトルとして別途表示するため）
    .trim()

  // チャンネル情報
  const channelInfo = getChannelDisplayInfo(article.channel)

  // 記事本文に登場する商品をマッチング
  const matchedProducts = getMatchedProductsForArticle(article.content, article.channel)

  // Article 構造化データ（記事リッチスニペット用）
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    ...(article.date ? { datePublished: article.date } : {}),
    author: {
      '@type': 'Person',
      name: channelInfo.displayName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'コスメまとめ',
      url: 'https://cosme-ch.com',
    },
    mainEntityOfPage: `https://cosme-ch.com/articles/${encodeURIComponent(article.slug)}`,
    ...(videoId ? { image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` } : {}),
  }

  // BreadcrumbList 構造化データ
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'トップ',
        item: 'https://cosme-ch.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '記事一覧',
        item: 'https://cosme-ch.com/articles',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://cosme-ch.com/articles/${encodeURIComponent(article.slug)}`,
      },
    ],
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Article 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* パンくず構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* パンくずリスト */}
      <nav className="text-xs text-gray-400 mb-6">
        <a href="/" className="hover:text-pink-500 transition-colors">トップ</a>
        <span className="mx-1.5">/</span>
        <a href="/articles" className="hover:text-pink-500 transition-colors">記事一覧</a>
        <span className="mx-1.5">/</span>
        <span className="text-gray-600">{channelInfo.displayName}</span>
      </nav>

      {/* 記事ヘッダーカード */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        {/* 記事タイトル */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight mb-4">{article.title}</h1>

        {/* チャンネル情報ヘッダー */}
        <div className="flex items-center gap-3">
          {/* チャンネルアイコン */}
          {channelInfo.iconUrl ? (
            <img
              src={channelInfo.iconUrl}
              alt={channelInfo.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-sm font-bold text-pink-600">
              {channelInfo.displayName.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-800">{channelInfo.displayName}</p>
            {article.date && (
              <p className="text-xs text-gray-400">{article.date}</p>
            )}
          </div>
        </div>
      </div>

      {/* YouTube動画埋め込み */}
      {videoId && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube動画"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      )}

      {/* 記事本文 */}
      <ArticleContent content={contentForRender} videoId={null} channelName={channelInfo.displayName} channelIconUrl={channelInfo.iconUrl} />

      {/* この記事で紹介された商品（購入リンク付き） */}
      <ArticleProducts products={matchedProducts} />

      {/* 記事一覧に戻るリンク */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <a href="/articles" className="inline-flex items-center gap-1 text-pink-500 hover:text-pink-600 text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          記事一覧に戻る
        </a>
      </div>
    </div>
  )
}
