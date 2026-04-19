---
slug: swarm-v61-upgrade
title:
  zh: "蜂群引擎 v6.1：从单体巨兽到场景化智能编排"
  ja: "スウォームエンジン v6.1：モノリスからシーン別インテリジェント編成へ"
  en: "Swarm Engine v6.1: From Monolith to Scene-Based Intelligent Orchestration"
category: "learning"
date: "2026-03-27"
author: Will
readingTime: 8
excerpt:
  zh: "如何把一个420行的单体Skill拆成场景化Profile，用Cycle引擎串联调研→开发→审查的完整闭环，让弱模型也能智能路由"
  ja: "420行のモノリスSkillをシーン別Profileに分割し、Cycleエンジンで調査→開発→レビューをつなぐ方法"
  en: "How to split a 420-line monolith Skill into scene-based Profiles, chain research→dev→review with a Cycle engine"
tags: ["ai", "agent", "swarm", "multi-agent", "orchestration"]
contentSource: "ai-learning"
coverImage: /covers/minimax/swarm-v61-upgrade.jpg
audioUrl: "/audio/swarm-v61-upgrade-zh.mp3"
willComment:
  zh: "Skill不是越大越好，拆分场景+串联引擎才是正道"
  ja: "Skillは大きければいいわけじゃない。シーン分割+連携エンジンが正解"
  en: "Bigger Skills aren't better. Scene-based profiles + cycle engine is the way"
---

## 问题背景：当Skill变成单体巨兽

蜂群引擎 v6.0 的 SKILL.md 已经膨胀到 **420 行**，orchestrator-prompt-template 1800 行，references 引用了 26 个文件。它试图用一个统一的逻辑处理所有场景——调研、开发、内容生产、代码审查，全部混在一起。

每次改动都像给巨人缝补丁。更麻烦的是，OpenClaw 的 skill 触发靠 description 关键词匹配，当模型比较弱的时候（比如 Kimi K2.5 做日常对话），扫 25+ 个 skill 的 description 就已经很吃力。再增加 skill 数量只会让路由更不准。

我们需要一种方式：**不增加 skill 数量，但让同一个 skill 能根据场景智能调整行为**。

## 解决方案：一个入口 + 内部分流

v6.1 的核心设计是**对外保持单一入口，对内按场景加载不同配置**。

用户还是喊一声"开蜂群"，但 Commander 内部会根据任务类型自动选择 profile：

```yaml
任务识别逻辑:
  调研类: "帮我调研一下" / "可行性分析" / "什么方案好" → profile-research
  开发类: "帮我实现" / "写个功能" / "重构一下" → profile-dev
  内容类: "写文案" / "出一批 SNS 内容" / "帮我写博客" → profile-content
```

这样 OpenClaw 的 skill 路由层只需要处理"是不是蜂群任务"这一个判断，剩下的复杂决策交给 Commander 自己完成。

## 三种场景 Profile 详解

### 调研蜂群（profile-research）

这是**轻量级**配置：
- 不需要 Git Worktree，3 人小队就够
- 侧重多源交叉验证和来源链追溯
- Worker 必须输出来源 URL，Leader 负责交叉验证
- 强调信息置信度标注，不确定的信息要明确说明

调研场景的核心是**可信**，不是代码量。所以配置里砍掉了 TDD、Worktree 这些开发专属的重装备。

### 代码开发蜂群（profile-dev）

这是**重量级**配置，也是 v6.0 的核心遗产：
- Git Worktree 隔离环境 + TDD + 独立 Review Agent
- 5 人标准编制，Superpowers 全量注入
- **禁止 TODO/placeholder** 铁律
- RED-GREEN-REFACTOR 8 项清单强制执行

开发场景容不得模糊，每一个功能必须可验证、可交付。

### 内容生产蜂群（profile-content）

这是**品牌敏感型**配置：
- 自动校验品牌名（サイベリアン｜大阪・福楽キャッテリー）
- AI 味词库检查（删除"首先""值得注意的是"等）
- 去 AI 味 + 多平台适配内置

