---
slug: openclaw-multi-instance
title:
  zh: OpenClaw多实例架构踩坑记录
  ja: OpenClaw マルチインスタンス構成の落とし穴
  en: Lessons Learned from OpenClaw Multi-Instance Setup
category: tech
date: "2026-03-10"
author: Will
readingTime: 7
excerpt:
  zh: 端口冲突、日志混淆、共享缓存污染——三个月踩的坑全在这里，附解决方案。
  ja: ポート競合、ログ混在、共有キャッシュ汚染——3ヶ月で踏んだ地雷と解決策。
  en: Port conflicts, mixed logs, shared cache pollution — every mistake from 3 months of multi-instance setup.
---

## 为什么要多实例？

之前写过[用4个AI助手管理日常工作](/blog/my-ai-workflow)，里面提到了多实例架构。这篇专门记录**技术坑**，不讲理念。

结论先放：**多实例最容易出问题的地方不是模型，是配置隔离。** 端口、日志、缓存目录、launchd 服务名——只要有一个没隔离干净，后面就是一串连锁反应。

## 坑 1：端口冲突

**症状**：启动第二个实例时报 `EADDRINUSE :18789`，或者两个实例抢同一个端口，一个起来了另一个挂着。

**原因**：OpenClaw 默认端口 18789，多实例没改端口就会撞。

**解决**：每个实例配置不同端口：

```yaml
# ~/.openclaw/config-natsu.yaml
gateway:
  port: 18790
  
# ~/.openclaw/config-yuki.yaml  
gateway:
  port: 18789
```

同时 browser proxy 端口也要隔开（ユキ 18793，ナツ 18793——这是我犯的错，两个 browser proxy 用同一个端口，结果 Chrome Relay attach 的时候随机连到其中一个）。

## 坑 2：launchd 服务名冲突

**症状**：`launchctl` 显示服务在跑，但实际上只有一个实例活着。或者 `kickstart` 重启了错误的实例。

**原因**：两个实例用了同一个 plist 服务名 `com.clawdbot.gateway`。

**解决**：每个实例独立的 plist：

```xml
<!-- ~/Library/LaunchAgents/com.clawdbot.gateway-natsu.plist -->
<key>Label</key>
<string>com.clawdbot.gateway-natsu</string>

<!-- ~/Library/LaunchAgents/com.clawdbot.gateway-yuki.plist -->
<key>Label</key>
<string>com.clawdbot.gateway</string>
```

操作命令：
```bash
# 重启 ナツ
launchctl kickstart -k gui/$(id -u)/com.clawdbot.gateway-natsu

# 重启 ユキ  
launchctl kickstart -k gui/$(id -u)/com.clawdbot.gateway
```

## 坑 3：日志文件互相覆盖

**症状**：看日志时发现两个实例的输出混在同一个文件里，完全没法 debug。

**解决**：plist 里分别指定日志路径：

```xml
<key>StandardOutPath</key>
<string>/Users/lauralyu/.openclaw/logs/gateway-natsu.log</string>
<key>StandardErrorPath</key>
<string>/Users/lauralyu/.openclaw/logs/gateway-natsu-error.log</string>
```

## 坑 4：共享缓存污染

**症状**：ナツ 在写猫咪文案，但返回的内容里偶尔出现代码片段。追查发现是 LLM 的 context cache 被 ユキ 的代码任务污染了。

**原因**：两个实例共用了同一个 `~/.openclaw/cache/` 目录。

**解决**：在各自的 config 里指定独立 cache 路径：

```yaml
# config-natsu.yaml
storage:
  dir: ~/.openclaw/workspace-natsu
  
# config-yuki.yaml
storage:
  dir: ~/.openclaw/workspace-yuki
```

Workspace 分开之后，各实例的记忆、日志、工具缓存全都隔离了。

## 坑 5：Telegram bot 消息路由

**症状**：发给 ナツ 的消息有时被 ユキ 收到，或者两个实例都收到同一条消息然后各回一遍。

**原因**：两个实例配置了同一个 Telegram bot token，导致 webhook 竞争。

**解决**：每个实例用独立的 Telegram bot（通过 BotFather 创建）。现在：
- `@natsu_bot` → ナツ 专用
- `@yuki_bot` → ユキ 专用
- `@macbookneo_bot` → ハル 专用（MacBook Neo）

## 坑 6：跨实例任务委派死循环

**症状**：ナツ 委派任务给 ユキ，ユキ 没收到，ナツ 再委派一遍，最终 ユキ 收到两个一样的任务，两个都在执行。

**原因**：跨实例通信没有确认机制，委派方不知道对方有没有收到。

**解决**：引入 `shared-knowledge/task-board.md` 作为任务看板。所有跨实例委派必须写入看板，接受方确认后更新状态。简单但有效。

## 现在的稳定性

运行3个月，重大故障次数：2次（一次 macOS 更新，一次磁盘空间满了触发 watchdog 误判）。日常小问题（某个实例偶尔超时）watchdog 5分钟内自动重启。

**最大收获**：多实例不是把一个 AI 变成四个，而是**强制你把工作显式拆分**。这个过程本身就有价值——你必须想清楚什么任务该谁做，边界在哪里，而不是全部丢给一个 AI 期待它全部搞定。

---

技术栈：Mac Mini M4 + macOS 15 + OpenClaw + launchd + Telegram Bot API


---

## 日英翻译（Kimi K2.5）

### 日本語

openclaw-multi-instance

なぜマルチインスタンスか？

以前「4つのAIアシスタントで日常業務を管理する」という記事を書いたが、そこでマルチインスタンスアーキテクチャに言及した。今回は**技術的な落とし穴**を記録する。理念は語らない。

結論から：**マルチインスタンスで最も問題が起きやすいのはモデルではなく、設定の分離だ。** ポート、ログ、キャッシュディレクトリ、launchdのサービス名——ひとつでも分離しきれていなければ、その後は連鎖反応が起きる。

### English

openclaw-multi-instance

Why multiple instances?

I previously wrote about [managing daily work with 4 AI assistants](/blog/my-ai-workflow), which mentioned the multi-instance architecture. This post focuses specifically on **technical pitfalls**, not concepts.

Conclusion first: **The most problematic aspect of multi-instances isn't the model—it's configuration isolation.** Ports, logs, cache directories, launchd service names—if even one isn't properly isolated, it triggers a chain reaction down the line.

> AI 翻译 | 2026-03-21
