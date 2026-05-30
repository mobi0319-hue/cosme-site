// 楽天ウェブサービス（Ichiba Item Search）+ アフィリエイトリンク生成
const APP_ID = process.env.RAKUTEN_APP_ID;
const AFF_ID = process.env.RAKUTEN_AFFILIATE_ID ?? 'mobi.0319';
const AMAZON_TAG = process.env.AMAZON_AFFILIATE_TAG ?? 'yuaffiliate01-22';

const BASE = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';

// 1秒1リクエスト制限 → 隣接呼び出しでスリープ挟む
const SLEEP_MS = 1100;
let lastCall = 0;
async function rateLimit() {
  const now = Date.now();
  const wait = SLEEP_MS - (now - lastCall);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCall = Date.now();
}

export async function searchRakutenItem(query) {
  if (!APP_ID) return null;
  await rateLimit();
  const url = `${BASE}?format=json&keyword=${encodeURIComponent(query)}&hits=1&applicationId=${APP_ID}&affiliateId=${AFF_ID}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    console.warn(`rakuten ${resp.status} for "${query}"`);
    return null;
  }
  const json = await resp.json();
  const item = json.Items?.[0]?.Item;
  if (!item) return null;
  return {
    image_url: item.mediumImageUrls?.[0]?.imageUrl?.replace(/\?_ex=128x128$/, '?_ex=500x500') ?? null,
    api_price: item.itemPrice ? `${item.itemPrice}円` : null,
    rakuten_url: item.affiliateUrl || item.itemUrl,
    item_name: item.itemName,
  };
}

// 検索クエリのノイズを除去する共通関数
// 除去対象: 全角/半角括弧とその中身、SPF/PA規格表記、過剰記号、末尾容量ノイズ
export function normalizeSearchQuery(productName) {
  let q = productName;
  // 全角丸括弧とその中身を除去: （医薬部外品）等
  q = q.replace(/（[^）]*）/g, '');
  // 半角丸括弧とその中身を除去: (医薬部外品) 等
  q = q.replace(/\([^)]*\)/g, '');
  // SPF数値表記: SPF50+ / SPF50
  q = q.replace(/SPF\d+\+?/gi, '');
  // PA表記: PA++++ 等
  q = q.replace(/PA\++/gi, '');
  // スラッシュ区切りのカラー/仕様ノイズ（例: "全11色" "クリームイエロー"のような後続）
  // スラッシュ前後のスペースを含む区切りを除去
  q = q.replace(/\s*\/\s*/g, ' ');
  // 中点・プラス記号の単独使用を除去
  q = q.replace(/[・+＋]/g, ' ');
  // 末尾の容量・型番ノイズ（例: "30ml" "50g" "SPF30"）
  q = q.replace(/\s+\d+(?:ml|mL|g|mg|ml|L|枚|個|本|色)\s*$/i, '');
  // 連続スペースを1つに圧縮し、前後トリム
  q = q.replace(/\s+/g, ' ').trim();
  return q;
}

// 楽天検索URL生成（API failed時のフォールバック）
export function buildRakutenSearchUrl(brand, productName) {
  const q = encodeURIComponent(`${brand} ${normalizeSearchQuery(productName)}`);
  return `https://search.rakuten.co.jp/search/mall/${q}/?af=${AFF_ID}`;
}

// Amazon検索URL生成（PA-APIなしでも tag は付与可能）
export function buildAmazonSearchUrl(brand, productName) {
  const q = encodeURIComponent(`${brand} ${normalizeSearchQuery(productName)}`);
  return `https://www.amazon.co.jp/s?k=${q}&tag=${AMAZON_TAG}`;
}