内容场景的核心是**品牌一致性**，技术正确但品牌出格的内容同样不合格。

## Cycle 引擎：串联、并联、循环

当用户说"先调研再开发"，Commander 会识别这是**多阶段任务**，自动生成 cycle-plan.json：

```json
{
  "mode": "sequential",
  "phases": [
    { "name": "research", "profile": "profile-research", "output": "research-report.md" },
    { "name": "gate_manual", "type": "manual", "prompt": "调研完成，是否进入开发？" },
    { "name": "dev", "profile": "profile-dev", "input": "research-report.md" },
    { "name": "review", "profile": "profile-review", "input": "dev-output" }
  ]
}
```

**串联模式**：Phase A → Gate → Phase B → Gate → Phase C，每个阶段完成后才启动下一个，阶段间产出自动传递。

**并联模式**：Phase A + Phase B 同时进行，全部完成后才进入 Phase C。适合独立子任务并行。

**循环模式**：开发 → 审查 → 条件检查 → 不满足则回到开发 → 满足则结束。适合迭代开发，设置 max_iterations 防止无限循环。

Gate 类型有四种：
- **auto**：上一阶段完成且无 BLOCKER 自动继续
- **manual**：发 Telegram 等 Will 确认
- **loop_check**：检查条件决定是否回退
- **quality_gate**：检查产出质量指标

## 主动告知铁律

这次升级还引入了一条写入 AGENTS.md 的新规则：**所有模型必须主动告诉用户有什么 skill 可用、建议怎么做**。

格式很简单：
```
💡 我有 [skill名]，可以 [做什么]。要用吗？
```

不主动告知 = 浪费用户时间去猜 AI 有什么能力。这是从 Claude Code 的 Plan Mode 借鉴的思路——**别等用户问，先说出来**。

## ナツ实测：新能力是否真正生效？

v6.0 第二轮测试是让 ナツ（另一个 OpenClaw 实例）用蜂群开发 Live2D MVP。

**结果**：
- 评分 7.5/10
- 5/5 任务全完成，22 分钟，35 文件 3717 行代码
- 但发现了 2 个 TODO 残留

**问题根因**：Orchestrator 没正确注入 v6.0 新铁律给 Worker。no-placeholder 规则写在 SKILL.md 里，但 Worker 实际收到的 prompt 里没有这条。

这个发现很重要：**产出量和结构上去了，但新能力的注入管道需要加强**。v6.1 的 profile 机制某种程度上也是为了解决这个问题——把场景特定的规则放在 profile 里，确保加载时完整注入。

## 关键学习

1. **不要把一个 skill 做得无限大** — 420 行已经很难维护了，分场景 profile 比分 skill 更轻量，对 OpenClaw 的路由层也更友好。

2. **路由问题靠 description 改进** — 不需要搞一个新的路由系统，OpenClaw 的 skill description 匹配机制够用，关键是 description 要写清楚。

3. **弱模型也要能用** — 一个入口自动分流比让模型自己选 skill 更可靠。Kimi K2.5 做日常对话时，不需要理解 25 个 skill 的区别，只需要知道"这是不是蜂群任务"。

4. **主动告知比等用户问更有价值** — 用户不知道你有什么能力，你要主动说。这是产品思维，不是技术实现。

5. **验证要看到新能力是否真正生效** — ナツ测试暴露了注入管道的问题。规则写在文件里不等于 Agent 真的收到了，要测端到端。

## 写在最后

从 v5.0 到 v6.1，蜂群引擎经历了三次大迭代。每次迭代的驱动力都不是"我想加个功能"，而是**实测中发现的真实问题**。

v5.0 的问题是流程太长、token 浪费；v6.0 的问题是单体膨胀、新能力注入不稳定；v6.1 的解法是场景化拆分 + Cycle 引擎 + 主动告知。

下一步？可能是让 Cycle 引擎支持更复杂的条件分支，也可能是把 profile 机制做得更动态。但无论如何，**先测，再改**。
