# 蜂群开发计划：Will's AI Blog 网站改造

## 项目概览
- **项目路径**: /Users/lauralyu/Projects/will-ai-lab
- **技术栈**: Next.js 15 + TypeScript + Tailwind + shadcn/ui + Motion + next-intl三语 + next-themes双主题
- **代码规模**: ~16,000行 / 70+文件
- **部署**: Vercel (https://aiblog.fuluckai.com)
- **当前状态**: 已回滚到稳定版本(c18fc63)，视觉动效丢失

## 改造目标（从用户需求提取）
1. **华丽视觉**：展示AI技术力，动效炫酷
2. **时间线真实内容**：目前页面为空，需填入真实事件数据
3. **内容来源标记**：2026-03-15前=AI整理，之后=Will原创
4. **Bug修复**：日期显示、部分文章问题
5. **SEO/Geo优化**：结构化数据、hreflang、大坂地理标签
6. **案例页面特效抖动**：待修复

## 技术债和风险

### P0（阻塞开发）
- timeline页面为空：timeline-data.ts已创建但timeline组件还在用旧data
- 部分文章frontmatter格式问题（分隔符不统一）

### P1（影响质量）
- 视觉动效在回滚中丢失，需要重新添加
- 移动端动画性能未优化

## 模块划分

| 模块 | 职责 | 文件范围 | 复杂度 | 推荐模型 |
|------|------|----------|--------|----------|
| timeline-content | 时间线数据填充+页面调试 | src/lib/timeline-data.ts, src/components/timeline/* | low | kimi |
| content-marking | 内容来源标记 | src/content/blog/*.md, src/components/blog/* | low | kimi |
| visual-enhancement | 华丽视觉动效 | src/components/* | high | sonnet |
| bug-fixes | 日期/Bug修复 | src/lib/blog.ts, src/content/blog/*.md | mid | kimi |
| seo-optimization | SEO/Geo优化 | src/app/[locale]/*.tsx | mid | kimi |

## 任务拆分（Phase 1细化）

### Round 1: 基础修复
1. [timeline-content] 时间线数据接入 - 让timeline页面显示真实数据
2. [content-marking] 内容标记 - 每篇文章添加AI整理/原创标记
3. [bug-fixes] 日期修复 - 修复Invalid Date问题

### Round 2: 华丽视觉
4. [visual-enhancement] Hero区域炫酷动效
5. [visual-enhancement] 博客卡片入场动画
6. [visual-enhancement] 页面切换过渡效果

### Round 3: 深度优化
7. [seo-optimization] 结构化数据完善
8. [seo-optimization] Geo标签+hreflang
9. [visual-enhancement] 案例页面特效修复

## 预估资源
- **Worker数量**: 3个并行
- **预计轮次**: 3轮
- **Token预算**: 约500K（使用kimi经济模型）
- **运行时间**: 约2-3小时

## 验证方法
- `npm run build` 成功
- `https://aiblog.fuluckai.com` 所有页面正常访问
- 时间线页面显示真实事件
- 文章显示正确日期和来源标记
