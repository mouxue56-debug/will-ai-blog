---
slug: minimax-coding-plan-image-tts
title:
  zh: MiniMax Coding Plan 里藏着图片和语音——我测了一整天
  ja: MiniMax Coding Planに画像・音声生成が隠れていた話
  en: MiniMax Coding Plan Has Image & TTS Built In — My Full Test
category: "learning"
date: "2026-03-23"
author: Will
readingTime: 6
excerpt:
  zh: 包月API套餐里除了LLM，还有图片生成和语音合成——测了一整天，踩了几个坑，整理成这篇。
  ja: 月額APIプランにLLMだけでなく、画像生成と音声合成が含まれていた話。丸一日テストしてわかったことをまとめた。
  en: The monthly API plan includes image generation and TTS beyond LLM — I tested it all day and hit a few gotchas.
tags: ["MiniMax", "API", "TTS", "图片生成", "Coding Plan"]
willComment:
  zh: MiniMax Coding Plan 里藏着图片和语音——我测了一整天，踩了几个坑，整理成这篇学习笔记。
  ja: MiniMax Coding Planに画像・音声生成が隠れていた話。丸一日テストして分かったことをまとめました。
  en: MiniMax Coding Plan Has Image & TTS Built In — My Full Test
audioUrl: minimax-coding-plan-image-tts.mp3
coverImage: "/covers/minimax-coding-plan-image-tts.jpg"
audioUrl: "/audio/minimax-coding-plan-image-tts.mp3"
---

# MiniMax Coding Plan 里藏着图片和语音——我测了一整天

说实话，我用 MiniMax 的 Coding Plan 已经有一段时间了，主要用来跑他们的 `MiniMax-M2.5-highspeed` 做文本生成。但前几天我突然意识到——等等，这个包月套餐里好像不只是 LLM？图片和语音功能是不是也能用？

于是花了一整天，把能测的都测了一遍。结果发现，这套餐里确实藏着不少东西，但也有几个坑，不踩一遍根本不知道。

## 先说说能用的和不能用的

Coding Plan 套餐里实际能调用的能力清单如下：

- **LLM 对话** ✅ `MiniMax-M2.5-highspeed`，主力模型，这个一直在用
- **文生图 image-01** ✅ 效果不错，日系插画风很稳定
- **TTS 语音合成** ✅ `speech-02` 标准版可用
- **TTS HD（speech-02-hd）** ❌ 套餐不支持，报错 2061
- **视频生成 Hailuo** ❌ 需要 Max 档
- **音乐生成 Music-2.5** ❌ 需要 Max 档

所以图片和语音是能用的，但高清语音、视频、音乐这些得加钱上 Max 档。

## 踩坑第一弹：域名有两个 i

这个真的挺坑的。MiniMax 的 API 端点是 `api.minimaxi.com`，**两个 i**。不是 `minimax.io`，也不是 `minimax.chat`。写错就 404，我一开始完全没注意，调试了半天才发现是域名拼错了……

## 图片生成：image-01 实测

图片生成的调用方式很简单：

```python
import requests, base64

resp = requests.post(
    "https://api.minimaxi.com/v1/image_generation",
    headers={"Authorization": "Bearer sk-cp-xxx", "Content-Type": "application/json"},
    json={
        "model": "image-01",
        "prompt": "Japanese anime illustration, ...",
        "aspect_ratio": "16:9",  # 或 1:1 / 9:16
        "response_format": "base64",
        "n": 1
    },
    timeout=90
)
img_bytes = base64.b64decode(resp.json()["data"]["image_base64"][0])
with open("output.jpg", "wb") as f:
    f.write(img_bytes)
```

响应是 base64，直接解码写文件就行。我测下来，image-01 的日系插画风格很稳定，给我博客生成了 6 张页面插图，效果都不错。支持 16:9、1:1、9:16 三种比例。

不过要注意，**中文文字必定乱码**，这是扩散模型的通病，别想着在图里加中文了。

分享一个我亲测有效的 Prompt 模板：

- **统一基底**：`Japanese anime illustration, friendly young Asian man, Osaka apartment at night, warm pastel colors, soft lighting, no text`
- **1:1 肖像**：在基底上加 `smiling warmly, one tiny cute glowing fox spirit companion, no horror elements`
- **16:9 banner**：在基底上加具体场景描述，加 `16:9`

## TTS 语音合成：有个大坑

语音合成的调用代码：

```python
import requests, binascii

resp = requests.post(
    "https://api.minimaxi.com/v1/t2a_v2",
    headers={"Authorization": "Bearer sk-cp-xxx", "Content-Type": "application/json"},
    json={
        "model": "speech-02",
        "text": "想说的话",
        "voice_setting": {
            "voice_id": "Japanese_KindLady",
            "speed": 1.0,
            "vol": 1.0,
            "pitch": 0
        },
        "audio_setting": {
            "format": "mp3",
            "sample_rate": 32000,
            "bitrate": 128000,
            "channel": 1
        }
    },
    timeout=60
)
# 注意：响应是 hex 字符串，不是 base64！
audio_bytes = binascii.unhexlify(resp.json()["data"]["audio"])
with open("output.mp3", "wb") as f:
    f.write(audio_bytes)
```

**重点来了**：图片返回的是 base64，但 TTS 返回的 `data.audio` 是 **hex 字符串**！要用 `binascii.unhexlify()` 转，我第一次惯性思维用 base64 解码，直接报错，排查了好一会儿。

## 音色选择

我测了好几个音色，最后选定 `Japanese_KindLady`（JP 亲切女性），中文和日语都自然，没有明显口音问题。适合猫舍 AI 助理、直播配音、网站语音导览这类场景。备选是 `tianxin_xiaoling`（甜心小玲），效果也不错。

## 我的工作流

测完之后，我把这两个能力整合进了我的工作流：

**图片流**：写 Prompt → image-01 生成 → base64 解码写 jpg → 上传 Supabase → Next.js 显示

**TTS 流**：准备文案 → speech-02 生成 → hex 解码写 mp3 → 上传 Supabase → 网站播放

---

## Will 说

测了一整天，最大的感受是：MiniMax 的 Coding Plan 性价比确实可以。一个月几十块，LLM + 图片 + 语音都能用，虽然高清语音和视频得加钱，但对大部分项目来说，标准版已经够用了。

不过文档里不会告诉你这些细节——比如域名有两个 i、TTS 是 hex 不是 base64——这些坑得自己踩一遍才知道。写这篇也是希望帮大家省点时间，少走弯路。

如果你也在用 Coding Plan，不妨试试图片和语音功能，说不定能解锁一些新玩法。
