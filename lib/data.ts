// データ読み込み・変換ユーティリティ
import fs from 'fs'
import path from 'path'

// ======== コスメフィルタ ========

// コスメと無関係なカテゴリキーワード（部分一致で除外）
const NON_COSME_KEYWORDS = [
  'ファッション', '衣類', 'トップス', 'ボトムス', 'アウター', 'インナー',
  'ルームウェア', 'パンツ', 'ワンピース', 'スカート', 'アパレル',
  '靴', 'シューズ', 'バッグ', '財布', '時計', '帽子',
  'アクセサリー', 'ピアス', 'ネックレス', 'リング',
  'キャンピングカー', 'テント', 'アウトドア',
  'ベビー', '書籍', '食品', '食材', '飲料', '調味料', 'フード',
  '家電', '家具', '収納', '掃除', '洗剤', '洗濯',
  'キッチン', '調理', '寝具', '日用品',
  'ペット', 'ドッグ', 'フィットネス', 'スマホ',
  'タンブラー', 'おもちゃ', 'サービス',
]

// カテゴリがコスメ関連かどうかを判定する
// カテゴリ未設定・不明・ハイフンのものは除外（コスメ以外が混入するため）
function isCosmeCategory(category: string): boolean {
  if (!category || category === '-' || category === '不明') return false
  return !NON_COSME_KEYWORDS.some(kw => category.includes(kw))
}

// 商品名がゴミデータ（SNSリンク、セール情報、非商品テキスト等）かどうかを判定
const GARBAGE_NAME_KEYWORDS = [
  // SNS・宣伝
  'TAG', 'Twitter', 'Instagram', 'Insram', 'フォロー', 'チャンネル登録',
  'LINE公式', 'TikTok', 'お仕事の依頼', 'お問い合わせ', 'プロフィール',
  // URL
  'https://', 'http://', '.com/', '.jp/',
  // 価格・セール情報（商品名ではない）
  'メガ割', '販売価格', '通常価格', 'クーポン', '期間限定',
  // ハッシュタグ
  '#ダイエット', '#筋トレ', '#宅トレ',
  // 非商品テキスト
  '前回の', '前々回の', 'おすすめ動画', '動画はこちら',
  // 人物紹介
  'フィットネスインストラクター', 'をモットーに',
  // 宣伝・PR
  '公式サイト', 'プロモーション', '提供：', '提供:', 'PR案件', 'プレゼント企画',
  // 非コスメ
  'AGA', 'デオドラント', '入浴剤', 'シャワーヘッド', '加湿器',
  // 感嘆
  'www', 'ｗｗ',
]
function isGarbageName(name: string): boolean {
  if (!name || name.trim().length <= 2) return true
  if (name.length > 100) return true
  if (GARBAGE_NAME_KEYWORDS.some(kw => name.includes(kw))) return true
  // 句読点・感嘆符・引用符がある = 文章であって商品名ではない
  if (/[。？！…\u201C\u201D\u300C\u300D]/.test(name)) return true
  // 助詞で始まる = 文の途中から切れた断片
  if (/^[のはがをにでと]/.test(name)) return true
  // 文末表現で終わる = 文章
  if (/(?:ます|ました|です|ません|だろう|ないです|だとか|ございます)$/.test(name.replace(/[。！？]+$/, ''))) return true
  // 感想文の書き出し
  if (/^(?:一番|基本的に|やっぱり|個人的に|正直|ちなみに|もう何回も)/.test(name)) return true
  // @メンション
  if (/@\w/.test(name)) return true
  // 【】で囲まれた動画タイトル
  if (/^【【/.test(name)) return true
  // 🍑等の絵文字で始まる宣伝文
  if (/^[\u{1F300}-\u{1FAFF}]/u.test(name)) return true
  // ◾️◼️▪️等の記号で始まる
  if (/^[◾◼▪▫●○■□★☆♪♫✨🫶📷📸🍽💙]/u.test(name)) return true
  // コラボセット、新作〜発売記念
  if (/発売記念$/.test(name)) return true
  // ブランド名だけで商品名がない（例: "CHANEL"のみ）
  if (name.trim().length <= 10 && !/[\u3040-\u309F\u30A0-\u30FF]/.test(name) && !/\d/.test(name)) return true
  return false
}

// ======== カテゴリ正規化 ========

// 表示用カテゴリの正規順（この順番でフィルターボタンに並ぶ）
const CATEGORY_ORDER = [
  'スキンケア', 'UVケア', '化粧下地', 'ファンデーション', 'フェイスパウダー',
  'コンシーラー', 'チーク', 'ハイライター', 'シェーディング',
  'アイシャドウ', 'アイライナー', 'アイブロウ', 'マスカラ',
  'リップ', 'ヘアケア', 'ボディケア', 'その他',
]

