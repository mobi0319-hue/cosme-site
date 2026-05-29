// 全ステージ orchestration
import 'dotenv/config';
import { spawnSync } from 'child_process';
import path from 'path';

const HERE = import.meta.dirname;
const stages = [
  'fetch_videos.mjs',
  'extract_products.mjs',
  'enrich_products.mjs',
  'merge_and_generate.mjs',
];

for (const s of stages) {
  console.log(`\n=== ${s} ===`);
  const r = spawnSync('node', [path.join(HERE, s)], { stdio: 'inherit', shell: false });
  if (r.status !== 0) {
    console.error(`× ${s} failed (exit ${r.status})`);
    process.exit(r.status ?? 1);
  }
}
console.log('\n✓ All stages complete. Run `git add data/ && git commit && git push` to deploy.');
