#!/usr/bin/env python3
"""
Will AI Blog - 每日新闻三语生成脚本
流程：SearXNG搜真实新闻 → Kimi基于真实新闻生成三语资讯 → 写入 Supabase news_items

用法：
  python3 gen-news.py              # 生成今日新闻（默认5条）
  python3 gen-news.py --count=3    # 生成3条
  python3 gen-news.py --dry-run    # 只打印不写入
"""
import json, requests, time, sys, os, re
from datetime import datetime

# ─── Config ───
SUPABASE_URL = "https://tafbypudxuksfwrkfbxv.supabase.co"
SUPABASE_KEY = "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ"
SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# SearXNG 本地搜索（真实新闻，无 API Key 限制）
SEARXNG_URL = "http://127.0.0.1:8890/search"

# 从 openclaw config 读 Kimi key
CFG_PATH = os.path.expanduser("~/.openclaw/openclaw.json")
with open(CFG_PATH) as f:
    cfg = json.load(f)
KIMI_KEY = cfg['models']['providers']['kimi']['apiKey']

DRY_RUN = "--dry-run" in sys.argv
COUNT = 5
for arg in sys.argv:
    if arg.startswith("--count="):
        COUNT = int(arg.split("=")[1])

LOCALES = ["zh", "ja", "en"]

AI_INSTANCES = [
    {"name": "ユキ", "model": "Kimi K2.5", "personality": "冷静理性的技术顾问，善于从系统和架构层面分析问题"},
    {"name": "ナツ", "model": "Kimi K2.5", "personality": "热情活泼的运营专家，关注实际应用和用户体验"},
    {"name": "ハル", "model": "Kimi K2.5", "personality": "沉稳务实的全栈开发者，喜欢从工程实践角度切入"},
]

def kimi_gen(prompt, max_tokens=2000):
    resp = requests.post(
        "https://api.kimi.com/coding/v1/messages",
        headers={
            "Content-Type": "application/json",
            "x-api-key": KIMI_KEY,
            "anthropic-version": "2023-06-01",
        },
        json={
            "model": "kimi-k2.5",
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=90
    )
    if resp.status_code == 200:
        return resp.json()["content"][0]["text"]
    else:
        raise Exception(f"Kimi error {resp.status_code}: {resp.text[:200]}")

def search_real_news(query, count=3):
    """用 SearXNG 搜索真实新闻"""
    try:
        r = requests.get(
            SEARXNG_URL,
            params={"q": query, "format": "json", "engines": "google,bing"},
            proxies={"http": None, "https": None},  # 绕过系统代理
            timeout=15
        )
        if r.status_code == 200:
            results = r.json().get("results", [])
            return [
                {
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "content": item.get("content", "")[:300],
                }
                for item in results[:count]
                if item.get("title")
            ]
    except Exception as e:
        print(f"   ⚠️ SearXNG 搜索失败: {e}")
    return []

def get_today_real_topics():
    """搜索今日真实新闻话题"""
    search_queries = [
        ("AI news today 2026", "ai"),
        ("artificial intelligence latest developments", "ai"),
        ("tech industry news today", "tech"),
        ("OpenAI Anthropic Google DeepMind news", "ai"),
        ("technology startup news", "business"),
    ]
    
    topics = []
    seen_titles = set()
    
    for query, category in search_queries:
        if len(topics) >= COUNT:
            break
        results = search_real_news(query, count=3)
        for r in results:
            if r["title"] not in seen_titles and len(topics) < COUNT:
                seen_titles.add(r["title"])
                topics.append({
                    "title": r["title"],
                    "url": r["url"],
                    "snippet": r["content"],
                    "category": category,
                })
        time.sleep(0.5)
    
    return topics

def generate_trilingual_from_real_news(real_title, real_url, real_snippet, category, ai_instance):
    """基于真实新闻，生成三语资讯"""
    prompt = f"""你是{ai_instance['name']}，{ai_instance['personality']}。

以下是一条真实新闻：
标题：{real_title}
来源：{real_url}
摘要：{real_snippet}

请基于这条真实新闻，以你的视角写一篇资讯评论。
- 不要捏造或夸大事实，内容必须基于这条真实新闻
- 可以加入你的专业分析视角
- 生成中文、日语、英文三个版本

严格按照以下 JSON 格式输出（不要有其他内容）：
{{
  "zh": {{
    "title": "中文标题（20字以内，基于原新闻）",
    "summary": "中文摘要（60字以内）",
    "content": "中文正文（150-250字，markdown格式，包含## 小标题和要点分析）"
  }},
  "ja": {{
    "title": "日本語タイトル（20文字以内）",
    "summary": "日本語要約（60文字以内）",
    "content": "日本語本文（150-250文字、markdown形式）"
  }},
  "en": {{
    "title": "English Title (within 15 words)",
    "summary": "English Summary (within 60 words)",
    "content": "English content (150-250 words, markdown format with ## headings)"
  }}
}}"""

    raw = kimi_gen(prompt, max_tokens=3000)
    match = re.search(r'\{[\s\S]*\}', raw)
    if not match:
        raise Exception(f"No JSON in response: {raw[:200]}")
    return json.loads(match.group())

def insert_news_item(locale, title, summary, content, category, tags, source, ai_instance, ai_model):
    payload = {
        "locale": locale,
        "category": category,
        "title": title,
        "summary": summary,
        "content": content,
        "tags": tags,
        "source": source or "",
        "author": ai_instance,
        "ai_instance": ai_instance,
        "ai_model": ai_model,
    }
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/news_items",
        headers=SB_HEADERS,
        json=payload,
        timeout=15
    )
    if resp.status_code not in (200, 201):
        raise Exception(f"Insert failed {resp.status_code}: {resp.text[:200]}")
    return True

def main():
    import random
    today = datetime.now().strftime("%Y-%m-%d")
    print(f"🚀 [{today}] 生成今日真实新闻资讯（目标{COUNT}条）...")

    # 1. 搜索真实新闻
    print("🔍 搜索真实新闻...")
    topics = get_today_real_topics()
    print(f"   找到 {len(topics)} 条真实新闻")

    if not topics:
        print("❌ 未找到真实新闻，退出")
        sys.exit(1)

    success_count = 0
    for i, topic in enumerate(topics):
        print(f"\n[{i+1}/{len(topics)}] {topic['title'][:50]}...")

        inst = random.choice(AI_INSTANCES)

        try:
            data = generate_trilingual_from_real_news(
                real_title=topic["title"],
                real_url=topic["url"],
                real_snippet=topic["snippet"],
                category=topic["category"],
                ai_instance=inst,
            )

            if DRY_RUN:
                for loc in LOCALES:
                    print(f"   [DRY RUN/{loc}] {data[loc]['title']}")
                success_count += 1
                continue

            # 写入三条记录
            tags = []
            for locale in LOCALES:
                insert_news_item(
                    locale=locale,
                    title=data[locale]["title"],
                    summary=data[locale]["summary"],
                    content=data[locale]["content"],
                    category=topic["category"],
                    tags=tags,
                    source=topic["url"],
                    ai_instance=inst["name"],
                    ai_model=inst["model"],
                )
                print(f"   ✅ [{locale}] {data[locale]['title'][:40]}")

            success_count += 1
            time.sleep(1)

        except Exception as e:
            print(f"   ❌ 失败: {e}")

    print(f"\n✅ 完成！成功 {success_count}/{len(topics)} 条（共 {success_count*3} 条Supabase记录）")

if __name__ == "__main__":
    main()
