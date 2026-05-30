// Amazon検索URLのクエリノイズを遡及除去する一回限りの移行スクリプト
// 実行: node scripts/fix_amazon_query.mjs
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '..', 'data', 'products.json');
const AMAZON_TAG = 'yuaffiliate01-22';

// rakuten.mjs の normalizeSearchQuery と同一ロジック（importせずコピー）
function normalizeSearchQuery(productName) {
  let q = productName;
  q = q.replace(/（[^）]*）/g, '');
  q = q.replace(/\([^)]*\)/g, '');
  q = q.replace(/SPF\d+\+?/gi, '');
  q = q.replace(/PA\++/gi, '');
  q = q.replace(/\s*\/\s*/g, ' ');
  q = q.replace(/[・+＋]/g, ' ');
  q = q.replace(/\s+\d+(?:ml|mL|g|mg|ml|L|枚|個|本|色)\s*$/i, '');
  q = q.replace(/\s+/g, ' ').trim();
  return q;
}

function buildAmazonSearchUrl(brand, productName) {
  const q = encodeURIComponent(`${brand} ${normalizeSearchQuery(productName)}`);
  return `https://www.amazon.co.jp/s?k=${q}&tag=${AMAZON_TAG}`;
}

// Amazon検索URLかどうか（/s?k= パターン）
function isAmazonSearchUrl(url) {
  return url && (url.includes('/s?k=') || url.includes('/s/?k='));
}

const products = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
console.log(`総件数: ${products.length}`);

let changed = 0;
const samples = [];

for (const p of products) {
  if (!isAmazonSearchUrl(p.amazon_url)) continue;

  const newUrl = buildAmazonSearchUrl(p.brand, p.product_name);
  if (newUrl !== p.amazon_url) {
    if (samples.length < 5) {
      samples.push({
        brand: p.brand,
        product_name: p.product_name,
        before: p.amazon_url,
        after: newUrl,
      });
    }
    p.amazon_url = newUrl;
    changed++;
  }
}

console.log(`変化した件数: ${changed} / ${products.length}`);
console.log('\n--- before/after サンプル5件 ---');
for (const s of samples) {
  console.log(`\n商品: ${s.brand} ${s.product_name}`);
  console.log(`  before: ${decodeURIComponent(s.before)}`);
  console.log(`  after:  ${decodeURIComponent(s.after)}`);
}

writeFileSync(DATA_PATH, JSON.stringify(products, null, 0), 'utf-8');
console.log('\nproducts.json を更新しました。');
