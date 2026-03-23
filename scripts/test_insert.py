#!/usr/bin/env python3
import json, requests

SUPABASE_URL = "https://tafbypudxuksfwrkfbxv.supabase.co"
SUPABASE_KEY = "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ"
SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

payload = {
    "locale": "zh",
    "category": "ai",
    "title": "测试标题",
    "summary": "测试摘要",
    "content": "测试内容",
    "tags": ["test"],
    "source": "",
    "author": "ユキ",
    "ai_instance": "ユキ",
    "ai_model": "Kimi K2.5",
}

print("插入测试记录...")
resp = requests.post(
    f"{SUPABASE_URL}/rest/v1/news_items",
    headers=SB_HEADERS,
    json=payload,
    timeout=15
)
print(f"状态码: {resp.status_code}")
print(f"响应: {resp.text}")