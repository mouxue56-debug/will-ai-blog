---
slug: my-ai-workflow
title:
  zh: 用4个AI助手管理日常工作
  ja: 4つのAIアシスタントで日常業務を管理
  en: Managing Daily Work with 4 AI Assistants
category: ai
date: "2026-03-18"
author: Will
locale: zh
coverImage: /images/blog/ai-workflow.jpg
excerpt:
  zh: 从单实例到四实例协作，我的AI工作流经历了三个阶段的演变。分享真实的配置细节和踩坑经验。
  ja: シングルインスタンスから4インスタンス協調へ、AI ワークフローの進化を共有します。
  en: From single instance to four-instance collaboration, sharing my real AI workflow evolution.
readingTime: 8
---

## 从一个 Bot 到四个 AI 助手

去年夏天，我开始用 OpenClaw 跑一个 Claude 实例来处理日常杂事——回邮件、查资料、整理文档。说实话，一开始觉得有点 overkill，一个聊天机器人能干嘛？

结果三个月后，我已经离不开它了。

### 第一阶段：单实例试水

最初就是一台 Mac Mini 上跑一个 OpenClaw Gateway，接了 Telegram 做交互界面。我给它取名ユキ（小爪爪），主要处理：

- 技术文档整理和翻译
- 代码审查和 PR 评论
- 日程提醒和待办管理

效果出奇地好。ユキ帮我把每天处理邮件的时间从 40 分钟压缩到 10 分钟——它会先通读所有邮件，按紧急程度排序，草拟回复让我确认。

### 第二阶段：双实例分工

随着猫舎业务增长，SNS 运营的工作量暴增。Instagram 要每天发帖、LINE 客户消息要及时回复、小红书要维护中国客户群。于是我启动了第二个实例——ナツ（小触手），专注社交媒体。

分工很明确：
- **ユキ**：技术顾问，代码/工程/自动化
- **ナツ**：社交媒体顾问，SNS/内容/品牌

两个实例每天凌晨 4:15 自动同步知识库，共享一个 `shared-knowledge/` 目录。这样ナツ写猫咪科普内容时，可以引用ユキ整理的繁育数据；ユキ做网站开发时，也知道ナツ那边的品牌规范。

### 第三阶段：四实例架构

后来又加了两个：一个跑在 MacBook 上的本地模型实例（用 Ollama 跑 Qwen3），和一个负责监控的 watchdog 实例。

现在的日常是这样的：

**早上 8:00** — 起床看 Telegram，四个 Bot 的晨报已经准备好了。ユキ总结了昨晚的 GitHub 活动，ナツ列出了今天的 SNS 发布计划，watchdog 报告所有服务运行正常。

**上午** — 和ユキ讨论技术方案，让ナツ准备 Instagram 帖子的文案。两边并行，互不干扰。

**下午** — 处理猫舎客户咨询。ナツ会预先分析 LINE 消息，草拟日语回复，我审核后发出。节省了大量时间。

**晚上** — 让ユキ跑一些耗时任务（数据分析、批量处理），第二天早上看结果。

### 踩过的坑

1. **千万别让 AI 自作主张发消息** — 有一次ナツ自动回复了一个客户咨询，虽然内容没问题，但客户发现是 AI 回的，很不高兴。现在所有对外消息必须人工确认。

2. **共享知识库要做冲突处理** — 两个实例同时写一个文件会出问题，后来加了简单的锁机制。

3. **成本控制** — Claude API 用多了费用会飙升，后来把简单任务迁移到本地模型，复杂任务才用 Claude。月费从 200 刀降到了 80 刀左右。

4. **watchdog 很重要** — 实例偶尔会卡住或崩溃，没有 watchdog 的时候经常早上起来发现某个实例挂了好几个小时。

### 总结

AI 助手不是万能的，但用对了确实能大幅提升效率。关键是：

- 明确分工，不要什么都丢给一个实例
- 建立审核机制，特别是对外通信
- 做好成本监控
- 有容错和恢复机制

这套架构已经稳定运行三个月了。每周大概节省 15-20 小时的重复性工作。

### 实际配置参考

给想尝试类似架构的朋友一个参考。我的 launchd 服务配置大概长这样：

```xml
<!-- com.clawdbot.gateway-natsu.plist -->
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.clawdbot.gateway-natsu</string>
  <key>ProgramArguments</key>
  <array>
    <string>/opt/homebrew/bin/node</string>
    <string>/opt/homebrew/lib/node_modules/openclaw/dist/gateway.js</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>OPENCLAW_WORKSPACE</key>
    <string>workspace-natsu</string>
    <key>OPENCLAW_PORT</key>
    <string>18790</string>
  </dict>
  <key>KeepAlive</key>
  <true/>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
```

每个实例的知识同步脚本也很简单：

```python
# sync-knowledge.py — 每天 04:15 运行
import shutil, os, fcntl
SHARED = os.path.expanduser("~/.openclaw/shared-knowledge/")
LOCK = SHARED + ".lock"

with open(LOCK, 'w') as f:
    fcntl.flock(f, fcntl.LOCK_EX)
    # 合并两个实例的学习笔记
    merge_notes("workspace-yuki", "workspace-natsu", SHARED)
    fcntl.flock(f, fcntl.LOCK_UN)
```

下一步计划是引入语音交互——开车的时候也能和 AI 助手沟通就方便多了。实际上 Whisper 本地识别已经跑通了（详见时间线），就差把语音输入和 Telegram Bot 对接起来。
