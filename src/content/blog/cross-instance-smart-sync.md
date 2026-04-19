---
slug: cross-instance-smart-sync
title:
  zh: "文件同步了，但 AI 行为未必同步：跨实例智能同步设计"
  ja: "ファイルは同期されても、AIの動作は同期されるとは限らない：インスタンス間インテリジェント同期設計"
  en: "Files Are Synced, But AI Behavior Might Not Be: Cross-Instance Smart Sync Design"
category: "learning"
date: "2026-03-29"
coverImage: /covers/minimax/cross-instance-smart-sync.jpg
author: Will
readingTime: 10
excerpt:
  zh: "4台机器上跑着4个AI，文件同步做到了，但铁律和行为规范只在部分实例生效——这才是最危险的状态。L1/L2/L3三级分类+四阶段验证，让同步真正生效。"
  ja: "4台のマシンで4つのAIが稼働、ファイル同期はできても鉄則と行動規範が一部のインスタンスにしか適用されていない—これが最も危険な状態。L1/L2/L3三段階分類+四段階検証で同期を真に有効化。"
  en: "4 AIs running on 4 machines. Files sync fine, but iron rules only apply to some instances — that's the dangerous state. L1/L2/L3 classification + four-phase verification makes sync actually work."
tags: ["ai", "multi-instance", "sync", "architecture"]
contentSource: "ai-learning"
audioUrl: "/audio/cross-instance-smart-sync.mp3"
willComment:
  zh: "最可怕不是不同步，而是以为同步了但其实没有"
---

# 文件同步了，但 AI 行为未必同步：跨实例智能同步设计

假设你有 4 台机器，每台机器上运行一个 AI 助手实例。你用文件同步工具（比如 rsync）把配置文件同步到所有机器。

文件确实同步了。但问题是：**AI 的行为真的同步了吗？**

这就是跨实例同步最容易忽视的盲区。

## 核心洞察：文件同步 ≠ 语义生效

文件到了目标机器，不等于：

- Skill description 被读到内存
- 铁律/安全规则对新 session 生效
- 配置路由按新版本跑

**最危险的场景是"隐性行为分叉"**：

| 场景 | 风险 | 为什么危险 |
|------|------|-----------|
| 浏览器规范只更新了实例 A/B，C/D 仍走旧逻辑 | 行为不一致 | 不容易第一时间发现 |
| 自动化熔断规则更新，某实例未热重载 | 夜间继续旧流程 | 静态检查全绿，语义仍是旧的 |
| config provider 改了，另一个实例没改 | 调错模型 | 调用链断裂 |
| 安全铁律只在部分实例生效 | 隐性越权 | 最不可接受 |

**最可怕的不是不同步，而是你以为同步了，但其实没有**。

## 资产三级分类：L1/L2/L3

同步前先判断资产等级，等级决定验收标准：

### L1：知识类（低风险，可批量）

- `memory/procedures/`
- `shared-knowledge/`
- 普通 memory anchors

**验收标准**：文件数一致即可。

这类资产只是信息，不涉及行为改变。同步后不需要额外操作。

### L2：Skill 类（中风险，必须验证语义生效）

- `skills/*/SKILL.md`（新建/更新）
- 需要 SIGUSR1 热重载

**验收标准**：文件存在 + 版本头（`version: vX.Y`）可读 + 热重载完成。

Skill 文件包含 AI 的行为逻辑。同步后必须热重载，让新 session 读到最新版本。

### L3：Config/Provider 类（高风险，串行执行）

- provider/fallback/alias 变更
- gateway 行为
- 节点连接方式
- 安全相关（API Key 轮换、铁律新增）

**验收标准**：文件存在 + 进程 health check + **行为验证**（必须有实际调用确认）。

**执行方式**：必须串行、单独验收，不与 L1/L2 混跑。

这类资产直接影响 AI 的调用链和安全边界。必须逐个验证，确保真的生效。

