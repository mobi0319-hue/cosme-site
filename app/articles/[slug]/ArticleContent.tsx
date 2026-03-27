'use client'

// 記事本文のMarkdownレンダリング（クライアントコンポーネント）
import ReactMarkdown from 'react-markdown'

type Props = {
  content: string
  videoId: string | null
}

export default function ArticleContent({ content, videoId }: Props) {
  // [YOUTUBE_EMBED] の前後でコンテンツを分割
  const parts = content.split('[YOUTUBE_EMBED]')

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6">
      {parts.map((part, i) => (
        <div key={i}>
          {/* Markdownレンダリング */}
          <ReactMarkdown
            components={{
              // 見出し
              h2: ({ children }) => (
                <h2 className="text-lg font-bold text-gray-800 mt-8 mb-3 pb-2 border-b border-pink-100">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-bold text-gray-700 mt-6 mb-2">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-sm font-bold text-gray-600 mt-4 mb-1">{children}</h4>
              ),
              // 段落
              p: ({ children }) => (
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{children}</p>
              ),
              // 強調
              strong: ({ children }) => (
                <strong className="font-bold text-gray-800">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="text-gray-500 text-xs">{children}</em>
              ),
              // リンク（Amazon・楽天リンク対応）
              a: ({ href, children }) => {
                const text = String(children)
                const isAmazon = text.includes('Amazon') || (href && href.includes('amazon'))
                const isRakuten = text.includes('楽天') || (href && href.includes('rakuten'))
                if (isAmazon) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-block bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg mr-2 mb-1 transition-colors"
                    >
                      {text}
                    </a>
                  )
                }
                if (isRakuten) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-block bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg mr-2 mb-1 transition-colors"
                    >
                      {text}
                    </a>
                  )
                }
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:underline"
                  >
                    {children}
                  </a>
                )
              },
              // リスト
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-sm text-gray-700 mb-3 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-sm text-gray-700 mb-3 space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              // 引用（YouTuberのコメント）
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-pink-300 bg-pink-50 pl-4 py-2 my-3 text-sm text-gray-700 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              // 水平線
              hr: () => (
                <hr className="my-6 border-gray-100" />
              ),
            }}
          >
            {part.trim()}
          </ReactMarkdown>

          {/* [YOUTUBE_EMBED] の位置にYouTube埋め込みを表示 */}
          {i < parts.length - 1 && videoId && (
            <div className="my-6">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube動画"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full rounded-xl"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
