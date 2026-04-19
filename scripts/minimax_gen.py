#!/usr/bin/env python3
"""MiniMax CodingPlan batch runner — covers + body fills.

Usage:
  python3 scripts/minimax_gen.py covers [--limit N] [--dry-run] [--force]
  python3 scripts/minimax_gen.py covers --slug SLUG
  python3 scripts/minimax_gen.py smoke           # one-shot API sanity check

Reads MINIMAX_CN_API_KEY from env or ~/.hermes/.env.
Images saved to public/covers/minimax/<slug>.jpg.
Frontmatter rewritten with coverImage: /covers/minimax/<slug>.jpg.
"""
from __future__ import annotations
import argparse, json, os, re, sys, time, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "src/content/blog"
COVERS_DIR = ROOT / "public/covers/minimax"
TEXT_URL = "https://api.minimaxi.com/v1/chat/completions"
IMAGE_URL = "https://api.minimaxi.com/v1/image_generation"
TEXT_MODEL = "MiniMax-M2.7-highspeed"
IMAGE_MODEL = "image-01"


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


def http_post_json(url: str, payload: dict, key: str, timeout: int = 120) -> dict:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def http_download(url: str, dest: Path, timeout: int = 90) -> int:
    with urllib.request.urlopen(url, timeout=timeout) as resp:
        blob = resp.read()
    dest.write_bytes(blob)
    return len(blob)


def parse_frontmatter(txt: str) -> tuple[dict | None, str, str]:
    m = re.match(r"^(---\s*\n)([\s\S]*?)(\n---\s*\n)([\s\S]*)$", txt)
    if not m:
        return None, "", txt
    return {"raw": m.group(2)}, m.group(2), m.group(4)


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


def build_prompt(slug: str, fm_raw: str) -> str:
    title = read_fm_nested(fm_raw, "title") or {}
    title_zh = title.get("zh") or title.get("en") or slug
    excerpt = read_fm_nested(fm_raw, "excerpt") or {}
    ex_zh = excerpt.get("zh", "")
    category = read_fm_field(fm_raw, "category") or "general"

    cat_hints = {
        "learning": "abstract tech illustration, neural network nodes, data flow",
        "business": "professional minimal workspace, clean gradients, no people",
        "tech": "futuristic tech, circuit patterns, subtle grid",
        "life": "warm everyday scene, soft lighting, cinematic",
        "general": "minimal abstract gradient composition",
    }.get(category, "minimal abstract composition")

    palette = (
        "Dior soft palette: pale pink #FFD1DC, mint #C8F5E4, lavender #E8D5F5, "
        "buttercream #FFEFC8. Liquid-glass surfaces, frosted translucent layers, "
        "pastel gradient, very high aesthetic, no text, no words, no letters, "
        "no logos, no watermarks, no humans, editorial banner composition, 16:9."
    )
    return (
        f"Blog cover banner for article titled: {title_zh}. "
        f"Theme: {cat_hints}. Excerpt: {ex_zh[:120]}. "
        f"Style: {palette}"
    )


def gen_image(prompt: str, key: str) -> str:
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
    if not urls:
        raise RuntimeError(f"no url in response: {json.dumps(resp)[:200]}")
    return urls[0]


def upsert_cover_field(fm_raw: str, path: str) -> str:
    lines = fm_raw.splitlines()
    for i, line in enumerate(lines):
        if line.startswith("coverImage:"):
            lines[i] = f"coverImage: {path}"
            return "\n".join(lines)
    # Insert after `date:` or at end
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
        needs = False
        if not cover:
            needs = True
        else:
            local = ROOT / ("public" + cover)
            if not local.is_file():
                needs = True
        if needs:
            out.append((slug, p, fm_raw))
    return out


def cmd_covers(args):
    key = load_key()
    COVERS_DIR.mkdir(parents=True, exist_ok=True)
    targets = list_missing_covers()
    if args.slug:
        targets = [t for t in targets if t[0] == args.slug]
        if not targets:
            # Also allow forcing regeneration
            for p in BLOG_DIR.glob("*.md"):
                if p.stem == args.slug:
                    txt = p.read_text()
                    m = re.match(r"^---\s*\n([\s\S]*?)\n---", txt)
                    if m:
                        targets = [(args.slug, p, m.group(1))]
                    break
    if args.limit:
        targets = targets[: args.limit]
    print(f"Targets: {len(targets)}")
    for slug, md_path, fm_raw in targets:
        dest = COVERS_DIR / f"{slug}.jpg"
        if dest.is_file() and not args.force:
            print(f"  SKIP (exists) {slug}")
            if args.update_frontmatter:
                rewrite_post(md_path, f"/covers/minimax/{slug}.jpg")
            continue
        prompt = build_prompt(slug, fm_raw)
        if args.dry_run:
            print(f"  DRY {slug} :: {prompt[:120]}")
            continue
        try:
            url = gen_image(prompt, key)
            size = http_download(url, dest)
            rewrite_post(md_path, f"/covers/minimax/{slug}.jpg")
            print(f"  OK  {slug} ({size // 1024}KB)")
            time.sleep(0.6)
        except Exception as e:
            print(f"  FAIL {slug}: {e}")


def cmd_smoke(args):
    key = load_key()
    r = http_post_json(
        TEXT_URL,
        {
            "model": TEXT_MODEL,
            "messages": [{"role": "user", "content": "Say OK in one word."}],
            "max_tokens": 8,
        },
        key,
    )
    print("TEXT:", json.dumps(r)[:200])
    r = http_post_json(
        IMAGE_URL,
        {
            "model": IMAGE_MODEL,
            "prompt": "minimal pink gradient, no text",
            "aspect_ratio": "16:9",
            "n": 1,
            "response_format": "url",
        },
        key,
    )
    print("IMG:", json.dumps(r)[:240])


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("covers")
    c.add_argument("--limit", type=int, default=0)
    c.add_argument("--slug", type=str, default="")
    c.add_argument("--dry-run", action="store_true")
    c.add_argument("--force", action="store_true")
    c.add_argument("--update-frontmatter", action="store_true", default=True)
    c.set_defaults(func=cmd_covers)

    s = sub.add_parser("smoke")
    s.set_defaults(func=cmd_smoke)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
