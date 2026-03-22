---
slug: swarm-v2-birth-story
title:
  zh: 蜂群引擎 v2.0 诞生记：AI 协作开发 AI 工具的全过程
  ja: スウォームエンジン v2.0 誕生記：AIが協力してAIツールを開発した全過程
  en: "Swarm Engine v2.0 Birth Story: How AIs Collaborated to Build an AI Tool"
category: "learning"
date: "2026-03-22"
author: Will
readingTime: 8
excerpt:
  zh: 一个人类提出需求，Claude Opus 4 主笔，GPT-5.4 担任审查官，5 轮打磨完成 5066 行代码——这是 AI 协作开发 AI 工具的真实全过程记录。
  ja: Claude Opus 4が書き、GPT-5.4がレビュー。5ラウンドの磨き込みで5066行のコードが完成した、AIがAIツールを開発した全過程。
  en: Claude Opus 4 wrote it, GPT-5.4 reviewed it. 5 rounds of polishing, 5066 lines of code — the real story of AIs building an AI tool.
tags: ["ai", "swarm", "agent", "engineering"]
contentSource: "ai-learning"
---

## 项目概要

这是一个 **AI 自主开发 AI 工具** 的故事。一个人类提出需求，两个顶级 AI 模型协同完成了一个 5000+ 行的完整开发引擎——从设计、实现、审查到修复，**全程 AI 主导**。

蜂群引擎 v1.0 于 2026 年 3 月初完成，但功能较为基础（745 行 / 14KB），仅实现了串行 Worker 调度和简单的 Review 流程。升级目标：对标业界最强、全功能无阉割的 v2.0 版本。

参考标的：开源项目 ClawTeam（8914 行 / 323KB），一个基于 ZeroMQ 的多 Agent 任务调度框架。设计目标是吸收 ClawTeam 的架构精华，做 OpenClaw 原生的蜂群引擎。

---

## 五轮打磨过程

### Round 1：Opus 主笔

- **执行者**：Claude Opus 4
- **产出**：12 个文件 / 3842 行 / 120.8KB
- 核心文件：SKILL.md（764行）、review-prompt-templates.md（452行）、worker-prompt-template.md（387行）、worktree-guide.md（365行）、dependency-engine.md（357行）

### Round 2：GPT-5.4 一审（评分 5.9/10）

**结论：不能上线**，发现 10 个必须修复的问题，最致命的 3 个：

- **Review 前先 merge 到 main 分支是大雷** — 如果 Review FAIL，主分支已被污染
- **整夜模式没有 Leader 互斥锁** — 15 分钟 Cron 重入会重复 spawn Worker
- **Mailbox JSON 写法不安全** — 用 shell echo 写 JSON 容易产出坏消息文件

### Round 3：Opus 修复 + 手动补完

Opus 修复大部分 references 文件（+846 行 / +33KB）：mailbox 改用 Python json.dump、overnight-guard 加了 leader.lock、worktree 改为 integration branch 审查。

Opus 超时前没来得及改 SKILL.md，人工手动修了 9 处关键问题（Review 分支命名、record_cost 签名、去掉双重确认门槛等）。

### Round 4：GPT-5.4 二审（评分 6.8/10）

评分从 5.9 提升到 6.8。10 个必须项中 3 个完全修复、5 个部分修复、2 个未修。27 个建议项中 22 个已修复。

### Round 5：最终确认（6/6 通过）

GPT-5.4 快速验证 6 个修复点，5/6 通过，1 个 worktree cleanup 过滤不完整。人工再修 1 处后 → **6/6 全部通过，正式上线**。

---

## 模型分工

| 角色 | 模型 | 职责 |
|------|------|------|
| 主笔 | Claude Opus 4 | 架构设计、全量编写、按 Review 修复 |
| 审查官 | GPT-5.4 | 逐文件审查、评分、发现问题、最终确认 |
| 协调者 | 人类 + AI 助理 | 发现主文件未修复、手动补完、部署上线 |

---

## 核心架构（5 个阶段）

- **Phase 0**：架构分析 → plan.md + 职称匹配
- **Phase 1**：智能分工 → board.json + config.json + Worktree 初始化
- **Phase 2**：蜂群执行 → spawn Workers 并行 + Mailbox 通信 + PUA 动态加载
- **Phase 3**：轮转审查 → 双轮 Review + 精准打回 → 回 Phase 2
- **Phase 4**：交付报告 → merge + cleanup + report.md + 通知

---

## 5 条关键教训

1. **单个 AI 写不出完美代码** — Opus 的 5.9 分说明即使最强模型也需要审查
2. **跨模型协作是质量保障** — GPT-5.4 发现了 Opus 自己看不到的盲区（merge-to-main 问题）
3. **超时是真实约束** — 大规模写入任务需要分批执行
4. **主文件和参考文件必须同步** — 最常见的 bug 是"文档修了，主流程没更新"
5. **最终一英里需要人工** — AI 协作完成 95%，最后的一致性检查需要人类判断

---

## v1 vs v2 对比

| 对比项 | v1.0 | v2.0 |
|--------|------|------|
| 代码行数 | 745 行 | 5066 行（7倍） |
| 文件大小 | 14KB | 157KB（11倍） |
| Worker 模式 | 串行单 Worker | 并行多 Worker |
| Review 机制 | 单轮简单检查 | 双轮深度 Review |
| 工作隔离 | 同一分支 | Git Worktree 隔离 |
| 通信方式 | 直接调用 | Mailbox 文件协议 |
| 职称系统 | 无 | 7类×5角色 |
| 整夜模式 | 不支持 | Cron + Leader Lock |

---

## 最终产出

- SKILL.md：856 行
- references 文件：15 个
- 总行数：**5066 行**
- 相比 v1.0：**7 倍增长**
