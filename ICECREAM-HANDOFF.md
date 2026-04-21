# 🍨 冰淇淋改造 HANDOFF

> 给远程 scheduled agent `trig_017Ef4vcwBRjTfkRnRqXBQaz`（每 3h）接力用。
> 跟 Will 已有的 `HANDOFF.md`（项目备份文档）不冲突。

## 最新状态: 2026-04-17 04:30 JST
## 上一个 agent: Claude Code 本地（Will Max Plan）

---

## 本次做了（4/17 凌晨）

- ✅ E01 完整备份 `~/projects/backups/will-ai-lab-pre-icecream-20260417-0426.tar.gz` + git tag `pre-icecream-redesign-20260417`
- ✅ S01 提取 fuluckpet.com 精确 CSS 变量
- ✅ S02 温馨视觉规范（在 `~/projects/design-system-icecream/` 本地）
- ✅ S03 组件样式（tokens.css / components.css / tailwind.config.js）
- ✅ **E02 核心**：`src/app/globals.css` 改成 fuluckpet 精确配色
  - 删除 coral 橙 `#fbbf24` → strawberry 粉 `#F9B8D0`
  - mint/taro/mango 对齐 fuluckpet
  - Warm green-tinted shadows (`rgba(90,122,122,*)`)
  - 新签名组件类：`.scroll-progress-bar` / `.card-icecream` / `.btn-icecream-primary` / `.bg-milk-*` / `.text-brand-gradient`
  - 背景 `#fafaf9` → `#FFFCF0` 暖奶油
  - 文字 纯黑 → `#5A7A7A` 带绿调灰
  - Tailwind HSL 变量对齐（bg-background / text-foreground / bg-primary 等）

---

## 下一 agent 立即做

### P0 必做

1. **测 build**：`npm install --legacy-peer-deps && npm run build`
   - 如出错：不要 revert globals.css，改调用方代码
2. **`src/components/ui/` 扫描**：
   - grep `blue-500|indigo-500|violet-500|purple-500|blue-600|indigo-600`
   - 换成 `brand-mint / brand-strawberry / brand-taro` 对应 Tailwind 类
   - 暗色模式（`dark:`）暂不动
3. **加 Scroll Progress Bar** 到 `src/app/layout.tsx`：
```tsx
<div className="scroll-progress-bar" id="scroll-progress" />
<script dangerouslySetInnerHTML={{__html: `
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      const el = document.getElementById('scroll-progress');
      if (el) {
        const h = document.documentElement;
        const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
        el.style.width = pct + '%';
      }
    });
  }
`}} />
```

### P1 再做

4. 首页 `src/app/[locale]/page.tsx`: hero 用 `.text-brand-gradient`，cards 换 `.card-icecream`
5. Blog 列表 `src/app/[locale]/blog/page.tsx`: 全部 card 改 `.card-icecream`
6. Blog 文章 `src/app/[locale]/blog/[slug]/page.tsx`: 段落 `leading-loose` (line-height 2), 引用块 `.bg-milk-mint`
7. Header/Footer（`src/components/layout/` 或 `common/`）
8. 三语同步（`src/i18n/` 中/日/英）

### P2 最后

9. 404 温馨化
10. 每页 SEO meta + OG 图
11. 性能（字体 preload / 图片 lazy / dynamic import）

---

## 绝对不能碰 ❌

- `src/app/[locale]/debate/*` — Yuki cron 07:03/19:48/08:00-08:30 依赖
- `src/content/blog/*` 已有文章 — Yuki 定时写新的
- `.env.local` / Supabase / Vercel 配置
- `HANDOFF.md`（Will 的项目备份文档，不是给你的）
- 原有的 `.github/workflows/*` （如有）

---

## 设计系统速查

已在 `src/app/globals.css` @theme 内定义：

```css
--color-brand-mint: #7DD3C0
--color-brand-mint-dark: #5BC4A8
--color-brand-strawberry: #F9B8D0
--color-brand-blueberry: #B8D4F9
--color-brand-mango: #FFE5A0
--color-brand-taro: #D4BCF0
--color-brand-peach: #FFDAB8

--color-milk-mint: #F0FFFA
--color-milk-strawberry: #FFF8FB
--color-milk-blueberry: #F5FAFF
--color-milk-mango: #FFFCF0
--color-milk-taro: #F8F4FF
--color-milk-peach: #FFF7F0

/* 签名 class */
.scroll-progress-bar          顶部四色渐变进度条
.card-icecream                 白卡片 + 暖阴影 + hover 上浮
.btn-icecream-primary          主按钮（mint + 圆角 + spring 动效）
.bg-milk-mint/.bg-milk-*       六色 milk 背景
.shadow-ice-soft/card/hover    暖绿调阴影
.text-brand-gradient           四色品牌渐变文字
```

Tailwind 语义化（HSL 变量已对齐 fuluckpet）：
- `bg-background` → `#FFFCF0` 暖奶油
- `text-foreground` → `#5A7A7A` 带绿调灰
- `bg-primary` → mint `#7DD3C0`
- `border-border` → soft green-gray
- `radius` → 16px 默认

---

## 工作流程

1. `cat ICECREAM-HANDOFF.md`（你正在看）
2. `git log --oneline -10` 看历史
3. 选 1-3 个任务做（别贪多）
4. `npm install --legacy-peer-deps && npm run build` 验证
5. 更新这个 `ICECREAM-HANDOFF.md` 记录本次做了什么 + 下次做什么
6. `git add -A && git commit -m "[auto-icecream] XXX" && git push origin main`
7. Vercel 自动部署

---

## 退出条件

- 2 小时（保留时间余量）
- 连续 3 次 build 失败
- 当前列表全部做完（去生成 `docs/ice-cream-v2-backlog.md`）

---

## 任务耗尽时可做

1. 扫 `src/content/blog/` 最新 3 篇，为每篇写视觉优化建议 → `docs/ice-cream-v2-backlog.md`
2. 给现有 hover 加 spring 缓动（`cubic-bezier(0.34, 1.56, 0.64, 1)`）
3. 加 `prefers-reduced-motion` a11y 保护
4. 图片加 `loading="lazy"` 
5. 字体加 `<link rel="preload" as="font">`
6. 永远有事做

---

## 问题升级

3 次 build 失败 / 遇到需要 Will 决定的设计选择 → 在本文件加 `## ❌ 卡住需 Will 决策` 段落，描述清楚，不要硬推不要 revert 好进度。
