#!/usr/bin/env python3
import json, requests, os, re
from datetime import datetime

CFG_PATH = os.path.expanduser("~/.openclaw/openclaw.json")
with open(CFG_PATH) as f:
    cfg = json.load(f)
KIMI_KEY = cfg['models']['providers']['kimi']['apiKey']

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
        timeout=60
    )
    if resp.status_code == 200:
        return resp.json()["content"][0]["text"]
    else:
        raise Exception(f"Kimi error {resp.status_code}: {resp.text[:200]}")

COUNT = 2
today = datetime.now().strftime("%Y年%m月%d日")
prompt = f"""今天是{today}，请生成{COUNT}个值得关注的新闻话题，涵盖 AI动态、技术前沿、商业洞察。

每个话题包含：
- topic: 中文话题描述（30字以内）
- category: ai/tech/business/life/cats 其中一个
- tags: 2-3个标签

严格按照 JSON 数组格式输出：
[
  {{"topic": "...", "category": "ai", "tags": ["tag1", "tag2"]}},
  ...
]"""
print("发送提示...")
raw = kimi_gen(prompt, max_tokens=1000)
print("原始响应:")
print(raw)
print("\n尝试解析...")
# 使用gen-news.py中的逻辑
cleaned = raw.strip()
if cleaned.startswith('```'):
    lines = cleaned.split('\n')
    if lines[0].startswith('```'):
        lines = lines[1:]
    if lines[-1].startswith('```'):
        lines = lines[:-1]
    cleaned = '\n'.join(lines)

match = re.search(r'\[[\s\S]*\]', cleaned)
if match:
    json_str = match.group()
    print("提取的JSON:")
    print(json_str)
    try:
        data = json.loads(json_str)
        print("解析成功!")
        print(json.dumps(data, ensure_ascii=False, indent=2))
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        # 尝试修复单引号
        json_str_fixed = json_str.replace("'", '"')
        try:
            data = json.loads(json_str_fixed)
            print("修复后解析成功!")
        except:
            print("修复失败")
else:
    print("未找到JSON数组")