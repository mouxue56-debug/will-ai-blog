#!/usr/bin/env python3
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

# 从 openclaw config 读 Kimi key
CFG_PATH = os.path.expanduser("~/.openclaw/openclaw.json")
with open(CFG_PATH) as f:
    cfg = json.load(f)
KIMI_KEY = cfg['models']['providers']['kimi']['apiKey']

def kimi_gen(prompt, max_tokens=2000):
    """调用 Kimi K2.5 生成内容"""
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
        timeout=60
    )
    if resp.status_code == 200:
        return resp.json()["content"][0]["text"]
    else:
        raise Exception(f"Kimi error {resp.status_code}: {resp.text[:200]}")

def generate_news_triplet(topic_zh, category):
    """
    给定一个中文话题，生成中日英三语新闻
    """
    import random
    AI_INSTANCES = [
        {"name": "ユキ", "model": "Kimi K2.5", "personality": "冷静理性的技术顾问"},
        {"name": "ナツ", "model": "Kimi K2.5", "personality": "热情活泼的运营专家"},
        {"name": "ハル", "model": "Kimi K2.5", "personality": "沉稳务实的全栈开发者"},
    ]
    inst = random.choice(AI_INSTANCES)
    
    prompt = f"""你是{inst['name']}，{inst['personality']}。
    
今天的话题：{topic_zh}
分类：{category}

请生成一篇新闻资讯，包含三语版本（中文/日语/英文）。

严格按照以下 JSON 格式输出（不要有其他内容）：
{{
  "zh": {{
    "title": "中文标题（20字以内）",
    "summary": "中文摘要（50字以内）",
    "content": "中文正文（200-300字，markdown格式，包含标题和要点）"
  }},
  "ja": {{
    "title": "日本語タイトル（20文字以内）",
    "summary": "日本語要約（50文字以内）",
    "content": "日本語本文（200-300文字、markdown形式）"
  }},
  "en": {{
    "title": "English Title (within 20 words)",
    "summary": "English Summary (within 50 words)",
    "content": "English content (200-300 words, markdown format)"
  }}
}}"""

    raw = kimi_gen(prompt, max_tokens=3000)
    print("=== RAW RESPONSE ===")
    print(raw)
    print("=== END RAW ===")
    
    # 清理响应：移除可能存在的代码块标记
    cleaned = raw.strip()
    if cleaned.startswith('```'):
        # 移除开头的 ```json 或 ``` 和结尾的 ```
        lines = cleaned.split('\n')
        if lines[0].startswith('```'):
            lines = lines[1:]
        if lines[-1].startswith('```'):
            lines = lines[:-1]
        cleaned = '\n'.join(lines)
    
    # 提取 JSON 对象
    match = re.search(r'\{[\s\S]*\}', cleaned)
    if not match:
        raise Exception(f"No JSON object found.")
    
    json_str = match.group()
    print("=== EXTRACTED JSON ===")
    print(json_str)
    # 尝试解析
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        # 尝试修复单引号
        json_str_fixed = json_str.replace("'", '"')
        try:
            data = json.loads(json_str_fixed)
        except json.JSONDecodeError:
            raise Exception(f"JSON decode error: {e}. JSON string: {json_str[:500]}")
    
    return data, inst

# 测试一个话题
print("测试生成一个新闻...")
topic = "GPT-5多模态推理能力突破，代码生成准确率超95%"
category = "ai"

try:
    data, inst = generate_news_triplet(topic, category)
    print("成功生成!")
    print(f"AI实例: {inst['name']}")
    print(f"中文标题: {data['zh']['title']}")
    print(f"日文标题: {data['ja']['title']}")
    print(f"英文标题: {data['en']['title']}")
except Exception as e:
    print(f"错误: {e}")
    import traceback
    traceback.print_exc()