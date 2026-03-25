#!/usr/bin/env python3
"""
批量生成博客封面图和播客音频 - 修复版
使用 MiniMax API
"""

import requests
import json
import os
import binascii
from pathlib import Path

# API配置
API_KEY = "sk-cp-uOXxtdjtT3ECcptyzk6GYIWUDHrqm9sO51y_8E5DPeFwe52gy9fmqwV0iqPZfEHUkvKedsiWNNBVVIDOrGPilE0_bNbUfZZQaqMTxJP4lmmXXfEJilylvMA"
IMAGE_URL = "https://api.minimaxi.com/v1/image_generation"
TTS_URL = "https://api.minimaxi.com/v1/t2a_v2"

# 路径配置
BASE_DIR = Path("/Users/lauralyu/projects/will-ai-lab")
COVERS_DIR = BASE_DIR / "public" / "covers"
AUDIO_DIR = BASE_DIR / "public" / "audio"
BLOG_DIR = BASE_DIR / "src" / "content" / "blog"

# 文章数据：slug -> (标题, 内容摘要, 封面提示主题)
ARTICLES = {
    "my-ai-workflow": {
        "title": "用4个AI助手管理日常工作",
        "summary": "一台Mac Mini M4跑4个AI实例，分别负责代码、内容、客户沟通和医疗咨询。从单实例到多实例的架构演进，解决上下文污染问题，提升专业化程度。",
        "cover_theme": "四台AI助手协同工作，科技感的多屏幕工作站，数据流连接"
    },
    "swarm-v2-birth-story": {
        "title": "蜂群引擎v2.0诞生记",
        "summary": "Claude Opus 4主笔，GPT-5.4审查，5轮打磨完成5066行代码。AI协作开发AI工具的完整记录，从架构设计到最终交付的全过程。",
        "cover_theme": "蜂群协作，多个AI节点协同工作，代码和数据流交织"
    },
    "minimax-coding-plan-image-tts": {
        "title": "MiniMax Coding Plan里藏着图片和语音",
        "summary": "包月API套餐里除了LLM还有图片生成和语音合成。image-01文生图效果稳定，TTS语音合成有hex解码的小坑，完整测试记录。",
        "cover_theme": "API技术探索，代码与图像音频的融合，科技感界面"
    },
    "osaka-sakura-2026": {
        "title": "大阪の桜今年は少し遅め",
        "summary": "2026年大阪樱花前线预报，染井吉野预计3月25日开放。推荐大和川河堤、大阪城公园、长居植物园等花见路线。",
        "cover_theme": "大阪城樱花盛开，粉色花瓣飘落，传统日式建筑与樱花"
    },
    "siberian-spring-care": {
        "title": "春天的サイベリアン换毛季护理指南",
        "summary": "三月换毛季，猫毛飞满屋。西伯利亚猫三层被毛结构，每日梳理20-30分钟，配合Omega-3营养补充和AI护理提醒系统。",
        "cover_theme": " fluffy西伯利亚猫，春季樱花背景，猫咪梳理护理"
    },
    "cattery-timeline": {
        "title": "サイベリアン｜福楽キャッテリー成长时间线",
        "summary": "从2022年4月取得第一种动物取扱业登记，到2025年上半年获得全国第一名评价。福楽キャッテリー的成长历程与繁育理念。",
        "cover_theme": "西伯利亚猫，温馨猫舍，时间线成长记录，专业繁育"
    },
    "三岁儿子抓日本良心娃娃机大奖随便拿": {
        "title": "三岁儿子抓日本良心娃娃机大奖随便拿",
        "summary": "周末带娃去游戏中心，2000日元套餐玩一上午。面包超人游戏低龄友好，抓娃娃爪子良心，日本小姐姐还送了超大袋子。",
        "cover_theme": "日本游戏中心，抓娃娃机，面包超人主题，亲子欢乐"
    },
    "周末带着孩子和老婆去日本游乐场-居然5点就下班被赶走了": {
        "title": "周末带孩子去日本游乐场，居然5点就下班",
        "summary": "日本本地游乐场营业时间早，下午5点就闭园。旋转木马、小飞象、碰碰车、4D电影，虽然时间短但孩子们玩得很开心。",
        "cover_theme": "日本游乐园，旋转木马，亲子家庭，夕阳下的游乐场"
    },
    "在日本大阪遛娃好去处-高山牧场--这里可以骑马放羊喂各种小动物-还有迷你猪超级好玩": {
        "title": "大阪高山牧场遛娃好去处",
        "summary": "能势町高山牧场，骑马体验、喂羊、兔子互动、迷你猪，还有挤牛奶和捡鸡蛋。亲近自然的亲子农场体验。",
        "cover_theme": "高山牧场，骑马体验，迷你猪，亲子农场，大自然"
    },
    "大阪最推荐的家庭日式韩国烤肉-じゅうじゅうカルビ": {
        "title": "大阪最推荐的家庭日式韩国烤肉",
        "summary": "じゅうじゅうカルビ，日式韩国烤肉店，午餐2800日元晚餐3800日元畅吃。儿童友好，有儿童座椅和涂色纸。",
        "cover_theme": "日式烤肉，家庭聚餐，烤肉滋滋冒油，温馨餐厅"
    },
    "人入中年-带大家在日本挑母婴用品-逛日本最大母婴连锁店": {
        "title": "在日本挑母婴用品，逛最大母婴连锁店",
        "summary": "阿卡将本铺，从怀孕到3岁一站购齐。推荐奶瓶消毒器、吸鼻器、婴儿润肤霜等实用好物，日本母婴用品设计贴心。",
        "cover_theme": "母婴用品店，婴儿奶瓶玩具，温馨购物环境"
    },
    "带孩子去日本大阪海底捞-仿佛回到了中国": {
        "title": "带孩子去大阪海底捞，仿佛回到中国",
        "summary": "海底捞心斋桥店，熟悉的火锅味道和热情服务。儿童游乐区、抻面表演、虾滑和毛肚，海外华人的乡愁解药。",
        "cover_theme": "海底捞火锅，红汤翻滚，抻面表演，中式餐厅"
    },
    "带女儿来日本山顶农场体验生活-捡鸡蛋-摘蔬菜-泡温泉": {
        "title": "带女儿来山顶农场体验生活",
        "summary": "山顶农场捡鸡蛋、摘草莓和甘蓝、泡温泉。女儿找到温热鸡蛋时的兴奋，自己劳动换来的饭菜吃得特别香。",
        "cover_theme": "山顶农场，捡鸡蛋，草莓采摘，温泉，田园风光"
    },
    "租车带女儿去日本奈良看小鹿": {
        "title": "租车带女儿去奈良看小鹿",
        "summary": "奈良公园的小鹿，女儿与鹿互动的温馨时刻。日本传统与自然和谐共处的亲子旅行体验。",
        "cover_theme": "奈良小鹿，女儿喂鹿，春日大社，日本传统风景"
    },
    "日本买-开比亚迪-提车三天聊聊缺点-byd-atto3": {
        "title": "日本买比亚迪Atto 3，提车三天聊聊缺点",
        "summary": "BYD Atto 3在日本使用体验，性价比高续航400km，但充电兼容性、软件本地化、售后网点有待改善。",
        "cover_theme": "比亚迪电动车，Atto 3，电动汽车充电，科技感"
    }
}

