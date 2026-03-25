#!/usr/bin/env python3
"""
博客音频导读批量生成脚本
规范：/Users/lauralyu/projects/will-ai-lab/docs/audio-generation-spec.md
核心：LLM写导读文字（100~150字）→ MiniMax TTS → mp3
"""

import os, re, json, subprocess, sys, time
import urllib.request, urllib.error

MINIMAX_KEY = "sk-cp-uOXxtdjtT3ECcptyzk6GYIWUDHrqm9sO51y_8E5DPeFwe52gy9fmqwV0iqPZfEHUkvKedsiWNNBVVIDOrGPilE0_bNbUfZZQaqMTxJP4lmmXXfEJilylvMA"
BLOG_DIR = "/Users/lauralyu/projects/will-ai-lab/src/content/blog"
AUDIO_DIR = "/Users/lauralyu/projects/will-ai-lab/public/audio"
KIMI_KEY = os.environ.get("KIMI_KEY", "")  # 用于生成导读文字

INTRO_PROMPT = """你是一个博客音频导读编辑。请根据以下文章正文，写一段30~60秒的中文音频导读。

要求：
1. 提炼文章最有价值的1~2个核心信息
2. 制造轻微悬念或好奇心，引导读者想继续读
3. 语气自然口语化，像朋友推荐一篇文章
4. 不要有"欢迎收听"、"本期播客"等模板开头
5. 结尾可以用"想了解更多，往下看"或类似自然收尾
6. 字数控制在100~150字

文章正文：
{body}

只输出导读文本，不要任何解释。"""


def extract_frontmatter(content):
    """提取frontmatter字段"""
    if not content.startswith('---'):
        return {}, content
    end = content.find('---', 3)
    if end == -1:
        return {}, content
    fm_text = content[3:end]
    body = content[end+3:]
    fm = {}
    for line in fm_text.split('\n'):
        m = re.match(r'^(\w+):\s*["\']?(.+?)["\']?\s*$', line)
        if m:
            fm[m.group(1)] = m.group(2)
    return fm, body


def extract_body_text(body, max_chars=500):
    """清理markdown提取正文"""
    body = re.sub(r'^#{1,6}\s+.*$', '', body, flags=re.MULTILINE)
    body = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', body)
    body = re.sub(r'!\[.*?\]\(.*?\)', '', body)
    body = re.sub(r'\*\*?([^*]+)\*\*?', r'\1', body)
    body = re.sub(r'`[^`]+`', '', body)
    body = re.sub(r'^\s*[-*+>]\s*', '', body, flags=re.MULTILINE)
    body = re.sub(r'---+', '', body)
    body = re.sub(r'\n{3,}', '\n', body).strip()
    lines = [l.strip() for l in body.split('\n')
             if l.strip() and re.search(r'[\u4e00-\u9fff]', l)]
    text = ''.join(lines) if lines else body.replace('\n', '')
    chars = min(max_chars, len(text))
    for end in range(chars, 30, -1):
        if text[end-1] in '。！？.!?':
            return text[:end]
    return text[:chars]


