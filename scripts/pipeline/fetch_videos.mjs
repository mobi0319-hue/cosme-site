// Stage 1: YouTube から各 channel の新着動画と字幕を取得
// 出力: data/raw/videos_YYYY-MM-DD.json
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { resolvePlaylistId, listRecentVideos, fetchTranscript } from '../lib/youtube.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const SINCE_DAYS = Number(process.env.SINCE_DAYS ?? 30);
const MAX_VIDEOS = Number(process.env.MAX_VIDEOS_PER_CHANNEL ?? 20);

async function main() {
  if (!process.env.YOUTUBE_API_KEY) {
    console.error('× YOUTUBE_API_KEY not set. Copy .env.example to .env and fill keys.');
    process.exit(1);
  }

  const channelsPath = path.join(ROOT, 'data', 'channels.json');
  const channels = JSON.parse(await fs.readFile(channelsPath, 'utf-8'));
  const active = channels.filter(c => c.active);

  console.log(`Fetching last ${SINCE_DAYS}d videos for ${active.length} channels...`);

  const out = [];
  for (const ch of active) {
    process.stdout.write(`  ${ch.name}: `);
    try {
      const playlistId = await resolvePlaylistId(ch.url);
      const videos = await listRecentVideos(playlistId, { sinceDays: SINCE_DAYS, maxVideos: MAX_VIDEOS });
      process.stdout.write(`${videos.length} videos `);
      for (const v of videos) {
        v.channel = ch.name;
        v.youtube_name = ch.youtube_name;
        v.transcript = await fetchTranscript(v.video_id);
        if (v.transcript) process.stdout.write('.');
        else process.stdout.write('!'); // 字幕なし → description だけで extract する
      }
      out.push(...videos);
      console.log('');
    } catch (e) {
      console.log(`ERR ${e.message}`);
    }
  }

  const outDir = path.join(ROOT, 'data', 'raw');
  await fs.mkdir(outDir, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const outPath = path.join(outDir, `videos_${today}.json`);
  await fs.writeFile(outPath, JSON.stringify(out, null, 2));
  console.log(`\nSaved ${out.length} videos → ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
