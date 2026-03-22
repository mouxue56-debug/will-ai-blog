#!/usr/bin/env python3
"""
翻译 daily_reports 表的标题和内容到三语 (zh/ja/en)
前提：Supabase 表已添加 title_ja, title_en, content_zh, content_ja, content_en 字段
"""

import os
import json
import requests
import time
from typing import Dict, List, Optional

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://tafbypudxuksfwrkfbxv.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ")
TRANSLATE_API_KEY = os.getenv("TRANSLATE_API_KEY", "sk-sp-af0f0f93c06d4996ae0aa34a63be70f5")
TRANSLATE_API_BASE = os.getenv("TRANSLATE_API_BASE", "https://dashscope.aliyuncs.com/compatible-mode/v1")
TRANSLATE_MODEL = os.getenv("TRANSLATE_MODEL", "qwen-plus")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

def translate_text(text: str, target_lang: str, source_lang: str = "zh") -> Optional[str]:
    """使用 DashScope (Qwen) 翻译单条文本"""
    if not text or not text.strip():
        return None
    
    # 简化翻译提示
    prompts = {
        "ja": f"将以下中文翻译成日语，保持专业新闻风格：\n{text}",
        "en": f"Translate the following Chinese text to English, maintain professional news style:\n{text}",
        "zh": text  # 中文原文直接返回
    }
    
    if target_lang == "zh":
        return text
    
    prompt = prompts.get(target_lang)
    if not prompt:
        return None
    
    payload = {
        "model": TRANSLATE_MODEL,
        "messages": [
            {"role": "system", "content": "你是一个专业的翻译助手，输出只返回翻译结果，不添加任何解释。"},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 2000,
        "temperature": 0.1,
    }
    
    try:
        resp = requests.post(
            f"{TRANSLATE_API_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {TRANSLATE_API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=30
        )
        data = resp.json()
        
        if resp.status_code == 200:
            translated = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            # 清理可能的多余说明
            translated = translated.replace("翻译结果：", "").replace("Translation:", "").strip()
            return translated if translated else None
        else:
            print(f"翻译失败 {target_lang}: {resp.status_code} {data}")
            return None
    except Exception as e:
        print(f"翻译异常 {target_lang}: {e}")
        return None

def translate_content(content: str) -> Dict[str, str]:
    """翻译内容（Markdown格式），分段落处理"""
    if not content:
        return {"zh": "", "ja": "", "en": ""}
    
    # 简单处理：先尝试整体翻译
    translated_ja = translate_text(content, "ja")
    translated_en = translate_text(content, "en")
    
    return {
        "zh": content,
        "ja": translated_ja or content,
        "en": translated_en or content
    }

def fetch_reports_needing_translation() -> List[dict]:
    """获取需要翻译的 daily_reports 记录"""
    url = f"{SUPABASE_URL}/rest/v1/daily_reports"
    params = {
        "select": "id,title,content,topic_type,slug,published_at,title_ja,title_en,content_zh,content_ja,content_en",
        "order": "published_at.desc"
    }
    
    resp = requests.get(url, headers=HEADERS, params=params)
    if resp.status_code != 200:
        print(f"获取数据失败: {resp.status_code} {resp.text}")
        return []
    
    reports = resp.json()
    
    # 过滤出需要翻译的记录
    needs_translation = []
    for r in reports:
        # 检查翻译字段是否存在或为空
        needs = False
        if not r.get("title_ja") or not r.get("title_en"):
            needs = True
        if not r.get("content_zh") or not r.get("content_ja") or not r.get("content_en"):
            needs = True
        if needs:
            needs_translation.append(r)
    
    return needs_translation

def update_report_translations(report_id: str, translations: dict) -> bool:
    """更新一条记录的翻译字段"""
    # 只更新非空的翻译
    update_data = {}
    for field, value in translations.items():
        if value:
            update_data[field] = value
    
    if not update_data:
        return False
    
    url = f"{SUPABASE_URL}/rest/v1/daily_reports?id=eq.{report_id}"
    resp = requests.patch(url, headers=HEADERS, json=update_data)
    
    if resp.status_code == 204:
        return True
    else:
        print(f"更新失败 {report_id}: {resp.status_code} {resp.text}")
        return False

def main():
    print("=== 开始翻译 daily_reports ===")
    
    reports = fetch_reports_needing_translation()
    print(f"需要翻译的记录数: {len(reports)}")
    
    if not reports:
        print("所有记录都已翻译，无需操作")
        return
    
    for i, report in enumerate(reports):
        print(f"[{i+1}/{len(reports)}] 处理: {report['id'][:12]} {report['title'][:30]}")
        
        translations = {}
        
        # 标题翻译
        if not report.get("title_ja") or not report.get("title_en"):
            title = report["title"]
            translations["title_ja"] = translate_text(title, "ja") or title
            translations["title_en"] = translate_text(title, "en") or title
            print(f"  标题翻译完成: ja={translations['title_ja'][:20]}...")
        
        # 内容翻译
        if not report.get("content_zh") or not report.get("content_ja") or not report.get("content_en"):
            content_trans = translate_content(report["content"])
            translations["content_zh"] = content_trans["zh"]
            translations["content_ja"] = content_trans["ja"]
            translations["content_en"] = content_trans["en"]
            print(f"  内容翻译完成: ja={content_trans['ja'][:30] if content_trans['ja'] else 'None'}...")
        
        if translations:
            success = update_report_translations(report["id"], translations)
            if success:
                print("  ✅ 更新成功")
            else:
                print("  ❌ 更新失败")
        else:
            print("  ⏭️ 无需更新")
        
        # 避免触发 API 限流
        if i < len(reports) - 1:
            time.sleep(2)
    
    print("=== 翻译完成 ===")

if __name__ == "__main__":
    main()