// Stage 4: 既存 products.json と新規 enriched をマージ、articles/*.md 再生成
//
// --regen-only: 既存 products.json から articles を再生成するだけ（API キーゼロで動作）
//
// 入力: data/products.json (existing) + data/raw/enriched_products_YYYY-MM-DD.json (new) + data/raw/extracted_products_YYYY-MM-DD.json (mentions)
// 出力: data/products.json (updated) + data/articles/*.md (regenerated)
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { renderArticle, articleFilename } from '../lib/markdown.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const REGEN_ONLY = process.argv.includes('--regen-only');

// data.ts の正規カテゴリ
const CATEGORY_ORDER = [
  'スキンケア', 'UVケア', '化粧下地', 'ファンデーション', 'フェイスパウダー',
  'コンシーラー', 'チーク', 'ハイライター', 'シェーディング',
  'アイシャドウ', 'アイライナー', 'アイブロウ', 'マスカラ',
  'リップ', 'ヘアケア', 'ボディケア', 'その他',
];

function normalizeCategory(cat) {
  if (!cat || cat === '-' || cat === '不明') return 'その他';
  if (cat.startsWith('その他')) return 'その他';
  if (cat === '下地' || (cat.includes('下地') && cat.includes('CC'))) return '化粧下地';
  for (const c of ['スキンケア', 'ボディケア', 'ヘアケア', 'リップ']) {
    if (cat.startsWith(c)) return c;
  }
  if (!CATEGORY_ORDER.includes(cat)) return 'その他';
  return cat;
}

async function main() {
  const productsPath = path.join(ROOT, 'data', 'products.json');
  const channelsPath = path.join(ROOT, 'data', 'channels.json');
  const articlesDir = path.join(ROOT, 'data', 'articles');

  const products = JSON.parse(await fs.readFile(productsPath, 'utf-8'));
  const channels = JSON.parse(await fs.readFile(channelsPath, 'utf-8'));
  console.log(`Loaded ${products.length} existing products, ${channels.length} channels`);

  if (!REGEN_ONLY) {
    // 新規 enriched + extracted を読み込んでマージ
    const today = new Date().toISOString().slice(0, 10);
    const enrichedPath = path.join(ROOT, 'data', 'raw', `enriched_products_${today}.json`);
    const extractedPath = path.join(ROOT, 'data', 'raw', `extracted_products_${today}.json`);
    let enriched = [], extracted = [];
    try { enriched = JSON.parse(await fs.readFile(enrichedPath, 'utf-8')); } catch {}
    try { extracted = JSON.parse(await fs.readFile(extractedPath, 'utf-8')); } catch {}

    if (enriched.length === 0 && extracted.length === 0) {
      console.log('× No new data to merge. Run fetch/extract/enrich first or use --regen-only.');
      process.exit(1);
    }

    // mentions を (brand, product_name) → MentionedBy[] でグルーピング
    const mentionsByKey = new Map();
    for (const m of extracted) {
      const key = `${m.brand}|${m.product_name}`;
      if (!mentionsByKey.has(key)) mentionsByKey.set(key, []);
      mentionsByKey.get(key).push({
        channel: m.channel,
        video_title: m.video_title,
        video_url: m.video_url,
        context: m.context ?? '',
        published_at: m.published_at,
      });
    }

    // products.json 索引化
    const productsByKey = new Map();
    for (const p of products) {
      productsByKey.set(`${p.brand}|${p.product_name}`, p);
    }

    // enriched を マージ
    for (const e of enriched) {
      const key = `${e.brand}|${e.product_name}`;
      const newMentions = mentionsByKey.get(key) ?? [];
      const existing = productsByKey.get(key);
      if (existing) {
        // 既存 mentioned_by に新規 mention を append（video_url 重複は skip）
        const existingUrls = new Set((existing.mentioned_by ?? []).map(m => m.video_url));
        for (const m of newMentions) {
          if (!existingUrls.has(m.video_url)) {
            existing.mentioned_by.push(m);
          }
        }
        existing.mention_count = new Set(existing.mentioned_by.map(m => m.channel)).size;
        if (e.image_url && !existing.image_url) existing.image_url = e.image_url;
        if (e.api_price && !existing.api_price) existing.api_price = e.api_price;
      } else {
        productsByKey.set(key, {
          product_name: e.product_name,
          brand: e.brand,
          category: normalizeCategory(e.category),
          genre: 'cosme',
          price: e.api_price ?? '',
          amazon_url: e.amazon_url,
          rakuten_url: e.rakuten_url,
          mention_count: new Set(newMentions.map(m => m.channel)).size,
          mentioned_by: newMentions,
          image_url: e.image_url ?? undefined,
          api_price: e.api_price ?? undefined,
        });
      }
    }

    const merged = [...productsByKey.values()];
    await fs.writeFile(productsPath, JSON.stringify(merged, null, 2));
    console.log(`Merged → ${merged.length} products (was ${products.length}, +${merged.length - products.length})`);
    products.length = 0; products.push(...merged);
  }

  // === Articles 再生成 ===
  await fs.mkdir(articlesDir, { recursive: true });

  // 既存 article ファイル削除（変更検出されたものだけ削除する厳密版はあとで）
  // const existing = await fs.readdir(articlesDir);
  // for (const f of existing) if (f.endsWith('.md')) await fs.unlink(path.join(articlesDir, f));

  // channel × category でグルーピング
  const grouped = new Map(); // key: `${channelName}|${category}` → products[]
  for (const p of products) {
    const cat = normalizeCategory(p.category);
    for (const m of p.mentioned_by ?? []) {
      const ch = channels.find(c => c.name === m.channel);
      if (!ch || !ch.active || ch.display === false) continue;
      const key = `${ch.name}|${cat}`;
      if (!grouped.has(key)) grouped.set(key, { channel: ch, category: cat, products: [], seen: new Set() });
      const slot = grouped.get(key);
      const pKey = `${p.brand}|${p.product_name}`;
      if (!slot.seen.has(pKey)) {
        slot.products.push(p);
        slot.seen.add(pKey);
      }
    }
  }

  let written = 0;
  for (const slot of grouped.values()) {
    if (slot.products.length === 0) continue;
    const md = renderArticle({ channel: slot.channel, category: slot.category, products: slot.products });
    const filename = articleFilename(slot.channel.name, slot.category);
    await fs.writeFile(path.join(articlesDir, filename), md);
    written++;
  }
  console.log(`Wrote ${written} article files → ${articlesDir}`);
}

main().catch(e => { console.error(e); process.exit(1); });
