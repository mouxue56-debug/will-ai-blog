# Will's AI Blog — Codex 作战地图

> 本文件是给 AI（Codex/Claude）的项目升级指南。每次开始新任务前先读这个文件。
> **Owner:** Will（落雪 / konayuki56）  
> **Site:** https://aiblog.fuluckai.com  
> **Repo:** mouxue56-debug/will-ai-blog  
> **Stack:** Next.js 15 App Router · next-intl 4.8.3 · TypeScript · Tailwind CSS v4 · Vercel

---

## 项目目录结构

```
src/
  app/[locale]/          # 页面（zh/ja/en）
  components/
    home/                # 首页组件
    layout/              # header, footer, mobile-nav
    shared/              # 通用组件（AIChatWidget, LocaleSwitcher...）
    blog/                # 博客相关
    cases/               # 案例相关
    timeline/            # 时间线相关
  data/
    timeline.ts          # 时间线数据（手动维护）
    cases.ts             # 案例数据（手动维护）
    blog/                # 博客 MDX 文件
  i18n/
    routing.ts           # next-intl 路由配置
  lib/                   # 工具函数
messages/
  zh.json                # 中文翻译
  ja.json                # 日文翻译
  en.json                # 英文翻译
```

---

## 账号与权限

| 用途 | 账号 | 密码 | 权限 |
|------|------|------|------|
| 管理员登录 | fuluck56 | fuluck5632 | 全部编辑权限 |
| 访客登录 | （随机注册） | — | 仅评论 |

**登录系统**：NextAuth v5 beta，providers: GitHub / Google / Credentials  
**Credentials admin** 需要在 Vercel 环境变量中配置：`ADMIN_USERNAME=fuluck56` `ADMIN_PASSWORD=fuluck5632`

---

## 已完成 ✅

- T1-T17: 项目初始化、导航、Hero、博客、时间线、案例页、生活页、社交页、About 页、SEO、资讯、视觉重做、Aceternity UI、NextAuth 用户系统
- T18: Aceternity 整合 + UserMenu + 评论升级
- T19: 时间线页面重做 — 垂直轴+交替卡片 + 三级钻入
- T21: 文案修复（三语）+ SEO 强化
- T22: 移动端修复 + 统一样式
- T23: AI 聊天助手浮窗 + 公开日历
- T24: AI 研修课程资料扩充（25+ 文件）
- **三语切换修复**（根因：setRequestLocale + html lang）
- **全站 i18n**：StoryTimeline、LatestUpdates、各页面 layout、footer、mobile-nav

---

## 待修复 🔧

### BUG-01: 案例页内容空白
**文件**：`src/data/cases.ts`  
**问题**：3 个案例（multi-ai-architecture / cattery-sns-automation / medical-ai-service）的 `story.zh`、`story.ja`、`technical.zh`、`technical.ja`、`deep.zh`、`deep.ja` 字段内容不完整或为空  
**修复**：为每个案例补全中文和日文内容（可参考 `.en` 字段翻译+改写）

### BUG-02: 英语页面跳转报错
**症状**：切换到 `/en` 某些子页面报错  
**排查**：检查 `src/app/[locale]/` 下所有页面的 `generateMetadata` 和 `params` 类型，确保 `locale` 参数正确解包

### BUG-03: 管理员账号未激活
**文件**：`src/app/[locale]/auth/signin/page.tsx` 和 NextAuth 配置  
**修复**：
1. 在 Vercel 环境变量中配置：`ADMIN_USERNAME=fuluck56`、`ADMIN_PASSWORD=fuluck5632`、`NEXTAUTH_SECRET`（随机值）
2. 确认 Credentials provider 能验证这两个字段
3. 管理员登录后可以看到内容编辑入口

---

## 待完善 📋

### FEAT-01: 博客与生活页面去重
**问题**：博客（Blog）和生活（Life）内容重叠  
**方案**：
- **博客** → 技术类：AI 工具测评、项目复盘、技术笔记、商业分析
- **生活** → 生活类：大阪日常、猫咪日记、美食探店、旅行记录
- 调整导航标签和页面描述来强化差异化
- 生活页面增加：地图 pin 功能（大阪美食地点）、猫咪相册入口