// 旧データの表記ゆれを正規カテゴリに変換する
function normalizeCategory(cat: string): string {
  if (!cat || cat === '-' || cat === '不明') return 'その他'
  // 「その他（xxx）」パターンはすべて「その他」に統一
  if (cat.startsWith('その他')) return 'その他'
  // 下地系統一
  if (cat === '下地' || cat.includes('下地') && cat.includes('CC')) return '化粧下地'
  // スキンケア系統一
  if (cat.startsWith('スキンケア')) return 'スキンケア'
  // ボディケア系統一
  if (cat.startsWith('ボディケア')) return 'ボディケア'
  // ヘアケア系統一
  if (cat.startsWith('ヘアケア')) return 'ヘアケア'
  // リップ系統一
  if (cat.startsWith('リップ')) return 'リップ'
  // 既知カテゴリ以外は「その他」に
  if (!CATEGORY_ORDER.includes(cat)) return 'その他'
  return cat
}

// ======== 型定義 ========

export type MentionedBy = {
  channel: string
  video_title: string
  video_url: string
  context: string
  published_at?: string
}

export type Product = {
  product_name: string
  brand: string
  category: string
  genre: string
  price: string
  amazon_url: string
  rakuten_url: string
  mention_count: number
  mentioned_by: MentionedBy[]
  image_url?: string
  api_price?: string
}

export type Channel = {
  name: string
  youtube_name: string
  url: string
  genre: string
  active: boolean
  display?: boolean
  icon_url?: string
}

export type Video = {
  video_id: string
  video_url: string
  video_title: string
  channel: string
  published_at?: string
  products: Product[]
}

export type Creator = {
  name: string
  youtube_name: string
  url: string
  genre: string
  icon_url?: string
  videos: Video[]
  top_products: Product[]
}

// ======== データ読み込み ========

const DATA_DIR = path.join(process.cwd(), 'data')

// ビルド中に何度も呼ばれるため、パース結果をキャッシュしてメモリ節約
let _productsCache: Product[] | null = null

export function getProducts(): Product[] {
  if (_productsCache) return _productsCache

  const raw = fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8')
  const products: Product[] = JSON.parse(raw)
  // コスメ以外・ゴミデータ・不明商品を除外する
  // products.jsonはpublish済みのみ収録されている
  _productsCache = products
    .filter(p => isCosmeCategory(p.category))
    .filter(p => p.brand && p.brand.trim() !== '' && p.brand !== '-' && p.brand !== '不明' && !p.product_name.includes('不明'))
    .filter(p => !isGarbageName(p.product_name))
    .map(p => ({
      ...p,
      category: normalizeCategory(p.category),
      // mentioned_by: contextがある紹介を全て保持（動画カウント・クリエイターページ用）
      mentioned_by: p.mentioned_by.filter((m: MentionedBy) => m.context && m.context.trim().length > 0),
      // mention_count: 動画内で実際に言及された紹介のみカウント（ランキング・品質指標用）
      // 「概要欄で紹介」等の短いcontextは動画数には含めるが、mention_countには含めない
      mention_count: new Set(
        p.mentioned_by
          .filter((m: MentionedBy) => m.context && m.context.trim().length > 10)
          .map((m: MentionedBy) => m.channel)
      ).size,
    }))
  return _productsCache
}

let _channelsCache: Channel[] | null = null

export function getChannels(): Channel[] {
  if (_channelsCache) return _channelsCache
  const raw = fs.readFileSync(path.join(DATA_DIR, 'channels.json'), 'utf-8')
  _channelsCache = JSON.parse(raw)
  return _channelsCache!
}

// ======== mention集計ヘルパー ========

// 意味のあるcontext（>10文字）のmentionのみ。ランキング・表示カウント・引用に使う
export function getMeaningfulMentions(mentions: MentionedBy[]): MentionedBy[] {
  return mentions.filter(m => m.context && m.context.trim().length > 10)
}

// ======== スラッグ生成 ========

// 商品スラッグ: brand + product_name をURLセーフな文字列に変換
export function slugifyProduct(product: Product): string {
  const str = `${product.brand}-${product.product_name}`
  const slug = str
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  // Vercelのファイルシステム制限対策（Linux ext4: 255バイト上限）
  // 日本語はUTF-8で1文字3バイトなので、80文字（約240バイト）で切り詰め
  if (Buffer.byteLength(slug, 'utf8') > 200) {
    let trimmed = slug
    while (Buffer.byteLength(trimmed, 'utf8') > 200) {
      trimmed = trimmed.slice(0, -1)
    }
    return trimmed.replace(/-$/, '')
  }
  return slug
}

