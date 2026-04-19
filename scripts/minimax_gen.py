#!/usr/bin/env python3
"""MiniMax image generation — blog covers, case covers, site banners.

Usage:
  python3 scripts/minimax_gen.py covers [--regen-minimax] [--smart] [--limit N] [--dry-run] [--force]
  python3 scripts/minimax_gen.py case-covers [--slug SLUG] [--smart] [--dry-run] [--force]
  python3 scripts/minimax_gen.py site-banners [--dry-run] [--force]
  python3 scripts/minimax_gen.py smoke

--smart  Uses Kimi K2.5 to extract a specific visual motif from article body
         before sending to MiniMax — produces content-relevant covers.
--regen-minimax  Regenerate all posts whose current coverImage is in /covers/minimax/
"""
from __future__ import annotations
import argparse, json, os, re, sys, time, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "src/content/blog"
COVERS_DIR = ROOT / "public/covers/minimax"
CASE_COVERS_DIR = ROOT / "public/covers/cases"
ILLUS_DIR = ROOT / "public/covers/illustrations"

TEXT_URL = "https://api.minimaxi.com/v1/chat/completions"
IMAGE_URL = "https://api.minimaxi.com/v1/image_generation"
TEXT_MODEL = "MiniMax-M2.7-highspeed"
IMAGE_MODEL = "image-01"

KIMI_URL = "https://api.kimi.com/coding/v1/messages"
KIMI_MODEL = "kimi-k2.5"

DIOR_STYLE = (
    "Dior liquid-glass aesthetic: soft pastel palette (pale pink #FFD1DC, mint #C8F5E4, "
    "lavender #E8D5F5, buttercream #FFEFC8). Frosted translucent overlapping planes, "
    "liquid glass light refraction, premium editorial mood, very high aesthetic quality. "
    "16:9 banner composition. Absolutely NO text, NO letters, NO words, NO humans, NO logos, NO watermarks."
)


# ─── Key loaders ─────────────────────────────────────────────────────────────

def load_key() -> str:
    k = os.environ.get("MINIMAX_CN_API_KEY")
    if k:
        return k.strip()
    env = Path.home() / ".hermes/.env"
    if env.is_file():
        for line in env.read_text().splitlines():
            if line.startswith("MINIMAX_CN_API_KEY="):
                return line.split("=", 1)[1].strip()
    raise RuntimeError("MINIMAX_CN_API_KEY not found (env or ~/.hermes/.env)")


def load_kimi_key() -> str:
    cfg = Path.home() / ".openclaw/openclaw.json"
    if not cfg.is_file():
        raise RuntimeError(f"Config not found: {cfg}")
    data = json.loads(cfg.read_text())
    k = data.get("models", {}).get("providers", {}).get("kimi", {}).get("apiKey")
    if not k:
        raise RuntimeError("kimi.apiKey missing in openclaw.json")
    return k.strip()


# ─── HTTP helpers ─────────────────────────────────────────────────────────────

def http_post_json(url: str, payload: dict, key: str, timeout: int = 120) -> dict:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def http_download(url: str, dest: Path, timeout: int = 90) -> int:
    with urllib.request.urlopen(url, timeout=timeout) as resp:
        blob = resp.read()
    dest.write_bytes(blob)
    return len(blob)


# ─── Kimi visual motif extractor ─────────────────────────────────────────────

