// Stage 3: 楽天 API で画像URL・価格・アフィリリンク取得、Amazon は検索URL生成
// 入力: data/raw/extracted_products_YYYY-MM-DD.json
// 出力: data/raw/enriched_products_YYYY-MM-DD.json
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { searchRakutenItem, buildRakutenSearchUrl, buildAmazonSearchUrl } from '../lib/rakuten.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

async function main() {
  const inputArg = process.argv[2] ?? `extracted_products_${new Date().toISOString().slice(0, 10)}.json`;
  const inputPath = path.join(ROOT, 'data', 'raw', inputArg);
  const items = JSON.parse(await fs.readFile(inputPath, 'utf-8'));

  // 同じ (brand, product_name) 単位で dedupe してから問い合わせ（rate limit 節約）
  const uniq = new Map();
  for (const it of items) {
    const key = `${it.brand}|${it.product_name}`;
    if (!uniq.has(key)) uniq.set(key, it);
  }
  console.log(`Enriching ${uniq.size} unique products (rate-limited)...`);

  const enriched = [];
  let i = 0;
  for (const [key, sample] of uniq) {
    i++;
    process.stdout.write(`[${i}/${uniq.size}] ${sample.brand} ${sample.product_name.slice(0, 30)}... `);
    let info = null;
    try {
      info = await searchRakutenItem(`${sample.brand} ${sample.product_name}`);
    } catch (e) {
      process.stdout.write(`(rakuten err: ${e.message}) `);
    }
    const merged = {
      brand: sample.brand,
      product_name: sample.product_name,
      category: sample.category,
      image_url: info?.image_url ?? null,
      api_price: info?.api_price ?? null,
      rakuten_url: info?.rakuten_url ?? buildRakutenSearchUrl(sample.brand, sample.product_name),
      amazon_url: buildAmazonSearchUrl(sample.brand, sample.product_name),
    };
    enriched.push(merged);
    console.log(info ? 'ok' : 'fallback');
  }

  const today = new Date().toISOString().slice(0, 10);
  const outPath = path.join(ROOT, 'data', 'raw', `enriched_products_${today}.json`);
  await fs.writeFile(outPath, JSON.stringify(enriched, null, 2));
  console.log(`\nSaved ${enriched.length} enriched products → ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
