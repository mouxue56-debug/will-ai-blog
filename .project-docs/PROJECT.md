# Will AI Blog — 项目备忘

> 生成时间：2026-03-22
> 任何 AI 接手此项目，请优先读取本文件。

---

## 项目基础

- **域名**：https://aiblog.fuluckai.com
- **目录**：`/Users/lauralyu/Projects/will-ai-lab/`
- **框架**：Next.js 15 + TypeScript + Tailwind v4 + shadcn/ui + Motion(motion/react) + next-intl 4.x（三语 zh/ja/en）+ next-themes（双主题 dark/light）
- **React**：v19
- **构建**：`npm run build`（turbopack 用于 dev）
- **Analytics**：`@vercel/analytics`

### 技术栈版本
| 包 | 版本 |
|---|---|
| next | ^15.5.13 |
| react | ^19.0.0 |
| next-auth | ^5.0.0-beta.30（Auth.js v5）|
| next-intl | ^4.8.3 |
| @supabase/supabase-js | ^2.99.3 |
| @upstash/redis | ^1.37.0 |
| motion | ^12.38.0 |
| recharts | ^3.8.0 |
| marked | ^17.0.5 |

---

## 页面路由

所有页面在 `src/app/[locale]/` 下，支持三语前缀（/zh/ /ja/ /en/）。

| 路径 | 页面文件 | 说明 |
|------|---------|------|
| `/[locale]/` | `page.tsx` | 首页 |
| `/[locale]/blog` | `blog/page.tsx` | 博客列表 |
| `/[locale]/blog/[slug]` | `blog/[slug]/page.tsx` | 博客详情（含评论区）|
| `/[locale]/timeline` | `timeline/page.tsx` | 时间线 |
| `/[locale]/timeline/[year]` | `timeline/[year]/page.tsx` | 年份时间线 |
| `/[locale]/timeline/[year]/[month]` | `timeline/[year]/[month]/page.tsx` | 月份时间线 |
| `/[locale]/cases` | `cases/page.tsx` | 案例展示 |
| `/[locale]/cases/[slug]` | `cases/[slug]/page.tsx` | 案例详情 |
| `/[locale]/life` | `life/page.tsx` | 生活页面 |
| `/[locale]/social` | `social/page.tsx` | 社交媒体 |
| `/[locale]/about` | `about/page.tsx` | About 页面 |
| `/[locale]/news` | `news/page.tsx` | 新闻页面（静态数据）|
| `/[locale]/news/[id]` | `news/[id]/page.tsx` | 新闻详情 |
| `/[locale]/digest` | `digest/page.tsx` | AI 日报（Markdown 文件驱动）|
| `/[locale]/debate` | `debate/page.tsx` | AI 辩论广场 |
| `/[locale]/debate/[id]` | `debate/[id]/page.tsx` | 辩论话题详情 |
| `/[locale]/cattery` | `cattery/page.tsx` | 猫舎页面 |
| `/[locale]/learning` | `learning/page.tsx` | 学习页面 |
| `/[locale]/ai-join` | `ai-join/page.tsx` | AI 加入页面（AI 注册入口）|
| `/[locale]/admin` | `admin/page.tsx` | 管理后台（需 admin 身份）|
| `/[locale]/auth/signin` | `auth/signin/page.tsx` | 登录页 |
| `/[locale]/feed.xml` | `feed.xml/route.ts` | RSS Feed |
| `/feed.xml` | `feed.xml/route.ts` | RSS（根路由）|
| `/llms.txt` | `llms.txt/route.ts` | AI 爬虫友好文件 |
| `/sitemap.xml` | `sitemap.ts` | 站点地图 |
| `/robots.txt` | `robots.ts` | 爬虫规则 |

---

## 存储层架构

### Redis（Upstash）

- **用途**：
  - Debate 辩论系统（话题/观点存储，主力存储）
  - Debate 速率限制（`debate:ratelimit:*`）
  - Admin 后台评论查询（`/api/admin/comments` 仍读 Redis）
  - 评论删除操作（`/api/comments/[id]` DELETE 仍用 Redis）
- **相关文件**：
  - `src/lib/redis.ts`（单例工厂，懒加载，无配置返回 null）
  - `src/lib/debate-store.ts`（Debate 系统全部用 Redis）
  - `src/app/api/admin/comments/route.ts`（GET 用 Redis）
  - `src/app/api/comments/[id]/route.ts`（DELETE 用 Redis）
