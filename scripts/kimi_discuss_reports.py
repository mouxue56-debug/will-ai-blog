#!/usr/bin/env python3
"""
为 daily_reports 话题批量生成 Kimi K2.5 四角色讨论意见。

用法：
  python3 scripts/kimi_discuss_reports.py              # 最近 7 天
  python3 scripts/kimi_discuss_reports.py --days=3     # 最近 3 天
  python3 scripts/kimi_discuss_reports.py --dry-run    # 只打印不提交
  python3 scripts/kimi_discuss_reports.py --id=<uuid>  # 单条

四个角色（全 Kimi K2.5）：
  ユキ — 冷静理性，技术架构视角，neutral
  ナツ — 热情活泼，应用/用户体验，pro
  ハル — 务实全栈，工程实践角度，neutral
  アキ — 好奇研究型，反直觉深度，con
"""
from __future__ import annotations
import json, os, re, sys, time, urllib.request, urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

SITE_API = "https://aiblog.fuluckai.com/api/debate"
AI_DISCUSS_SECRET = "689e23ed87d8e4b237f300795d4d887b"
SB_URL = "https://tafbypudxuksfwrkfbxv.supabase.co"
SB_KEY = "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ"
KIMI_URL = "https://api.kimi.com/coding/v1/messages"
KIMI_MODEL = "kimi-k2.5"

CFG = Path.home() / ".openclaw/openclaw.json"
KIMI_KEY = json.loads(CFG.read_text())["models"]["providers"]["kimi"]["apiKey"].strip()

DRY_RUN = "--dry-run" in sys.argv
DAYS = 7
SINGLE_ID = None
for arg in sys.argv[1:]:
    if arg.startswith("--days="):
        DAYS = int(arg.split("=")[1])
    elif arg.startswith("--id="):
        SINGLE_ID = arg.split("=")[1]

AI_PROFILES = [
    {"name": "ユキ", "model": "Kimi K2.5", "personality": "冷静理性的技术顾问，从架构和系统层面分析，善用类比", "stance": "neutral"},
    {"name": "ナツ", "model": "Kimi K2.5", "personality": "热情活泼的运营专家，关注实际应用和用户体验，结合案例", "stance": "pro"},
    {"name": "ハル", "model": "Kimi K2.5", "personality": "沉稳务实的全栈开发者，从工程实践和成本收益分析", "stance": "neutral"},
    {"name": "アキ", "model": "Kimi K2.5", "personality": "好奇的研究型AI，挖掘深层逻辑、历史背景和反直觉观点", "stance": "con"},
]

TYPE_CONTEXT = {
    "ai": "AI技术动态",
    "economy": "全球经济金融",
    "github": "开源软件/GitHub趋势",
    "social": "社交媒体数据",
    "japan_cn": "在日华人生活",
    "politics": "时事政经",
}


def kimi_gen(prompt: str, max_tokens: int = 600) -> str | None:
    body = json.dumps({
        "model": KIMI_MODEL,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }).encode()
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                KIMI_URL, data=body,
                headers={"Content-Type": "application/json", "x-api-key": KIMI_KEY,
                         "anthropic-version": "2023-06-01"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=90) as r:
                data = json.loads(r.read())
                for blk in data.get("content", []):
                    if blk.get("type") == "text" and blk.get("text", "").strip():
                        return blk["text"].strip()
        except Exception as e:
            print(f"  Kimi attempt {attempt+1}: {e}", flush=True)
            time.sleep(4)
    return None


def parse_json(text: str) -> dict | None:
    if not text:
        return None
    cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip())
    cleaned = re.sub(r'\s*```$', '', cleaned)
    start = cleaned.find('{')
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(cleaned)):
        if cleaned[i] == '{':
            depth += 1
        elif cleaned[i] == '}':
            depth -= 1
            if depth == 0:
                try:
                    obj = json.loads(cleaned[start:i + 1])
                    if obj.get("zh"):
                        return obj
                except Exception:
                    pass
                return None
    return None


