"""
cosme-site データ品質チェックスクリプト
デプロイ前に自動実行し、問題があればデプロイを止める

チェック項目:
1. 商品データの品質（ゴミ商品名、ブランド空、カテゴリ不正）
2. クリエイターページの品質（商品数ゼロ、ゴミ商品率が高いチャンネル）
3. ランキングの整合性（mention_countと表示の一致）
4. ページ表示の整合性（youtuberCount vs 実際の引用数）
5. リンク切れ・スラッグ重複

問題があればexit 1でデプロイを止める（警告のみはexit 0）
"""
import json
import re
import sys
import os
from collections import defaultdict, Counter
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

# パス設定
SITE_DIR = Path(__file__).parent.parent
DATA_DIR = SITE_DIR / 'data'

# ======== ゴミ判定（data.tsと同じロジック） ========

GARBAGE_NAME_KEYWORDS = [
    'TAG', 'Twitter', 'Instagram', 'Insram', 'フォロー', 'チャンネル登録',
    'LINE公式', 'TikTok', 'お仕事の依頼', 'お問い合わせ', 'プロフィール',
    'https://', 'http://', '.com/', '.jp/',
    'メガ割', '販売価格', '通常価格', 'クーポン', '期間限定',
    '#ダイエット', '#筋トレ', '#宅トレ',
    '前回の', '前々回の', 'おすすめ動画', '動画はこちら',
    'フィットネスインストラクター', 'をモットーに',
    '公式サイト', 'プロモーション', '提供：', '提供:', 'PR案件', 'プレゼント企画',
    'AGA', 'デオドラント', '入浴剤', 'シャワーヘッド', '加湿器',
    'www', 'ｗｗ',
]

NON_COSME_KEYWORDS = [
    'ファッション', '衣類', 'トップス', 'ボトムス', 'アウター', 'インナー',
    'ルームウェア', 'パンツ', 'ワンピース', 'スカート', 'アパレル',
    '靴', 'シューズ', 'バッグ', '財布', '時計', '帽子',
    'アクセサリー', 'ピアス', 'ネックレス', 'リング',
    'キャンピングカー', 'テント', 'アウトドア',
    'ベビー', '書籍', '食品', '食材', '飲料', '調味料', 'フード',
    '家電', '家具', '収納', '掃除', '洗剤', '洗濯',
    'キッチン', '調理', '寝具', '日用品',
    'ペット', 'ドッグ', 'フィットネス', 'スマホ',
    'タンブラー', 'おもちゃ', 'サービス',
]

def is_garbage_name(name):
    if not name or len(name.strip()) <= 2 or len(name) > 100:
        return True
    if any(kw in name for kw in GARBAGE_NAME_KEYWORDS):
        return True
    if re.search(r'[。？！…\u201C\u201D\u300C\u300D]', name):
        return True
    if re.match(r'^[のはがをにでと]', name):
        return True
    if re.search(r'(?:ます|ました|です|ません|だろう|ないです|だとか|ございます)$', re.sub(r'[。！？]+$', '', name)):
        return True
    if re.match(r'^(?:一番|基本的に|やっぱり|個人的に|正直|ちなみに|もう何回も)', name):
        return True
    if re.search(r'@\w', name):
        return True
    if name.startswith('【【'):
        return True
    if re.match(r'^[◾◼▪▫●○■□★☆♪♫✨🫶📷📸🍽💙🍑]', name):
        return True
    if name.endswith('発売記念'):
        return True
    if len(name.strip()) <= 10 and not re.search(r'[\u3040-\u309F\u30A0-\u30FF\d]', name):
        return True
    return False

def is_cosme_category(cat):
    if not cat or cat in ['-', '不明']:
        return False
    return not any(kw in cat for kw in NON_COSME_KEYWORDS)

def is_valid_product(p):
    """data.tsのフィルタと同じ条件で有効な商品か判定"""
    if not is_cosme_category(p.get('category', '')):
        return False
    brand = p.get('brand', '')
    if not brand or brand.strip() in ['', '-', '不明']:
        return False
    if '不明' in p.get('product_name', ''):
        return False
    if is_garbage_name(p.get('product_name', '')):
        return False
    return True


# ======== メインチェック ========

