#!/usr/bin/env python3
"""
AI 自动讨论脚本
早报生成后，四个 AI（ユキ/ナツ/ハル/アキ）自动对最新话题发表评论

用法：
  python3 ai-auto-discuss.py              # 对最新一批话题评论
  python3 ai-auto-discuss.py --dry-run    # 只显示不提交
"""
import json, requests, time, sys, os, re

# ─── Config ───
SITE_API = "https://aiblog.fuluckai.com/api/debate"
AI_DISCUSS_SECRET = "689e23ed87d8e4b237f300795d4d887b"

# Kimi for generating opinions (Anthropic format)
CFG_PATH = os.path.expanduser("~/.openclaw/openclaw.json")
with open(CFG_PATH) as f:
    cfg = json.load(f)
KIMI_KEY = cfg['models']['providers']['kimi']['apiKey']

SUPABASE_URL = "https://tafbypudxuksfwrkfbxv.supabase.co"
SUPABASE_KEY = "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ"
SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

# AI profiles — 四个实例的人格
AI_PROFILES = [
    {
        "model": "Kimi K2.5",
        "instanceName": "ユキ",
        "personality": "冷静理性的技术顾问，善于从架构和系统层面分析问题，偶尔冷幽默",
        "stance": "neutral",
    },
    {
        "model": "Claude Opus 4.6",
        "instanceName": "ナツ",
        "personality": "热情活泼的运营专家，关注实际应用和用户体验，喜欢用数据说话",
        "stance": "pro",
    },
    {
        "model": "GPT-5.4",
        "instanceName": "ハル",
        "personality": "沉稳务实的全栈开发者，喜欢从代码和工程实践角度切入，偶尔吐槽",
        "stance": "neutral",
    },
    {
        "model": "DeepSeek V3.2",
        "instanceName": "アキ",
        "personality": "好奇心旺盛的研究型AI，喜欢挖掘深层逻辑和反直觉观点，善于提问",
        "stance": "con",
    },
]

DRY_RUN = "--dry-run" in sys.argv

# Round mode: --round=2 means 2nd round, AIs reply to existing comments
ROUND = 1
for arg in sys.argv:
    if arg.startswith("--round="):
        ROUND = int(arg.split("=")[1])


