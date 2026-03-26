// 悩み別ページの定義とマッチングロジック
import { getProducts, slugifyProduct } from './data'
import type { Product } from './data'

export type Concern = {
  slug: string
  title: string
  subtitle: string
  description: string
  icon: string
  categories: string[]   // このカテゴリの商品をすべて対象
  keywords: string[]     // product_name に含まれるキーワード
  brands: string[]       // brand が一致するもの
}

export const CONCERNS: Concern[] = [
  {
    slug: 'base-makeup',
    title: '崩れにくいベースメイク',
    subtitle: '汗・皮脂に強い下地・ファンデを探している方へ',
    description: '長時間メイクをキープしたい方向け。YouTuberが実際に使って「崩れない」「テカらない」と絶賛したファンデーション・下地・パウダーをまとめました。',
    icon: '✨',
    categories: ['ファンデーション', '化粧下地', 'フェイスパウダー'],
    keywords: [],
    brands: [],
  },
  {
    slug: 'skincare',
    title: '乾燥肌・保湿スキンケア',
    subtitle: 'うるおいが続く、乾燥知らずの肌へ',
    description: '乾燥が気になる方向け。YouTuberが「しっとり」「翌朝も潤い続く」と紹介した保湿スキンケアをまとめました。',
    icon: '💧',
    categories: ['スキンケア'],
    keywords: [],
    brands: [],
  },
  {
    slug: 'eye-makeup',
    title: '目元メイク・デカ目',
    subtitle: 'アイシャドウ・ライナー・マスカラを探している方へ',
    description: '目を大きく印象的に見せたい方向け。YouTuberがリピートしているアイシャドウ・アイライナー・マスカラを厳選しました。',
    icon: '👁️',
    categories: ['アイシャドウ', 'アイライナー', 'マスカラ', 'アイブロウ'],
    keywords: [],
    brands: [],
  },
  {
    slug: 'lip',
    title: 'リップメイク',
    subtitle: '口紅・グロス・ティントまとめ',
    description: '今人気のリップアイテムをYouTuberの口コミからまとめました。発色・持ち・使いやすさが評判のリップを厳選。',
    icon: '💋',
    categories: ['リップ'],
    keywords: [],
    brands: [],
  },
  {
    slug: 'puchi-pla',
    title: 'プチプラコスメ',
    subtitle: '1,000〜2,000円台でコスパ最強のコスメ',
    description: 'ドラッグストアで買えるプチプラコスメの中から、YouTuberが「デパコスに負けない」と絶賛したアイテムをまとめました。',
    icon: '🛒',
    categories: [],
    keywords: [],
    brands: ['CANMAKE', 'CEZANNE', 'KATE TOKYO', 'RIMMEL', 'MAYBELLINE', 'INTEGRATE', 'excel', 'VISEE', 'CHIFURE', 'OPERA'],
  },
  {
    slug: 'korean-cosme',
    title: '韓国コスメ',
    subtitle: 'SNSで話題の韓国発コスメをYouTuber視点でまとめ',
    description: '韓国コスメが気になる方向け。YouTuberが実際に使って評価した韓国ブランドのアイテムをまとめました。',
    icon: '🇰🇷',
    categories: [],
    keywords: [],
    brands: ['rom&nd', 'CLIO', 'ETUDE HOUSE', 'innisfree', 'TIRTIR', 'MIXSOON'],
  },
]

// 悩みにマッチする商品を返す（mention_count降順）
export function getProductsForConcern(concern: Concern): Product[] {
  return getProducts()
    .filter(p => p.genre === 'cosme')
    .filter(p => {
      if (concern.categories.length > 0 && concern.categories.includes(p.category)) return true
      if (concern.brands.length > 0 && concern.brands.some(b => p.brand === b)) return true
      if (concern.keywords.length > 0 && concern.keywords.some(kw => p.product_name.includes(kw))) return true
      return false
    })
    .sort((a, b) => b.mention_count - a.mention_count)
    .slice(0, 20)
}

export function getConcernBySlug(slug: string): Concern | null {
  return CONCERNS.find(c => c.slug === slug) ?? null
}