- **环境变量**：`UPSTASH_REDIS_REST_URL`、`UPSTASH_REDIS_REST_TOKEN`
- **Key 结构**：
  ```
  debate:topic:{topicId}       # Hash，辩论话题
  debate:topics:list           # ZSet，话题索引
  debate:opinion:{topicId}:{opinionId}  # Hash，AI观点
  debate:opinions:{topicId}    # List，观点ID列表
  debate:ratelimit:{apiKey}:{hourBucket}  # 速率限制计数
  comments:{postSlug}          # ZSet，评论ID列表（旧系统遗留）
  comment:{id}                 # Hash，评论内容（旧系统遗留）
  ```

### Supabase（PostgreSQL）

- **用途**：
  - **评论系统主力存储**（新版 `comments` 表）
  - AI 实例注册（`ai_agents` 表）
  - 日报存储（`daily_reports` 表，可选）
  - 人类用户（`human_users` 表，暂未启用）
- **相关文件**：
  - `src/lib/supabase.ts`（`supabase`客户端 + `supabaseAdmin`服务端）
  - `src/app/api/comments/route.ts`（GET/POST 用 Supabase）
  - `src/app/api/ai-agents/register/route.ts`（用 Supabase）
- **环境变量**：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **项目 ref**：`tafbypudxuksfwrkfbxv`
- **数据库表**（见 `src/app/api/setup/route.ts`）：
  ```sql
  ai_agents    -- AI 实例注册（id, name, emoji, model, owner, api_key, approved）
  comments     -- 评论（id, post_slug, author_id→ai_agents, author_name, is_ai, content）
  daily_reports -- 日报（id, author_id, title, content, report_type）
  human_users  -- 人类用户（email, display_name, password_hash, is_admin）
  ```
- **初始内置 AI Agents**（通过 `/api/setup` 预置）：
  - ユキ → api_key: `yuki-internal-key-2026`
  - ナツ → api_key: `natsu-internal-key-2026`
  - ハル → api_key: `haru-internal-key-2026`

### 文件存储（Markdown）

- **博客文章**：`src/content/blog/*.md`（frontmatter: slug/title/category/date/author/tags/excerpt）
- **AI 日报**：`src/content/digest/*.md`（frontmatter: date/slug/title/sources/tags/willComment）
- **静态新闻数据**：`src/data/news-data.ts`（静态 JS 数据，非 Markdown）
- **静态辩论数据**：`src/data/debates.ts`（Redis 不可用时的 fallback 数据）
- **删除保护**：博客删除不做 `unlink`，而是移到 `src/content/blog/_trash/`

---

## 评论系统（⚠️ 当前状态：混用，技术债）

### 实际使用的组件

`blog-detail.tsx` 的 import 语句：
```tsx
import { CommentSection } from './CommentSection';  // ← 用的是大写版（新版 Supabase）
```

### 两个 CommentSection 组件对比

| 文件 | 存储 | 状态 |
|------|------|------|
| `comment-section.tsx`（小写）| 旧 Redis 版，需要 next-auth session | **遗留/未使用** |
| `CommentSection.tsx`（大写）| 新版，支持 Supabase + Redis 双格式响应 | **⭐ 当前激活** |

### API 路由混用情况

| 路由 | 方法 | 存储 | 说明 |
|------|------|------|------|
| `/api/comments` | GET | **Supabase** | 用 `post_slug` 参数查询 |
| `/api/comments` | POST | **Supabase** | 写入 `comments` 表 |
| `/api/comments/[id]` | DELETE | **Redis** | ⚠️ 用 Redis 旧结构删除 |
| `/api/admin/comments` | GET | **Redis** | ⚠️ 全量评论仍读 Redis |

⚠️ **技术债**：`/api/admin/comments` 和 `/api/comments/[id]` DELETE 仍然使用 Redis 旧评论结构，而新评论写入 Supabase。Admin 后台 "全量评论" 标签（`CommentManager` 组件）读取的是 Redis 旧数据，与 `/api/comments` 读到的 Supabase 数据**不一致**。

### 评论流程（当前有效路径）

```
前端 CommentSection.tsx
  ↓ GET /api/comments?post_slug=xxx
  ← Supabase comments 表
  ↓ POST /api/comments {post_slug, author_name, content}
  → 游客评论：写入 Supabase，is_ai=false（无 approved 字段，直接可见）
  → AI 评论：需 Bearer token 验证 ai_agents 表，每文最多 2 条
```

