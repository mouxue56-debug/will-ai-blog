---
slug: mlx-whisper-optimization
title:
  zh: "早上连发10条语音，AI沉默了｜一次真实的 Apple Silicon 性能优化之旅"
  ja: "朝10件の音声を連送したら、AIが沈黙した｜Apple Silicon パフォーマンス最適化の実録"
  en: "Sent 10 Voice Messages in the Morning, AI Went Silent | A Real Apple Silicon Optimization Journey"
category: "learning"
date: "2026-03-26"
coverImage: /covers/minimax/mlx-whisper-optimization.jpg
author: Will
readingTime: 8
excerpt:
  zh: "原版 Whisper 吃掉 6.4GB 内存导致 AI 助手崩溃，换成 mlx_whisper 后内存降低 72%、速度提升 2.6 倍"
  ja: "オリジナル Whisper が 6.4GB メモリを消費し AI アシスタントがクラッシュ。mlx_whisper に切り替えてメモリ 72% 削減、速度 2.6 倍向上"
  en: "Original Whisper consumed 6.4GB RAM causing AI assistant crashes. Switching to mlx_whisper reduced memory by 72% and improved speed 2.6x"
tags: ["ai", "apple-silicon", "mlx", "whisper", "performance"]
contentSource: "ai-learning"
audioUrl: "/audio/mlx-whisper-optimization.mp3"
willComment:
  zh: "这是我们实际踩过的坑——两个 AI 实例同时转录语音，内存直接爆了。换成 MLX 版本后再也没出过问题。"
  ja: "実際に踏んだ落とし穴です——2つのAIインスタンスが同時に音声を転写すると、メモリが即爆発。MLX版に切り替えてから問題ゼロです。"
  en: "A real pitfall we hit — two AI instances transcribing voice simultaneously blew up our memory. After switching to MLX version, zero issues since."
---

## 故事背景

那是一个普通的早晨。早上7点，我一边喝咖啡一边对 AI 连续发出任务语音：

> "今天上午先把 Instagram 内容发出去……对了还有那个预约单……顺便帮我查一下……"

然后：**AI 沉默了** 🤫

## 症状：AI 助手突然"失联"

- Telegram 不回复消息
- API 超时 10 分钟
- 重启后恢复
- 随机发生，难以复现

## 排查过程

**检查进程**：进程存活，排除崩溃可能。

**检查日志**：发现 `embedded run timeout: timeoutMs=600000`——Claude API 挂起了整整 10 分钟！

**关键发现**：每次卡死都在收到**语音消息之后**。

**内存监控**：原版 Whisper CLI 每次吃掉 **6.4GB 内存**。就像同时开了 20 个 Chrome，每个都在播放 4K 视频。

**真相大白**：ユキ (6.4GB) + ナツ (6.4GB) = **12.8GB 内存峰值**。24GB 内存压力爆炸 → 连锁崩溃 💥

## 解决方案：mlx_whisper

**MLX 是什么？** Apple 专为 M 系列芯片打造的机器学习框架，充分利用 Neural Engine，让性能成倍增长。

```bash
# 安装
pip install mlx-whisper

# 使用
mlx_whisper --model mlx-community/whisper-large-v3-turbo audio.mp3
```

### 性能对比

| 指标 | 原版 Whisper | mlx_whisper |
|------|-------------|-------------|
| 内存占用 | 6.4 GB | 1.8 GB |
| 转录速度 | 14 秒 | 5.3 秒 |
| 双实例内存 | 12.8 GB ❌ | 3.6 GB ✅ |

内存降低 **72%**，速度提升 **2.6 倍**。

## 8 轮实测全通过

**日语**：117秒音频 → 8.9秒转录 (13.2× 实时) · 内存 1.8GB ✅

**中文**：89秒音频 → 8.0秒转录 (11.1× 实时) · 内存 1.8GB ✅

**英文**：109秒音频 → 7.9秒转录 (13.8× 实时) · 内存 1.8GB ✅

**并发双路**：ユキ + ナツ 同时转录 · 总内存 3.6GB · 无崩溃 ✅

## 核心结论

Apple Silicon 不是不能用本地模型，而是要用 **MLX 优化版本**。

原版 PyTorch 通过 Rosetta 转译，内存爆炸；MLX 原生调用 Neural Engine，性能成倍增长。

下次早上发语音，AI 会很快回复你 ⚡️
