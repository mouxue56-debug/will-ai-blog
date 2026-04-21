#!/usr/bin/env python3
"""
Batch-translate English title_zh → proper Chinese titles using Kimi K2.5.
Sends 10 titles per Kimi call to minimize API round-trips.

Usage:
  python3 scripts/translate_titles.py [--dry-run]
"""
from __future__ import annotations
import json, sys, time, urllib.request
from pathlib import Path

SB_URL = "https://tafbypudxuksfwrkfbxv.supabase.co"
SB_KEY = "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ"
KIMI_URL = "https://api.kimi.com/coding/v1/messages"
KIMI_MODEL = "kimi-k2.5"
DRY_RUN = "--dry-run" in sys.argv
BATCH = 10

TYPE_HINTS = {
    "ai": "AI科技资讯",
    "economy": "财经资讯",
    "github": "GitHub开源项目",
    "social": "社交数据",
    "japan_cn": "在日华人",
    "politics": "时事政经",
}

def load_key() -> str:
    cfg = Path.home() / ".openclaw/openclaw.json"
    return json.loads(cfg.read_text())["models"]["providers"]["kimi"]["apiKey"].strip()

def kimi_call(prompt: str, key: str, max_tokens: int = 1500) -> str:
    body = json.dumps({
        "model": KIMI_MODEL,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                KIMI_URL, data=body,
                headers={"Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                return json.loads(resp.read())["content"][0]["text"].strip()
        except Exception as e:
            print(f"  Kimi attempt {attempt+1}: {e}", flush=True)
            if attempt < 2: time.sleep(5)
    raise RuntimeError("Kimi failed")

def sb_get(path: str) -> list:
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/{path}",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def sb_patch(row_id: str, fields: dict) -> None:
    body = json.dumps(fields).encode("utf-8")
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/daily_reports?id=eq.{row_id}",
        data=body,
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
                 "Content-Type": "application/json", "Prefer": "return=minimal"},
        method="PATCH",
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        r.read()

def is_chinese(s: str) -> bool:
    return any("\u4e00" <= c <= "\u9fa5" for c in s)

def translate_batch(items: list[dict], key: str) -> dict[str, str]:
    """items: list of {id, title_zh, topic_type}. Returns {id: translated_title}."""
    lines = []
    for i, item in enumerate(items, 1):
        hint = TYPE_HINTS.get(item["topic_type"], "资讯")
        lines.append(f"{i}. [{hint}] {item['title_zh']}")

    prompt = f"""将以下新闻标题翻译成简洁的中文标题（每个15-30字，不要解释，只输出序号和标题）：
注意：
- [AI科技资讯] 聚焦AI技术动态
- [财经资讯] 聚焦经济金融动态
- [GitHub开源项目] 聚焦开源项目名称+亮点
- 如果标题包含多个用"/"分隔的要点，请综合成一个主标题
- 不要加日期
- 直接输出"序号. 中文标题"格式

{chr(10).join(lines)}"""

    response = kimi_call(prompt, key, max_tokens=800)

    # Parse response: "1. 中文标题\n2. 中文标题"
    result = {}
    for line in response.splitlines():
        line = line.strip()
        if not line:
            continue
        for i, item in enumerate(items, 1):
            if line.startswith(f"{i}.") or line.startswith(f"{i}、"):
                title = line[len(f"{i}."):].strip().lstrip("、").strip()
                if is_chinese(title):
                    result[item["id"]] = title
                break
    return result

def main() -> None:
    key = load_key()
    print("Fetching records with English title_zh…", flush=True)

    rows = sb_get(
        "daily_reports"
        "?select=id,title_zh,topic_type,published_at"
        "&topic_type=in.(ai,economy,github,social,japan_cn,politics)"
        "&order=published_at.desc"
        "&limit=200"
    )

    # Filter: title_zh set but no Chinese characters
    to_translate = [
        r for r in rows
        if r.get("title_zh") and not is_chinese(r["title_zh"])
    ]
    print(f"Found {len(to_translate)} records with English title_zh.", flush=True)

    if DRY_RUN:
        for r in to_translate[:10]:
            print(f"  {r['id'][:8]} {r['published_at'][:10]} {r['topic_type']}: {r['title_zh'][:50]}")
        print(f"  …and {max(0,len(to_translate)-10)} more")
        return

    # Batch process
    ok = 0
    for batch_start in range(0, len(to_translate), BATCH):
        batch = to_translate[batch_start:batch_start+BATCH]
        batch_num = batch_start // BATCH + 1
        total_batches = (len(to_translate) + BATCH - 1) // BATCH
        print(f"\nBatch {batch_num}/{total_batches}: {len(batch)} titles…", flush=True)

        try:
            translations = translate_batch(batch, key)
            for item in batch:
                cn = translations.get(item["id"])
                if cn:
                    if not DRY_RUN:
                        sb_patch(item["id"], {"title_zh": cn})
                    print(f"  ✓ {item['id'][:8]}: {item['title_zh'][:30]} → {cn}", flush=True)
                    ok += 1
                else:
                    print(f"  ✗ {item['id'][:8]}: parse failed for: {item['title_zh'][:40]}", flush=True)
        except Exception as e:
            print(f"  Batch error: {e}", flush=True)

        time.sleep(3)  # rate limit buffer

    print(f"\nDone: {ok}/{len(to_translate)} translated.")

if __name__ == "__main__":
    main()