// クリエイタースラッグ: チャンネル名をURLセーフに
export function slugifyCreator(name: string): string {
  return name
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// YouTube動画IDを抽出
export function extractVideoId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/)
  return match ? match[1] : url
}

// ======== チャンネル名照合 ========

// products.json の channel名と channels.json の name/youtube_name を照合する
// 1. 完全一致（channel名 === name or youtube_name）
// 2. 部分一致（channel名がnameを含む or nameがchannel名を含む）
// 3. youtube_nameでも同様の部分一致
function channelMatches(productChannel: string, ch: Channel): boolean {
  // 空文字列は全チャンネルにマッチしてしまうため除外
  if (!productChannel || !ch.name) return false
  // 完全一致
  if (productChannel === ch.name || productChannel === ch.youtube_name) return true
  // 部分一致（短すぎる文字列の誤マッチを防ぐため、2文字以上の場合のみ）
  if (productChannel.length >= 2 && ch.name.length >= 2) {
    if (productChannel.includes(ch.name) || ch.name.includes(productChannel)) return true
  }
  if (productChannel.length >= 2 && ch.youtube_name.length >= 2) {
    if (productChannel.includes(ch.youtube_name) || ch.youtube_name.includes(productChannel)) return true
  }
  return false
}

// ======== 集計・変換 ========

// 全商品（mention_count降順）
export function getProductsSorted(): Product[] {
  return getProducts()
    .filter(p => p.genre === 'cosme')
    .sort((a, b) => b.mention_count - a.mention_count)
}

// スラッグから商品を取得
export function getProductBySlug(slug: string): Product | null {
  const products = getProducts()
  return products.find(p => slugifyProduct(p) === slug) ?? null
}

// 動画一覧（video_urlでグループ化）
let _videosCache: Video[] | null = null

export function getVideos(): Video[] {
  if (_videosCache) return _videosCache
  const products = getProducts().filter(p => p.genre === 'cosme')
  const map = new Map<string, Video>()

  for (const product of products) {
    for (const mention of product.mentioned_by) {
      const vid = extractVideoId(mention.video_url)
      if (!map.has(vid)) {
        map.set(vid, {
          video_id: vid,
          video_url: mention.video_url,
          video_title: mention.video_title,
          channel: mention.channel,
          published_at: mention.published_at,
          products: [],
        })
      }
      map.get(vid)!.products.push(product)
    }
  }

  // コスメ商品が1件以上ある動画のみ、商品数が多い順に並べる
  _videosCache = Array.from(map.values())
    .filter(v => v.products.length > 0)
    .sort((a, b) => b.products.length - a.products.length)
  return _videosCache
}

// 動画IDから動画を取得
export function getVideoById(id: string): Video | null {
  return getVideos().find(v => v.video_id === id) ?? null
}

// クリエイター一覧
export function getCreators(): Creator[] {
  const channels = getChannels().filter(c => c.genre === 'cosme' && c.active && c.display !== false)
  const videos = getVideos()

  return channels.map(ch => {
    // このチャンネルの動画を抽出（部分一致も含めて照合）
    const creatorVideos = videos.filter(v => channelMatches(v.channel, ch))

    // よく出る商品（mention_count降順で上位10件）
    const allProducts = creatorVideos.flatMap(v => v.products)
    const uniqueProducts = Array.from(
      new Map(allProducts.map(p => [slugifyProduct(p), p])).values()
    ).sort((a, b) => b.mention_count - a.mention_count).slice(0, 10)

    return {
      name: ch.name,
      youtube_name: ch.youtube_name,
      url: ch.url,
      genre: ch.genre,
      icon_url: ch.icon_url,
      videos: creatorVideos,
      top_products: uniqueProducts,
    }
  }).sort((a, b) => b.videos.length - a.videos.length)
}

// スラッグからクリエイターを取得
export function getCreatorBySlug(slug: string): Creator | null {
  return getCreators().find(c => slugifyCreator(c.name) === slug) ?? null
}

// チャンネルのYouTube名から表示名とアイコンURLを取得する
// products.json の mentioned_by[].channel は youtube_name なので、channels.json と照合して表示用情報を返す
export function getChannelDisplayInfo(youtubeChannelName: string): { displayName: string; iconUrl: string | null } {
  const channels = getChannels()
  // channelMatches で完全一致＋部分一致を一括照合
  const matched = channels.find(c => channelMatches(youtubeChannelName, c))
  if (matched) {
    return { displayName: matched.name, iconUrl: matched.icon_url || null }
  }
  // channels.json に見つからない場合はそのまま返す
  return { displayName: youtubeChannelName, iconUrl: null }
}