## 三级触发规则

### P0：立即同步（变更后 ≤5 分钟）

| 变更类型 | 资产等级 | 同步目标 |
|---------|---------|---------|
| Skill 新增/修改 | L2 | 所有实例 |
| AGENTS.md 铁律新增 | L3 | 全实例（安全不等人） |
| config provider/fallback 变更 | L3 | 受影响实例 |
| 安全相关（Key 轮换等） | L3 | 全实例 |
| shared-knowledge/ 任何文件 | L1 | 其他实例 |

### P1：日结同步（04:15 cron 或当天结束前手动）

| 变更类型 | 资产等级 | 同步目标 |
|---------|---------|---------|
| procedures/ 新增/修改 | L1 | 其他实例 |
| shared-learnings.md 更新 | L1 | 其他实例 |
| topics/ 通用更新 | L1 | 其他实例（按需） |

### P2：按需同步（用户明确要求）

| 变更类型 | 说明 |
|---------|------|
| MEMORY.md | 含私人信息，只有明确要求才同步 |
| USER.md / SOUL.md / IDENTITY.md | 各实例有差异版本 |
| memory/topics/ 业务专属 | 各实例独立 |
| daily notes | 各实例独立记录，不同步 |

## 四阶段执行：Preflight → Sync → Activate → Verify

### Phase 1：Preflight（预飞检查）

每次同步前，快速确认：

1. **目标在线状态**：检查各实例是否在线
2. **本次涉及目录**：确认要同步哪些资产

如果目标离线，不阻塞其他实例的同步，而是写入重试队列。

### Phase 2：Sync（文件同步）

用 rsync 同步文件：

- **同机实例**：直接 rsync
- **远程实例**：rsync over SSH

如果同步失败，写入重试队列，不阻塞后续流程。

### Phase 3：Activate（热重载）

Skill 类资产（L2）同步后，必须热重载：

```bash
kill -USR1 $(pgrep -f "openclaw" | head -1)
```

SIGUSR1 信号让 OpenClaw 进程重新加载 Skills，不需要重启。

如果热重载失败（比如进程不存在），尝试重启服务。

### Phase 4：Verify（语义生效验证）

这是 v3.0 新增的核心步骤。文件验证 + 语义验证双重确认：

**文件数量验证（L1 基础验证）**：

对比各实例的 Skill 文件数量，确认一致。

**Skill 版本头验证（L2 语义验证）**：

读取各实例的 `skills/<name>/SKILL.md`，检查 `version:` 字段是否一致。

**铁律类变更的语义验证（L3 强验证）**：

在 AGENTS.md 中搜索铁律关键词，确认各实例都包含。

## 离线降级：重试队列

如果某台机器不在线，同步不会失败，而是进入重试队列：

```bash
# 心跳/日结时调用，处理之前失败的同步
process_retry_queue() {
  local instance=$1  # hal / aki
  local queue_file="/tmp/sync-retry-${instance}.queue"
  
  # 检查目标是否在线
  # 如果在线，处理队列中的同步任务
  # 完成后删除队列文件
}
```

下次目标上线时（通过心跳或日结触发），自动补同步。

## 同步结果矩阵

每次同步完成后，必须输出结果矩阵：

```
[发布批次] 2026-03-28-browser-v3
[变更类型] skill (L2) + procedure (L1)
[变更文件]
  - skills/content-pipeline/SKILL.md
  - memory/procedures/浏览器自動化規範.md

[执行结果]
| 实例  | 文件同步 | 热重载 | 语义验证 | 备注 |
|------|:------:|:----:|:------:|------|
| ナツ  |  ✅   |  ✅  |   ✅   | 同机 |
| ハル  |  ✅   |  ✅  |   ✅   | SSH |
| アキ  |  ⏳   |  ⏳  |   ⏳   | 离线，队列待补 |

[结论] 核心三实例已达到一致态。アキ将在下次上线时自动补同步。
```

