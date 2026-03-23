#!/usr/bin/env python3
"""
简化版：生成1条新闻并写入Supabase
"""
import json, requests, time, os, re, random
from datetime import datetime

print("=== 初始化 ===", flush=True)

SUPABASE_URL = "https://tafbypudxuksfwrkfbxv.supabase.co"
SUPABASE_KEY = "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ"
SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

CFG_PATH = os.path.expanduser("~/.openclaw/openclaw.json")
with open(CFG_PATH) as f:
    cfg = json.load(f)
KIMI_KEY = cfg['models']['providers']['kimi']['apiKey']

AI_INSTANCES = [
    {"name": "ユキ", "model": "Kimi K2.5", "personality": "冷静理性的技术顾问"},
    {"name": "ナツ", "model": "Kimi K2.5", "personality": "热情活泼的运营专家"},
    {"name": "ハル", "model": "Kimi K2.5", "personality": "沉稳务实的全栈开发者"},
]

LOCALES = ["zh", "ja", "en"]

def kimi_gen(prompt, max_tokens=2000):
    print(f"  [Kimi] 发送请求...", flush=True)
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
        print(f"  [Kimi] 响应成功", flush=True)
        return resp.json()["content"][0]["text"]
    else:
        raise Exception(f"Kimi error {resp.status_code}: {resp.text[:200]}")

def extract_json(raw):
    """提取并解析JSON"""
    cleaned = raw.strip()
    if cleaned.startswith('```'):
        lines = cleaned.split('\n')
        if lines[0].startswith('```'):
            lines = lines[1:]
        if lines[-1].startswith('```'):
            lines = lines[:-1]
        cleaned = '\n'.join(lines)
    return cleaned

def get_topic():
    print("[步骤1] 获取话题...", flush=True)
    today = datetime.now().strftime("%Y年%m月%d日")
    prompt = f"""今天是{today}，请生成1个值得关注的AI或科技新闻话题。

返回格式：
{{"topic": "话题描述", "category": "ai", "tags": ["tag1", "tag2"]}}
"""
    raw = kimi_gen(prompt, max_tokens=500)
    cleaned = extract_json(raw)
    match = re.search(r'\{[\s\S]*\}', cleaned)
    if not match:
        raise Exception(f"No JSON: {raw[:200]}")
    return json.loads(match.group())

def generate_news(topic_zh, category):
    print(f"[步骤2] 生成三语新闻: {topic_zh}", flush=True)
    inst = random.choice(AI_INSTANCES)
    
    prompt = f"""你是{inst['name']}，{inst['personality']}。

话题：{topic_zh}
分类：{category}

生成新闻，包含三语版本（中日英）。严格JSON格式：
{{
  "zh": {{"title": "标题", "summary": "摘要", "content": "正文(markdown)"}},
  "ja": {{"title": "タイトル", "summary": "要約", "content": "本文(markdown)"}},
  "en": {{"title": "Title", "summary": "Summary", "content": "Content(markdown)"}}
}}"""
    raw = kimi_gen(prompt, max_tokens=4000)
    cleaned = extract_json(raw)
    match = re.search(r'\{[\s\S]*\}', cleaned)
    if not match:
        raise Exception(f"No JSON: {raw[:200]}")
    data = json.loads(match.group())
    return data, inst

def insert_news(locale, title, summary, content, category, tags, ai_instance, ai_model):
    payload = {
        "locale": locale,
        "category": category,
        "title": title,
        "summary": summary,
        "content": content,
        "tags": tags,
        "source": "",
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

# === 主流程 ===
print("\n🚀 开始生成新闻...", flush=True)

# 1. 获取话题
topic_item = get_topic()
topic = topic_item.get("topic", "")
category = topic_item.get("category", "ai")
tags = topic_item.get("tags", [])
print(f"  话题: {topic}", flush=True)
print(f"  分类: {category}", flush=True)

# 2. 生成三语内容
data, inst = generate_news(topic, category)
print(f"  AI实例: {inst['name']}", flush=True)

# 3. 写入Supabase
print("[步骤3] 写入Supabase...", flush=True)
for locale in LOCALES:
    insert_news(
        locale=locale,
        title=data[locale]["title"],
        summary=data[locale]["summary"],
        content=data[locale]["content"],
        category=category,
        tags=tags,
        ai_instance=inst["name"],
        ai_model=inst["model"],
    )
    print(f"  ✅ {locale}: {data[locale]['title']}", flush=True)

print("\n✅ 完成！生成了3条记录（中日英各1条）", flush=True)
