---
slug: content-pipeline-full-auto
title:
  zh: "一句话触发全链路：AI 内容全自动流水线设计"
  ja: "一言でフルチェーン起動：AIコンテンツ全自動パイプライン設計"
  en: "One Command, Full Pipeline: Designing a Fully Automated AI Content System"
category: "learning"
date: "2026-03-29"
author: Will
readingTime: 10
excerpt:
  zh: "从搜索话题到发布上线，AI 全自动完成。draft/publish 两模式、阶段产物落盘（失败可续跑）、TTS 三重校验，让内容生产真正自动化。"
  ja: "話題の検索から公開まで、AIが全自動完了。draft/publishモード、段階的成果物保存（失敗時再開可能）、TTS三重検証でコンテンツ制作を真に自動化。"
  en: "From topic research to publishing, fully automated by AI. Draft/publish modes, staged artifact saves for resumability, triple TTS validation for truly automated content production."
tags: ["ai", "content", "automation", "tts", "pipeline"]
contentSource: "ai-learning"
audioUrl: "/audio/content-pipeline-full-auto.mp3"
willComment:
  zh: "不是懒，是把时间留给更重要的事"
---

# 一句话触发全链路：AI 内容全自动流水线设计

想象一下这个场景：

你对 AI 说："写一篇关于 Claude Code 实用技巧的文章，发到博客。"

然后你去泡了杯咖啡。20 分钟后，文章已经上线，带音频导读，URL 已经发到了你的 Telegram。

这不是科幻，这是内容全自动流水线的日常。

## 核心问题：手动流程太耗时

传统的内容生产流程是这样的：

1. 打开搜索引擎，查资料（15 分钟）
2. 整理思路，写大纲（20 分钟）
3. 写文章（1-2 小时）
4. 排版成网页（30 分钟）
5. 生成音频（10 分钟）
6. 上传到服务器（5 分钟）
7. 发布到博客（5 分钟）

一篇 3000 字的文章，前前后后要 2-3 小时。如果每天都要产出，这个工作量是不可持续的。

**内容流水线的目标**：把 2-3 小时压缩到 20 分钟，而且你只需要说一句话。

## 标准流程：5 步全自动

```
Step 1: 调研（SearXNG + web_fetch）
  ↓ → 产物：01-brief.md（调研包）落盘
Step 2: 文章生成（kimi-k2.5）
  ↓ → 产物：02-article.mdx + meta.json 落盘
Step 3: 网页化（knowledge-to-web skill）
  ↓ → 产物：03-article.html（可选）
Step 4: TTS 音频（MiniMax speech-2.8-hd）[Publish模式]
  ↓ → 产物：04-audio.mp3 + Supabase URL
Step 5: 博客发布（git push + Vercel）[Publish模式]
  ↓ → 产物：05-publish.json（含博客URL + 验证状态）
```

每一步都有明确的产物落盘，任何步骤失败都能从最近成功节点续跑，不需要整条重来。

## Draft 模式 vs Publish 模式

流水线有两种入口模式：

| 触发词 | 模式 | 行为 |
|--------|------|------|
| "写一篇...草稿" / "先出内容看看" | Draft 模式 | 调研→成文→HTML，不发布，Telegram 发内容预览 |
| "发到博客" / "出一篇...发布" | Publish 模式 | 完整五步全走，发布后回传链接 |

**默认是 Draft 模式**。如果用户没说清楚，系统会问："要直接发布，还是先出草稿审一下？"

这样设计是为了安全。AI 生成的内容可能有事实错误、语气不当、或者不符合你的预期。先出草稿让你审阅，比直接发布后发现有问题要好得多。

## Step 1：调研

搜索引擎用 SearXNG（本地部署），不需要 API Key，没有搜索次数限制。

```bash
# 中文搜索
curl --noproxy '*' "http://127.0.0.1:8890/search?q=关键词&format=json&language=zh&engines=bing"
```