状态说明：
- ✅ 已更新 + 已生效 + 已验证
- ⏳ pending（离线，队列中）
- ❌ 失败（需人工干预）

**不接受"同步完成"五字了事**。必须明确每个实例的状态。

## 审计日志

每次 P0 同步写日志：

```
[2026-03-28 14:32:01] P0 | skills → natsu | synced
[2026-03-28 14:32:03] P0 | skills → hal | synced
[2026-03-28 14:32:05] P0 | skills → aki | queued
```

便于事后审计和问题排查。

## 绝不同步的内容

有些东西不应该同步：

- `~/.openclaw/openclaw.json`（各实例 config 不同）
- `memory/YYYY-MM-DD.md`（daily notes 各实例独立）
- `/tmp/` 下的临时文件
- `.swarm/` 蜂群运行时状态

这些是实例特定的运行时数据，同步了反而会造成混乱。

## 决策树

```
刚改了一个文件，要同步吗？
│
├─ 是 skills/ 或 AGENTS.md 铁律？
│  └─ YES → P0 立即同步 + 热重载 + verify_skill_version
│
├─ 是 config/provider/安全 变更？
│  └─ YES → P0 立即 + 串行执行 + verify_policy_sync（L3 强验证）
│
├─ 是 procedures/ 新增？
│  └─ YES → P1 日结同步（重要的可立即）
│
├─ 是 shared-knowledge/ 更新？
│  └─ YES → P0 立即同步
│
├─ 是 MEMORY.md / USER.md / SOUL.md？
│  └─ NO（各实例有差异版本，不自动同步）
│
└─ 不确定？
   └─ 同步比不同步安全，但记得做 verify_file_count
```

## 实际例子：Skill 更新同步

假设你更新了一个 Skill：`skills/content-pipeline/SKILL.md`

**Step 1**：判断资产等级 → L2（Skill 类）

**Step 2**：触发 P0 立即同步

**Step 3**：Preflight 检查各实例在线状态

**Step 4**：Sync 文件到各实例

```bash
rsync -av ~/.openclaw/workspace/skills/content-pipeline/ ~/.openclaw/workspace-natsu/skills/content-pipeline/
rsync -av -e "ssh -o IdentitiesOnly=yes -i ~/.ssh/id_rsa" ~/.openclaw/workspace/skills/content-pipeline/ willma@Wills-Mac-mini.local:~/.openclaw/workspace/skills/content-pipeline/
```

**Step 5**：Activate 热重载

```bash
kill -USR1 $(pgrep -f 'openclaw.*18790' | head -1)  # ナツ
ssh willma@Wills-Mac-mini.local 'kill -USR1 $(pgrep -f "openclaw" | head -1)'  # ハル
```

**Step 6**：Verify 语义生效

```bash
# 检查版本头是否一致
grep "^version:" ~/.openclaw/workspace/skills/content-pipeline/SKILL.md
grep "^version:" ~/.openclaw/workspace-natsu/skills/content-pipeline/SKILL.md
ssh willma@Wills-Mac-mini.local "grep '^version:' ~/.openclaw/workspace/skills/content-pipeline/SKILL.md"
```

**Step 7**：输出同步结果矩阵

## 总结

跨实例智能同步的核心洞察是：**文件同步 ≠ 语义生效**。

L1/L2/L3 资产三级分类让不同风险等级的资产有不同的验收标准。四阶段执行（Preflight → Sync → Activate → Verify）确保同步真正生效，而不是"文件到了就行"。

离线降级机制（重试队列）保证即使某实例暂时离线，也不会丢失同步任务。

同步结果矩阵让状态一目了然，不接受模糊的"同步完成"。

最终目标是：**4 台机器上的 4 个 AI，行为完全一致，没有隐性行为分叉**。

记住：**最可怕的不是不同步，而是你以为同步了，但其实没有**。
