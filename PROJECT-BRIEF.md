# Will's AI Lab — Project Brief

## 项目定位
日本大阪 AI 自动化实践者 Will 的个人网站。展示真实 AI 使用经验，打造 AI 专家形象。
不是纯作品集，是有日记感的"数字实验室"——生活+技术混合的真实记录。

## 核心要求
- 视觉花哨、有冲击力、有品味（不是模板感）
- 技术含量高但易阅读
- 中日英三语（next-intl）
- 默认深色模式

## 技术栈
- Next.js 15 App Router + TypeScript
- Tailwind CSS + shadcn/ui（底座组件）
- Aceternity UI（spotlight cards, text shimmer, 3D effects）
- Magic UI（animated beam, particles, globe, marquee）
- Motion（Framer Motion, 页面转场+滚动动画）
- Recharts（数据可视化）
- next-intl（i18n, /zh /ja /en 路由）
- Pagefind（搜索）
- Vercel 部署

## 视觉设计规范
- 底色：暖黑/墨蓝黑（不是纯黑 #000，用 #0a0a0f 或 #0d1117）
- 强调色：
  - Mint: #4ADE80
  - Warm Coral: #FB923C
  - Electric Cyan: #22D3EE
- 动效克制但高级：首屏进入、滚动联动、卡片展开，不要到处 hover 发光
- 把真实数据当装饰物（模型名、执行耗时、自动化次数 > 粒子背景）
- 参考 Linear.app / Stripe / Rauno.me / Supabase 的信息分层和节奏

## 页面结构

### 1. 首页 (/)
- Hero: 一句定位 + "最近7天我让AI做了什么" 动态展示
- 四实例架构动画图（ユキ/ナツ/ハル/アキ 四个 AI 助手协同工作）
- 最新案例卡片（spotlight hover 效果）
- 数据仪表板预览（月度 AI 使用统计）
- 语言切换

### 2. 案例库 (/cases)
- 卡片列表，悬停显示技术栈标签 + 效果数据
- 每个案例页三层深度：
  1. 故事化摘要（200字 + 可视化图）
  2. 技术概述（工具链、方法论、可折叠代码块）
  3. 深度细节（完整代码、架构权衡、踩坑记录）
- 旗舰案例：
  - OpenClaw 四实例协作架构
  - 猫舍 SNS 自动化运营
  - 医疗客服 AI 系统

### 3. 时间线 (/timeline)
- 垂直时间线，颜色编码区分类型：
  - 🔧 技术突破（cyan）
  - 📝 日常碎片（coral）
  - 🏆 里程碑（mint）
  - 💭 感悟（灰白）
- 支持按类型/日期/关键词筛选
- 滚动加载，展开/折叠详情
- 先放 30-50 条精选内容

### 4. 工具箱 (/toolkit)
- 我使用的 AI 工具链（OpenClaw, Codex, Claude, DS Thinking 等）
- 每个工具卡片：名称、用途、评分、使用频率
- 方法论文章

### 5. 生活 (/life)
- 日常更新板块（猫咪、大阪生活、美食等）
- 瀑布流图文布局
- 轻松调性，和技术板块形成反差

### 6. About (/about)
- 个人介绍：Will，大阪，猫舍经营者 × AI 实践者
- AI 工作方式说明（四实例架构简图）
- 联系方式

## 三语策略
- URL: /zh/..., /ja/..., /en/...
- 默认按浏览器语言跳转
- 核心页面（首页/About/旗舰案例）三语结构对齐
- 时间线内容分层：中文全量，日文业务摘要，英文技术摘要

## MVP 内容（用示例数据）
- 首页 Hero + 架构动画
- 3个案例卡片（用 placeholder 数据）
- 时间线 30 条示例
- About 页面
- 工具箱 + 生活板块（基础框架）
- 深色主题 + 响应式
- 三语路由框架（内容用占位符）

## 不在 MVP 范围
- AI 自动更新后台（Phase 2）
- 评论系统（Phase 2）
- 社交证明墙（Phase 2）
- 搜索功能（Phase 2）
