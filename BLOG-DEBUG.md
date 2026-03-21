# Will's AI Blog — 调试与修复日志

**创建时间：** 2026-03-21 23:27 JST
**状态：** 🔴 调试中
**目标：** 修复所有翻译/显示/内容问题，直到网站无问题

---

## 问题清单（审计中...）

### Phase 1: 内容审计
- [ ] 扫描27篇博客文章
- [ ] 标记空内容/字符串title/标题内容不符/翻译缺失

### Phase 2: 批量修复
- [ ] 空内容：补充内容或标记「待补充」
- [ ] 字符串title：全部转为 `{zh, ja, en}` 对象格式
- [ ] 标题内容不符：修正标题和摘要

### Phase 3: 翻译补全
- [ ] 为尚未翻译的22篇文章生成日英标题+摘要
- [ ] 有transcription的B站帖子：根据音频补充正文

---

## 已知问题（已确认）

1. **字符串title问题** — blog.ts 已修复（commit 12aef9d）
2. **B站帖子标题与内容不符** — 已修复2个（BYD充电、奈良小鹿），还有多个内容空洞
3. **大部分文章无日英正文翻译** — 只有5篇文章有完整翻译
4. **很多B站帖子正文是空的** — 需要根据 transcription 补充

---

## 技术栈
- Next.js 15 + TypeScript + Tailwind + shadcn/ui + Motion + next-intl
- 三语：zh / ja / en
- 部署：Vercel（aiblog.fuluckai.com）
- 内容目录：`src/content/blog/`

## Transcriptions 目录
- `/tmp/bilibili-downloads/*.txt` — B站视频音频转录

---

*最后更新：2026-03-21 23:27*
