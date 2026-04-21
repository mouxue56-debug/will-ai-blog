# will-ai-lab — AI 实例行动指南

> 本文件供所有 OpenClaw 实例（ユキ/ナツ/ハル/アキ/マユキ）在进入此项目时自检。  
> **完整分工手册**：`~/.openclaw/shared-knowledge/blog-team-roles.md`（必读）  
> **完整操作手册**：`~/.openclaw/shared-knowledge/will-ai-lab-blog-management.md`

---

## 进入项目后先做这三件事

```bash
# 1. 确认当前分支
git -C /Users/lauralyu/projects/will-ai-lab branch --show-current
# 应为：feat/icecream-refresh

# 2. 确认有无未提交变更
git -C /Users/lauralyu/projects/will-ai-lab status --short

# 3. 确认生产状态
curl -s -o /dev/null -w "%{http_code}" https://aiblog.fuluckai.com/zh
# 应为：200
```

---

## 权限速记

| 我是 | 可以部署 | 可以建定时任务 | 可以跑内容管道 |
|------|:-------:|:------------:|:------------:|
| ユキ | ✅ | ✅ | ✅ |
| ナツ / ハル / アキ / マユキ | ✅ | ❌ | ✅ 手动单次 |

> 🚫 **非 ユキ 实例**：不得调用 `CronCreate` 或 `mcp__scheduled-tasks__create_scheduled_task`。

---

## 最常用命令

```bash
PROJECT=/Users/lauralyu/projects/will-ai-lab

# 本地预览
npm run dev --prefix $PROJECT -- --port 3012

# TS 检查
npx --prefix $PROJECT tsc --noEmit --skipLibCheck

# 部署
cd $PROJECT && npx vercel --prod --yes

# 给新资讯生成 AI 讨论（ユキ 专属日常，其他实例单次可用）
python3 $PROJECT/scripts/kimi_discuss_reports.py --days=2
python3 $PROJECT/scripts/kimi_discuss_reports.py --id=<uuid>

# 充实空文章正文
python3 $PROJECT/scripts/enrich_daily_reports.py

# 翻译英文标题
python3 $PROJECT/scripts/translate_titles.py
```

---

## 写博客文章规范（一眼必查）

```yaml
---
slug: article-slug          # 与文件名一致
title:
  zh: 中文标题
  ja: 日本語タイトル
  en: English Title
category: ai                # ai | tech | life | cats | business | learning
date: 2026-04-21
author: Will
locale: zh
coverImage: /covers/minimax/article-slug.jpg
tags: ["tag1", "tag2"]      # ⚠️ 必须 JSON 数组格式，不能用 YAML - item
---
```

---

## 部署后验证

```bash
for path in /zh /zh/debate /zh/blog /zh/cases; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://aiblog.fuluckai.com${path}")
  echo "$code $path"
done
```

---

*详细职责分工 → `~/.openclaw/shared-knowledge/blog-team-roles.md`*
