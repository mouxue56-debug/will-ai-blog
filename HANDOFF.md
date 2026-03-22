# Will's AI Blog — 项目备份文档

**创建时间：** 2026-03-22 01:29 JST  
**最后更新：** 2026-03-22 01:29 JST  
**项目状态：** 已上线运行中

---

## 📌 项目基本信息

| 项目 | 内容 |
|------|------|
| **网站名称** | Will's AI Lab |
| **域名** | https://aiblog.fuluckai.com |
| **GitHub** | https://github.com/mouxue56-debug/will-ai-blog |
| **项目目录** | `/Users/lauralyu/Projects/will-ai-lab/` |
| **部署平台** | Vercel (mouxue56-debugs-projects) |

---

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui + Aceternity UI
- **动画**: Motion
- **国际化**: next-intl (三语: zh/ja/en)
- **主题**: next-themes (深色/浅色双主题)
- **认证**: NextAuth + GitHub OAuth
- **评论**: Upstash Redis (访客限流)
- **数据库**: 文件系统 (Markdown)

---

## 📁 核心目录结构

```
src/
├── app/
│   └── [locale]/           # 按语言路由 (zh/ja/en)
│       ├── blog/            # 博客列表和详情页
│       ├── timeline/        # 时间线页面
│       ├── debate/         # AI观点（辩论）页面
│       ├── digest/         # AI速递页面（已从导航移除）
│       ├── cases/          # 案例页面
│       ├── about/          # 关于页面
│       └── auth/           # 认证页面
├── components/
│   ├── home/               # 首页组件
│   ├── blog/               # 博客相关组件
│   ├── debate/             # AI观点组件
│   └── layout/             # 导航、页脚等
├── content/
│   └── blog/               # 27篇博客文章 (Markdown)
├── data/
│   ├── timeline.ts          # 时间线数据
│   └── debates.ts          # AI观点话题数据
├── i18n/                   # next-intl 配置
└── lib/                    # 工具函数、类型定义
```

---

## 🔑 关键配置

### 环境变量 (Vercel)

| 变量名 | 用途 |
|--------|------|
| `UPSTASH_REDIS_REST_URL` | Redis 连接 URL |
| `UPSTASH_REDIS_REST_TOKEN` | Redis 认证 Token |
| `AUTH_SECRET` | NextAuth 加密密钥 |
| `AUTH_GITHUB_ID` | GitHub OAuth Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth Client Secret |
| `DEBATE_ADMIN_KEY` | AI观点管理后台密钥 |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token (评论通知) |

### Vercel Token
```
[REDACTED - 使用环境变量 VERCEL_TOKEN]
```

### GitHub OAuth
- **Client ID**: `Ov23lihfodwSatXvgx8Y`
- **Client Secret**: `c83ffac51e15399c115509360e76b57b392884f2`

---

## 📝 已完成的页面和功能

### 页面 (7个)
1. ✅ **首页** — Hero + 时间线故事节点 + 最新文章 + AI Dashboard
2. ✅ **博客列表** — 搜索 + 分类筛选 + 分页
3. ✅ **博客详情** — 文章内容 + 评论 + Schema.org
4. ✅ **时间线** — 年月分层路由 (`/timeline/[year]/[month]`)
5. ✅ **AI观点** — 辩论话题 + 观点提交 + API端点展示
6. ✅ **案例** — AI落地案例展示
7. ✅ **关于** — Will个人介绍 + 工具栈

### 功能
- ✅ 三语切换 (zh/ja/en)
- ✅ 深色/浅色主题切换
- ✅ RSS Feed (`/feed.xml`)
- ✅ Sitemap (`/sitemap.xml`)
- ✅ Robots.txt (允许AI爬虫)
- ✅ 404页面
- ✅ NextAuth GitHub登录
- ✅ 评论系统 (Redis + 限流)
- ✅ 博客全文搜索
- ✅ 阅读时间显示
- ✅ 文章目录 (TOC)
- ✅ 每文章OG图
- ✅ Schema.org结构化数据

---

## 📊 内容状态

### 博客文章 (27篇)
- **中文内容**: 27篇 ✅
- **日语标题/摘要**: 22篇有翻译
- **英语标题/摘要**: 22篇有翻译
- **文章正文翻译**: 无（只有中文）

### 时间线 (约50条)
- 覆盖: 2017-2026
- 最新添加: 2025年自动化学习、2024年猫舍启程、AI客服
- 首页展示: 6个故事节点

---

## 🔴 已知问题和待办

### 待配置
1. **Telegram Bot Token** — 评论通知功能需要
2. **Umami统计** — 可选，需要注册 umami.is
3. **Google Search Console** — 需手动添加域名验证

### 可能的改进
1. 博客文章正文全文翻译（日语/英语）
2. 更多博客文章SEO优化
3. 图片优化 (Next/Image)

---

## 🎨 品牌规范

| 规范 | 内容 |
|------|------|
| **品牌名** | Will's AI Lab / Will AI Lab |
| **品种名** | サイベリアン ✅ / シベリアン ❌ |
| **品牌正式名** | 「サイベリアン｜大阪・福楽キャッテリー」 |
| **配色** | 冰淇淋色系 (mint, strawberry, blueberry, mango, taro) |
| **品牌色** | Mint (#5eead4), Cyan (#22d3ee), Berry (#a855f7) |

---

## 🔒 隐私和安全

### 已脱敏处理
- ❌ 无IP地址暴露
- ❌ 无端口号暴露
- ❌ 无家庭住址暴露
- ❌ 无文件路径暴露

### 评论系统限制
- 每IP每天最多5条评论
- 访客评论需要审核后公开

---

## 🚀 日常部署命令

```bash
# 进入项目目录
cd /Users/lauralyu/Projects/will-ai-lab

# 本地开发
npm run dev

# 构建测试
npm run build

# 部署到 Vercel
npx vercel deploy --prod --yes --token="$VERCEL_TOKEN"
```

---

## 📌 常用链接

| 链接 | 地址 |
|------|------|
| **网站** | https://aiblog.fuluckai.com |
| **GitHub** | https://github.com/mouxue56-debug/will-ai-blog |
| **Vercel Dashboard** | https://vercel.com/mouxue56-debugs-projects/will-ai-lab |
| **辩论API** | https://aiblog.fuluckai.com/api/debate/topics |

---

## 🔄 最近提交记录 (2026-03-22)

| Commit | 描述 |
|--------|------|
| `8c60999` | fix: 时间线按年份倒序排列 |
| `1b66032` | feat: 首页时间线增加2023自动化工作流和2024AI客服 |
| `22f7951` | fix: 首页时间线2024改为2022猫舍启程 |
| `f8d14b0` | fix: 首页时间线2025年改为猫舍全国第一 |
| `fbc6cf2` | fix: 2024年时间线修正为猫舍启程 |
| `0a60d92` | fix: 时间线修正 + 博客内容修复 + AI观点默认展开 |
| `ef424d4` | fix: 隐私修复 + 删除AI速递 + 辩论改名AI观点 |

---

## 💡 继续开发的建议

1. **调试模式**: `npm run dev` 启动本地开发服务器
2. **添加新文章**: 在 `src/content/blog/` 添加 `.md` 文件
3. **修改时间线**: 编辑 `src/data/timeline.ts`
4. **修改首页故事**: 编辑 `messages/zh.json` 中的 `story_node*` 字段
5. **修改导航文案**: 编辑 `messages/*.json` 中的 `nav.*` 字段

---

*本文档由 ナツ（ナツ）整理，最后更新于 2026-03-22*
