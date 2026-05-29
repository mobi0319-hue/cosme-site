// 記事 Markdown 生成
// 既存記事フォーマットと互換: # {Creator}おすすめ{Category}{N}選【YYYY年MM月版】

const MONTH_JA = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function fmtMonth(date) {
  const y = date.getFullYear();
  const m = MONTH_JA[date.getMonth()].padStart(2, '0');
  return `${y}年${m}月`;
}

function fmtDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 1記事 (channel, category) ぶんの md を生成
export function renderArticle({ channel, category, products, generatedAt = new Date() }) {
  const lines = [];
  lines.push('<!-- GENRE: cosme -->');
  lines.push(`<!-- LAST_UPDATED: ${fmtDate(generatedAt)} -->`);
  lines.push(`# ${channel.name}おすすめ${category}${products.length}選【${fmtMonth(generatedAt)}版】`);
  lines.push('');
  lines.push(`人気美容YouTuber **${channel.name}** さんが動画で紹介した${category}アイテムをまとめました。`);
  lines.push('');
  lines.push('## 一覧');
  lines.push('');
  products.forEach((p, i) => {
    lines.push(`${i + 1}. **${p.brand}** ${p.product_name}`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const p of products) {
    lines.push(`### ${p.brand} ${p.product_name}`);
    lines.push('');
    if (p.image_url) {
      lines.push(`![${p.brand} ${p.product_name}](${p.image_url})`);
      lines.push('');
    }
    if (p.api_price || p.price) {
      lines.push(`**価格**: ${p.api_price ?? p.price}`);
      lines.push('');
    }
    const mainMention = (p.mentioned_by ?? []).find(m => m.channel === channel.name && m.context && m.context.length > 10)
      ?? p.mentioned_by?.[0];
    if (mainMention?.context) {
      lines.push(`> **${mainMention.channel}**: 「${mainMention.context}」`);
      if (mainMention.video_url) {
        lines.push(`> [動画を見る](${mainMention.video_url})`);
      }
      lines.push('');
    }
    const aff = [];
    if (p.amazon_url) aff.push(`[🛒 Amazonで見る](${p.amazon_url})`);
    if (p.rakuten_url) aff.push(`[🛒 楽天で見る](${p.rakuten_url})`);
    if (aff.length) {
      lines.push(aff.join(' | '));
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

// 安全なファイル名スラッグ（既存命名規則と合わせる）
export function articleFilename(channelName, category) {
  const safeChannel = channelName
    .replace(/\s+/g, '_')
    .replace(/[\\/:*?"<>|]/g, '_');
  return `article_creator_${safeChannel}_${category}.md`;
}
