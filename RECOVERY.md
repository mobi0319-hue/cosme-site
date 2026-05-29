# cosme-site 補助ツール 復元プラン

最終更新: 2026-05-29
PC破損で消失したスクリプト群を、現存リポから逆算して復元するための設計書。

## 現状

| 領域 | 状態 |
|---|---|
| 公開サイト（cosme-ch.com → cosme-site.vercel.app） | ✅ 稼働 |
| GitHub リポ `mobi0319-hue/cosme-site` | ✅ 健在、main branch |
| データ `data/products.json` (5.8MB) `data/channels.json` (25KB) | ✅ 健在、最終更新 2026-05-07 |
| 生成済み記事 `data/articles/*.md` 547件 | ✅ 健在 |
| `lib/data.ts` パーサ | ✅ 健在、型定義もここに |
| `scripts/` 内 Python 3本（画像系のみ） | ✅ 健在 |
| **データ取り込みスクリプト群（YouTube/楽天/Amazon → JSON更新）** | ❌ **消失 = 再構築要** |

最終データ更新が 22 日前で停止中。新規 YouTube 動画が反映されていない。

## 必要なパイプライン（5ステージ）

```
┌─────────────────────┐    ┌───────────────────┐    ┌──────────────────────┐
│ 1. fetch_videos     │ →  │ 2. extract_products│ →  │ 3. enrich_products   │
│   YouTube Data API  │    │   AI 商品名抽出    │    │   楽天/Amazon検索    │
└─────────────────────┘    └───────────────────┘    └──────────────────────┘
                                                                ↓
                                  ┌──────────────────────────────────┐
                                  │ 4. merge_products + gen_articles │
                                  │   既存JSONマージ + .md再生成     │
                                  └──────────────────────────────────┘
                                                                ↓
                                  ┌──────────────────────┐
                                  │ 5. git commit & push │
                                  │   → Vercel自動build  │
                                  └──────────────────────┘
```

## ステージ別 必要API・SDK・実装方針

### Stage 1: fetch_videos（YouTube動画取得）
- **API**: YouTube Data API v3 (`videos.list`, `playlistItems.list`)
- **キー**: 既存 Google Cloud Console プロジェクト → APIキー再発行（無料、1日10,000 quota）
- **入力**: `data/channels.json` の channel URL リスト
- **出力**: `data/raw/videos_YYYY-MM-DD.json`（チャンネル別動画リスト＋字幕URL）
- **要点**:
  - チャンネルIDだけでなく `channel/UCxxx` と `user/xxx` 両方扱う必要あり
  - `published_at` で「前回取得以降」だけ差分取得すると quota 節約
  - 字幕は `youtube-transcript-api` (Python) または同等の Node ライブラリで取得

### Stage 2: extract_products（商品名抽出）
- **API**: Anthropic Claude Haiku 4.5（Prompt Caching 適用、`ANTHROPIC_API_KEY`）
- **入力**: 字幕テキスト + 動画概要欄
- **プロンプト構造**:
  - System: 「美容YouTuberの動画から紹介された化粧品の商品名・ブランド・カテゴリを JSON で抽出」
  - User: 字幕文字列
  - 出力: `[{brand, product_name, category, context, mention_count}]`
- **コスト**: 1動画あたり ~$0.001（推定、字幕10K文字想定）
- **要点**:
  - `data.ts` の `NON_COSME_KEYWORDS` `GARBAGE_NAME_KEYWORDS` フィルタは抽出後段で適用
  - カテゴリは `CATEGORY_ORDER` 内 17 種に正規化（`normalizeCategory` 使用）

### Stage 3: enrich_products（楽天/Amazon検索）
- **API1**: 楽天ウェブサービス Ichiba Item Search API (`RAKUTEN_APP_ID`、無料、1秒1リクエスト)
- **API2**: Amazon PA-API 5.0（**取得困難**、3ヶ月以内の売上必須）→ **代替: Amazon検索URL生成のみ**
- **入力**: 抽出された `{brand, product_name}` ペア
- **出力**: 各商品に `image_url`, `api_price`, `amazon_url`, `rakuten_url` を付与
- **要点**:
  - 楽天 API: 商品名+ブランドで search → 上位1件の画像URL/価格取得
  - Amazon: 検索URL生成だけ（既存 articles 内のリンクと同じ形式 `https://www.amazon.co.jp/s?k=...&tag=yuaffiliate01-22`）
  - 楽天アフィリリンク: `?af=mobi.0319` を付与（既存と同じ）

### Stage 4: merge_products + generate_articles
- **入力**: 新規抽出商品 + 既存 `products.json`
- **マージ規則**:
  - `(brand, product_name)` キーで重複検出
  - 重複時: `mentioned_by[]` に新規 mention 追記、 `mention_count` 再計算
  - 新規時: 追加
