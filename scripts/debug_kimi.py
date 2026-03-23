#!/usr/bin/env python3
import json, requests, os, re

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

# 测试获取今日话题
from datetime import datetime
today = datetime.now().strftime("%Y年%m月%d日")
prompt = f"""今天是{today}，请生成5个值得关注的新闻话题，涵盖 AI动态、技术前沿、商业洞察。

每个话题包含：
- topic: 中文话题描述（30字以内）
- category: ai/tech/business/life/cats 其中一个
- tags: 2-3个标签

严格按照 JSON 数组格式输出：
[
  {{"topic": "...", "category": "ai", "tags": ["tag1", "tag2"]}},
  ...
]"""

print("=== 发送的提示 ===")
print(prompt)
print("\n=== 等待响应 ===")

try:
    raw = kimi_gen(prompt, max_tokens=1000)
    print("=== 原始响应 ===")
    print(raw)
    print("\n=== 尝试提取 JSON ===")
    match = re.search(r'\[[\s\S]*\]', raw)
    if match:
        json_str = match.group()
        print("提取的字符串:")
        print(json_str)
        # 尝试修复常见的JSON问题
        # 替换单引号为双引号
        json_str = json_str.replace("'", '"')
        # 尝试解析
        data = json.loads(json_str)
        print("解析成功!")
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        print("未找到JSON数组")
except Exception as e:
    print(f"错误: {e}")
    import traceback
    traceback.print_exc()