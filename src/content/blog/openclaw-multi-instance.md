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

**具体做法**：
- 主实例：gateway 端口 18789，browser proxy 端口 9222
- 副实例：gateway 端口 18790，browser proxy 端口 9223
- 在配置文件中明确指定，不要依赖默认值

## 坑 2：launchd 服务名冲突

**症状**：`launchctl` 显示服务在跑，但实际上只有一个实例活着。或者 `kickstart` 重启了错误的实例。

**原因**：两个实例用了同一个 plist 服务名。

**解决**：每个实例用独立的 plist 文件和服务名，例如：
- `com.clawdbot.gateway`（主实例）
- `com.clawdbot.gateway-natsu`（副实例）

**注意**：plist 文件里的 `Label` 字段必须唯一，且要和文件名一致。否则 launchctl 会混乱。

## 坑 3：日志混在一起

**症状**：看日志时发现两个实例的输出混在一起，分不清哪条是谁的。

**原因**：没有分别指定日志文件路径。

**解决**：每个实例的配置文件里单独指定 `logs.path`，例如：
- 主实例：`~/.openclaw/logs/`
- 副实例：`~/.openclaw/logs-natsu/`

建议日志文件名也加上实例标识，比如 `gateway-natsu.log`，方便快速定位问题。

## 坑 4：共享缓存污染

**症状**：一个实例的缓存占满了磁盘，或者缓存太大拖慢了另一个实例的速度。更严重的是，两个实例可能读写同一个缓存文件，导致数据混乱。

**原因**：多个实例共享同一个缓存目录。

**解决**：每个实例的 `cache.path` 也要隔离。或者定期清理缓存。

**推荐做法**：
```
~/.openclaw/cache/          # 主实例
~/.openclaw/cache-natsu/    # 副实例
```

另外，建议设置缓存大小上限，避免无限制增长。

## 坑 5：网络访问权限

**症状**：一个实例能联网，另一个不行。或者某些 API 调用在一个实例上成功，在另一个上失败。

**原因**：不同的 launchd 运行环境变量不同。比如代理设置、DNS 配置、证书路径等。

**解决**：确保所有实例的 `EnvironmentFile` 路径一致，或者在 plist 里显式声明需要的变量。

**检查清单**：
- HTTP_PROXY / HTTPS_PROXY
- SSL_CERT_FILE
- NODE_EXTRA_CA_CERTS
- 自定义的 API Key 路径

## 坑 6：浏览器自动化混乱

**症状**：Chrome Relay 连接到了错误的实例，或者浏览器操作在两个实例之间"串线"。

**原因**：browser proxy 端口冲突，或者 Chrome 的 remote debugging 端口被多个实例同时连接。

**解决**：
1. 每个实例使用独立的 browser proxy 端口
2. 每个实例启动独立的 Chrome 实例（使用不同的 user-data-dir）
3. 在配置中明确指定 `browser.remoteDebuggingPort`

## 坑 7：内存和 CPU 争抢

**症状**：多个实例同时运行时，系统卡顿，甚至触发 OOM Killer。

**原因**：每个 OpenClaw 实例都会启动多个子进程（gateway、browser proxy、各种工具进程），多个实例叠加后资源消耗很大。

**解决**：
- 监控每个实例的资源占用
- 必要时限制单个实例的并发任务数
- 考虑在不同机器上部署实例，而不是全部堆在一台机器上

## 总结：配置隔离是核心

多实例部署的本质是**资源隔离**。只要记住这一点，80% 的问题都能避免：

| 资源类型 | 隔离方案 |
|---------|---------|
| 端口 | 每个实例独立端口段 |
| 日志 | 独立日志目录和文件名 |
| 缓存 | 独立缓存目录 |
| 服务名 | 唯一 launchd Label |
| 浏览器 | 独立 Chrome 实例和数据目录 |
| 环境变量 | 显式声明，不依赖全局配置 |

建议多实例部署前先画一张配置表，把每个实例的关键参数都列出来，避免遗漏。

---

> ⚠️ **配置细节已脱敏**：本文仅展示问题思路，不包含任何具体端口号、IP 地址或配置文件路径。
