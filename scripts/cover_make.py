#!/usr/bin/env python3
"""Cover composer — 小红书 / 视频号 cover generator.

Reads a Dior liquid-glass background (reuse minimax outputs or fetch new via
minimax_gen.gen_image), composes text layer on top, outputs PNG.

Usage:
  python3 scripts/cover_make.py opinion \
    --title "72M token 一晚烧光的真相" \
    --subtitle "GLM-4.6 长文本代价实测" \
    --chip "观点" --handle "@will.ai.lab" \
    --bg content-pipeline-full-auto --theme light \
    --out demo-opinion

Templates:
  opinion   — 3:4 大字标题（小红书）
  ranking   — 3:4 榜单型（Top N 大字）
  tool      — 3:4 工具评测（logo 矩阵 + 标题）
  yt        — 16:9 视频号/YT 缩略图

Themes: light | dark
"""
from __future__ import annotations
import argparse, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
BG_DIR = ROOT / "public/covers/minimax"
OUT_DIR = ROOT / "public/covers/xhs"
FONT_CJK = "/System/Library/Fonts/Hiragino Sans GB.ttc"
FONT_EN = "/System/Library/Fonts/Helvetica.ttc"

# Dior palette (from globals.css + minimax_gen)
DIOR = {
    "pink": (255, 123, 156),
    "pink_soft": (251, 200, 212),
    "mint": (92, 201, 167),
    "mint_soft": (190, 235, 216),
    "lav": (180, 142, 224),
    "lav_soft": (223, 201, 237),
    "yel": (255, 203, 69),
    "cream": (248, 240, 228),
    "warm": (50, 32, 24),  # near-black warm
    "ink": (30, 20, 40),
}

# Canvas sizes (小红书 3:4 official = 1080×1440)
SIZES = {
    "xhs": (1080, 1440),   # 3:4 小红书
    "yt":  (1280, 720),    # 16:9 YouTube / 视频号
}


# ────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────
def font(size: int, weight: str = "W6") -> ImageFont.FreeTypeFont:
    """Hiragino Sans GB has W3/W6 faces inside the .ttc."""
    idx = {"W3": 0, "W6": 1}.get(weight, 1)
    try:
        return ImageFont.truetype(FONT_CJK, size=size, index=idx)
    except Exception:
        return ImageFont.truetype(FONT_EN, size=size)


