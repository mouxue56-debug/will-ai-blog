#!/usr/bin/env python3
"""
Kimi K2.5 enrichment for daily_reports — fills missing content_zh / title_zh.

Usage:
  python3 scripts/enrich_daily_reports.py [--dry-run]

- Finds records with missing/thin content_zh or title_zh
- Uses Kimi to translate English content to Chinese and expand thin stubs
- Updates Supabase in-place
- Adds date context to body (title stays clean)
"""
from __future__ import annotations
import json, sys, time, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KIMI_URL = "https://api.kimi.com/coding/v1/messages"
KIMI_MODEL = "kimi-k2.5"
SB_URL = "https://tafbypudxuksfwrkfbxv.supabase.co"
SB_KEY = "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ"
DRY_RUN = "--dry-run" in sys.argv


def load_kimi_key() -> str:
    cfg = Path.home() / ".openclaw/openclaw.json"
    data = json.loads(cfg.read_text())
    return data["models"]["providers"]["kimi"]["apiKey"].strip()


def kimi_call(prompt: str, key: str, max_tokens: int = 3000) -> str:
    body = json.dumps({
        "model": KIMI_MODEL,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                KIMI_URL,
                data=body,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": key,
                    "anthropic-version": "2023-06-01",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return result["content"][0]["text"].strip()
        except Exception as e:
            print(f"  Kimi attempt {attempt+1} failed: {e}", flush=True)
            if attempt < 2:
                time.sleep(5)
    raise RuntimeError("Kimi call failed after 3 attempts")


def sb_get(path: str) -> list:
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/{path}",
        headers={
            "apikey": SB_KEY,
            "Authorization": f"Bearer {SB_KEY}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def sb_patch(table: str, row_id: str, fields: dict) -> None:
    body = json.dumps(fields).encode("utf-8")
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/{table}?id=eq.{row_id}",
        data=body,
        headers={
            "apikey": SB_KEY,
            "Authorization": f"Bearer {SB_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="PATCH",
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        r.read()


TYPE_LABELS = {
    "ai": "AI 动态",
    "economy": "经济观察",
    "github": "GitHub 热榜",
    "social": "社交数据",
    "japan_cn": "在日华人",
    "politics": "时事政经",
}


def enrich_record(r: dict, key: str) -> dict:
    """Return fields dict with values to update, or empty dict if nothing needed."""
    fields = {}
    title_en = r.get("title_en") or r.get("title") or ""
    content_en = r.get("content_en") or r.get("content") or ""
    content_zh = r.get("content_zh") or ""
    date_str = (r.get("published_at") or "")[:10]
    topic_type = r.get("topic_type", "ai")
    label = TYPE_LABELS.get(topic_type, "资讯")

    # --- title_zh ---
    if not r.get("title_zh") and title_en:
        is_english = not any("\u4e00" <= c <= "\u9fa5" for c in title_en)
        if is_english:
            print(f"  Generating title_zh for: {title_en[:60]}", flush=True)
            prompt = (
                f"将以下英文新闻标题翻译成吸引人的中文标题，简短有力（20字以内），不要加日期，直接返回标题文字：\n{title_en}"
            )
            fields["title_zh"] = kimi_call(prompt, key, max_tokens=100)
        else:
            fields["title_zh"] = title_en  # already Chinese

    # --- content_zh ---
    needs_content = (
        not content_zh or len(content_zh) < 100
    ) and content_en

    if needs_content:
        is_english = not any("\u4e00" <= c <= "\u9fa5" for c in content_en)
        print(f"  Generating content_zh ({len(content_en)} chars EN, zh={len(content_zh)})…", flush=True)

        if is_english:
            prompt = f"""将以下英文新闻摘要翻译成高质量中文，保持 Markdown 格式，使用 ## 标题分节。
在开头第一行加上：*{date_str}*
话题类型：{label}
不要加 "翻译结果" 等说明。

原文：
{content_en}"""
        else:
            # Has Chinese but too short — expand it
            prompt = f"""以下是一段{label}类新闻摘要，请扩写为600-1000字的高质量中文资讯文章，使用 ## 标题分节，
在开头第一行加上：*{date_str}*
要有深度分析和背景解读，风格专业但易读。

原文：
{content_en}"""

        fields["content_zh"] = kimi_call(prompt, key, max_tokens=2000)

    return fields


def main() -> None:
    key = load_kimi_key()
    print("Fetching records needing enrichment…", flush=True)

    rows = sb_get(
        "daily_reports"
        "?select=id,title,title_zh,title_en,content,content_zh,content_en,topic_type,published_at"
        "&topic_type=in.(ai,economy,github,social,japan_cn,politics)"
        "&order=published_at.desc"
        "&limit=200"
    )

    to_enrich = []
    for r in rows:
        cz = (r.get("content_zh") or "")
        tz = r.get("title_zh")
        en = (r.get("content_en") or r.get("content") or "")
        te = r.get("title_en") or r.get("title") or ""
        needs_title = not tz and te
        needs_content = (not cz or len(cz) < 100) and en
        if needs_title or needs_content:
            to_enrich.append(r)

    print(f"Found {len(to_enrich)} records needing enrichment.", flush=True)
    if DRY_RUN:
        for r in to_enrich:
            print(f"  DRY: {r['id'][:8]} {r.get('published_at','')[:10]} {r.get('topic_type')} {(r.get('title') or '')[:40]}")
        return

    ok = 0
    for i, r in enumerate(to_enrich, 1):
        rid = r["id"]
        print(f"\n[{i}/{len(to_enrich)}] {rid[:8]} {r.get('published_at','')[:10]} {r.get('topic_type')}", flush=True)
        try:
            fields = enrich_record(r, key)
            if fields:
                sb_patch("daily_reports", rid, fields)
                print(f"  ✓ Updated: {list(fields.keys())}", flush=True)
                ok += 1
            else:
                print("  — Nothing to update", flush=True)
        except Exception as e:
            print(f"  ✗ Error: {e}", flush=True)
        time.sleep(2)  # rate limit buffer

    print(f"\nDone: {ok}/{len(to_enrich)} enriched.")


if __name__ == "__main__":
    main()