def kimi_visual_motif(title: str, body_excerpt: str, key: str) -> str:
    """Ask Kimi to describe a specific visual scene for MiniMax image generation."""
    prompt = (
        "You are a visual art director. Based on the article below, write ONE precise image-generation prompt "
        "(40-60 words) describing a SPECIFIC visual scene or metaphor for an editorial banner.\n"
        "Rules: abstract/symbolic only — show an OBJECT or SCENE that represents the article's core idea, "
        "not a generic illustration. No people, no text, no logos, no UI screenshots.\n"
        "Output only the scene description sentence. Start with a noun like 'A close-up of...' / 'An aerial view...' / 'A floating...' etc.\n\n"
        f"Article title: {title}\n"
        f"Article excerpt:\n{body_excerpt[:600]}"
    )
    body = json.dumps({
        "model": KIMI_MODEL,
        "max_tokens": 200,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")
    req = urllib.request.Request(
        KIMI_URL,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        for b in data.get("content", []):
            if b.get("type") == "text" and b.get("text", "").strip():
                return b["text"].strip()
    except Exception as e:
        print(f"    [Kimi motif error: {e}]", flush=True)
    return f"A precise abstract editorial illustration representing: {title}"


# ─── Frontmatter helpers ──────────────────────────────────────────────────────

def read_fm_field(raw: str, field: str) -> str | None:
    for line in raw.splitlines():
        m = re.match(rf'^{re.escape(field)}:\s*"?([^"\n]+?)"?\s*$', line)
        if m:
            return m.group(1).strip()
    return None


def read_fm_nested(raw: str, block: str) -> dict[str, str]:
    out: dict[str, str] = {}
    lines = raw.splitlines()
    i = 0
    while i < len(lines):
        if lines[i].rstrip() == f"{block}:":
            i += 1
            while i < len(lines) and lines[i].startswith(" "):
                m = re.match(r'^\s+(\w+):\s*"?([^"\n]+?)"?\s*$', lines[i])
                if m:
                    out[m.group(1)] = m.group(2).strip()
                i += 1
            break
        i += 1
    return out


def extract_body(md_path: Path) -> str:
    txt = md_path.read_text()
    m = re.match(r"^---\s*\n[\s\S]*?\n---\s*\n", txt)
    body = txt[m.end():].strip() if m else txt.strip()
    # Strip markdown syntax for cleaner excerpt
    body = re.sub(r"#+\s+", "", body)
    body = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", body)
    body = re.sub(r"[*_`]", "", body)
    return body[:700]


# ─── Blog cover generation ────────────────────────────────────────────────────

CAT_HINTS = {
    "learning": "AI knowledge and learning, abstract neural pathways, data flowing through geometric lattices",
    "business": "AI-powered workflow automation, digital process optimization, clean tech workspace",
    "tech": "cutting-edge technology infrastructure, circuit patterns, system architecture visualization",
    "life": "everyday life in Japan, cinematic warm moments, urban lifestyle",
    "general": "abstract conceptual space, floating geometric forms, digital creativity",
}


def build_blog_prompt(slug: str, fm_raw: str, body: str = "", kimi_key: str = "") -> str:
    title_d = read_fm_nested(fm_raw, "title") or {}
    title = title_d.get("zh") or title_d.get("en") or slug
    excerpt_d = read_fm_nested(fm_raw, "excerpt") or {}
    excerpt = excerpt_d.get("zh") or excerpt_d.get("en") or ""
    category = read_fm_field(fm_raw, "category") or "general"

    if kimi_key and (body or excerpt):
        source = body if body else excerpt
        motif = kimi_visual_motif(title, source, kimi_key)
        print(f"    [motif] {motif[:80]}…", flush=True)
    else:
        cat_hint = CAT_HINTS.get(category, CAT_HINTS["general"])
        excerpt_short = excerpt[:120] if excerpt else ""
        motif = f"A highly detailed editorial illustration representing '{title}'. Theme: {cat_hint}. {excerpt_short}"

    return f"{motif}. {DIOR_STYLE}"


def gen_image(prompt: str, key: str) -> str:
    for attempt in range(3):
        try:
            resp = http_post_json(
                IMAGE_URL,
                {
                    "model": IMAGE_MODEL,
                    "prompt": prompt,
                    "aspect_ratio": "16:9",
                    "n": 1,
                    "response_format": "url",
                },
                key,
            )
            urls = (resp.get("data") or {}).get("image_urls") or []
            if urls:
                return urls[0]
            raise RuntimeError(f"no url in response: {json.dumps(resp)[:200]}")
        except Exception as e:
            if attempt == 2:
                raise
            wait = 5 + attempt * 5
            print(f"    [retry {attempt+1}/3 after {wait}s: {e}]", flush=True)
            time.sleep(wait)
    raise RuntimeError("gen_image failed 3x")


def upsert_cover_field(fm_raw: str, path: str) -> str:
    lines = fm_raw.splitlines()
    for i, line in enumerate(lines):
        if line.startswith("coverImage:"):
            lines[i] = f"coverImage: {path}"
            return "\n".join(lines)
    for i, line in enumerate(lines):
        if line.startswith("date:"):
            lines.insert(i + 1, f"coverImage: {path}")
            return "\n".join(lines)
    lines.append(f"coverImage: {path}")
    return "\n".join(lines)


def rewrite_post(md_path: Path, cover_rel: str) -> None:
    txt = md_path.read_text()
    m = re.match(r"^(---\s*\n)([\s\S]*?)(\n---\s*\n)([\s\S]*)$", txt)
    if not m:
        return
    new_fm = upsert_cover_field(m.group(2), cover_rel)
    md_path.write_text(f"{m.group(1)}{new_fm}{m.group(3)}{m.group(4)}")


def list_missing_covers() -> list[tuple[str, Path, str]]:
    out: list[tuple[str, Path, str]] = []
    for p in sorted(BLOG_DIR.glob("*.md")):
        slug = p.stem
        txt = p.read_text()
        m = re.match(r"^---\s*\n([\s\S]*?)\n---", txt)
        if not m:
            continue
        fm_raw = m.group(1)
        cover = read_fm_field(fm_raw, "coverImage")
        needs = not cover or not (ROOT / ("public" + cover)).is_file()
        if needs:
            out.append((slug, p, fm_raw))
    return out


def list_minimax_covers() -> list[tuple[str, Path, str]]:
    """Return posts whose current coverImage lives in /covers/minimax/ (needs smart redo)."""
    out: list[tuple[str, Path, str]] = []
    for p in sorted(BLOG_DIR.glob("*.md")):
        slug = p.stem
        txt = p.read_text()
        m = re.match(r"^---\s*\n([\s\S]*?)\n---", txt)
        if not m:
            continue
        fm_raw = m.group(1)
        cover = read_fm_field(fm_raw, "coverImage") or ""
        if "/covers/minimax/" in cover:
            out.append((slug, p, fm_raw))
    return out


def cmd_covers(args):
    key = load_key()
    kimi_key = load_kimi_key() if args.smart else ""
    COVERS_DIR.mkdir(parents=True, exist_ok=True)

    if args.regen_minimax:
        targets = list_minimax_covers()
        print(f"Regen-minimax mode: {len(targets)} posts")
    elif args.slug:
        targets = []
        for p in BLOG_DIR.glob("*.md"):
            if p.stem == args.slug:
                txt = p.read_text()
                mm = re.match(r"^---\s*\n([\s\S]*?)\n---", txt)
                if mm:
                    targets = [(args.slug, p, mm.group(1))]
                break
    else:
        targets = list_missing_covers()

    if args.limit:
        targets = targets[: args.limit]
    print(f"Targets: {len(targets)}")

    for slug, md_path, fm_raw in targets:
        dest = COVERS_DIR / f"{slug}.jpg"
        if dest.is_file() and not args.force and not args.regen_minimax:
            print(f"  SKIP (exists) {slug}")
            continue
        body = extract_body(md_path) if kimi_key else ""
        prompt = build_blog_prompt(slug, fm_raw, body, kimi_key)
        if args.dry_run:
            print(f"  DRY {slug}\n      {prompt[:140]}")
            continue
        print(f"  gen {slug} …", flush=True)
        try:
            url = gen_image(prompt, key)
            size = http_download(url, dest)
            rewrite_post(md_path, f"/covers/minimax/{slug}.jpg")
            print(f"  OK  {slug} ({size // 1024}KB)")
            time.sleep(0.8)
        except Exception as e:
            print(f"  FAIL {slug}: {e}")


# ─── Case covers ──────────────────────────────────────────────────────────────

CASES_TS = ROOT / "src/data/cases.ts"


def extract_cases() -> list[dict]:
    txt = CASES_TS.read_text()
    out: list[dict] = []
    for m in re.finditer(
        r"slug:\s*'([^']+)'[\s\S]*?title:\s*\{[\s\S]*?en:\s*'([^']+)'[\s\S]*?"
        r"subtitle:\s*\{[\s\S]*?en:\s*'([^']+)'[\s\S]*?"
        r"category:\s*'([^']+)'[\s\S]*?"
        r"gradient:\s*'([^']+)'[\s\S]*?"
        r"icon:\s*'([^']+)'",
        txt,
    ):
        out.append({
            "slug": m.group(1),
            "title_en": m.group(2),
            "subtitle_en": m.group(3),
            "category": m.group(4),
            "gradient": m.group(5),
            "icon": m.group(6),
        })
    return out


def extract_case_story_en(slug: str) -> str:
    """Pull story.en text from cases.ts for a given slug (for Kimi motif extraction)."""
    txt = CASES_TS.read_text()
    # Find the block for this slug
    start = txt.find(f"slug: '{slug}'")
    if start == -1:
        return ""
    # Find next story en value
    chunk = txt[start:start + 6000]
    m = re.search(r"story:\s*\{[\s\S]*?en:\s*'((?:[^'\\]|\\.)*)'", chunk)
    if m:
        return m.group(1).replace("\\n", "\n").replace("\\'", "'")[:600]
    return ""


def build_case_prompt(c: dict, kimi_key: str = "") -> str:
    if kimi_key:
        story = extract_case_story_en(c["slug"])
        body = f"{c['title_en']}. {c['subtitle_en']}. {story}"
        motif = kimi_visual_motif(c["title_en"], body, kimi_key)
        print(f"    [motif] {motif[:80]}…", flush=True)
    else:
        motif = (
            f"Abstract editorial illustration for a technology case study: {c['title_en']}. "
            f"{c['subtitle_en']}. Symbolic representation of AI automation workflow."
        )
    return f"{motif}. {DIOR_STYLE}"


def cmd_case_covers(args):
    key = load_key()
    kimi_key = load_kimi_key() if args.smart else ""
    CASE_COVERS_DIR.mkdir(parents=True, exist_ok=True)
    cases = extract_cases()
    if args.slug:
        cases = [c for c in cases if c["slug"] == args.slug]
    print(f"Cases: {len(cases)}")
    for c in cases:
        dest = CASE_COVERS_DIR / f"{c['slug']}.jpg"
        if dest.is_file() and not args.force:
            print(f"  SKIP {c['slug']}")
            continue
        prompt = build_case_prompt(c, kimi_key)
        if args.dry_run:
            print(f"  DRY {c['slug']}\n      {prompt[:140]}")
            continue
        print(f"  gen {c['slug']} …", flush=True)
        try:
            url = gen_image(prompt, key)
            size = http_download(url, dest)
            print(f"  OK  {c['slug']} ({size // 1024}KB)")
            time.sleep(0.8)
        except Exception as e:
            print(f"  FAIL {c['slug']}: {e}")


# ─── Site infrastructure banners ─────────────────────────────────────────────

SITE_BANNERS = [
    {
        "key": "hero-main",
        "file": ILLUS_DIR / "hero-main.jpg",
        "motif": (
            "A breathtaking aerial view of a luminous AI laboratory floating in space: "
            "interconnected glowing nodes and data streams forming a neural network galaxy, "
            "miniature robotic arms handling delicate circuit boards inside frosted glass domes, "
            "holographic workflow diagrams drifting between transparent platforms. "
            "Deep space background with soft pastel nebula. 16:9 ultra-wide."
        ),
    },
    {
        "key": "blog-banner",
        "file": ILLUS_DIR / "blog-banner.jpg",
        "motif": (
            "A close-up of an open crystal book with pages turning into glowing data streams and "
            "neural network diagrams, each page a different pastel hue, floating feather-light "
            "in a void of soft mint and lavender light. Abstract knowledge visualization. 16:9."
        ),
    },
    {
        "key": "cases-banner",
        "file": ILLUS_DIR / "cases-banner.jpg",
        "motif": (
            "An architectural blueprint table made of frosted glass, showing three-dimensional "
            "holographic case study diagrams floating above it: flowcharts, data dashboards, and "
            "workflow maps rendered in pastel mint and pink light, surrounded by translucent "
            "geometric building blocks. Editorial 16:9 composition."
        ),
    },
    {
        "key": "about-portrait",
        "file": ILLUS_DIR / "about-portrait.jpg",
        "motif": (
            "A single elegant glass desk in a minimalist floating studio: a holographic keyboard "
            "projecting soft mint light upward, surrounded by floating transparent screens showing "
            "AI workflow diagrams, a small Siberian cat silhouette perched on the corner. "
            "Warm buttercream and lavender ambient lighting. Portrait orientation adapted to 16:9 banner."
        ),
    },
    {
        "key": "learning-banner",
        "file": ILLUS_DIR / "learning-banner.jpg",
        "motif": (
            "A vast cosmic library of transparent stacked knowledge cubes, each glowing with "
            "different pastel colors (mint, pink, lavender), connected by flowing data threads "
            "like a 3D mind-map in zero gravity. A single beam of warm light illuminates the "
            "central pathway. Abstract learning and knowledge visualization. 16:9."
        ),
    },
    {
        "key": "debate-banner",
        "file": ILLUS_DIR / "debate-banner.jpg",
        "motif": (
            "Two opposing abstract AI entity forms — one mint-teal crystalline, one lavender-pink "
            "organic — facing each other across a translucent debate stage, exchanging glowing "
            "data packets between them. The space between them forms a perfect yin-yang of "
            "algorithmic patterns. Editorial 16:9."
        ),
    },
]


def cmd_site_banners(args):
    key = load_key()
    ILLUS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Site banners: {len(SITE_BANNERS)}")
    for banner in SITE_BANNERS:
        dest: Path = banner["file"]
        if dest.is_file() and not args.force:
            print(f"  SKIP {banner['key']} (exists {dest.stat().st_size // 1024}KB)")
            continue
        prompt = f"{banner['motif']} {DIOR_STYLE}"
        if args.dry_run:
            print(f"  DRY {banner['key']}\n      {prompt[:140]}")
            continue
        print(f"  gen {banner['key']} …", flush=True)
        try:
            url = gen_image(prompt, key)
            size = http_download(url, dest)
            print(f"  OK  {banner['key']} ({size // 1024}KB)")
            time.sleep(0.8)
        except Exception as e:
            print(f"  FAIL {banner['key']}: {e}")


# ─── OG image ─────────────────────────────────────────────────────────────────

OG_DEST = ROOT / "public/og-image.jpg"
OG_PROMPT = (
    "A premium editorial banner for 'Will AI Lab' — a luminous ice-cream-colored AI workspace "
    "floating in soft space: translucent glass panels displaying AI workflow diagrams, "
    "a small Siberian cat watching a holographic data stream, pastel mint and pink ambient glow, "
    "frosted geometric platforms, Dior liquid-glass luxury aesthetic. "
    "Text-free, human-free, logo-free. 16:9 social media OG banner, 1200x630 equivalent."
)


def cmd_og_image(args):
    key = load_key()
    if OG_DEST.is_file() and not args.force:
        print(f"SKIP og-image.jpg (exists {OG_DEST.stat().st_size // 1024}KB)")
        return
    prompt = f"{OG_PROMPT} {DIOR_STYLE}"
    if args.dry_run:
        print(f"DRY og-image\n    {prompt[:140]}")
        return
    print("gen og-image.jpg …", flush=True)
    try:
        url = gen_image(prompt, key)
        size = http_download(url, OG_DEST)
        print(f"OK  og-image.jpg ({size // 1024}KB)")
    except Exception as e:
        print(f"FAIL og-image: {e}")


# ─── Smoke test ───────────────────────────────────────────────────────────────

def cmd_smoke(args):
    key = load_key()
    r = http_post_json(
        TEXT_URL,
        {"model": TEXT_MODEL, "messages": [{"role": "user", "content": "Say OK in one word."}], "max_tokens": 8},
        key,
    )
    print("TEXT:", json.dumps(r)[:200])
    r = http_post_json(
        IMAGE_URL,
        {"model": IMAGE_MODEL, "prompt": "minimal pink gradient, no text", "aspect_ratio": "16:9", "n": 1, "response_format": "url"},
        key,
    )
    print("IMG:", json.dumps(r)[:240])


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("covers", help="Generate/regen blog post covers")
    c.add_argument("--limit", type=int, default=0)
    c.add_argument("--slug", type=str, default="")
    c.add_argument("--dry-run", action="store_true")
    c.add_argument("--force", action="store_true")
    c.add_argument("--smart", action="store_true", help="Use Kimi to extract visual motif from body")
    c.add_argument("--regen-minimax", action="store_true", help="Redo all posts with /covers/minimax/ covers")
    c.add_argument("--update-frontmatter", action="store_true", default=True)
    c.set_defaults(func=cmd_covers)

    cc = sub.add_parser("case-covers", help="Generate/regen case study covers")
    cc.add_argument("--slug", type=str, default="")
    cc.add_argument("--dry-run", action="store_true")
    cc.add_argument("--force", action="store_true")
    cc.add_argument("--smart", action="store_true", help="Use Kimi to extract visual motif from story")
    cc.set_defaults(func=cmd_case_covers)

    sb = sub.add_parser("site-banners", help="Generate site infrastructure banner images")
    sb.add_argument("--dry-run", action="store_true")
    sb.add_argument("--force", action="store_true")
    sb.set_defaults(func=cmd_site_banners)

    og = sub.add_parser("og-image", help="Generate OG social share image")
    og.add_argument("--dry-run", action="store_true")
    og.add_argument("--force", action="store_true")
    og.set_defaults(func=cmd_og_image)

    s = sub.add_parser("smoke")
    s.set_defaults(func=cmd_smoke)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