def fit_bg(bg_path: Path, size: tuple[int, int]) -> Image.Image:
    """Cover-fit bg into target size, preserving aspect."""
    bg = Image.open(bg_path).convert("RGB")
    tw, th = size
    bw, bh = bg.size
    scale = max(tw / bw, th / bh)
    nw, nh = int(bw * scale), int(bh * scale)
    bg = bg.resize((nw, nh), Image.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return bg.crop((left, top, left + tw, top + th))


def gradient_fallback(size: tuple[int, int], theme: str) -> Image.Image:
    """If no bg specified, render a diagonal Dior gradient."""
    w, h = size
    img = Image.new("RGB", size)
    if theme == "dark":
        top = (34, 22, 48)      # deep violet
        bot = (58, 32, 52)      # warm plum
    else:
        top = DIOR["pink_soft"]
        bot = DIOR["lav_soft"]
    for y in range(h):
        t = y / h
        r = int(top[0] * (1 - t) + bot[0] * t)
        g = int(top[1] * (1 - t) + bot[1] * t)
        b = int(top[2] * (1 - t) + bot[2] * t)
        ImageDraw.Draw(img).line([(0, y), (w, y)], fill=(r, g, b))
    return img


def glass_rect(img: Image.Image, box: tuple[int, int, int, int],
               theme: str, radius: int = 32, alpha: int = 180) -> None:
    """Draw a frosted liquid-glass rect (simulated via blur + translucent fill)."""
    x0, y0, x1, y1 = box
    # 1. blur the region behind
    region = img.crop(box).filter(ImageFilter.GaussianBlur(radius=28))
    img.paste(region, (x0, y0))
    # 2. overlay translucent tint
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    fill = (20, 12, 30, alpha) if theme == "dark" else (255, 255, 255, alpha - 40)
    od.rounded_rectangle(box, radius=radius, fill=fill)
    # subtle border
    border = (255, 255, 255, 60) if theme == "dark" else (255, 255, 255, 180)
    od.rounded_rectangle(box, radius=radius, outline=border, width=2)
    img.paste(overlay, (0, 0), overlay)


def wrap_cjk(text: str, font_obj: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    """Greedy wrap, CJK-char aware (break anywhere for CJK, keep ASCII words)."""
    lines: list[str] = []
    buf = ""
    for ch in text:
        test = buf + ch
        w = font_obj.getbbox(test)[2]
        if w <= max_w:
            buf = test
        else:
            if buf:
                lines.append(buf)
            buf = ch
    if buf:
        lines.append(buf)
    return lines


def draw_multiline(draw: ImageDraw.ImageDraw, xy: tuple[int, int],
                   lines: list[str], font_obj: ImageFont.FreeTypeFont,
                   fill, line_gap: int = 12) -> int:
    x, y = xy
    line_h = font_obj.getbbox("汉A")[3] + line_gap
    for ln in lines:
        draw.text((x, y), ln, font=font_obj, fill=fill)
        y += line_h
    return y


# ────────────────────────────────────────────────────────────
# Template: opinion (观点型 3:4)
# ────────────────────────────────────────────────────────────
def tpl_opinion(args) -> Image.Image:
    W, H = SIZES["xhs"]
    # 1. background
    if args.bg:
        bg_path = BG_DIR / f"{args.bg}.jpg"
        if not bg_path.is_file():
            print(f"bg not found: {bg_path}", file=sys.stderr)
            sys.exit(2)
        img = fit_bg(bg_path, (W, H))
    else:
        img = gradient_fallback((W, H), args.theme)

    # 2. darken/lighten top-half slightly for title contrast
    veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil)
    if args.theme == "dark":
        vd.rectangle([0, 0, W, H], fill=(10, 6, 18, 90))
    else:
        vd.rectangle([0, 0, W, H], fill=(255, 255, 255, 40))
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, veil)

    # 3. top chip (category tag)
    if args.chip:
        chip_font = font(32, "W6")
        pad_x, pad_y = 28, 14
        tw = chip_font.getbbox(args.chip)[2]
        th = chip_font.getbbox("汉")[3]
        chip_box = (60, 80, 60 + tw + pad_x * 2, 80 + th + pad_y * 2)
        glass_rect(img, chip_box, args.theme, radius=(th + pad_y * 2) // 2, alpha=200)
        d = ImageDraw.Draw(img)
        chip_color = DIOR["cream"] if args.theme == "dark" else DIOR["ink"]
        d.text((chip_box[0] + pad_x, chip_box[1] + pad_y - 2),
               args.chip, font=chip_font, fill=chip_color)

    # 4. main title (center-left, big)
    title_font = font(96, "W6")
    max_w = W - 120
    lines = wrap_cjk(args.title, title_font, max_w)
    # vertical anchor: 45% down
    line_h = title_font.getbbox("汉")[3] + 18
    total_h = line_h * len(lines)
    y0 = int(H * 0.42) - total_h // 2
    d = ImageDraw.Draw(img)
    title_color = DIOR["cream"] if args.theme == "dark" else DIOR["ink"]
    # shadow for readability
    shadow = (0, 0, 0, 120) if args.theme == "light" else (0, 0, 0, 200)
    shadow_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow_layer)
    y = y0 + 4
    for ln in lines:
        sd.text((62, y), ln, font=title_font, fill=shadow)
        y += line_h
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=6))
    img = Image.alpha_composite(img, shadow_layer)
    d = ImageDraw.Draw(img)
    y = y0
    for ln in lines:
        d.text((60, y), ln, font=title_font, fill=title_color)
        y += line_h

    # 5. subtitle
    if args.subtitle:
        sub_font = font(40, "W3")
        sub_lines = wrap_cjk(args.subtitle, sub_font, max_w)
        sub_color = (220, 210, 230, 255) if args.theme == "dark" else (80, 60, 90, 255)
        y += 20
        draw_multiline(d, (60, y), sub_lines, sub_font, sub_color, line_gap=8)

    # 6. bottom handle bar (liquid glass strip)
    if args.handle:
        bar_h = 120
        bar_box = (0, H - bar_h, W, H)
        glass_rect(img, bar_box, args.theme, radius=0, alpha=140)
        d = ImageDraw.Draw(img)
        hf = font(36, "W6")
        handle_color = DIOR["cream"] if args.theme == "dark" else DIOR["ink"]
        # dot accent
        accent = DIOR["pink"]
        d.ellipse([60, H - bar_h // 2 - 18, 96, H - bar_h // 2 + 18], fill=accent)
        d.text((120, H - bar_h // 2 - 22), args.handle, font=hf, fill=handle_color)

    return img.convert("RGB")


# ────────────────────────────────────────────────────────────
# CLI
# ────────────────────────────────────────────────────────────
TEMPLATES = {
    "opinion": tpl_opinion,
}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("template", choices=TEMPLATES.keys())
    p.add_argument("--title", required=True)
    p.add_argument("--subtitle", default="")
    p.add_argument("--chip", default="")
    p.add_argument("--handle", default="")
    p.add_argument("--bg", default="", help="filename stem under public/covers/minimax/ (no .jpg)")
    p.add_argument("--theme", choices=["light", "dark"], default="light")
    p.add_argument("--out", default="demo", help="output filename stem (no extension)")
    args = p.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    img = TEMPLATES[args.template](args)
    out_path = OUT_DIR / f"{args.out}.png"
    img.save(out_path, "PNG", optimize=True)
    print(f"✓ {out_path.relative_to(ROOT)}  ({out_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
