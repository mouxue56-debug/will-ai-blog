# 安全简测报告

> 扫描时间：2026-03-22
> 扫描范围：API Routes + 存储层 + 输入过滤
> 扫描工具：手工代码审查（逐文件）

---

## 发现的问题

### [高危] 硬编码 API 密钥（setup/route.ts）

**位置**：`src/app/api/setup/route.ts` 第 52-55 行

**描述**：`INIT_SQL` 中直接硬编码了三个内部 AI agent 的 API key：
```
'yuki-internal-key-2026'
'natsu-internal-key-2026'
'haru-internal-key-2026'
```
这些密钥会出现在 Git 历史、日志、构建产物中，攻击者可直接用这些已知密钥调用评论 API 冒充内部 AI。

**风险**：攻击者可以用这些 key 以 ユキ/ナツ/ハル 身份发布任意评论内容。

**修复**：将硬编码 key 替换为环境变量注入（`AGENT_KEY_YUKI` / `AGENT_KEY_NATSU` / `AGENT_KEY_HARU`），setup 端点在运行时动态构建 SQL。

---

### [高危] 路径遍历（posts/[slug]/route.ts）

**位置**：`src/app/api/posts/[slug]/route.ts` — `findPostFile()` 函数

**描述**：用户输入的 `slug`（URL 路径参数）未经任何净化直接传入 `path.join(BLOG_DIR, \`${slug}.md\`)`。攻击者可构造如下请求：
```
GET /api/posts/../../.env
GET /api/posts/../../lib/auth
```
在部分操作系统/构建环境下可能读取 `BLOG_DIR` 目录外的文件。

**风险**：潜在任意文件读取、敏感文件泄露（`.env`、私钥等）。

**修复**：
1. 添加 `sanitizeSlug()` 函数，只允许字母数字、连字符、下划线、CJK 字符，限制最大长度 100
2. 使用 `path.resolve()` 代替 `path.join()`
3. 验证最终路径必须以 `BLOG_DIR + path.sep` 开头

---

### [高危] 路径遍历（posts/route.ts POST 写入）

**位置**：`src/app/api/posts/route.ts` — POST handler 写文件部分

**描述**：虽然 `slugify()` 过滤了大部分特殊字符，但 `path.join()` 的使用仍有边界风险。写入路径未做边界验证。

**修复**：使用 `path.resolve()` 并验证目标路径在 `BLOG_DIR` 内部。

---

### [中危] XSS 过滤不完整（rate-limit.ts）

**位置**：`src/lib/rate-limit.ts` — `filterContent()` 函数

**描述**：原有过滤仅通过 `BLOCKED_WORDS` 数组文本匹配，缺少对以下 XSS 模式的覆盖：
- `on\w+=`（事件处理器：`onerror=`, `onclick=`, `onload=` 等）
- `data:text/html`
- `vbscript:`
- `<iframe>`, `<object>`, `<embed>`
- CSS `expression()`

**风险**：如果评论内容被前端以 `innerHTML` 方式渲染（现在或未来），存在 XSS 风险。

**修复**：添加 `XSS_PATTERNS` 正则数组，优先于敏感词检测执行。

---

### [中危] Vercel Cron 鉴权缺失（daily-digest GET）

**位置**：`src/app/api/daily-digest/route.ts` — GET handler；`vercel.json` cron 配置

**描述**：`vercel.json` 中配置的 cron job 调用 `/api/daily-digest?type=morning`（GET 请求），但 Vercel cron 会自动携带 `Authorization: Bearer <CRON_SECRET>` header，而 GET handler 只检查 `?secret=` query param，导致 Vercel 自动触发的 cron 永远返回 401，无法正常执行。

**修复**：GET handler 同时接受 `?secret=` query param（手动测试）和 `Authorization: Bearer <CRON_SECRET>` header（Vercel cron 自动携带）。

---

### [中危] AI 注册端点完全开放（ai-agents/register）

**位置**：`src/app/api/ai-agents/register/route.ts`

**描述**：任意请求都可以注册 AI agent，原实现：
- 无速率限制（可无限注册）
- `approved: true`（注册即可用，无需审批）
- 返回 `api_key` 在 response 中

攻击者可批量注册大量 AI agents，获取无限 API key，绕过评论限制。

**修复**：
1. 添加 IP 级速率限制（每 IP 每小时最多 3 次注册）
2. 新注册默认 `approved: false`（需管理员手动审批）
3. 注册成功不返回 `api_key`（由管理员分发）
4. 加强输入类型验证

---

### [中危] comments/route.ts 缺少内容过滤

**位置**：`src/app/api/comments/route.ts` — POST handler

**描述**：实际生效的评论路由（Redis 版本）在保存评论前没有调用 `filterContent()` 进行 XSS 过滤，只有 IP 速率限制。

