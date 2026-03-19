# Will's AI Blog — Project Brief

## 域名
aiblog.fuluckai.com

## 定位
个人博客 + 技术分享（不过度强调技术，写得出来最重要）
日常生活 + AI使用心得 + 宠物 + 社交媒体联动
"这个人真的在用AI做事"的真实感

## 品牌关联
- 母站：fuluckai.com（福楽AI，AI導入・AI研修サービス）
- 猫舍：福楽キャッテリー（サイベリアン専門）
- 品牌色系：冰淇淋色（mint, strawberry, blueberry, mango, taro）

## 技术栈
- Next.js 15 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Aceternity UI（spotlight cards, text shimmer, 3D effects）
- Magic UI（animated beam, particles, globe, marquee）
- Motion / Framer Motion（页面转场 + 滚动动画）
- Recharts（数据可视化）
- next-intl（i18n: /zh /ja /en）
- Pagefind（全站搜索，CJK支持）
- Vercel 部署

## 设计规范

### 双主题（必须）
- 深色模式：暖黑底 #0a0a0f，不是纯黑
- 浅色模式：苹果风干净白底
- 一键切换（跟随系统偏好 + 手动切换按钮）
- 两种模式都要好看

### 色系（与 fuluckai.com 统一）
- Mint: #4ADE80（主强调色）
- Strawberry/Coral: #FB923C（次强调色）
- Blueberry/Cyan: #22D3EE（第三强调色）
- Mango: #FBBF24（辅助）
- Taro: #A78BFA（辅助）
- 浅色模式下适当降低饱和度

### 移动优先（核心要求）
- 手机体验第一位
- 底部 tab 导航（手机）/ 侧边导航（桌面）
- 大字体、大触摸区域、流畅滑动
- 所有交互都要手机友好

## 页面结构

### 1. 首页 (/)
- Hero：动效标题 + 一句话介绍（"大阪 × AI × 猫舍"）
- 最新文章/动态 feed
- SNS 联动入口（YouTube/Instagram/TikTok 卡片）
- AI 助手状态仪表盘（点缀式，展示4个AI实例：ユキ/ナツ/ハル/アキ）
- fuluckai.com 互链

### 2. 博客 (/blog)
- 文章列表（卡片式布局）
- 分类标签筛选：AI心得 · 技术笔记 · 生活日常 · 猫咪 · 商业思考
- 每篇支持三语（中/日/英）
- Markdown + MDX 渲染 + 代码高亮
- AI可编辑 + 人工可编辑
- 评论区（AI评论 + 人工评论）

### 3. 时间线 (/timeline)
- 垂直时间线，日记式
- 颜色编码：
  - 🔧 技术（cyan #22D3EE）
  - 📝 日常（coral #FB923C）
  - 🏆 里程碑（mint #4ADE80）
  - 💭 感悟（taro #A78BFA）
- 按类型/日期/关键词筛选
- 30+ 条示例数据

### 4. 案例 (/cases)
- AI实践案例（讲故事为主，不用太深度）
- 旗舰案例：
  - 多AI协作架构（ユキ/ナツ/ハル/アキ）
  - 猫舍SNS自动化运营
  - 医疗客服AI系统
- 三层展开（故事→技术概述→深度细节）
- 带证据（截图占位符/数据/链接）

### 5. 生活 (/life)
- 猫咪日常 🐱
- 大阪生活 🏙️
- 美食/旅行
- 瀑布流/Masonry 图文布局
- 和猫舍SNS内容联动

### 6. 社交媒体 (/social)
- YouTube 最新视频嵌入
- Instagram feed 联动
- TikTok 精选嵌入
- 各平台关注入口按钮
- 预留AI自动同步接口

### 7. About (/about)
- 个人介绍：Will，大阪 × AI × 猫舎经营者
- AI工作方式简图（四实例架构动画）
- fuluckai.com 链接
- 猫舎链接
- 联系方式

## AI 深度集成

### 编辑系统
- API: /api/posts (CRUD)
- 多AI可通过API创建/编辑文章草稿
- 草稿→审核→发布 工作流
- OpenClaw webhook 接入点
- 人工管理界面 /admin

### 评论系统
- API: /api/comments
- AI评论带标记（哪个AI、什么模型）
- 人工评论正常支持
- 评论审核机制

### 自动更新
- 定期扫描素材 → 生成候选稿
- 候选稿队列 /admin/queue
- 一键 approve/edit/reject
- 自动三语翻译 + 审核状态

## SEO 强化
- SSG + ISR 混合渲染
- JSON-LD 结构化数据
- Open Graph + Twitter Cards
- 多语言 hreflang 标签
- 自动 sitemap.xml + robots.txt
- RSS 订阅
- Lighthouse 90+ 目标

## 联动
- fuluckai.com 互链
- 猫舍 SNS 内容导入
- AI 猫咪科普/趣事生成
- YouTube/Instagram/TikTok 嵌入和同步

## 动效要求
- Aceternity UI: spotlight cards, text reveal, shimmer, 3D pin
- Magic UI: animated beam, particles, marquee, globe
- Motion: 页面转场、滚动触发、卡片展开
- 最大程度丰富但不廉价
- 参考 Linear / Stripe / Rauno.me 的节奏感
