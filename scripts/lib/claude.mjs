// Anthropic Claude Haiku 4.5 ラッパ
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL ?? 'claude-haiku-4-5';

const SYSTEM = `あなたは美容YouTube動画の文字起こしを分析するアシスタントです。
動画内で言及された化粧品商品を抽出し、JSON配列のみを返してください。

各要素のスキーマ:
{
  "brand": "ブランド名（カタカナまたは英字）",
  "product_name": "商品名（ブランド除く）",
  "category": "次のうち1つ: スキンケア / UVケア / 化粧下地 / ファンデーション / フェイスパウダー / コンシーラー / チーク / ハイライター / シェーディング / アイシャドウ / アイライナー / アイブロウ / マスカラ / リップ / ヘアケア / ボディケア / その他",
  "context": "言及されている文脈の一節（10-100文字、原文ママ）"
}

注意:
- 化粧品以外（食品/家電/服等）は除外
- 同じ商品が何度も言及されたら1件にまとめる
- ブランド名と商品名が判別できないものは除外
- ハッシュタグ・SNSリンク・PR告知は除外
- JSON以外の文字（コードフェンス含む）は出力しない`;

export async function extractProducts(transcript, videoTitle) {
  if (!transcript || transcript.length < 50) return [];

  const userMsg = `動画タイトル: ${videoTitle}\n\n文字起こし:\n${transcript.slice(0, 20000)}`;

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [
      { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }
    ],
    messages: [{ role: 'user', content: userMsg }],
  });

  const text = resp.content.find(b => b.type === 'text')?.text ?? '[]';
  try {
    // JSON以外の前後テキストを取り除く防御
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start < 0 || end < 0) return [];
    return JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    console.error('JSON parse failed:', e.message, '\nraw:', text.slice(0, 200));
    return [];
  }
}
