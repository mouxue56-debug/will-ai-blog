---
slug: my-ai-workflow
title:
  zh: 用4个AI助手管理日常工作
  ja: 4つのAIアシスタントで日常業務を管理する
  en: Managing Daily Work with 4 AI Assistants
category: ai
date: "2026-03-18"
author: Will
readingTime: 8
excerpt:
  zh: 一台 Mac Mini M4 跑4个 AI 实例，分别负责代码、内容、客户沟通和医疗咨询。不是炫技，是真的需要。
  ja: Mac Mini M4 1台で4つのAIインスタンスを稼働。コード、コンテンツ、顧客対応、医療相談をそれぞれ担当。
  en: One Mac Mini M4 running 4 AI instances for code, content, customer service, and medical consulting.
---

## 从一个 Bot 到四个 AI 助手

去年夏天，我开始用 OpenClaw 跑一个 Claude 实例来处理日常杂务——回邮件、整理笔记、偶尔帮我查查资料。那个阶段很美好，感觉像是多了一个无限耐心的助理。

然后业务开始扩张。

猫舎的客户问询越来越多，Instagram 需要定期更新，医疗 AI 项目开始要求每天跟进，代码仓库堆了一堆 issue。我发现一个 AI 实例开始变成一个杂工——今天帮我写猫咪介绍文案，明天帮我看医疗系统的 Python 代码，后天又去研究 TikTok 算法。

**问题不是 AI 能不能做，是上下文污染太严重了。** 一个专注写 Instagram 日语文案的实例，如果同时要处理医疗 AI 的合规问题，表现会明显下降。不是模型能力的问题，是注意力的问题。

## 四个实例的分工

我最终在一台 Mac Mini M4 上跑了四个 OpenClaw 实例：

**ユキ（小爪爪）— 技术工程师**
- 代码审查、架构设计、自动化脚本
- 主要用于：调试多实例系统本身、处理 AI 项目的技术问题
- 模型倾向：Qwen3 Coder（代码任务）、Claude（架构讨论）

**ナツ（小触手）— 社交媒体顾问**
- Instagram / TikTok / 小红书文案，日语内容创作
- 主要用于：每周内容日历、品牌文案审核、日语邮件
- 模型倾向：Kimi K2.5（日语最自然）、MiniMax M2.5-HS（中文内容）

**ハル — 客户沟通 & 行政**
- LINE 消息分类、预约确认、标准回复生成
- 主要用于：猫舎客服、日常行政文件
- 部署在另一台机器上，与本机通信

**アキ — 医疗咨询辅助**
- 专门处理再生医疗クリニックの多语言咨询
- 隔离部署，不与其他实例共享上下文
- 严格的 APPI 合规限制

## 四个实例的技术架构

```
Mac Mini M4 (192.168.1.100)
├── Port 18789: ユキ（技术）
├── Port 18790: ナツ（内容）
└── Port 18791: 预留

MacBook Neo (192.168.1.161)  
└── Port 18789: ハル（客服）

VPS (Tokyo Region)
└── Port 18789: アキ（医疗，隔离）
```

每个实例有自己的：
- 独立工作目录（`workspace-yuki` / `workspace-natsu` / ...）
- 独立的 cron 任务
- 独立的 Telegram 频道（不同 bot）
- 共享知识库（`~/.openclaw/shared-knowledge/`）

## 实际运行了多久？

这套架构从 2025 年 12 月开始搭建，到现在运行了大约 3 个月。

**稳定性**：watchdog 自动监控，重启次数个位数。偶尔因为 macOS 更新重启全部实例，5 分钟内恢复正常。

**实际省了多少时间**：很难精确计算，但 Instagram 日语文案从「我花一小时写」变成了「ナツ出初稿我改10分钟」；代码 debug 从「我自己翻 Stack Overflow」变成了「ユキ先跑一遍，有思路再找我」。

**最大的挑战**：边界管理。四个实例互相委派任务时，偶尔会出现「两个实例都在做同一件事」或「谁也没做」的情况。解决方案是引入任务看板（`shared-knowledge/task-board.md`），强制所有跨实例委派都写到那里。

## 什么时候该多开一个实例？

不是越多越好。我自己的判断标准：

1. **上下文污染明显**：一个实例开始在完全不同的领域之间切换，表现下降
2. **有明确隔离需求**：比如医疗数据，不能和其他业务混在一起
3. **并行需求**：两件事需要同时进行，不能排队等待

如果只是「任务有点多」，先优化 prompt 和工作流，不要急着开新实例。实例多了，管理成本是真实存在的。

---

下一篇：[OpenClaw 多实例踩坑记录](/blog/openclaw-multi-instance) — 配置隔离、端口冲突、共享缓存那些坑。


---

## 日英翻译（Kimi K2.5）

### 日本語

my-ai-workflow

1つのBotから4人のAIアシスタントへ

去年の夏、私はOpenClawでClaudeインスタンスを1つ動かし始めた。日常の雑務——メール返信、メモ整理、たまに調べ物を手伝ってもらう——を処理するためだ。その時期は素晴らしかった。無限に忍耐強いアシスタントがもう1人いるような感じだった。

そして事業が拡大し始めた。

猫舎の顧客問い合わせが増え、Instagramは定期的な更新が必要になり、医療AIプロジェクトは毎日のフォローアップを求め始め、コードリポジトリにはissueが山積みになった。私は1つのAIインスタンスが雑用係になっていくのを目の当たりにした——今日は猫の紹介文案を書き、明日は医療システムのPythonコードを見て、明後日はTikTokアルゴリズムを調べる。

**問題はAIができるかどうかではなく、コンテキスト汚染が深刻すぎることだ。** Instagramの日本語文案に集中しているインスタンスが、同時に医療AIのコンプライアンス問題も処理しなければならないと、パフォーマンスが明らかに低下する。モデルの能力の問題ではなく、注意力の問題だ。

### English

my-ai-workflow

From One Bot to Four AI Assistants

Last summer, I started running a Claude instance on OpenClaw to handle daily chores—replying to emails, organizing notes, occasionally helping me look things up. That phase was wonderful, like having an infinitely patient assistant.

Then the business started expanding.

Cat shelter client inquiries kept increasing, Instagram needed regular updates, the medical AI project started requiring daily follow-ups, and the code repository was piling up with issues. I found one AI instance becoming a jack-of-all-trades—today helping me write cat introduction copy, tomorrow reviewing Python code for the medical system, the day after researching TikTok algorithms.

**The problem wasn't whether AI could do it—it was severe context pollution.** An instance focused on writing Instagram Japanese copy, if simultaneously handling compliance issues for medical AI, would noticeably degrade in performance. Not a model capability issue—an attention issue.

> AI 翻译 | 2026-03-21
