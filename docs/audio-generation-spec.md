# 博客音频导读生成规范

> 建立时间：2026-03-25
> 背景：蜂群批量生成时用了LLM改写文本，导致每篇音频都有"欢迎收听本期播客"模板头，
> 且AudioPlayer的src路径错误，造成大量返工。本文档防止重复踩坑。

---

## 一、核心原则

**音频内容 = 文章正文直接TTS，绝不经过LLM改写**

LLM改写会产生：
- 固定模板开头（"欢迎收听本期播客，今天我们要聊的是..."）
- 内容脱离原文
- 每篇听起来一模一样

---

## 二、正确的TTS调用格式

### MiniMax speech-2.8-hd（首选，GracefulMaiden音色）

```python
import subprocess, json

payload = {
    "model": "speech-2.8-hd",
    "text": "从文章正文提取的原始文本，不经LLM改写",
    "stream": False,
    "voice_setting": {
        "voice_id": "Japanese_GracefulMaiden",  # 必须有这个对象
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
}

result = subprocess.run([
    "curl", "-s", "-X", "POST", "https://api.minimaxi.com/v1/t2a_v2",
    "-H", f"Authorization: Bearer {MINIMAX_KEY}",
    "-H", "Content-Type: application/json",
    "-d", json.dumps(payload, ensure_ascii=False)
], capture_output=True, text=True, timeout=60)

data = json.loads(result.stdout)
# 检查错误
if data.get("base_resp", {}).get("status_code", 0) != 0:
    print("错误:", data["base_resp"])
# 解析hex音频
audio_hex = data["data"]["audio"]
with open("output.mp3", "wb") as f:
    f.write(bytes.fromhex(audio_hex))
```

### ❌ 错误格式（不要用）

```python
# 错误1：multipart upload
files={"model": (None, "speech-2.8-hd"), "text": (None, text), ...}

# 错误2：缺少voice_setting对象 → 返回 2013 invalid params, empty field
payload = {"model": "speech-2.8-hd", "text": text}  # 缺voice_setting
```

---

## 三、音频导读内容标准

### 什么是导读（非常重要）

音频不是朗读正文，是**引导读者进入文章**的30~60秒钩子。

**好的导读 = 提炼核心 + 制造悬念 + 邀请阅读**

示例（osaka-sakura-2026）：
> 今年大阪的樱花比去年晚了整整4天。3月初的持续低温让染井吉野迟迟未开，
> 但一旦开放，从满开到散落只有一周。如果你也在大阪，或者打算来——
> 这篇文章告诉你最佳的赏樱时机和路线。

**不好的导读（不要这样写）：**
- "欢迎收听本期播客，今天我们要聊的是……" ← 模板废话
- 直接朗读正文第一段 ← 没有引导感
- 只念标题 ← 太短没内容

### 导读生成Prompt（给LLM用）

```
你是一个博客音频导读编辑。请根据以下文章正文，写一段30~60秒的中文音频导读。

要求：
1. 提炼文章最有价值的1~2个核心信息
2. 制造轻微悬念或好奇心，引导读者想继续读
3. 语气自然口语化，像朋友推荐一篇文章
4. 不要有"欢迎收听"、"本期播客"等模板开头
5. 结尾可以用"想了解更多，往下看"或类似自然收尾
6. 字数控制在100~150字

文章正文：
{body}

只输出导读文本，不要任何解释。
```

### 导读生成流程

```
文章正文 → LLM生成导读文本（用上方Prompt）→ MiniMax TTS → mp3
```

注意：**LLM只用来写导读文字，不改变TTS格式**。TTS调用仍然按第二节的格式。

---

## 四、正文提取规范