def generate_podcast_audio(slug, title, summary):
    """生成播客音频"""
    # 生成150-250字的播客脚本
    podcast_script = f"欢迎收听本期播客。今天我们要聊的是：{title}。{summary}。希望这期内容对你有所帮助，我们下期再见。"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "speech-2.8-hd",
        "text": podcast_script,
        "stream": False,
        "voice_setting": {
            "voice_id": "Japanese_GracefulMaiden",
            "speed": 1,
            "vol": 1,
            "pitch": 0
        },
        "audio_setting": {
            "sample_rate": 32000,
            "bitrate": 128000,
            "format": "mp3",
            "channel": 1
        }
    }
    
    try:
        resp = requests.post(TTS_URL, headers=headers, json=data, timeout=120)
        resp.raise_for_status()
        result = resp.json()
        
        # 修复：音频在 result["data"]["audio"] 直接是hex字符串
        if "data" in result and "audio" in result["data"]:
            audio_hex = result["data"]["audio"]
            audio_bytes = binascii.unhexlify(audio_hex)
            
            output_path = AUDIO_DIR / f"{slug}.mp3"
            with open(output_path, "wb") as f:
                f.write(audio_bytes)
            return True, f"音频已保存: {output_path} ({len(audio_bytes)} bytes)"
        else:
            return False, f"API返回异常: {result.keys()}"
    except Exception as e:
        return False, f"生成音频失败: {e}"

def process_article(slug, info):
    """处理单篇文章 - 仅音频"""
    # 生成音频
    success, msg = generate_podcast_audio(slug, info["title"], info["summary"])
    return msg

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python generate_audio.py <slug>")
        sys.exit(1)
    
    slug = sys.argv[1]
    if slug not in ARTICLES:
        print(f"未知slug: {slug}")
        sys.exit(1)
    
    info = ARTICLES[slug]
    result = process_article(slug, info)
    print(result)
