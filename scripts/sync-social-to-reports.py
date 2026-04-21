#!/usr/bin/env python3
"""
Hermes social-monitor → Supabase daily_reports bridge.

Reads ~/social-monitor/db/social.db and writes ONE aggregate row of
topic_type='social' to Supabase daily_reports per run. The blog's
DailyFeedMasonry picks it up automatically.

Run: python3 scripts/sync-social-to-reports.py
Cron: 0 10 * * * cd /Users/lauralyu/projects/will-ai-lab && /usr/bin/python3 scripts/sync-social-to-reports.py
"""
import sqlite3, requests, json, os, uuid
from datetime import datetime, timezone

SB_URL = "https://tafbypudxuksfwrkfbxv.supabase.co"
SB_KEY = "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ"
SB_HEADERS = {
    "apikey": SB_KEY,
    "Authorization": f"Bearer {SB_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}
DB_PATH = os.path.expanduser("~/social-monitor/db/social.db")


def build_payload():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    # 1. Top-growth competitors last 24h
    cur.execute(
        """
        SELECT a.display_name, a.platform, a.account_type,
               ms.followers, ms.total_views, ms.snapshot_at
        FROM metrics_snapshots ms
        JOIN accounts a ON a.id = ms.account_id
        WHERE ms.snapshot_at >= datetime('now', '-1 day')
        ORDER BY ms.snapshot_at DESC
        LIMIT 50
        """
    )
    snaps = cur.fetchall()

    # 2. Recent RSS items (8 most recent)
    cur.execute(
        """
        SELECT source, title, url, published_at
        FROM rss_items
        WHERE published_at >= datetime('now', '-2 day')
        ORDER BY published_at DESC
        LIMIT 8
        """
    )
    rss = cur.fetchall()

    # 3. Trending last 24h (5 highest score)
    cur.execute(
        """
        SELECT source, subtype, title, url, score, comments_count
        FROM trending_items
        WHERE collected_at >= datetime('now', '-1 day') AND score IS NOT NULL
        ORDER BY score DESC
        LIMIT 5
        """
    )
    trending = cur.fetchall()
    con.close()

    date_str = datetime.now().strftime("%Y-%m-%d")

    lines_zh = [f"## 📊 社交数据日报 {date_str}\n"]
    lines_en = [f"## 📊 Social Pulse Daily {date_str}\n"]
    lines_ja = [f"## 📊 ソーシャル指標デイリー {date_str}\n"]

    if snaps:
        lines_zh.append(f"- 过去 24 小时收录 {len(snaps)} 条账号快照")
        lines_en.append(f"- Captured {len(snaps)} account snapshots in the last 24h")
        lines_ja.append(f"- 直近24時間で{len(snaps)}件のアカウントスナップショット")

    if trending:
        lines_zh.append("\n### 🔥 全网热榜")
        lines_en.append("\n### 🔥 Trending")
        lines_ja.append("\n### 🔥 トレンド")
        for t in trending:
            lines_zh.append(f"- [{t['title']}]({t['url']}) *— {t['source']} · {t['score']} pts*")
            lines_en.append(f"- [{t['title']}]({t['url']}) *— {t['source']} · {t['score']} pts*")
            lines_ja.append(f"- [{t['title']}]({t['url']}) *— {t['source']} · {t['score']} pts*")

    if rss:
        lines_zh.append("\n### 📡 RSS 更新")
        lines_en.append("\n### 📡 RSS Updates")
        lines_ja.append("\n### 📡 RSS更新")
        for r in rss:
            lines_zh.append(f"- [{r['title']}]({r['url']}) *— {r['source']}*")
            lines_en.append(f"- [{r['title']}]({r['url']}) *— {r['source']}*")
            lines_ja.append(f"- [{r['title']}]({r['url']}) *— {r['source']}*")

    title_zh = f"社交数据日报 · {date_str}"
    title_en = f"Social Pulse · {date_str}"
    title_ja = f"ソーシャル指標 · {date_str}"

    return {
        "id": str(uuid.uuid4()),
        "slug": f"social-{date_str}",
        "topic_type": "social",
        "report_type": "morning",
        "author_id": "34f408c4-cf81-487d-8fec-f739103f85e8",  # ナツ acts as reporter
        "author_name": "ナツ",
        "author_emoji": "📊",
        "published_at": datetime.now(timezone.utc).isoformat(),
        "title": title_zh,
        "title_zh": title_zh,
        "title_ja": title_ja,
        "title_en": title_en,
        "content": "\n".join(lines_en),
        "content_zh": "\n".join(lines_zh),
        "content_ja": "\n".join(lines_ja),
        "content_en": "\n".join(lines_en),
    }


def upsert(payload: dict):
    # Delete any existing row for today's social slug so we only keep the latest.
    del_url = f"{SB_URL}/rest/v1/daily_reports?slug=eq.{payload['slug']}"
    requests.delete(del_url, headers=SB_HEADERS, timeout=15)

    ins_url = f"{SB_URL}/rest/v1/daily_reports"
    r = requests.post(ins_url, headers=SB_HEADERS, json=payload, timeout=20)
    print(f"insert status={r.status_code} body={r.text[:200]}")


if __name__ == "__main__":
    if not os.path.exists(DB_PATH):
        print(f"skip: {DB_PATH} not found (social-monitor not installed locally)")
        raise SystemExit(0)
    data = build_payload()
    print(f"payload prepared: {data['slug']} ({len(data['content_zh'])} chars)")
    upsert(data)