def kimi_gen(prompt):
    """调用 Kimi K2.5 生成内容"""
    try:
        resp = requests.post(
            "https://api.kimi.com/coding/v1/messages",
            headers={
                "Content-Type": "application/json",
                "x-api-key": KIMI_KEY,
                "anthropic-version": "2023-06-01",
            },
            json={
                "model": "kimi-k2.5",
                "max_tokens": 1500,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=60,
        )
        if resp.status_code != 200:
            print(f"  ⚠️ Kimi error: {resp.status_code}")
            return None
        for block in resp.json().get("content", []):
            if block.get("type") == "text":
                return block["text"].strip()
    except Exception as e:
        print(f"  ⚠️ Kimi exception: {e}")
    return None


def get_latest_topics():
    """获取最新一天的话题（最多3个）"""
    resp = requests.get(f"{SITE_API}/topics")
    if resp.status_code != 200:
        print(f"Failed to get topics: {resp.status_code}")
        return []
    topics = resp.json().get("topics", [])
    if not topics:
        return []
    
    # 取最新日期的话题
    latest_date = topics[0].get("date", topics[0].get("published_at", "")[:10])
    latest = [t for t in topics if (t.get("date") or t.get("published_at", "")[:10]) == latest_date]
    return latest[:3]


def get_existing_opinions(topic_id):
    """获取话题已有的评论（避免重复）"""
    resp = requests.get(f"{SITE_API}/opinion/{topic_id}")
    if resp.status_code != 200:
        return []
    return resp.json().get("opinions", [])


def generate_opinion(ai_profile, topic_title, topic_content, existing_opinions):
    """让 AI 生成一条评论"""
    existing_text = ""
    if existing_opinions:
        existing_text = "\n已有评论：\n" + "\n".join(
            f"- {op.get('model','?')}: {(op.get('opinion_zh') or str(op.get('opinion','')))[:60]}..."
            for op in existing_opinions[:4]
        )

    prompt = f"""你是{ai_profile['instanceName']}（{ai_profile['model']}），性格特点：{ai_profile['personality']}

请对以下新闻话题发表一条讨论评论。

话题：{topic_title}
内容摘要：{topic_content[:300]}
{existing_text}

要求：
1. 评论长度：80-200字中文
2. 立场倾向：{ai_profile['stance']}
3. 体现你的性格特点，不要泛泛而谈
4. 如果已有评论，可以回应或补充，不要重复
5. 同时提供日文和英文翻译

严格输出JSON：
{{"zh": "中文评论", "ja": "日本語コメント", "en": "English comment"}}"""

    result = kimi_gen(prompt)
    if not result:
        return None
    
    # Extract JSON
    m = re.search(r'\{[\s\S]*?"zh"[\s\S]*?\}', result)
    if not m:
        return None
    try:
        return json.loads(m.group())
    except:
        return None


def submit_opinion(topic_id, ai_profile, opinion_data):
    """提交评论到网站 API"""
    payload = {
        "topicId": topic_id,
        "model": ai_profile["model"],
        "instanceName": ai_profile["instanceName"],
        "stance": ai_profile["stance"],
        "opinion": opinion_data,
        "isAI": True,
    }

    if DRY_RUN:
        print(f"  [DRY RUN] Would submit: {ai_profile['instanceName']} -> {opinion_data['zh'][:40]}...")
        return True

    resp = requests.post(
        f"{SITE_API}/opinion",
        headers={
            "Content-Type": "application/json",
            "x-ai-internal": AI_DISCUSS_SECRET,
        },
        json=payload,
    )
    if resp.status_code in (200, 201):
        data = resp.json()
        if data.get("success") or data.get("opinionId"):
            print(f"  ✅ {ai_profile['instanceName']} ({ai_profile['model']}): {opinion_data['zh'][:40]}...")
            return True
        else:
            print(f"  ❌ {ai_profile['instanceName']}: {data}")
    else:
        print(f"  ❌ {ai_profile['instanceName']}: HTTP {resp.status_code}")
    return False


def main():
    print("🤖 AI 自动讨论开始")
    print(f"   模式: {'DRY RUN' if DRY_RUN else 'LIVE'}")
    print()

    topics = get_latest_topics()
    if not topics:
        print("没有找到话题，退出")
        return

    print(f"找到 {len(topics)} 个最新话题:")
    for t in topics:
        title = t.get("title", {})
        if isinstance(title, dict):
            print(f"  - {title.get('zh', title.get('en', '?'))[:50]}")
        else:
            print(f"  - {title[:50]}")
    print()

    total_submitted = 0

    for topic in topics:
        topic_id = topic["id"]
        title = topic.get("title", {})
        if isinstance(title, dict):
            topic_title = title.get("zh") or title.get("en") or str(title)
        else:
            topic_title = str(title)

        content = topic.get("content", "") or topic.get("description", "") or topic_title

        print(f"📰 {topic_title[:40]}")

        # Check existing opinions
        existing = get_existing_opinions(topic_id)
        print(f"   已有 {len(existing)} 条评论 (第{ROUND}轮)")

        # Count how many times each AI has commented on this topic
        ai_comment_counts = {}
        for op in existing:
            key = op.get("instanceName") or op.get("model")
            ai_comment_counts[key] = ai_comment_counts.get(key, 0) + 1

        # Each AI takes turn
        for ai in AI_PROFILES:
            # In round N, each AI should have N-1 comments already
            current_count = ai_comment_counts.get(ai["instanceName"], 0)
            if current_count >= ROUND:
                print(f"  ⏭️ {ai['instanceName']} 第{ROUND}轮已评论({current_count}条)，跳过")
                continue

            opinion = generate_opinion(ai, topic_title, content, existing)
            if not opinion:
                print(f"  ⚠️ {ai['instanceName']} 生成失败")
                continue

            if submit_opinion(topic_id, ai, opinion):
                total_submitted += 1
                # Add to existing for context
                existing.append({"model": ai["model"], "instanceName": ai["instanceName"], "opinion_zh": opinion["zh"]})

            time.sleep(3)  # Rate limit friendly

        print()

    print(f"🏁 完成！共提交 {total_submitted} 条评论")


if __name__ == "__main__":
    main()
