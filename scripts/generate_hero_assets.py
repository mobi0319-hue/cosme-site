"""
GPT image 2 でコスメサイトの装飾素材を生成する。

動画「Claude Design × GPT image 2」の手法を参考に、
AI感のない柔らかい装飾素材を生成して public/decorations/ に配置する。

使い方:
  py -3.12 scripts/generate_hero_assets.py
"""
import os
import sys
import base64
import json
from pathlib import Path
from urllib.request import Request, urlopen

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("環境変数 OPENAI_API_KEY が設定されていません。")
    sys.exit(1)

OUT_DIR = Path(__file__).parent.parent / "public" / "decorations"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# 動画の構造化プロンプトに倣って、目的/業種/ターゲット/トンマナ/要件を含める
PROMPTS = {
    "hero_bg": (
        "Soft abstract decorative background for a Japanese cosmetics review website hero section. "
        "Pastel pink, cream, and rose gold gradient. "
        "Very soft organic blob shapes, gentle curves, and subtle blurred circles. "
        "Watercolor-like wash texture, delicate floating particles. "
        "Feminine, elegant, transparent feel. NO text, NO product images, NO faces. "
        "Pure decorative background, suitable as a section backdrop. "
        "Plenty of empty white/cream space in the center for text overlay. "
        "Style: minimalist, modern Japanese beauty editorial, NOT illustration, NOT cartoon."
    ),
    "shapes_grid": (
        "A grid layout (2 rows x 3 columns) of 6 isolated decorative design assets on a pure white background. "
        "Each cell contains ONE separate soft abstract shape suitable for a Japanese cosmetics website. "
        "Shapes include: soft pink blob, watercolor circle in rose gold, gentle curved wave line, "
        "small petal cluster, sparkle/twinkle accents, soft cream cloud shape. "
        "All shapes are isolated with clear white space between them, ready to be cut out. "
        "Pastel pink, cream, beige, rose gold color palette only. "
        "NO text, NO product images. Pure design assets in a clean grid."
    ),
    "section_divider": (
        "A horizontal decorative section divider for a cosmetics website. "
        "Soft wavy line with gentle curves in pastel pink and cream. "
        "Watercolor-style with subtle gradient. Very thin and elegant. "
        "Transparent background feel, lots of white space above and below. "
        "NO text. Pure decorative element, suitable to place between page sections."
    ),
}


def generate_image(prompt: str, filename: str, size: str = "1024x1024", quality: str = "high") -> Path:
    """OpenAI gpt-image-2 を呼んで PNG を保存する。"""
    body = json.dumps({
        "model": "gpt-image-2",
        "prompt": prompt,
        "size": size,
        "quality": quality,
        "n": 1,
    }).encode("utf-8")

    req = Request(
        "https://api.openai.com/v1/images/generations",
        data=body,
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    print(f"  生成中: {filename} (size={size}, quality={quality})...")
    with urlopen(req, timeout=180) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    b64 = result["data"][0]["b64_json"]
    out_path = OUT_DIR / filename
    out_path.write_bytes(base64.b64decode(b64))
    size_kb = out_path.stat().st_size // 1024
    print(f"  保存: {out_path.name} ({size_kb} KB)")
    return out_path


def main() -> None:
    print(f"出力先: {OUT_DIR}")
    print(f"生成枚数: {len(PROMPTS)} 枚")

    # ヒーロー背景は横長
    targets = [
        ("hero_bg.png", PROMPTS["hero_bg"], "1536x1024", "high"),
        ("shapes_grid.png", PROMPTS["shapes_grid"], "1024x1024", "high"),
        ("section_divider.png", PROMPTS["section_divider"], "1536x1024", "medium"),
    ]

    for filename, prompt, size, quality in targets:
        try:
            generate_image(prompt, filename, size=size, quality=quality)
        except Exception as e:
            print(f"  失敗: {filename} -> {e}")

    print("\n完了。public/decorations/ に画像が保存されました。")


if __name__ == "__main__":
    main()