def sb_get_topics(days: int) -> list[dict]:
    since = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT00:00:00Z")
    url = (
        f"{SB_URL}/rest/v1/daily_reports"
        f"?select=id,title_zh,title_en,content_zh,content_en,topic_type,published_at"
        f"&topic_type=in.(ai,economy,github,social,japan_cn,politics)"
        f"&published_at=gte.{since}"
        f"&order=published_at.desc"
        f"&limit=200"
    )
    req = urllib.request.Request(url, headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def sb_get_single(topic_id: str) -> list[dict]:
    url = (
        f"{SB_URL}/rest/v1/daily_reports"
        f"?select=id,title_zh,title_en,content_zh,content_en,topic_type,published_at"
        f"&id=eq.{topic_id}"
    )
    req = urllib.request.Request(url, headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def get_existing_count(topic_id: str) -> dict[str, int]:
    try:
        url = f"{SITE_API}/opinion/{topic_id}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
            counts: dict[str, int] = {}
            for op in data.get("opinions", []):
                k = op.get("instanceName", "") or op.get("instance_name", "")
                counts[k] = counts.get(k, 0) + 1
            return counts
    except Exception:
        return {}


def submit_opinion(topic_id: str, ai: dict, opinion: dict) -> bool:
    body = json.dumps({
        "topicId": topic_id,
        "model": ai["model"],
        "instanceName": ai["name"],
        "stance": ai["stance"],
        "opinion": opinion,
        "isAI": True,
    }).encode()
    req = urllib.request.Request(
        f"{SITE_API}/opinion", data=body,
        headers={"Content-Type": "application/json", "x-ai-internal": AI_DISCUSS_SECRET},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            result = json.loads(r.read())
            return bool(result.get("success"))
    except Exception as e:
        print(f"  submit error: {e}", flush=True)
        return False


def process_topic(topic: dict) -> int:
    tid = topic["id"]
    title = topic.get("title_zh") or topic.get("title_en") or ""
    content = (topic.get("content_zh") or topic.get("content_en") or "")[:600]
    ttype = topic.get("topic_type", "ai")
    ctx_label = TYPE_CONTEXT.get(ttype, "资讯")
    date_str = (topic.get("published_at") or "")[:10]

    existing_counts = get_existing_count(tid)
    total_existing = sum(existing_counts.values())
    print(f"\n📰 [{date_str}] {title[:45]} ({total_existing}条已有)", flush=True)

    submitted = 0
    for ai in AI_PROFILES:
        if existing_counts.get(ai["name"], 0) >= 1:
            print(f"  ⏭  {ai['name']} 已评", flush=True)
            continue

        prompt = f"""你是{ai['name']}，Will的AI助手团队成员，性格：{ai['personality']}

新闻类型：{ctx_label}（{date_str}）
新闻标题：{title}
新闻摘要：{content}

请用{ai['name']}的视角，帮助读者更好地理解这条新闻，写一段80-180字的中文解读。
要求：
- 用你的独特专业角度切入，让读者看到别人看不到的维度
- 可以解释背景、延伸影响、或提出值得关注的问题
- 目标是帮助读者"学到更多"，不是辩论输赢
- 体现个性，不要泛泛而谈
- 同时给出日语和英语翻译

输出纯 JSON（不加代码块）：
{{"zh":"中文解读（80-180字）","ja":"日本語コメント","en":"English comment"}}"""

        result = kimi_gen(prompt)
        opinion = parse_json(result)
        if not opinion:
            print(f"  ❌ {ai['name']} 解析失败", flush=True)
            continue

        if DRY_RUN:
            print(f"  🔸 {ai['name']} [{ai['stance']}]: {opinion['zh'][:50]}…", flush=True)
            submitted += 1
            continue

        ok = submit_opinion(tid, ai, opinion)
        if ok:
            print(f"  ✅ {ai['name']} [{ai['stance']}]: {opinion['zh'][:50]}…", flush=True)
            submitted += 1
        else:
            print(f"  ❌ {ai['name']} 提交失败", flush=True)
        time.sleep(2)

    return submitted


def main() -> None:
    print(f"🤖 Kimi 批量讨论 {'[DRY RUN]' if DRY_RUN else '[LIVE]'}", flush=True)

    if SINGLE_ID:
        topics = sb_get_single(SINGLE_ID)
    else:
        topics = sb_get_topics(DAYS)

    # Skip topics that already have all 4 AIs
    to_process = []
    for t in topics:
        counts = get_existing_count(t["id"])
        missing = [ai for ai in AI_PROFILES if counts.get(ai["name"], 0) < 1]
        if missing:
            to_process.append(t)

    print(f"共 {len(topics)} 条话题，{len(to_process)} 条需要生成意见", flush=True)

    total = 0
    for i, topic in enumerate(to_process, 1):
        print(f"\n[{i}/{len(to_process)}]", flush=True)
        total += process_topic(topic)

    print(f"\n🏁 完成 {total} 条意见", flush=True)


if __name__ == "__main__":
    main()
