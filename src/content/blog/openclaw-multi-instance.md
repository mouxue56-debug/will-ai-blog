---
slug: openclaw-multi-instance
title:
  zh: OpenClaw多实例架构踩坑记录
  ja: OpenClaw マルチインスタンス構成の落とし穴
  en: Lessons Learned from OpenClaw Multi-Instance Setup
category: tech
date: "2026-03-10"
author: Will
locale: zh
coverImage: /images/blog/multi-instance.jpg
excerpt:
  zh: 在一台 Mac Mini 上跑多个 OpenClaw 实例，听起来简单，实际上有不少陷阱。端口冲突、资源竞争、日志混淆……
  ja: 1台の Mac Mini で複数の OpenClaw インスタンスを実行するのは簡単に見えて落とし穴が多い。
  en: Running multiple OpenClaw instances on one Mac Mini sounds simple but has many pitfalls.
readingTime: 7
---

## 为什么要多实例？

之前写过[用4个AI助手管理日常工作](/blog/my-ai-workflow)，里面提到了多实例的好处。这篇来聊聊技术细节——主要是踩过的坑。

### 架构概览

```
Mac Mini M4 (32GB RAM)
├── ユキ (Gateway :18789) — 技术顾问
├── ナツ (Gateway :18790) — SNS顾问
├── Cloudflared Tunnel — 外部访问
└── Watchdog — 健康监控
```

每个实例都是独立的 OpenClaw Gateway 进程，通过 macOS 的 `launchd` 管理。

### 坑 #1：端口冲突

最基础的问题。两个 Gateway 默认都监听 18789 端口，第二个实例启动直接报错。

解决方案很简单——在第二个实例的配置文件里改端口：

```yaml
gateway:
  bind: "0.0.0.0:18790"
```

但连带的问题是：Telegram Bot 的 webhook 地址也要相应调整，Cloudflare Tunnel 的路由规则要改，浏览器自动化的 CDP 端口也不能冲突。一个端口号改了，要改五六个地方。

### 坑 #2：workspace 隔离

两个实例如果用同一个 workspace 目录，会互相覆盖文件。特别是 `MEMORY.md` 和 daily notes，两个实例同时写入会导致内容丢失。

最终方案是完全隔离 workspace：

```
~/.openclaw/workspace-yuki/   ← ユキ的工作区
~/.openclaw/workspace-natsu/  ← ナツ的工作区
~/.openclaw/shared-knowledge/ ← 共享知识库（只读同步）
```

共享知识库用一个简单的 Python 脚本做定时同步，每天凌晨 4:15 运行。写入有锁机制——先写临时文件，再原子性重命名。

### 坑 #3：内存管理

M4 Mac Mini 有 32GB 内存，听起来很充裕。但实际运行起来：

- 每个 OpenClaw Gateway：~200MB
- Node.js 进程基础开销：~150MB × 2
- 浏览器自动化（Playwright）：~500MB-1GB
- macOS 系统：~4GB
- 其他应用：~2GB

加起来轻松占用 8-10GB。如果两个实例同时做浏览器操作，内存直接飙到 15GB+。

解决方案：
1. 浏览器操作做排队，不同时启动两个浏览器实例
2. 定时清理 Playwright 的缓存
3. 设置内存告警，超过 80% 时暂停非关键任务

### 坑 #4：日志混淆

两个实例的日志如果写到同一个文件，排查问题时根本分不清是谁的输出。

```
~/.openclaw/logs/gateway.log       ← ユキ
~/.openclaw/logs/gateway-natsu.log ← ナツ
```

而且 launchd 的 `StandardOutPath` 和 `StandardErrorPath` 也要分开设。之前 stderr 混在一起，一个实例报错以为是另一个的，浪费了半天排查。

### 坑 #5：Telegram Bot 消息路由

两个实例各自有一个 Telegram Bot。但 Will 经常发错窗口——本来要跟ユキ说的技术问题发给了ナツ，ナツ只好回"这个你问ユキ吧"。

后来做了一个小改进：在每个 Bot 的欢迎消息里明确标注角色和职责，减少误发的概率。

### 坑 #6：定时任务冲突

两个实例的 cron/heartbeat 如果设在同一时间，会同时抢占 CPU 和网络资源。

解决方案：错开 heartbeat 时间。ユキ每小时的 00 分和 30 分，ナツ每小时的 15 分和 45 分。

### 稳定运行的关键

跑了三个月，总结几条经验：

1. **每个实例完全独立** — 配置、workspace、日志、端口，全部隔离
2. **资源竞争要提前考虑** — 内存、CPU、网络带宽都可能成为瓶颈
3. **watchdog 不是可选的** — 实例会崩溃，这是事实，要有自动恢复机制
4. **监控先于功能** — 先确保能看到所有实例的状态，再加新功能
5. **文档化一切** — 两个月后你不会记得为什么某个端口号是 18790

这套架构不完美，但够用。目前正在考虑用 Docker 来简化部署和隔离，但 macOS 上跑 Docker 的性能损耗还需要评估。
