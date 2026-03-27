'use client'

// 記事本文のMarkdownレンダリング（クライアントコンポーネント）
import ReactMarkdown from 'react-markdown'
import type { ReactNode } from 'react'

type Props = {
  content: string
  videoId: string | null
  channelName?: string
  channelIconUrl?: string | null
}

// 冒頭の「この動画で紹介されたアイテム一覧」セクションからリンクを除去する（目次化）
function removeLinksFromItemList(markdown: string): string {
  // 「この動画で紹介されたアイテム一覧」と「各アイテムの詳細」の間の番号付きリストからリンクを除去
  const listSectionRegex = /(## この動画で紹介されたアイテム一覧\s*\n)([\s\S]*?)((?=\n## )|$)/
  const match = markdown.match(listSectionRegex)
  if (!match) return markdown

  const before = markdown.slice(0, match.index! + match[1].length)
  const listSection = match[2]
  const after = markdown.slice(match.index! + match[1].length + listSection.length)

  // 番号付きリスト内の Markdown リンク [テキスト](URL) を除去（前後の全角スペースも含む）
  const cleanedList = listSection.replace(/[\s　]*\[(?:▶\s*)?(?:Amazon(?:で見る)?|楽天(?:で見る)?)\]\([^)]*\)/g, '')

  return before + cleanedList + after
}