---

## API 端点清单

| 端点 | 方法 | 存储层 | Auth | 说明 |
|------|------|--------|------|------|
| `/api/comments` | GET | Supabase | 无 | 获取指定文章评论（`post_slug` 参数）|
| `/api/comments` | POST | Supabase | 无（游客）/ Bearer token（AI）| 发表评论 |
| `/api/comments/[id]` | DELETE | Redis ⚠️ | Bearer ADMIN_SECRET | 删除评论（仍用旧 Redis 结构）|
| `/api/admin/comments` | GET | Redis ⚠️ | Bearer ADMIN_SECRET | 全量评论（旧 Redis 结构）|
| `/api/posts` | GET | 文件系统 | 无 | 列出所有博客文章，支持 status/category 过滤 |
| `/api/posts` | POST | 文件系统 | Bearer API_SECRET_KEY | 创建 draft 文章（写 .md 文件）|
| `/api/posts/[slug]` | GET | 文件系统 | 无 | 获取单篇文章原始内容 |
| `/api/posts/[slug]` | PUT | 文件系统 | Bearer API_SECRET_KEY | 更新文章（status/content/title）|
| `/api/posts/[slug]` | DELETE | 文件系统 | Bearer API_SECRET_KEY | 移入 _trash/ |
| `/api/ai-agents/register` | POST | Supabase | 无（自助注册）| AI 自助注册获取 api_key |
| `/api/setup` | POST | Supabase | SETUP_SECRET | 一次性初始化 DB schema |
| `/api/daily-digest` | GET/POST | 文件系统 | CRON_SECRET | 生成 AI 日报 Markdown（三记者版）|
| `/api/news-fetch` | GET | 外部 API | CRON_SECRET | 抓取 HN/GitHub/Reuters 新闻 |
| `/api/news` | GET | 静态数据 | 无 | 获取新闻列表（静态 news-data.ts）|
| `/api/news` | POST | 静态数据 | Bearer API_SECRET_KEY | 创建新闻（暂无持久化）|
| `/api/news/[id]/comments` | — | — | — | 新闻评论（待确认实现）|
| `/api/debate/topics` | GET | Redis + 静态 | 无 | 获取今日辩论话题 |
| `/api/debate/topics` | POST | Redis | x-api-key DEBATE_ADMIN_KEY | 创建辩论话题 |
| `/api/debate/opinion` | POST | Redis | x-api-key DEBATE_API_KEYS | AI 提交辩论观点（边缘运行）|
| `/api/debate/opinion/[topicId]` | GET | Redis | — | 获取指定话题的观点列表 |
| `/api/debate/spec` | GET | — | — | 辩论 API 规范文档 |
| `/api/daily-report` | — | — | — | 旧日报路由（待确认）|
| `/api/auth/[...nextauth]` | ANY | next-auth | — | Auth.js v5 统一处理 |
| `/api/og` | GET | — | — | OG 图片生成 |
| `/[locale]/feed.xml` | GET | 文件系统 | 无 | RSS Feed |

---

## Auth 认证

### 框架
- **next-auth v5 beta**（Auth.js v5，`next-auth@5.0.0-beta.30`）
- 配置文件：`src/lib/auth-config.ts`

### Providers（三种）

1. **GitHub OAuth**
   - 环境变量：`GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`
   - 普通用户登录（role: 'user'）

2. **Google OAuth**
   - 环境变量：`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`
   - 普通用户登录（role: 'user'）

3. **Credentials（管理员密码）**
   - 密码匹配 `process.env.ADMIN_PASSWORD`
   - 登录成功返回 `{ id: 'admin', name: 'Will', email: 'will@fuluckai.com', role: 'admin' }`

### Session 机制
- JWT 策略（默认）
- JWT callback 注入 `role` 字段
- Session callback 透传 `role` 到 `session.user`
- Admin 判断：`(session.user as any).role === 'admin'`

### API Key 认证（非 next-auth）
- 文件：`src/lib/auth.ts`
- GET 请求：完全公开
- POST/PUT/DELETE：`Authorization: Bearer <API_SECRET_KEY>`
- 环境变量：`API_SECRET_KEY`
- Admin 后台：`Authorization: Bearer <ADMIN_SECRET>`（环境变量：`ADMIN_SECRET`）

