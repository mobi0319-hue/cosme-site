# Google Search Console: 重複ページ問題

**日付**: 2026-04-13
**通知内容**: 「重複しています。ユーザーにより、正規ページとして選択されていません」

---

## 原因分析

### 主原因: trailingSlash未設定
- `next.config.ts` に `trailingSlash` が明示されていない
- `/products` と `/products/` の両方でアクセス可能な状態
- Googleが両方クロール → 重複と判定

### 副次的な可能性
- `/products?category=XXX` 等のクエリパラメータ付きURLにcanonicalが効いていない
- canonical自体は各ページに設定済み（layout.tsx, 各page.tsx）

## 対応内容

### 1. next.config.ts に追加（必須・1行）
```typescript
const nextConfig: NextConfig = {
  trailingSlash: false,  // 明示的に設定
  // ... 既存設定
};
```

### 2. クエリパラメータ付きURLのcanonical整理（任意）
- `/products?category=XXX` → canonical は `/products` に統一

### 緊急度
**低**。SEO最適化の話でサイト動作には影響なし。次のデプロイ時にまとめて対応でOK。
