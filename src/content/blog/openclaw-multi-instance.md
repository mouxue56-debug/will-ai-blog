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

**症状**：启动第二个实例时报 `EADDRINUSE` 错误，或者两个实例抢同一个端口，一个起来了另一个挂着。

**原因**：OpenClaw 默认端口是固定的，多实例没改端口就会冲突。

**解决**：每个实例配置不同端口，并且 browser proxy 端口也要错开，避免 Chrome Relay attach 时随机连到错误的实例。

## 坑 2：launchd 服务名冲突

**症状**：`launchctl` 显示服务在跑，但实际上只有一个实例活着。或者 `kickstart` 重启了错误的实例。

**原因**：两个实例用了同一个 plist 服务名。

**解决**：每个实例用独立的 plist 文件和服务名，例如：
- `com.clawdbot.gateway`（主实例）
- `com.clawdbot.gateway-natsu`（副实例）

## 坑 3：日志混在一起

**症状**：看日志时发现两个实例的输出混在一起，分不清哪条是谁的。

**原因**：没有分别指定日志文件路径。

**解决**：每个实例的配置文件里单独指定 `logs.path`，例如：
- 主实例：`~/.openclaw/logs/`
- 副实例：`~/.openclaw/logs-natsu/`

## 坑 4：共享缓存污染

**症状**：一个实例的缓存占满了磁盘，或者缓存太大拖慢了另一个实例的速度。

**原因**：多个实例共享同一个缓存目录。

**解决**：每个实例的 `cache.path` 也要隔离。或者定期清理缓存。

## 坑 5：网络访问权限

**症状**：一个实例能联网，另一个不行。

**原因**：不同的 launchd 运行环境变量不同。

**解决**：确保所有实例的 `EnvironmentFile` 路径一致，或者在 plist 里显式声明需要的变量。

---

> ⚠️ **配置细节已脱敏**：本文仅展示问题思路，不包含任何具体端口号、IP 地址或配置文件路径。