- **記事生成**: `lib/data.ts` の型定義に従って `data/articles/article_creator_{channel}_{category}.md` を再生成
  - テンプレ: 既存 .md と同形式（`# {Creator}おすすめ{Category}{N}選【{YYYY年MM月}版】`）
  - 各商品: 商品名 / 価格 / 引用 / 動画リンク / Amazon・楽天アフィリリンク

### Stage 5: commit & push
- `git add data/ && git commit -m "data: auto-update YYYY-MM-DD" && git push`
- Vercel が自動ビルド・デプロイ

## 推奨実装スタック

| 部品 | 推奨 | 理由 |
|---|---|---|
| 言語 | **Node.js (ESM)** | 既存リポと同一、 ライブラリ豊富、tsx で型恩恵 |
| YouTube | `googleapis` (公式) | Google公式 SDK |
| 字幕 | `youtube-transcript` (npm) | 簡単 |
| AI | Anthropic SDK + Prompt Cache | コスト最安、品質高 |
| 楽天 | 素 fetch（API単純） | SDK 不要 |
| スケジューリング | GitHub Actions cron（毎日1回） | コスト¥0、無管理 |
| 環境変数管理 | `.env`（git ignore） + GH Actions Secrets | 標準 |

## 推奨フォルダ構成

```
cosme-site/
├── scripts/
│   ├── (既存) generate_hero_assets.py
│   ├── (既存) quality_check.py
│   ├── (既存) split_shapes.py
│   ├── pipeline/                        ← 新規追加
│   │   ├── fetch_videos.mjs
│   │   ├── extract_products.mjs
│   │   ├── enrich_products.mjs
│   │   ├── merge_and_generate.mjs
│   │   └── run.mjs                      ← 全ステージ実行
│   ├── lib/
│   │   ├── youtube.mjs
│   │   ├── rakuten.mjs
│   │   ├── claude.mjs
│   │   └── markdown.mjs
│   └── package.json
├── .env.example                          ← 新規追加
└── .github/workflows/
    └── auto-update.yml                   ← 新規追加（cron毎日2:00 JST）
```

## 環境変数（.env.example）

```bash
# YouTube Data API v3
YOUTUBE_API_KEY=AIza...

# Anthropic Claude Haiku 4.5
ANTHROPIC_API_KEY=sk-ant-...

# 楽天ウェブサービス
RAKUTEN_APP_ID=...

# 楽天アフィリエイトID（既存値）
RAKUTEN_AFFILIATE_ID=mobi.0319

# Amazon アフィリエイトタグ（既存値）
AMAZON_AFFILIATE_TAG=yuaffiliate01-22

# Git push 用（GH Actions では token不要、 GITHUB_TOKEN自動付与）
```

## 復元の優先順位

### Phase 1: 最小再生産（1-2 日）
- [ ] YouTube Data API キー再発行
- [ ] Claude API キー確認（既存利用なら課金状況確認）
- [ ] 楽天ウェブサービス AppID 確認
- [ ] `scripts/pipeline/fetch_videos.mjs` 実装＋既存25 channels で動作確認
- [ ] `scripts/pipeline/extract_products.mjs` 実装＋5動画でテスト
- [ ] `merge_and_generate.mjs` の generate 部分のみ実装（既存 products.json から articles 再生成テスト）

### Phase 2: 全自動化（追加2-3 日）
- [ ] enrich_products.mjs（楽天検索＋画像/価格付与）
- [ ] run.mjs（全パイプライン orchestration）
- [ ] GitHub Actions cron 設定
- [ ] 初回フル実行 → 22 日分のキャッチアップ
- [ ] Vercel デプロイ確認

### Phase 3: 品質改善（オプション）
- [ ] 動画字幕がない場合の音声 → テキスト（Whisper）
- [ ] AI 抽出精度向上（few-shot例追加）
- [ ] dashboard ページ追加（chart.js等で mention 推移可視化）

## 既存資産で残ってる安全要素

1. `lib/data.ts` のフィルタ・正規化ロジック（再実装不要）
2. `data/channels.json` の 25 creator マスタ
3. `data/products.json` の 4,047 product 履歴
4. 既存記事 547 件（フォーマット参照用）
5. 既存アフィリエイトタグ（`mobi.0319` / `yuaffiliate01-22`）
6. Vercel hosting（無管理で動き続けている）

## 次のアクション（朝起きてすぐ）

1. **API キー3つ再発行/確認**:
   - Google Cloud Console → YouTube Data API v3 用キー
   - Anthropic Console → API キー残高確認
   - 楽天ウェブサービス → AppID 確認
2. **Phase 1 の `merge_and_generate.mjs` から着手**（既存 products.json で記事再生成テスト）が安全
3. それで動けば fetch / extract のパイプライン上流に拡張

---

参考: 元の補助ツール群は別フォルダで運用されており、コミットされていなかった（pre-merge artifact）。本リポからは復元不可。