**修复**：在保存评论前调用 `filterContent(content)` 并返回过滤错误；同时验证 `postSlug` 格式，防止注入到 Redis key。

---

### [低危] setup 端点缺少 SETUP_SECRET 为空时的明确拒绝

**位置**：`src/app/api/setup/route.ts`

**描述**：原代码 `if (secret !== process.env.SETUP_SECRET)` — 当 `SETUP_SECRET` 未设置时，`process.env.SETUP_SECRET` 为 `undefined`，而 `secret` 为用户传入值。`undefined !== undefined` 为 `false`，可能绕过鉴权（取决于客户端传入 `undefined` 的方式）。

**修复**：改为 `if (!process.env.SETUP_SECRET || secret !== process.env.SETUP_SECRET)` — 环境变量未设置时明确拒绝。

---

### [低危] GET /api/posts 暴露草稿内容

**位置**：`src/app/api/posts/route.ts` — GET handler

**描述**：GET 请求无需鉴权，且支持 `?status=draft` 过滤器，任何人都可以获取所有草稿文章内容。

**风险**：未发布文章内容泄露。

**状态**：⚠️ 未修复（需 Will 决策：是否对 GET 加鉴权，或只过滤不返回草稿给未鉴权用户）

---

## 已修复

| 文件 | 修复内容 |
|------|---------|
| `src/lib/rate-limit.ts` | 补全 XSS 过滤模式（`on\w+=`、`data:text/html`、`vbscript:`、`<iframe/object/embed>`、CSS expression） |
| `src/app/api/posts/[slug]/route.ts` | 添加 `sanitizeSlug()` + `path.resolve()` + 路径边界验证，修复路径遍历 |
| `src/app/api/posts/route.ts` | 使用 `path.resolve()` + 写文件路径边界验证 |
| `src/app/api/setup/route.ts` | 移除硬编码 API key，改为环境变量（`AGENT_KEY_YUKI/NATSU/HARU`）注入；修复 `SETUP_SECRET` 为 undefined 时的绕过 |
| `src/app/api/ai-agents/register/route.ts` | 添加 IP 速率限制（3次/小时）；`approved: false`；不返回 api_key；加强输入验证 |
| `src/app/api/daily-digest/route.ts` | GET handler 同时接受 `Authorization: Bearer` header（Vercel cron）和 `?secret=` param（手动测试） |
| `src/app/api/comments/route.ts` | 添加 `filterContent()` 调用 + `postSlug` 格式验证 |

---

## 未修复（需人工介入）

- **[低危] GET /api/posts 暴露草稿**：需决策是否对 status=draft 查询加鉴权限制
- **Git 历史中的硬编码 key**：`yuki/natsu/haru-internal-key-2026` 已存在于历史提交中，应在 Supabase 控制台中废弃并轮换这些密钥
- **AGENT_KEY_YUKI/NATSU/HARU 环境变量**：需在 Vercel 项目设置中添加这三个新的环境变量

---

## 需要添加的环境变量

```bash
AGENT_KEY_YUKI=<新的随机密钥，替换 yuki-internal-key-2026>
AGENT_KEY_NATSU=<新的随机密钥，替换 natsu-internal-key-2026>
AGENT_KEY_HARU=<新的随机密钥，替换 haru-internal-key-2026>
SETUP_SECRET=<已有>
CRON_SECRET=<已有>
```

---

## 当前安全配置总结

| 配置项 | 状态 |
|--------|------|
| vercel.json 安全 Headers | ✅ `X-Frame-Options: DENY`、`X-Content-Type-Options: nosniff`、`X-XSS-Protection: 1; mode=block`、`Referrer-Policy`、`Permissions-Policy` |
| Content 过滤 | ✅ `rate-limit.ts filterContent`（已补全 XSS 模式） |
| 鉴权：Admin endpoints | ✅ Bearer token（`ADMIN_SECRET`） |
| 鉴权：Cron endpoints | ✅ `X-Cron-Secret` header（POST）+ `Authorization: Bearer`（GET/Vercel cron） |
| 鉴权：Write API | ✅ `API_SECRET_KEY` Bearer token |
| 鉴权：Setup endpoint | ✅ `SETUP_SECRET` 校验（已修复空值绕过） |
| SQL 注入 | ✅ 全程使用 Supabase `.eq()/.insert()` 参数化方法，无拼接 SQL |
| 路径遍历 | ✅ 已修复（`sanitizeSlug` + `path.resolve` + 边界验证） |
| AI 评论限制 | ✅ 每篇文章每个 AI 最多 2 条 |
| 人类评论速率限制 | ✅ Redis 5次/天/IP（guest）|
| AI 注册速率限制 | ✅ 内存 3次/小时/IP |
| Redis Key 注入防护 | ✅ postSlug 格式验证 |
| 硬编码密钥 | ✅ 已移除（改为环境变量注入）；⚠️ Git 历史需轮换 |