```python
def extract_body(filepath, max_chars=300):
    with open(filepath, 'r', encoding='utf-8') as f:
        raw = f.read()
    # 跳过frontmatter
    if raw.startswith('---'):
        idx = raw.find('---', 3)
        body = raw[idx+3:] if idx != -1 else raw
    else:
        body = raw
    # 清理markdown语法
    import re
    body = re.sub(r'^#{1,6}\s+.*$', '', body, flags=re.MULTILINE)  # 去标题
    body = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', body)           # 链接只留文字
    body = re.sub(r'!\[.*?\]\(.*?\)', '', body)                     # 去图片
    body = re.sub(r'\*\*?([^*]+)\*\*?', r'\1', body)               # 去加粗/斜体
    body = re.sub(r'`[^`]+`', '', body)                             # 去代码
    body = re.sub(r'^\s*[-*+>]\s*', '', body, flags=re.MULTILINE)  # 去列表/引用
    body = re.sub(r'---+', '', body)                                 # 去分隔线
    body = re.sub(r'\n{3,}', '\n', body).strip()
    # 优先取中文段落
    lines = [l.strip() for l in body.split('\n')
             if l.strip() and re.search(r'[\u4e00-\u9fff]', l)]
    text = ''.join(lines) if lines else body.replace('\n', '')
    # 截到句子结尾
    chars = min(max_chars, len(text))
    for end in range(chars, 30, -1):
        if text[end-1] in '。！？.!?':
            return text[:end]
    return text[:chars]
```

---

## 四、frontmatter格式

```yaml
audioUrl: "/audio/{slug}.mp3"
```

- 必须以 `/audio/` 开头（绝对路径）
- 文件名 = slug（不是原始中文文件名）

---

## 五、AudioPlayer src格式（blog-detail.tsx）

```tsx
// ✅ 正确：完整URL
src={`https://aiblog.fuluckai.com${post.audioUrl}`}

// ❌ 错误：裸文件名，浏览器找不到
src={post.audioUrl?.replace(/^\/audio\//, '')}
```

---

## 六、额度限制

- MiniMax TTS 有每日调用限额（error code 2056）
- 一次不要生成超过10篇，留余量
- 额度每天 JST 00:00 重置
- 生成失败时不要用其他TTS替代，等次日重试

---

## 七、验证清单（每次生成后必做）

```bash
# 1. 检查文件大小（正常单篇应 > 100KB）
ls -la public/audio/{slug}.mp3

# 2. 验证元数据是MiniMax生成
ffprobe -v quiet -print_format json -show_format public/audio/{slug}.mp3 \
  | python3 -c "import sys,json; d=json.load(sys.stdin); \
    print(json.loads(d['format']['tags'].get('AIGC','{}') or '{}').get('ContentProducer','?'))"

# 3. 抽查音频内容（whisper转录前3行）
whisper public/audio/{slug}.mp3 --model tiny --language Chinese \
  --output_format txt --output_dir /tmp/check 2>/dev/null
head -3 /tmp/check/{slug}.txt
# 确认：开头不是"欢迎收听"，是文章真实内容

# 4. 确认frontmatter audioUrl格式正确
grep "audioUrl" src/content/blog/{file}.md
# 期望：audioUrl: "/audio/{slug}.mp3"
```

---

## 八、当前状态（2026-03-25）

| 篇名 | 状态 | 备注 |
|------|------|------|
| my-ai-workflow | ✅ 正确 | 正文TTS，GracefulMaiden |
| swarm-v2-birth-story | ✅ 正确 | 正文TTS，GracefulMaiden |
| 人入中年-母婴用品 | ✅ 正确 | 正文TTS，GracefulMaiden |
| ai-clinic-case | ✅ 正确 | 早期手动生成 |
| macbook-neo-openclaw | ✅ 正确 | 早期手动生成 |
| openclaw-multi-instance | ✅ 正确 | 早期手动生成 |
| memory-lancedb-pro-repair-guide | ✅ 正确 | 早期手动生成 |
| minimax-api-research-report | ✅ 正确 | 早期手动生成 |
| 其余12篇 | ⏳ 待补 | 音频已删，audioUrl已清除，等MiniMax额度恢复后按本规范重新生成 |

---

## 九、笨模型如何理解本规范（OpenClaw Skill 机制）

如果你用 MiniMax 2.7 这类能力较弱的模型，仍然要确保它遵循本规范，方法如下：

### 1. 创建专用 Skill（推荐）

在 `~/.openclaw/workspace/skills/` 下新建 `blog-audio-generator/`，包含：

```
blog-audio-generator/
├── SKILL.md          # 触发条件和核心指令
├── references/
│   └── spec.md       # 本规范全文（复制）
└── scripts/
    ├── generate.py   # 实际生成脚本
    └── prompt.txt    # 给模型的专用 Prompt
```

**SKILL.md** 开头必须写：
```markdown
# SKILL: 博客音频生成器

## 触发条件
- "生成博客音频"
- "重新生成音频"
- "批量TTS"
- 用户指定要生成音频的博客文章

## 前置步骤（必须按顺序执行）
1. **读取规范**：读取 references/spec.md 全部内容
2. **确认理解**：向用户确认已理解核心要求（音频导读、格式等）
3. **检查额度**：测试 MiniMax API 是否可用
4. **执行生成**：按 spec.md 的流程操作

## 模型能力要求
- 能用 Python 脚本处理文件
- 能调用 MiniMax TTS API（JSON 格式）
- 能理解中文导读文本的撰写
```

这样，任何模型（哪怕是弱模型）被触发时，都会先加载 `references/spec.md`，从而强制它阅读规范。

### 2. 在 Task Prompt 中嵌入强制读取指令

如果你用 `sessions_spawn` 直接启动一个 Agent，Prompt 要这样写：

```yaml
task: |
  你负责生成博客音频导读。在开始前，**必须先读取以下规范文档**：

  《博客音频生成规范》
  位置：/Users/lauralyu/projects/will-ai-lab/docs/audio-generation-spec.md

  核心要求：
  - 音频内容是导读（提炼核心+制造悬念），不是朗读全文
  - MiniMax TTS 必须用 JSON 格式，包含 voice_setting
  - audioUrl 格式必须是 "/audio/{slug}.mp3"
  - AudioPlayer 的 src 必须是完整 URL

  现在请你：
  1. 打开规范文档，阅读第1-5节
  2. 确认你理解了什么是“导读”及其生成方法
  3. 告诉我你将如何生成音频，并举一个导读示例

  然后才开始实际生成工作。
```

### 3. 验证机制（针对弱模型）

弱模型容易忽略指令，所以要 **分步验证**：

```yaml
task: |
  步骤1：阅读规范
  - 执行：`read /Users/lauralyu/projects/will-ai-lab/docs/audio-generation-spec.md`
  - 告诉我规范中最关键的三条是什么

  步骤2：编写示例导读
  - 针对文章《大阪樱花2026》，写一段30秒的导读（用你的话）

  步骤3：确认API格式
  - 写出调用 MiniMax TTS 的正确 curl 命令（包含所有字段）

  步骤4：开始生成
  - 现在可以开始实际生成任务了
```

### 4. 直接提供脚本（最安全）

如果模型能力真的不足，直接给它可执行的脚本：

```python
# 文件：generate_audio.py
# 模型只需要运行此脚本，不用自己写代码
import sys, json, subprocess, os

# 1. 参数检查
# 2. 读取文章，用固定Prompt生成导读
# 3. 调用MiniMax TTS（格式固定）
# 4. 保存文件，更新frontmatter
```

然后在任务中说：“运行 `python3 generate_audio.py`，脚本里已经包含了所有规范。”

---

## 十、最佳实践总结

| 模型能力 | 推荐方案 |
|----------|----------|
| GPT-5.4 / Opus | 直接给规范文档链接，它会自己读 |
| Kimi 2.5 | 用 Skill 机制，强制加载 references/ |
| MiniMax 2.7 / 2.5 | 用分步验证 Prompt，或直接给脚本 |
| 非常弱的模型 | 直接运行写好的脚本，不让它决策 |

**铁律**：任何音频生成任务，第一句话必须是“请先阅读规范文档”。不确认理解不准动手。
