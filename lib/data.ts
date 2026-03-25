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
  accumulated_at: string
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
}

export type Channel = {
  name: string
  youtube_name: string
  url: string
  genre: string
  active: boolean
}

export type Video = {
  video_id: string
  video_url: string
  video_title: string
  channel: string
  products: Product[]
}

export type Creator = {
  name: string
  youtube_name: string
  url: string
  genre: string
  videos: Video[]
  top_products: Product[]
}

// ======== データ読み込み ========

const DATA_DIR = path.join(process.cwd(), 'data')

export function getProducts(): Product[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8')
  const products: Product[] = JSON.parse(raw)
  // コスメ以外のカテゴリを除外し、ブランド・商品名が不明なものも除外する
  return products
    .filter(p => isCosmeCategory(p.category))
    .filter(p => p.brand !== '不明' && !p.product_name.includes('不明'))
    .map(p => ({
      ...p,
      category: normalizeCategory(p.category),
      // 同一YouTuberが複数動画で紹介しても1人とカウントする
      mention_count: new Set(p.mentioned_by.map((m: MentionedBy) => m.channel)).size,
    }))
}

export function getChannels(): Channel[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'channels.json'), 'utf-8')
  return JSON.parse(raw)
}

// ======== スラッグ生成 ========

// 商品スラッグ: brand + product_name をURLセーフな文字列に変換
export function slugifyProduct(product: Product): string {
  const str = `${product.brand}-${product.product_name}`
  return str
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
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
export function getVideos(): Video[] {
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
          products: [],
        })
      }
      map.get(vid)!.products.push(product)
    }
  }

  // コスメ商品が1件以上ある動画のみ、商品数が多い順に並べる
  return Array.from(map.values())
    .filter(v => v.products.length > 0)
    .sort((a, b) => b.products.length - a.products.length)
}

// 動画IDから動画を取得
export function getVideoById(id: string): Video | null {
  return getVideos().find(v => v.video_id === id) ?? null
}

// クリエイター一覧
export function getCreators(): Creator[] {
  const channels = getChannels().filter(c => c.genre === 'cosme' && c.active)
  const videos = getVideos()

  return channels.map(ch => {
    // このチャンネルの動画を抽出
    const creatorVideos = videos.filter(v => v.channel === ch.name || v.channel === ch.youtube_name)

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
      videos: creatorVideos,
      top_products: uniqueProducts,
    }
  })
}

// スラッグからクリエイターを取得
export function getCreatorBySlug(slug: string): Creator | null {
  return getCreators().find(c => slugifyCreator(c.name) === slug) ?? null
}

// カテゴリ一覧（正規順で返す）
export function getCategories(): string[] {
  const products = getProducts().filter(p => p.genre === 'cosme')
  const cats = new Set(products.map(p => p.category).filter(Boolean))
  // CATEGORY_ORDER に沿って並べ、定義外のものは末尾に追加
  return CATEGORY_ORDER.filter(c => cats.has(c))
}