// 関連商品（同カテゴリ・mention_count降順・自分を除く上位4件）
export function getRelatedProducts(product: Product): Product[] {
  return getProducts()
    .filter(p => p.genre === 'cosme' && p.category === product.category && slugifyProduct(p) !== slugifyProduct(product))
    .sort((a, b) => b.mention_count - a.mention_count)
    .slice(0, 4)
}

// 記事本文に登場する商品をproducts.jsonからマッチングして返す
export function getMatchedProductsForArticle(articleContent: string, articleChannel: string): Product[] {
  const products = getProducts().filter(p => p.genre === 'cosme')
  const matched: Product[] = []

  for (const product of products) {
    // 商品名が記事本文に含まれているか（部分一致）
    // 短すぎる商品名（3文字以下）は誤マッチ防止のためブランド名も合わせてチェック
    const nameInContent = product.product_name.length > 3
      ? articleContent.includes(product.product_name)
      : articleContent.includes(product.product_name) && articleContent.includes(product.brand)

    if (nameInContent) {
      // リンクが両方とも空なら意味がないのでスキップ
      if (!product.amazon_url && !product.rakuten_url) continue
      matched.push(product)
    }
  }

  // 重複除去（同じ商品名+ブランドの組み合わせ）
  const unique = Array.from(
    new Map(matched.map(p => [`${p.brand}-${p.product_name}`, p])).values()
  )

  return unique
}

// カテゴリ一覧（正規順で返す）
export function getCategories(): string[] {
  const products = getProducts().filter(p => p.genre === 'cosme')
  const cats = new Set(products.map(p => p.category).filter(Boolean))
  // CATEGORY_ORDER に沿って並べ、定義外のものは末尾に追加
  return CATEGORY_ORDER.filter(c => cats.has(c))
}

// ======== 記事データ ========

export type Article = {
  slug: string
  title: string
  channel: string
  date: string
  lastUpdated: string
  videoUrl: string
  genre: string
  content: string
}

// 記事ファイル名からメタデータを抽出する
function parseArticleFilename(filename: string): { channel: string; date: string } {
  // article_video_チャンネル名_YYYYMMDD_HHMMSS.md
  const match = filename.match(/^article_video_(.+)_(\d{8})_\d{6}\.md$/)
  if (!match) {
    // article_multi.md など特殊なファイル
    return { channel: '複数チャンネル', date: '' }
  }
  const channel = match[1]
  const dateStr = match[2]
  const date = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  return { channel, date }
}

// Markdownの先頭コメントからメタデータを抽出する
function parseArticleMeta(content: string): { videoUrl: string; genre: string; title: string; lastUpdated: string } {
  const videoMatch = content.match(/<!--\s*VIDEO_URL:\s*(.+?)\s*-->/)
  const genreMatch = content.match(/<!--\s*GENRE:\s*(.+?)\s*-->/)
  const updatedMatch = content.match(/<!--\s*LAST_UPDATED:\s*(.+?)\s*-->/)
  // H1 タイトルを取得
  const titleMatch = content.match(/^#\s+(.+)$/m)
  return {
    videoUrl: videoMatch ? videoMatch[1] : '',
    genre: genreMatch ? genreMatch[1] : 'cosme',
    title: titleMatch ? titleMatch[1] : '無題',
    lastUpdated: updatedMatch ? updatedMatch[1] : '',
  }
}

const ARTICLES_DIR = path.join(process.cwd(), 'data', 'articles')

// 全記事を取得（日付の新しい順）
export function getArticles(): Article[] {
  if (!fs.existsSync(ARTICLES_DIR)) return []

  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'))
  const articles: Article[] = []

  for (const file of files) {
    const content = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8')
    const { channel, date } = parseArticleFilename(file)
    const { videoUrl, genre, title, lastUpdated } = parseArticleMeta(content)
    // スラッグはファイル名から .md を除いたもの
    const slug = file.replace(/\.md$/, '')
    articles.push({ slug, title, channel, date, lastUpdated, videoUrl, genre, content })
  }

  // 日付の新しい順にソート
  return articles.sort((a, b) => b.date.localeCompare(a.date))
}

// スラッグから記事を取得
export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const content = fs.readFileSync(filePath, 'utf-8')
  const { channel, date } = parseArticleFilename(`${slug}.md`)
  const { videoUrl, genre, title, lastUpdated } = parseArticleMeta(content)
  return { slug, title, channel, date, lastUpdated, videoUrl, genre, content }
}