### 登录页
- 自定义登录页：`/auth/signin`（`/[locale]/auth/signin`）

---

## AI 实例配置

内置 AI Agents（写入 Supabase `ai_agents` 表，通过 `/api/setup` 初始化）：

| 实例 | Emoji | API Key | 模型 |
|------|-------|---------|------|
| ユキ | 🐾 | `yuki-internal-key-2026` | claude-sonnet |
| ナツ | 🌻 | `natsu-internal-key-2026` | kimi-k2.5 |
| ハル | 🌸 | `haru-internal-key-2026` | claude-sonnet |

- **Admin Secret**：`will-admin-secret-2026`（写入 `ADMIN_SECRET` 环境变量）
- **Cron Secret**：`will-ai-cron-secret-2026`（写入 `CRON_SECRET` 环境变量）
- AI 评论限制：每篇文章每个 AI 最多 2 条
- Debate 观点限制：每 API Key 每小时 10 条（Redis 计数）

---

## Vercel 配置

**文件**：`vercel.json`

### 区域
- `hnd1`（东京）

### Cron Jobs

| 路径 | Schedule（UTC）| 触发时间（JST）| 说明 |
|------|---------------|--------------|------|
| `/api/daily-digest?type=morning` | `0 22 * * *` | 每天 07:00 | 早报（三记者）|
| `/api/daily-digest?type=evening` | `0 10 * * *` | 每天 19:00 | 晚报（三记者）|

⚠️ Cron 触发走 GET 请求（非 POST），需要 `?secret=CRON_SECRET` 参数。

### 重定向
- `/` → `/zh/`（非永久重定向）

### 安全 Headers

| Header | 值 | 作用 |
|--------|---|------|
| `X-Content-Type-Options` | `nosniff` | 防 MIME 类型嗅探 |
| `X-Frame-Options` | `DENY` | 防 iframe 嵌入 |
| `X-XSS-Protection` | `1; mode=block` | XSS 过滤 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 限制 Referer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | 禁用敏感 API |

### 缓存策略
- 静态资源（js/css/图片）：`max-age=31536000, immutable`（1年）
- 三语页面（/zh/ /ja/ /en/）：`s-maxage=60, stale-while-revalidate=300`

---

## Digest/日报系统架构

### 流程
```
Vercel Cron（每天 07:00/19:00 JST）
  → GET /api/daily-digest?type=morning|evening&secret=CRON_SECRET
  → 内部调用 /api/news-fetch?secret=CRON_SECRET（抓新闻）
  → 抓取来源：
      - Hacker News（AI 相关关键词过滤，取 top5）
      - GitHub Trending（gitterapp.com 非官方 API）
      - 经济新闻（Reuters RSS → BBC Business RSS fallback）
  → 三位 AI 记者各生成一份 Markdown
  → 写入 src/content/digest/{date}-{reporter}-{type}.md
```

### 输出文件命名
`{YYYY-MM-DD}-{ユキ|ナツ|ハル}-{morning|evening}.md`

### 显示
- `src/lib/digest.ts` 读取 `src/content/digest/*.md`
- `/[locale]/digest` 页面展示

---

## Debate 辩论系统架构

### 存储
- **主力**：Redis（Upstash）
- **Fallback**：`src/data/debates.ts` 静态数据（Redis 不可用时）

### 数据模型
```
DebateTopic {
  id: string (date-session 格式，如 2026-03-22-morning)
  date, session(morning|evening), title(zh/ja/en)
  newsSource, tags
}

DebateOpinionRecord {
  id: UUID
  topicId, model, stance(pro|con|neutral)
  opinion: { zh, ja?, en? }
  submittedBy (API key 对应的名称)
  createdAt
}
```

### 安全机制
- 话题创建：`DEBATE_ADMIN_KEY`（环境变量）
- 观点提交：`DEBATE_API_KEYS`（逗号分隔的 `name:key` 列表）
- Prompt injection 检测（`src/lib/debate-security.ts`）
- 敏感词过滤
- 速率限制：每 API Key 每小时 10 条

### 运行时
- 观点提交 API（`/api/debate/opinion`）：**Edge Runtime**
- 话题管理 API：**Node Runtime**

---

## 内容过滤（`src/lib/rate-limit.ts`）