**注意**：必须加 `--noproxy '*'`（系统有 tinyproxy 代理，不加会超时）。Bing 是当前唯一可靠引擎（Google/DDG/Brave 被 CAPTCHA/限流）。

调研输出不只是堆素材，而是结构化的"调研包"：

- 核心论点（3-5 个）
- 可引用事实 + 来源链接
- 争议点/风险点
- 推荐文章结构（给 Step 2 用）

产物落盘：`~/Desktop/博客文章/<slug>/01-brief.md`

## Step 2：文章生成

模型用 kimi-k2.5（日语/中文文章、AI 工具评测、行业分析的首选）。

文章规范：

- 格式：Markdown，含 frontmatter
- 长度：3000-15000 字（有深度不灌水）
- 风格：口语化、有观点、有态度
- **禁止**："欢迎收听本期播客"等模板头

frontmatter 包含标题、描述、发布日期、分类、音频 URL、标签等元信息。

meta.json 包含 tts_source_hash，用于 Step 4 的校验。

产物落盘：
- `~/Desktop/博客文章/<slug>/02-article.mdx`
- `~/Desktop/博客文章/<slug>/meta.json`

## Step 3：网页化（可选）

调用 knowledge-to-web skill，生成深海暗色风格的 HTML 页面。

这一步是可选的。如果失败，不会阻塞后续步骤。

Draft 模式下，HTML 文件会同步发 Telegram 给你预览。

产物落盘：`~/Desktop/博客文章/<slug>/03-article.html`

## Step 4：TTS 音频

这是最容易出问题的环节，所以设计了三重校验：

### 校验 1：文本来源验证

TTS 必须来源于文章正文直接抽取，**绝不经 LLM 改写**。

❌ 错误做法：让 LLM "生成一段音频导读"
✅ 正确做法：直接用文章正文前 150 字（或指定摘要段落）

为什么？因为 LLM 会生成"欢迎收听本期播客"、"大家好，我是 AI 主播"这种模板废话，听起来很假。

### 校验 2：模板头检查

生成前检查文本前 3 句，是否含：
- "欢迎收听"
- "本期播客"
- "大家好，我是"
- 任何明显的播客开场白模板

发现 → 截断前面部分，从实质内容开始。

### 校验 3：URL 可访问验证

上传 Supabase 后，`curl -I <audioUrl>` 确认返回 200。

**MiniMax TTS 调用**：

```bash
curl -X POST "https://api.minimaxi.com/v1/t2a_v2" \
  -H "Authorization: Bearer $MINIMAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-2.8-hd",
    "text": "导读内容...",
    "stream": false,
    "voice_setting": {
      "voice_id": "Japanese_GracefulMaiden",
      "speed": 1,
      "vol": 1,
      "pitch": 0
    },
    "audio_setting": {
      "sample_rate": 32000,
      "bitrate": 128000,
      "format": "mp3",
      "channel": 1
    }
  }'
```

**关键参数**：
- 模型必须是 `speech-2.8-hd`（不是 `speech-02`，会报 2013 错误）
- 必须包含 `voice_setting` 对象（缺少会报 `invalid params, empty field`）
- 音色：`Japanese_GracefulMaiden`（中日双语自然）
- 域名：`api.minimaxi.com`（两个 i）
- 响应：`data.audio` 字段是 hex 字符串，需转为二进制保存

**音频上传到 Supabase**：

```bash
curl -X POST "https://tafbypudxuksfwrkfbxv.supabase.co/storage/v1/object/audio/<slug>.mp3" \
  -H "Authorization: Bearer $SUPABASE_TOKEN" \
  -H "Content-Type: audio/mpeg" \
  --data-binary @<本地文件路径>
```

产物落盘：`~/Desktop/博客文章/<slug>/04-audio.mp3`

**TTS 降级链**：

1. 方案 A：本地 Qwen3-TTS
2. 方案 B：OpenClaw 内置 Edge TTS
3. 切换降级方案前必须告知用户