### FEAT-02: 时间线完善
**文件**：`src/data/timeline.ts`  
**当前状态**：有 30+ 条事件，但缺少真实的小红书内容  
**待做**：Will 会陆续提供小红书笔记链接，按以下格式导入：
```ts
{
  id: 'xhs-xxx',
  date: 'YYYY-MM-DD',
  title: '标题',
  titleJa: '日本語タイトル',
  titleEn: 'English title',
  summary: '摘要',
  summaryJa: '日本語摘要',
  summaryEn: 'English summary',
  category: 'daily' | 'milestone' | 'tech' | 'news' | 'thought',
  isMilestone: boolean,
  tags: string[],
  link: 'https://xhslink.com/...',
}
```

### FEAT-03: 关于页面深化
**文件**：`src/app/[locale]/about/page.tsx`  
**待做**：
- 填充真实个人介绍（Will 的背景、AI 旅程、猫舍故事）
- 技能展示（用进度条或图标）
- 联系方式（Email / LINE / Instagram）
- 合作咨询 CTA

### FEAT-04: 博客文章补充
**目录**：`src/data/blog/` 或 MDX 文件  
**当前**：全是占位文章  
**待做**：写 5-10 篇真实文章（中日双语），主题建议：
1. OpenClaw 多实例架构实践
2. AI 助力猫舍 SNS 运营
3. 提示词设计入门
4. 大阪开猫舍的日常
5. AI 研修服务介绍

### FEAT-05: 数据库接入（持久化评论/资讯）
**问题**：Vercel 文件系统只读，评论和 AI 资讯无法持久化  
**方案**：接入 Upstash Redis 或 PlanetScale MySQL  
**环境变量**：`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`

### FEAT-06: Cloudflare Pages 迁移
**从**：Vercel  
**到**：Cloudflare Pages  
**原因**：统一管理、无限带宽、免费  
**CF 信息**：
- Zone ID (fuluckai.com): `91a34e7bcb04c81941a661e775d18564`  
- Account ID: `8df2461b3c0372bf44e8aac61ea62287`

---

## 环境变量清单（Vercel）

| 变量 | 用途 | 状态 |
|------|------|------|
| `NEXTAUTH_SECRET` | NextAuth 签名密钥 | ❌ 未配置 |
| `NEXTAUTH_URL` | 站点 URL | ❌ 未配置 |
| `ADMIN_USERNAME` | 管理员账号 | ❌ 未配置 |
| `ADMIN_PASSWORD` | 管理员密码 | ❌ 未配置 |
| `GITHUB_CLIENT_ID` | GitHub OAuth | ❌ 未配置 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth | ❌ 未配置 |
| `GOOGLE_CLIENT_ID` | Google OAuth | ❌ 未配置 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | ❌ 未配置 |

---

## 开发规范

### 三语规范
- 所有用户可见文本必须通过 `t()` 读取翻译
- 新增翻译 key 必须同时更新 `messages/zh.json`、`messages/ja.json`、`messages/en.json`
- 日语必须是自然的母语级表达（非机翻）
- 品种名：サイベリアン ✅ / シベリアン ❌

### 组件规范
- `'use client'` 组件：`const t = useTranslations('namespace')`
- Server 组件：`const t = await getTranslations({ locale, namespace: 'namespace' })`
- Layout 文件：必须调用 `setRequestLocale(locale)`

### 部署规范
```bash
# Build 验证
npm run build

# Deploy
vercel --prod --token "$VERCEL_TOKEN" --yes
```

### Git 规范
- 每个功能点一个 commit
- commit message 格式：`type: description`（fix/feat/i18n/content/style）

---

## 当前 Codex 任务队列

按优先级排列，每次选择一个任务执行：

| ID | 优先级 | 任务 | 文件 |
|----|--------|------|------|
| BUG-01 | 🔴 高 | 案例页内容补全 | src/data/cases.ts |
| BUG-02 | 🔴 高 | 英语页面跳转修复 | src/app/[locale]/ |
| BUG-03 | 🟡 中 | 管理员账号激活 | NextAuth config |
| FEAT-01 | 🟡 中 | 博客/生活去重+差异化 | 页面描述+导航 |
| FEAT-02 | 🟡 中 | 时间线数据补充 | src/data/timeline.ts |
| FEAT-03 | 🟡 中 | About 页面深化 | about/page.tsx |
| FEAT-04 | 🟢 低 | 真实博客文章 | src/data/blog/ |
| FEAT-05 | 🟢 低 | 数据库持久化 | API routes |
| FEAT-06 | 🟢 低 | Cloudflare Pages 迁移 | — |

---

*Last updated: 2026-03-20*
