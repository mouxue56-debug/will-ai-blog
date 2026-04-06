# 博客部署踩坑记录 - 2026-04-06

## 问题：音频文件部署后损坏（11KB vs 273KB）

### 现象
- 本地音频文件正常（273KB，17秒）
- Vercel部署后只有11KB，无法播放
- 多次git push无法解决

### 根因
Vercel的GitHub集成有缓存bug，同名文件更新后不会正确刷新。

### 解决方案
**必须使用Vercel CLI直接部署**：
```bash
vercel --prod --yes --token <token>
```

### 教训
1. 音频/大文件更新后，不要依赖GitHub自动部署
2. 使用Vercel CLI强制重新构建
3. 部署后立即验证文件大小和格式

---

## 问题：MiniMax TTS音频解码错误

### 现象
- MiniMax API返回的音频数据无法播放
- ffprobe显示"Header missing"

### 根因
MiniMax返回的是hex编码字符串，不是base64。

### 正确解码方式
```python
audio_hex = result['data']['audio']
audio_bytes = bytes.fromhex(audio_hex)  # 不是base64!
```

### 教训
- 不要假设API返回的是base64
- 先用Python验证解码方式再批量生成

---

## 问题：文章slug重复导致缓存问题

### 现象
- 替换音频后，Vercel始终返回旧文件
- 即使删除重新创建也不行

### 解决方案
- 更换全新slug（如：github-ai-trends-april-2026）
- 或者使用Vercel CLI部署

### 教训
- 内容更新+文件替换时，优先使用Vercel CLI
- 不要反复使用相同slug测试

---

## 标准部署流程（更新版）

1. 生成内容（文章+音频）
2. 本地验证音频格式：`ffprobe -i audio.mp3`
3. **使用Vercel CLI部署**：`vercel --prod --yes --token <token>`
4. 线上验证：curl下载音频，检查大小和格式
5. 完成

---

*记录时间：2026-04-06*
*记录者：ユキ*
