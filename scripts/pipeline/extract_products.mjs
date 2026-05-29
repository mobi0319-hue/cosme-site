// Stage 2: 字幕 + 概要欄から商品名を AI で抽出
// 入力: data/raw/videos_YYYY-MM-DD.json
// 出力: data/raw/extracted_products_YYYY-MM-DD.json
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { extractProducts } from '../lib/claude.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('× ANTHROPIC_API_KEY not set.');
    process.exit(1);
  }

  const inputArg = process.argv[2] ?? `videos_${new Date().toISOString().slice(0, 10)}.json`;
  const inputPath = path.join(ROOT, 'data', 'raw', inputArg);
  const videos = JSON.parse(await fs.readFile(inputPath, 'utf-8'));

  console.log(`Extracting products from ${videos.length} videos...`);

  const out = [];
  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    process.stdout.write(`[${i + 1}/${videos.length}] ${v.channel}/${v.video_title.slice(0, 30)}... `);
    const corpus = [v.transcript ?? '', v.description ?? ''].join('\n');
    if (corpus.trim().length < 50) {
      console.log('skip (too short)');
      continue;
    }
    try {
      const products = await extractProducts(corpus, v.video_title);
      console.log(`${products.length} items`);
      for (const p of products) {
        out.push({
          ...p,
          channel: v.channel,
          video_url: v.video_url,
          video_title: v.video_title,
          published_at: v.published_at,
        });
      }
    } catch (e) {
      console.log(`ERR ${e.message}`);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const outPath = path.join(ROOT, 'data', 'raw', `extracted_products_${today}.json`);
  await fs.writeFile(outPath, JSON.stringify(out, null, 2));
  console.log(`\nSaved ${out.length} product mentions → ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
