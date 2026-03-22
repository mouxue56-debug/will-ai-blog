#!/usr/bin/env python3
"""
简化版翻译：填充翻译字段，内容暂用原文，标题使用规则翻译
"""

import os
import requests
import time

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://tafbypudxuksfwrkfbxv.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

# 标题翻译规则
TITLE_MAPPINGS = {
    "AI动态": {"ja": "AIニュース", "en": "AI News"},
    "经济动态": {"ja": "経済ニュース", "en": "Economy News"},
    "GitHub热点": {"ja": "GitHubトレンド", "en": "GitHub Trending"},
    "晚报": {"ja": "夕刊", "en": "Evening"},
    "早报": {"ja": "朝刊", "en": "Morning"},
    "日报": {"ja": "日報", "en": "Daily"},
}

def translate_title(title: str, lang: str) -> str:
    """基于规则的标题翻译"""
    result = title
    for zh, mapping in TITLE_MAPPINGS.items():
        if zh in result and mapping.get(lang):
            result = result.replace(zh, mapping[lang])
    return result

def fetch_reports() -> list:
    """获取所有 daily_reports"""
    url = f"{SUPABASE_URL}/rest/v1/daily_reports"
    params = {
        "select": "id,title,content",
        "order": "published_at.desc"
    }
    resp = requests.get(url, headers=HEADERS, params=params)
    if resp.status_code != 200:
        print(f"获取失败: {resp.status_code}")
        return []
    return resp.json()

def update_report(report_id: str, data: dict) -> bool:
    """更新一条记录"""
    url = f"{SUPABASE_URL}/rest/v1/daily_reports?id=eq.{report_id}"
    resp = requests.patch(url, headers=HEADERS, json=data)
    if resp.status_code == 204:
        return True
    else:
        print(f"更新失败 {report_id}: {resp.status_code} {resp.text[:100]}")
        return False

def main():
    print("=== 填充翻译字段 (简化版) ===")
    
    reports = fetch_reports()
    print(f"共 {len(reports)} 条记录")
    
    for i, r in enumerate(reports):
        print(f"[{i+1}/{len(reports)}] {r['id'][:12]} {r['title'][:30]}")
        
        # 生成翻译
        title_ja = translate_title(r['title'], 'ja')
        title_en = translate_title(r['title'], 'en')
        content = r['content'] or ""
        
        update_data = {
            "title_ja": title_ja,
            "title_en": title_en,
            "content_zh": content,  # 中文原文
            "content_ja": content,  # 暂用原文，后续可替换
            "content_en": content,  # 暂用原文，后续可替换
        }
        
        if update_report(r['id'], update_data):
            print(f"  ✅ 更新成功")
        else:
            print(f"  ❌ 更新失败")
        
        time.sleep(0.5)  # 避免速率限制
    
    print("=== 完成 ===")

if __name__ == "__main__":
    main()