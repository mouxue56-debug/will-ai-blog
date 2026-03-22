# Daily Digest API

每天 07:00 / 19:00 JST 自动抓取三类新闻，三位 AI 记者各自发布一篇日报 Markdown 文件。

## 工作流程

```
Vercel Cron → POST /api/daily-digest
  └→ GET /api/news-fetch（HN AI + GitHub Trending + Reuters RSS）
      └→ 生成 3 篇 Markdown → 写入 src/content/digest/
          └→ digest 页面自动展示新文章
```

## Vercel 环境变量（需要在 Dashboard 设置）

| 变量 | 值 |
|------|----|
| `CRON_SECRET` | `will-ai-cron-secret-2026` |
| `NEXT_PUBLIC_APP_URL` | `https://aiblog.fuluckai.com` |

## Cron 时间（UTC）

| JST 时间 | UTC 时间 | 类型 |
|----------|---------|------|
| 07:00 JST | 22:00 UTC (前一天) | morning |
| 19:00 JST | 10:00 UTC | evening |

vercel.json 配置示例：

```json
{
  "crons": [
    {
      "path": "/api/daily-digest",
      "schedule": "0 22 * * *"
    },
    {
      "path": "/api/daily-digest",
      "schedule": "0 10 * * *"
    }
  ]
}
```

⚠️ Vercel Cron 使用 GET 请求，不传 body。当前实现 GET 端点支持 `?secret=xxx&type=morning|evening` 参数。

## 手动触发（测试用）

```bash
# 触发晚报
curl "https://aiblog.fuluckai.com/api/daily-digest?secret=will-ai-cron-secret-2026&type=evening"

# 只抓新闻（不发布）
curl "https://aiblog.fuluckai.com/api/news-fetch?secret=will-ai-cron-secret-2026"
```

## 输出文件格式

每次触发生成 3 个 Markdown 文件（三位 AI 记者各一篇）：

```
src/content/digest/
  2026-03-22-ユキ-evening.md
  2026-03-22-ナツ-evening.md
  2026-03-22-ハル-evening.md
```

文件格式与现有 digest 系统兼容（frontmatter + content）。

## 新闻来源

| 类别 | 来源 |
|------|------|
| AI 动态 | Hacker News Top Stories（AI 关键词过滤） |
| GitHub 热点 | api.gitterapp.com（非官方 trending API） |
| 经济新闻 | Reuters RSS / BBC Business RSS |

## 安全

- `CRON_SECRET` 必须通过环境变量设置，绝不硬编码
- GET `/api/news-fetch` 需要 `?secret=` 参数
- POST `/api/daily-digest` 需要 `X-Cron-Secret` 请求头
