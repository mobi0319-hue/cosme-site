"""
shapes_grid.png を 2x3 のセルに分割して、各セルを透過PNGとして書き出す。

動画のワークフロー「グリッド形式で出力 → 1つずつ分割 → 透過」に対応。
白背景を透過化する処理付き。
"""
from pathlib import Path
from PIL import Image

SRC = Path(__file__).parent.parent / "public" / "decorations" / "shapes_grid.png"
OUT_DIR = SRC.parent / "shapes"
OUT_DIR.mkdir(exist_ok=True)

ROWS = 2
COLS = 3
NAMES = [
    ["blob_pink", "circle_rose", "wave_pink"],
    ["petals", "sparkles", "cloud_cream"],
]
# 白に近いピクセルを透過扱いするしきい値（0-255）
WHITE_THRESHOLD = 240


def make_transparent(img: Image.Image) -> Image.Image:
    """白背景を透過に変換する。"""
    img = img.convert("RGBA")
    pixels = img.getdata()
    new_pixels = []
    for r, g, b, a in pixels:
        if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD:
            new_pixels.append((r, g, b, 0))
        else:
            # 白に近いほど半透明にして滑らかにする
            min_c = min(r, g, b)
            if min_c > 220:
                alpha = max(0, 255 - int((min_c - 220) * (255 / 35)))
                new_pixels.append((r, g, b, alpha))
            else:
                new_pixels.append((r, g, b, a))
    img.putdata(new_pixels)
    return img


def main() -> None:
    img = Image.open(SRC)
    w, h = img.size
    cell_w = w // COLS
    cell_h = h // ROWS
    print(f"元画像: {w}x{h}, セル: {cell_w}x{cell_h}")

    for row in range(ROWS):
        for col in range(COLS):
            left = col * cell_w
            top = row * cell_h
            right = left + cell_w
            bottom = top + cell_h
            cell = img.crop((left, top, right, bottom))
            transparent = make_transparent(cell)
            name = NAMES[row][col]
            out = OUT_DIR / f"{name}.png"
            transparent.save(out, "PNG")
            print(f"  保存: {out.relative_to(SRC.parent.parent.parent)}")


if __name__ == "__main__":
    main()