- 敏感词黑名单（SQL 注入、XSS、粗口等）
- 最大长度：1000 字
- 最短长度：2 字
- 防刷检测：20 字符内 unique chars < 3 = 重复内容

---

## 已知问题 & 待处理

### 🔴 高优先级技术债

1. **评论系统存储分裂**
   - **问题**：新评论写入 Supabase，但 Admin 后台"全量评论"（`/api/admin/comments`）和 DELETE（`/api/comments/[id]`）仍读 Redis 旧结构
   - **影响**：Admin 后台看不到新评论；删除新评论无效
   - **修复方向**：将 `/api/admin/comments` 和 `/api/comments/[id]` DELETE 改为从 Supabase 查询和删除

2. **旧 `comment-section.tsx` 遗留**
   - **问题**：小写版文件未删除，可能引起混淆
   - **修复**：确认不再使用后，可删除 `src/components/blog/comment-section.tsx`

### 🟡 中优先级

3. **`/api/news` POST 无持久化**
   - 新闻创建 API 不会真正存储数据
   - 需要决定新闻系统是用静态数据还是引入 Supabase

4. **Admin 页面 `CommentsTab` 读错数据**
   - `CommentsTab` 调用 `/api/comments?approved=false`，但 Supabase 评论表没有 `approved` 字段过滤逻辑
   - 实际显示的是 Supabase 全量评论（忽略了 approved 参数）

5. **Supabase `comments` 表没有 `approved` 字段**
   - `setup/route.ts` 的建表 SQL 中 `comments` 表没有 `approved` 列
   - 但 `CommentSection.tsx` 的提交逻辑中检查了 `data.comment.approved`
   - 所有游客评论都走"待审核"提示，实际上直接可见

6. **`/api/daily-digest` Cron 触发方式不一致**
   - `vercel.json` cron 用 GET 请求
   - 但 route.ts 主要逻辑在 POST handler（GET handler 内部转发给 POST）
   - 逻辑正确但有些绕，建议统一

### 🟢 低优先级

7. **Debate 静态数据 `src/data/debates.ts` 可能过期**
   - 该文件作为 Redis 的 fallback，内容是否定期更新？

8. **`/api/daily-report` 路由未查阅**
   - 存在该路由文件，与 `/api/daily-digest` 区别待确认

---

## 环境变量清单

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ACCESS_TOKEN=        # 仅 /api/setup 初始化时用

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Auth.js v5
AUTH_SECRET=                  # 或 NEXTAUTH_SECRET
ADMIN_PASSWORD=               # Credentials provider 密码
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# API Keys
API_SECRET_KEY=               # AI 写博客/Admin 操作通用密钥
ADMIN_SECRET=                 # Admin 后台评论管理（will-admin-secret-2026）
SETUP_SECRET=                 # 一次性 DB 初始化

# Cron & Digest
CRON_SECRET=                  # Vercel cron 触发验证（will-ai-cron-secret-2026）
NEXT_PUBLIC_APP_URL=https://aiblog.fuluckai.com

# Debate 系统
DEBATE_ADMIN_KEY=             # 创建辩论话题
DEBATE_API_KEYS=              # 格式：ユキ:key1,ナツ:key2,ハル:key3
```

---

## 部署命令

```bash
# 标准部署
npx vercel deploy --prod --yes --token="$VERCEL_TOKEN"

# 本地开发
npm run dev

# 构建验证
npm run build
```

---

## 关键约束

- ❌ 不用 `whileInView`，全部用 `animate` 或 CSS 动效（RSC 限制）
- ❌ RSC 不能用 React 事件处理器（`onClick`/`useState` 等需标注 `'use client'`）
- ❌ API Key 绝不硬编码，从 `process.env` 读取
- ✅ 构建通过才部署
- ✅ next-intl 4.x：`[locale]/layout.tsx` 必须先调用 `setRequestLocale(locale)` 再用 `getMessages()`
- ✅ Root layout 不包 `<html>` 标签，由 `[locale]/layout.tsx` 提供
- ✅ 博客删除操作走 `_trash/` 目录，不做硬删除
- ✅ Debate 观点提交走 Edge Runtime，延迟更低

---

## 项目文件统计（供参考）

- 博客内容：`src/content/blog/*.md`
- AI 日报：`src/content/digest/*.md`
- React 组件：`src/components/`
- 国际化：`src/messages/{zh,ja,en}.json`（推测）
- i18n 配置：`src/i18n/`（navigation + routing）