def run_checks():
    errors = []    # デプロイを止める問題
    warnings = []  # 警告のみ

    # データ読み込み
    products = json.loads((DATA_DIR / 'products.json').read_text(encoding='utf-8'))
    channels = json.loads((DATA_DIR / 'channels.json').read_text(encoding='utf-8'))

    # フィルタ適用（data.tsと同じ）
    valid = [p for p in products if is_valid_product(p)]

    print(f"=== cosme-site データ品質チェック ===")
    print(f"  products.json: {len(products)}件 → フィルタ後: {len(valid)}件")

    # ---- 1. 基本データチェック ----
    if len(valid) == 0:
        errors.append("有効な商品が0件")
    elif len(valid) < 500:
        errors.append(f"有効商品が少なすぎる: {len(valid)}件（想定500件以上）")

    # ファイルサイズ
    size_mb = (DATA_DIR / 'products.json').stat().st_size / 1024 / 1024
    if size_mb > 15:
        errors.append(f"products.json が {size_mb:.1f}MB（上限15MB、Vercelデプロイ失敗の可能性）")

    # ---- 2. ゴミデータが素通りしていないか ----
    # フィルタ通過後にまだゴミが残っていないかスポットチェック
    suspicious = []
    for p in valid:
        name = p.get('product_name', '')
        # 追加の疑わしいパターン
        if re.search(r'[\U0001F300-\U0001FAFF]', name):  # 絵文字
            suspicious.append(f"絵文字: {name[:50]}")
        if len(name) > 80:
            suspicious.append(f"長すぎ: {name[:50]}...")
        if name.count(' ') > 10:
            suspicious.append(f"スペース多: {name[:50]}")

    if suspicious:
        warnings.append(f"疑わしい商品名 {len(suspicious)}件（サンプル: {suspicious[0]}）")

    # ---- 3. クリエイターチェック ----
    active_channels = [c for c in channels if c.get('genre') == 'cosme' and c.get('active') and c.get('display') != False]

    for ch in active_channels:
        name = ch['name']
        yt_name = ch.get('youtube_name', '')

        # このチャンネルの商品を集計
        ch_products = []
        for p in valid:
            for m in p.get('mentioned_by', []):
                mch = m.get('channel', '')
                if not mch or not name:
                    continue
                if mch == name or mch == yt_name:
                    ch_products.append(p)
                    break
                if len(mch) >= 2 and len(name) >= 2:
                    if mch in name or name in mch:
                        ch_products.append(p)
                        break
                    if len(yt_name) >= 2 and (mch in yt_name or yt_name in mch):
                        ch_products.append(p)
                        break

        if len(ch_products) == 0:
            warnings.append(f"クリエイター '{name}' の有効商品が0件 → display=false推奨")

    # ---- 4. ランキング整合性 ----
    # mention_count vs 実際のユニークチャンネル数
    mismatch_count = 0
    for p in valid:
        mentions = [m for m in p.get('mentioned_by', []) if m.get('context', '').strip()]
        actual_mc = len(set(m['channel'] for m in mentions))
        stored_mc = p.get('mention_count', 0)
        # stored_mcはslim前の値なので完全一致は期待しないが、大きくずれていたら警告
        if actual_mc > 0 and stored_mc == 0:
            mismatch_count += 1

    if mismatch_count > 10:
        warnings.append(f"mention_count不整合 {mismatch_count}件（products.jsonのmention_countが古い可能性）")

    # ---- 5. スラッグ重複チェック ----
    def slugify(p):
        s = f"{p['brand']}-{p['product_name']}"
        s = re.sub(r'[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]', '-', s)
        s = re.sub(r'-+', '-', s).strip('-')
        if len(s.encode('utf-8')) > 200:
            while len(s.encode('utf-8')) > 200:
                s = s[:-1]
            s = s.rstrip('-')
        return s

    slugs = Counter(slugify(p) for p in valid)
    duplicates = {s: c for s, c in slugs.items() if c > 1}
    if duplicates:
        warnings.append(f"スラッグ重複 {len(duplicates)}件（最大: '{max(duplicates, key=duplicates.get)}' x{max(duplicates.values())}）")

    # ---- 6. 記事チェック ----
    articles_dir = DATA_DIR / 'articles'
    if articles_dir.exists():
        articles = list(articles_dir.glob('*.md'))
        empty_articles = []
        for a in articles:
            content = a.read_text(encoding='utf-8')
            if len(content.strip()) < 100:
                empty_articles.append(a.name)
        if empty_articles:
            warnings.append(f"空に近い記事 {len(empty_articles)}件")

    # ---- 結果出力 ----
    print()
    if errors:
        print(f"❌ エラー: {len(errors)}件（デプロイ不可）")
        for e in errors:
            print(f"  ❌ {e}")
    if warnings:
        print(f"⚠ 警告: {len(warnings)}件")
        for w in warnings:
            print(f"  ⚠ {w}")
    if not errors and not warnings:
        print("✅ 問題なし")

    if errors:
        print("\n>>> デプロイを中止します")
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(run_checks())
