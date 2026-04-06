# Will's AI Blog 项目操作手册

> 项目路径：`~/projects/will-ai-lab/`
> 线上地址：https://aiblog.fuluckai.com
> GitHub：https://github.com/mouxue56-debug/will-ai-blog

---

## 一、API密钥获取方式

### MiniMax TTS（音频生成）
- **Endpoint**: https://api.minimaxi.com/v1/t2a_v2
- **Model**: speech-2.8-hd
- **Voice**: Japanese_GracefulMaiden
- **API Key**: 从 `~/.openclaw/openclaw.json` 中 `minimax-coding.apiKey` 获取
- **重要**: 返回的音频是hex编码，不是base64！用 `bytes.fromhex()` 解码

### Vercel部署
- **Token**: 从 `~/.openclaw/openclaw.json` 或询问ユキ获取
- **CLI命令**: `vercel --prod --yes --token $TOKEN`

### Supabase（数据库+存储）
- **URL**: https://tafbypudxuksfwrkfbxv.supabase.co
- **Access Token**: 询问ユキ获取
- **Project ID**: tafbypudxuksfwrkfbxv

---

## 二、标准部署流程

### 场景1：只更新文章内容（无音频/图片）
```bash
cd ~/projects/will-ai-lab

# 编辑文章
git add src/content/blog/xxx.md
git commit -m "update: xxx"
git push origin main

# 等待Vercel自动部署（约1-2分钟）
```

### 场景2：更新音频或大文件（⚠️ 必须用CLI）
```bash
cd ~/projects/will-ai-lab

# 1. 添加文件
git add public/audio/xxx.mp3 src/content/blog/xxx.md

# 2. 提交并push
git commit -m "add: xxx"
git push origin main

# 3. ⚠️ 关键：使用Vercel CLI强制重新构建
vercel --prod --yes --token $VERCEL_TOKEN

# 4. 验证部署
curl -s "https://aiblog.fuluckai.com/audio/xxx.mp3" -o /tmp/check.mp3
ls -lh /tmp/check.mp3
ffprobe -i /tmp/check.mp3 2>&1 | grep "Duration"
```

**为什么必须用CLI？**
- Vercel的GitHub集成有缓存bug
- 同名文件更新后不会正确刷新
- CLI部署强制重新构建，绕过缓存

---

## 三、音频生成流程

### 步骤1：生成导读文本
用LLM根据文章内容生成30-60秒导读（100-150字），要求：
- 提炼核心+制造悬念
- 无"欢迎收听"等模板开头
- 口语化，像朋友推荐

### 步骤2：MiniMax TTS生成
```python
import requests
import os

# 从环境变量或配置文件读取
API_KEY = os.getenv("MINIMAX_API_KEY")

response = requests.post(
    "https://api.minimaxi.com/v1/t2a_v2",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "model": "speech-2.8-hd",
        "text": "导读文本",
        "voice_setting": {"voice_id": "Japanese_GracefulMaiden"}
    }
)

result = response.json()
audio_bytes = bytes.fromhex(result['data']['audio'])  # ⚠️ hex解码，不是base64

with open('public/audio/xxx.mp3', 'wb') as f:
    f.write(audio_bytes)
```

### 步骤3：验证音频
```bash
ffprobe -i public/audio/xxx.mp3 2>&1 | grep "Duration"
# 期望输出：Duration: 00:00:xx.xx（正常应>10秒）
```

### 步骤4：更新文章frontmatter
```yaml
audioUrl: "/audio/xxx.mp3"
```

### 步骤5：部署（⚠️ 用CLI）
```bash
git add .
git commit -m "add: xxx文章+音频"
git push origin main
vercel --prod --yes --token $VERCEL_TOKEN
```

---

## 四、常见问题排查

### 问题1：音频部署后无法播放（11KB损坏文件）
**症状**：本地文件正常，Vercel上只有11KB
**解决**：使用Vercel CLI重新部署
**预防**：音频文件更新必须用CLI部署

### 问题2：MiniMax TTS返回错误
**2013错误**：缺少`voice_setting`对象
**2056错误**：每日额度耗尽，等JST 00:00重置

### 问题3：文章页面404
**检查**：slug是否正确（大小写敏感）
**检查**：文件是否在`src/content/blog/`目录
**检查**：frontmatter格式是否正确

---

## 五、项目结构速查

```
will-ai-lab/
├── src/content/blog/          # 文章目录（Markdown）
├── public/audio/              # 音频文件
├── public/covers/             # 封面图片
├── docs/                      # 项目文档
│   └── audio-generation-spec.md  # 音频生成规范
├── DEPLOY_TROUBLESHOOTING.md  # 部署踩坑记录
└── OPERATIONS.md              # 本文件
```

---

## 六、相关文档

- [音频生成规范](./docs/audio-generation-spec.md)
- [部署踩坑记录](./DEPLOY_TROUBLESHOOTING.md)
- [架构备忘录](./memory/procedures/will-ai-blog架构备忘录.md)

---

## 七、2026-04-06 经验教训

### 成功经验
- ✅ Vercel CLI直接部署可以绕过GitHub集成的缓存bug
- ✅ MiniMax TTS返回hex编码，用`bytes.fromhex()`解码
- ✅ 部署后立即验证文件大小和格式

### 失败教训
- ❌ 不要依赖GitHub自动部署来更新音频文件
- ❌ 不要假设同名文件会被正确刷新
- ❌ 不要在文档中硬编码API密钥（GitHub会阻止push）

### 关键认知
- 音频/大文件更新 → 必须用Vercel CLI
- 纯文本更新 → 可以用GitHub自动部署
- 部署后必验证 → `curl`下载检查文件大小

---

*最后更新：2026-04-06*