export default function ArticleContent({ content, videoId, channelName, channelIconUrl }: Props) {
  // 冒頭一覧のリンクを除去（目次化）
  const processedContent = removeLinksFromItemList(content)
  // [YOUTUBE_EMBED] の前後でコンテンツを分割
  const parts = processedContent.split('[YOUTUBE_EMBED]')

  return (
    <div className="space-y-4">
      {parts.map((part, i) => (
        <div key={i}>
          {/* Markdownレンダリング */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6">
            <ReactMarkdown
              components={{
                // h2見出し：ピンク左ボーダー + 薄いピンク背景
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold text-gray-800 mt-8 mb-4 pl-4 py-2.5 border-l-4 border-pink-400 bg-pink-50/60 rounded-r-lg first:mt-0">
                    {children}
                  </h2>
                ),
                // h3見出し：ドットアクセント付き
                h3: ({ children }) => (
                  <h3 className="text-base font-bold text-gray-800 mt-7 mb-3 flex items-center gap-2 first:mt-0">
                    <span className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0" />
                    {children}
                  </h3>
                ),
                // h4見出し
                h4: ({ children }) => (
                  <h4 className="text-sm font-bold text-gray-700 mt-5 mb-2">{children}</h4>
                ),
                // 段落：「こんな人におすすめ」をハイライト
                p: ({ children }) => {
                  // children の中身をテキスト化して判定
                  const textContent = extractText(children)
                  // 「こんな人におすすめ」セクション
                  if (textContent.startsWith('こんな人におすすめ')) {
                    return (
                      <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 my-4">
                        <div className="flex items-start gap-2">
                          <span className="text-pink-400 mt-0.5 flex-shrink-0">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                          </span>
                          <p className="text-sm text-gray-700 leading-relaxed">{children}</p>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{children}</p>
                  )
                },
                // 強調（太字）：商品名として目立たせる
                strong: ({ children }) => {
                  const text = extractText(children)
                  // YouTuber名（引用の中の太字）はそのまま
                  if (channelName && text === channelName) {
                    return <strong className="font-bold text-pink-600">{children}</strong>
                  }
                  return <strong className="font-bold text-gray-800">{children}</strong>
                },
                // イタリック
                em: ({ children }) => (
                  <em className="text-gray-400 text-xs not-italic">{children}</em>
                ),
                // リンク（Amazon・楽天リンク対応 → ボタン風スタイル）
                a: ({ href, children }) => {
                  const text = String(children)
                  const isAmazon = text.includes('Amazon') || text.includes('▶ Amazon') || (href && href.includes('amazon'))
                  const isRakuten = text.includes('楽天') || (href && href.includes('rakuten'))
                  if (isAmazon) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs font-bold px-4 py-2 rounded-xl mr-2 mb-2 transition-colors shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.616 15.393c-.32-.22-.667-.326-1.04-.326-.267 0-.52.066-.76.2-.24.133-.467.333-.68.6l-.2.267c-.16.213-.32.32-.48.32-.107 0-.213-.054-.32-.16-.107-.107-.173-.267-.2-.48l-.04-.28c-.027-.213-.04-.44-.04-.68 0-.587.067-1.16.2-1.72.133-.56.333-1.067.6-1.52.267-.453.587-.813.96-1.08.373-.267.787-.4 1.24-.4.32 0 .613.067.88.2.267.133.493.313.68.54.187.227.333.487.44.78.107.293.16.6.16.92 0 .48-.08.933-.24 1.36-.16.427-.373.8-.64 1.12-.267.32-.573.573-.92.76-.347.187-.707.28-1.08.28h-.04zM21.6 19.2c-.8.667-1.96 1-3.48 1-1.627 0-3-.533-4.12-1.6.08-.08.22-.213.42-.4.2-.187.307-.307.32-.36.96.827 2.047 1.24 3.26 1.24.907 0 1.627-.2 2.16-.6.533-.4.8-.92.8-1.56 0-.48-.16-.907-.48-1.28-.32-.373-.867-.693-1.64-.96-.4-.133-.733-.267-1-.4-.267-.133-.493-.28-.68-.44-.187-.16-.333-.34-.44-.54-.107-.2-.16-.44-.16-.72 0-.747.293-1.36.88-1.84.587-.48 1.32-.72 2.2-.72 1.12 0 2 .307 2.64.92-.107.133-.267.307-.48.52-.213.213-.347.347-.4.4-.48-.48-1.087-.72-1.82-.72-.533 0-.96.133-1.28.4-.32.267-.48.6-.48 1 0 .347.133.64.4.88.267.24.707.467 1.32.68.667.24 1.2.547 1.6.92.4.373.6.88.6 1.52 0 .827-.32 1.493-.96 2-.64.507-1.48.76-2.52.76-.133 0-.273-.007-.42-.02z"/></svg>
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
                        className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl mr-2 mb-2 transition-colors shadow-sm"
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
                      className="text-pink-500 hover:text-pink-600 underline underline-offset-2 transition-colors"
                    >
                      {children}
                    </a>
                  )
                },
                // 順序付きリスト（商品一覧）
                ol: ({ children }) => (
                  <ol className="space-y-2 my-4 list-none">{children}</ol>
                ),
                // 順序なしリスト
                ul: ({ children }) => (
                  <ul className="text-sm text-gray-700 mb-3 space-y-1.5 pl-1">{children}</ul>
                ),
                // リスト項目
                li: ({ children, ...props }) => {
                  // 順序付きリストの子か判定（ordered propsで判定）
                  // ordered list の中の li はカード風に
                  const textContent = extractText(children)
                  const hasAmazonRakuten = textContent.includes('Amazon') || textContent.includes('楽天')
                  if (hasAmazonRakuten) {
                    // 商品カード風のスタイリング
                    return (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 hover:border-pink-200 transition-colors">
                        <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
                      </div>
                    )
                  }
                  return (
                    <li className="leading-relaxed flex items-start gap-2">
                      <span className="text-pink-300 mt-1.5 flex-shrink-0">
                        <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>
                      </span>
                      <span>{children}</span>
                    </li>
                  )
                },
                // 引用ブロック（YouTuberのコメント）
                blockquote: ({ children }) => (
                  <div className="bg-pink-50/70 border border-pink-100 rounded-xl p-4 my-4">
                    <div className="flex gap-3 items-start">
                      {/* チャンネルアイコン */}
                      {channelIconUrl ? (
                        <img
                          src={channelIconUrl}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-xs font-bold text-pink-600 flex-shrink-0 mt-0.5">
                          {channelName ? channelName.charAt(0) : '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 text-sm text-gray-700 leading-relaxed [&>p]:mb-0">
                        {children}
                      </div>
                    </div>
                  </div>
                ),
                // 水平線（商品区切り）
                hr: () => (
                  <div className="my-6 flex items-center gap-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
                  </div>
                ),
              }}
            >
              {part.trim()}
            </ReactMarkdown>
          </div>

          {/* [YOUTUBE_EMBED] の位置にYouTube埋め込みを表示 */}
          {i < parts.length - 1 && videoId && (
            <div className="my-4">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube動画"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ReactNodeからテキストを抽出するユーティリティ
function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (!node) return ''
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (typeof node === 'object' && 'props' in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}