## Step 5：博客发布

文件路径：`/Users/lauralyu/projects/will-ai-lab/src/content/blog/<slug>.md`

slug 规则：英文小写 + 短横线（如 `claude-code-practical-tips`）

frontmatter 包含完整的元信息，包括 audioUrl。

发布命令：

```bash
cd /Users/lauralyu/projects/will-ai-lab
git add .
git commit -m "feat: add blog post - <标题>"
git push origin main
vercel --prod --yes --token <token>
```

**注意**：必须加 `--prod`（否则是 preview 部署）+ `--yes`（跳过确认）。

**发布后验证**：

```bash
# 等待 Vercel 边缘传播 (~30s)
sleep 30
# 验证博客页面可访问
curl -s -o /dev/null -w "%{http_code}" https://aiblog.fuluckai.com/blog/<slug>
# 验证音频 URL 可访问
curl -s -o /dev/null -w "%{http_code}" <audioUrl>
```

产物落盘：`~/Desktop/博客文章/<slug>/05-publish.json`（含 blog_url / audio_url / deploy_time / verification_status）

## 阶段产物落盘的价值

每步完成后写文件到本地目录，有什么好处？

**失败可续跑**：如果 Step 4 TTS 失败，不需要从 Step 1 重新开始。修复 TTS 问题后，直接从 Step 4 续跑。

**人工干预**：如果某一步的结果不满意，可以手动修改产物文件，然后继续下一步。

**审计追踪**：所有中间产物都保留，可以回溯整个流程。

## SearXNG 替代 Brave Search 的背景

早期的流水线用 Brave Search API，但后来遇到了问题：

- API 有调用次数限制
- 某些查询返回结果质量不稳定
- 需要 API Key，增加配置复杂度

SearXNG 是本地部署的元搜索引擎，聚合了 89 个搜索引擎（Google/Bing/Brave/DuckDuckGo/StartPage/Wikipedia 等）。

优势：
- 无 API Key 限制
- 无搜索次数限制
- 支持中日英搜索，自动语言分流
- 本地部署，响应快

唯一的限制是：Google/DDG/Brave 已被封（CAPTCHA/限流），Bing 是当前唯一可靠引擎。

## 全局错误处理策略

```
任何步骤失败？
├─ Step 1 调研失败 → 告知用户，建议换话题或手动提供参考资料
├─ Step 2 文章生成失败 → 换模型重试一次（kimi→MiniMax M2.5）
├─ Step 3 HTML 失败 → 跳过（非必需），继续 Step 4
├─ Step 4 TTS 失败 → 告知用户并询问降级方案
├─ Step 5 部署失败 → 检查 build log，修复后重试
└─ 连续 2 步失败 → 停止，Telegram 汇报
```

## 完成后的交付回执

```
✅ 内容流水线完成

📄 文章：<标题>
🔗 博客：https://aiblog.fuluckai.com/blog/<slug>（或"草稿模式，未发布"）
🎵 音频：<audioUrl>（或"未生成/使用降级方案"）
📁 本地：~/Desktop/博客文章/<slug>/

产物清单：
  01-brief.md      ✅ 调研包
  02-article.mdx   ✅ 文章正文
  03-article.html  ✅/跳过
  04-audio.mp3     ✅/降级/跳过
  05-publish.json  ✅/跳过（draft模式）

验证结果：
  博客页面：✅ 200 / ❌ 异常
  音频URL：✅ 200 / ❌ 异常
```

## 总结

内容全自动流水线的核心价值是：**一句话触发全链路，把时间留给更重要的事**。

Draft/Publish 双模式兼顾安全和效率。阶段产物落盘确保失败可续跑。TTS 三重校验防止生成模板废话。

从调研到发布，原本 2-3 小时的工作压缩到 20 分钟。这不是为了偷懒，而是为了把有限的时间投入到更有创造性的工作中。

正如流水线的设计者所说：**"不是懒，是把时间留给更重要的事。"**
