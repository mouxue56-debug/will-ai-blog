#!/usr/bin/env python3
"""
AI 自动讨论脚本 — 全 Kimi 版
四个 AI 角色（ユキ/ナツ/ハル/アキ）对最新话题发表评论
统一用 Kimi K2.5 (Anthropic 格式) 生成

用法：
  python3 ai-auto-discuss.py              # 对最新话题评论
  python3 ai-auto-discuss.py --dry-run    # 只显示不提交
  python3 ai-auto-discuss.py --round=2    # 第2轮回复
"""
import json, requests, time, sys, os, re

# ─── Config ───
SITE_API = "https://aiblog.fuluckai.com/api/debate"
AI_DISCUSS_SECRET = "689e23ed87d8e4b237f300795d4d887b"

CFG_PATH = os.path.expanduser("~/.openclaw/openclaw.json")
with open(CFG_PATH) as f:
    cfg = json.load(f)

KIMI_KEY = cfg['models']['providers']['kimi']['apiKey']
KIMI_URL = 'https://api.kimi.com/coding/v1/messages'

# 四个角色，全用 Kimi
AI_PROFILES = [
    {"name": "ユキ", "model": "Kimi K2.5", "personality": "冷静理性的技术顾问，从架构和系统层面分析", "stance": "neutral"},
    {"name": "ナツ", "model": "Kimi K2.5", "personality": "热情活泼的运营专家，关注应用和用户体验", "stance": "pro"},
    {"name": "ハル", "model": "Kimi K2.5", "personality": "沉稳务实的全栈开发者，从工程实践角度切入", "stance": "neutral"},
    {"name": "アキ", "model": "Kimi K2.5", "personality": "好奇的研究型AI，挖掘深层逻辑和反直觉观点", "stance": "con"},
]

DRY_RUN = "--dry-run" in sys.argv
ROUND = 1
for arg in sys.argv:
    if arg.startswith("--round="):
        ROUND = int(arg.split("=")[1])


def kimi_gen(prompt):
    """调用 Kimi K2.5 (Anthropic 格式, 非 streaming)"""
    for attempt in range(3):
        try:
            resp = requests.post(KIMI_URL,
                headers={
                    'Content-Type': 'application/json',
                    'x-api-key': KIMI_KEY,
                    'anthropic-version': '2023-06-01',
                },
                json={
                    'model': 'kimi-k2.5',
                    'max_tokens': 800,
                    'messages': [{'role': 'user', 'content': prompt}],
                },
                timeout=60)

            if resp.status_code != 200:
                print(f"    retry {attempt+1}: HTTP {resp.status_code}", flush=True)
                time.sleep(3)
                continue

            data = resp.json()
            text = ""
            for block in data.get('content', []):
                if block.get('type') == 'text':
                    text = block.get('text', '').strip()
                    break
            if text:
                return text
            print(f"    retry {attempt+1}: empty text", flush=True)
            time.sleep(3)
        except Exception as e:
            print(f"    retry {attempt+1}: {e}", flush=True)
            time.sleep(3)
    return None


def parse_json(text):
    """从 LLM 输出中提取 JSON"""
    if not text:
        return None
    # 去 markdown 代码块
    cleaned = text.strip()
    if cleaned.startswith('```'):
        cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
        cleaned = re.sub(r'\s*```$', '', cleaned)

    # 括号匹配提取 JSON
    start = cleaned.find('{')
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(cleaned)):
        if cleaned[i] == '{': depth += 1
        elif cleaned[i] == '}':
            depth -= 1
            if depth == 0:
                try:
                    obj = json.loads(cleaned[start:i+1])
                    if obj.get('zh'):
                        return obj
                except:
                    pass
                return None
    return None


def main():
    print(f"🤖 AI讨论 {'[DRY RUN]' if DRY_RUN else '[LIVE]'} 第{ROUND}轮", flush=True)

    # 获取最新话题
    resp = requests.get(f"{SITE_API}/topics", timeout=15)
    topics = resp.json().get("topics", []) if resp.ok else []
    if not topics:
        print("无话题，退出")
        return

    # 取最新一天
    latest_date = topics[0].get("date", topics[0].get("published_at", "")[:10])
    topics = [t for t in topics if (t.get("date") or t.get("published_at", "")[:10]) == latest_date][:3]
    print(f"话题 x{len(topics)}:", flush=True)
    for t in topics:
        title = t.get("title", {})
        name = title.get("zh") or title.get("en") or str(title) if isinstance(title, dict) else str(title)
        print(f"  · {name[:50]}", flush=True)

    total = 0
    for topic in topics:
        tid = topic["id"]
        title = topic.get("title", {})
        tname = title.get("zh") or title.get("en") or str(title) if isinstance(title, dict) else str(title)
        content = topic.get("content", "") or topic.get("description", "") or tname

        # 已有评论
        existing_resp = requests.get(f"{SITE_API}/opinion/{tid}", timeout=15)
        existing = existing_resp.json().get("opinions", []) if existing_resp.ok else []
        counts = {}
        for op in existing:
            k = op.get("instanceName", "")
            counts[k] = counts.get(k, 0) + 1

        print(f"\n📰 {tname[:40]} ({len(existing)}条已有)", flush=True)

        for ai in AI_PROFILES:
            if counts.get(ai["name"], 0) >= ROUND:
                print(f"  ⏭ {ai['name']} 已评", flush=True)
                continue

            # 构造 prompt
            ctx = ""
            if existing:
                ctx = "\n已有评论：\n" + "\n".join(
                    f"- {o.get('instance_name','')}: {(o.get('opinion_zh',''))[:50]}..."
                    for o in existing[:4])

            prompt = f"""你是{ai['name']}，性格：{ai['personality']}
对以下话题发表80-200字中文评论，立场偏{ai['stance']}。
话题：{tname}
摘要：{content[:300]}
{ctx}
要求：不泛泛而谈，体现性格。已有评论则回应补充不重复。同时给日英翻译。
严格输出JSON（不要代码块）：
{{"zh":"中文评论","ja":"日本語コメント","en":"English comment"}}"""

            result = kimi_gen(prompt)
            opinion = parse_json(result)
            if not opinion:
                print(f"  ❌ {ai['name']} 失败", flush=True)
                continue

            if DRY_RUN:
                print(f"  🔸 {ai['name']}: {opinion['zh'][:40]}...", flush=True)
                total += 1
                continue

            # 提交
            sub = requests.post(f"{SITE_API}/opinion",
                headers={"Content-Type": "application/json", "x-ai-internal": AI_DISCUSS_SECRET},
                json={"topicId": tid, "model": ai["model"], "instanceName": ai["name"],
                      "stance": ai["stance"], "opinion": opinion, "isAI": True},
                timeout=15)
            if sub.ok and sub.json().get("success"):
                print(f"  ✅ {ai['name']}: {opinion['zh'][:40]}...", flush=True)
                total += 1
                existing.append({"instance_name": ai["name"], "opinion_zh": opinion["zh"]})
            else:
                print(f"  ❌ {ai['name']} 提交失败: {sub.text[:80]}", flush=True)

            time.sleep(2)

    print(f"\n🏁 完成 {total} 条", flush=True)


if __name__ == "__main__":
    main()