def gen_intro_with_kimi(body_text, title):
    """用Kimi生成导读文字（走Kimi Coding Plan）"""
    prompt = INTRO_PROMPT.format(body=body_text[:400])
    
    # Kimi Coding Plan: Anthropic格式
    kimi_key = "sk-kimi-7f3ot1TGlHVGN22-OTmP8GD3GX6TPlvdPDxsMWMu_Zih1IvT8R-AJe8txLqDQ8T3DqmhJI8nfDGzBkUG7bFt0eKqiVJ0VHEFn1nrN5C-7TKKEHxEWGX6cGWcmWMEHbK"
    
    payload = json.dumps({
        "model": "kimi-k2.5",
        "max_tokens": 300,
        "messages": [{"role": "user", "content": prompt}]
    }, ensure_ascii=False).encode('utf-8')
    
    req = urllib.request.Request(
        "https://api.kimi.com/coding/v1/messages",
        data=payload,
        headers={
            "x-api-key": kimi_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            return data["content"][0]["text"].strip()
    except Exception as e:
        print(f"  Kimi API失败: {e}，使用正文前150字作为导读")
        return body_text[:150]


def minimax_tts(text, output_path):
    """MiniMax TTS生成mp3"""
    payload = {
        "model": "speech-2.8-hd",
        "text": text,
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
    
    result = subprocess.run([
        "curl", "-s", "-X", "POST", "https://api.minimaxi.com/v1/t2a_v2",
        "-H", f"Authorization: Bearer {MINIMAX_KEY}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(payload, ensure_ascii=False)
    ], capture_output=True, text=True, timeout=60)
    
    data = json.loads(result.stdout)
    status_code = data.get("base_resp", {}).get("status_code", 0)
    
    if status_code != 0:
        msg = data.get("base_resp", {}).get("status_msg", "未知错误")
        raise Exception(f"TTS失败 code={status_code}: {msg}")
    
    audio_hex = data["data"]["audio"]
    with open(output_path, "wb") as f:
        f.write(bytes.fromhex(audio_hex))
    
    size = os.path.getsize(output_path)
    if size < 10000:
        raise Exception(f"音频太小({size}B)，可能生成失败")
    return size


def update_frontmatter_audiourl(filepath, slug):
    """更新frontmatter中的audioUrl"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    audio_url = f"/audio/{slug}.mp3"
    
    if 'audioUrl:' in content:
        # 替换现有的（可能是空的）
        content = re.sub(r'audioUrl:.*', f'audioUrl: "{audio_url}"', content)
    else:
        # 在frontmatter末尾（---前）插入
        end = content.find('---', 3)
        if end != -1:
            content = content[:end] + f'audioUrl: "{audio_url}"\n' + content[end:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  ✅ frontmatter已更新: audioUrl: {audio_url}")


def process_article(filename, slug=None):
    """处理单篇文章"""
    filepath = os.path.join(BLOG_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fm, body = extract_frontmatter(content)
    if slug is None:
        slug = fm.get('slug', filename.replace('.md', ''))
    
    title = fm.get('title', slug)
    print(f"\n处理: {title}")
    print(f"  slug: {slug}")
    
    # 提取正文
    body_text = extract_body_text(body)
    print(f"  正文提取: {len(body_text)} 字")
    
    # 生成导读
    print("  生成导读文字...")
    intro_text = gen_intro_with_kimi(body_text, title)
    print(f"  导读({len(intro_text)}字): {intro_text[:50]}...")
    
    # 检查不是模板头
    bad_starts = ["欢迎收听", "本期播客", "大家好", "Hello everyone", "こんにちは"]
    for bad in bad_starts:
        if intro_text.startswith(bad):
            raise Exception(f"导读开头有模板头: {intro_text[:20]}")
    
    # TTS生成
    audio_path = os.path.join(AUDIO_DIR, f"{slug}.mp3")
    print(f"  TTS生成中...")
    size = minimax_tts(intro_text, audio_path)
    print(f"  ✅ 音频生成: {audio_path} ({size//1024}KB)")
    
    # 更新frontmatter
    update_frontmatter_audiourl(filepath, slug)
    
    return True


# 第一批：英文slug的5篇
BATCH_1 = [
    ("cattery-timeline.md", "cattery-timeline"),
    ("minimax-coding-plan-image-tts.md", "minimax-coding-plan-image-tts"),
    ("osaka-sakura-2026.md", "osaka-sakura-2026"),
    ("siberian-spring-care.md", "siberian-spring-care"),
]

# 第二批：中文slug（需要英文音频文件名）
BATCH_2 = [
    ("三岁儿子抓日本良心娃娃机大奖随便拿.md", "gashapon-jackpot"),
    ("周末带着孩子和老婆去日本游乐场-居然5点就下班被赶走了.md", "japan-amusement-park-weekend"),
    ("在日本大阪遛娃好去处-高山牧场--这里可以骑马放羊喂各种小动物-还有迷你猪超级好玩.md", "osaka-takayama-ranch"),
    ("大阪最推荐的家庭日式韩国烤肉-じゅうじゅうカルビ.md", "osaka-juju-kalbi"),
    ("带女儿来日本山顶农场体验生活-捡鸡蛋-摘蔬菜-泡温泉.md", "japan-mountain-farm-daughter"),
    ("带孩子去日本大阪海底捞-仿佛回到了中国.md", "osaka-haidilao-kids"),
    ("日本byd-元plus-atto3第一次高速桩充电-想详细了解日本比亚迪充电的可以评论留言人多我就做期长视频.md", "japan-byd-highway-charging"),
    ("日本买-开比亚迪-提车三天聊聊缺点-byd-atto3.md", "japan-byd-atto3-review"),
]


if __name__ == "__main__":
    batch = sys.argv[1] if len(sys.argv) > 1 else "1"
    articles = BATCH_1 if batch == "1" else BATCH_2
    
    os.makedirs(AUDIO_DIR, exist_ok=True)
    
    success = 0
    for filename, slug in articles:
        try:
            process_article(filename, slug)
            success += 1
            time.sleep(2)  # 避免频率限制
        except Exception as e:
            print(f"  ❌ 失败: {e}")
    
    print(f"\n完成: {success}/{len(articles)} 篇")
