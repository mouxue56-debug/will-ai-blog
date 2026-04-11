<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Karpathy LLM Wiki 知识库方法论 · 四模型深度研讨报告</title>
<style>
  :root {
    --bg: #0A1420;
    --bg2: #0F1D2E;
    --bg3: #152840;
    --accent: #00D4FF;
    --accent2: #FF6B35;
    --accent3: #7B61FF;
    --text: #E8F4FD;
    --text2: #8BB8D0;
    --border: #1E3A5F;
    --card: #0D1F33;
    --tag-bg: #1A3A5C;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.7;
    min-height: 100vh;
  }
  .hero {
    background: linear-gradient(135deg, #0A1420 0%, #0F2847 50%, #0A1420 100%);
    border-bottom: 1px solid var(--border);
    padding: 60px 24px;
    text-align: center;
  }
  .hero .eyebrow {
    color: var(--accent);
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 16px;
    opacity: 0.8;
  }
  .hero h1 {
    font-size: clamp(24px, 4vw, 42px);
    font-weight: 700;
    color: #fff;
    margin-bottom: 16px;
    line-height: 1.2;
  }
  .hero .subtitle {
    color: var(--text2);
    font-size: 15px;
    max-width: 600px;
    margin: 0 auto 28px;
  }
  .meta-row {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .badge {
    background: var(--tag-bg);
    color: var(--accent);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    border: 1px solid var(--border);
  }
  .badge.ds { border-color: var(--accent2); color: var(--accent2); }
  .badge.glm { border-color: var(--accent3); color: var(--accent3); }
  .badge.kimi { border-color: #00FF94; color: #00FF94; }
  .container { max-width: 860px; margin: 0 auto; padding: 48px 24px; }
  .toc {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px 28px;
    margin-bottom: 40px;
  }
  .toc h2 { font-size: 13px; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; }
  .toc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 8px; }
  .toc a {
    color: var(--text2);
    text-decoration: none;
    font-size: 13px;
    padding: 6px 10px;
    border-radius: 6px;
    transition: all 0.2s;
    display: block;
  }
  .toc a:hover { background: var(--bg3); color: var(--accent); }
  .section { margin-bottom: 56px; }
  .section-title {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 6px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--accent);
    display: inline-block;
  }
  .section-num {
    font-size: 11px;
    color: var(--accent);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 4px;
    display: block;
  }
  h3 { font-size: 16px; color: #fff; margin: 24px 0 10px; font-weight: 600; }
  h4 { font-size: 13px; color: var(--accent); margin: 16px 0 8px; letter-spacing: 0.5px; }
  p { color: var(--text2); margin-bottom: 12px; font-size: 14px; }
  ul, ol { color: var(--text2); margin: 0 0 16px 20px; font-size: 14px; }
  li { margin-bottom: 6px; }
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin: 20px 0;
  }
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
  }
  .card .card-title {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 8px;
  }
  .card .card-model {
    font-size: 10px;
    color: var(--accent);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 10px;
    display: block;
  }
  .card p, .card li { font-size: 13px; }
  .highlight-box {
    background: linear-gradient(135deg, #0F2847 0%, #0A1420 100%);
    border-left: 3px solid var(--accent);
    padding: 16px 20px;
    border-radius: 0 8px 8px 0;
    margin: 16px 0;
  }
  .highlight-box.orange { border-left-color: var(--accent2); }
  .highlight-box.purple { border-left-color: var(--accent3); }
  .highlight-box.green { border-left-color: #00FF94; }
  .highlight-box p { color: var(--text); margin: 0; }
  blockquote {
    border-left: 3px solid var(--accent2);
    padding: 12px 20px;
    margin: 16px 0;
    background: var(--card);
    border-radius: 0 8px 8px 0;
    font-style: italic;
    color: var(--text);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 13px;
  }
  th {
    background: var(--bg3);
    color: var(--accent);
    padding: 10px 14px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }
  td {
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    color: var(--text2);
  }
  tr:hover td { background: var(--card); }
  .status-done { color: #00FF94; }
  .status-gap { color: var(--accent2); }
  .status-none { color: #FF4444; }
  .tag {
    display: inline-block;
    background: var(--tag-bg);
    color: var(--accent);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    margin-right: 4px;
  }
  .tag.orange { background: rgba(255,107,53,0.15); color: var(--accent2); }
  .tag.purple { background: rgba(123,97,255,0.15); color: var(--accent3); }
  .three-col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin: 16px 0;
  }
  .col-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 18px;
    text-align: center;
  }
  .col-card .num {
    font-size: 28px;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
    margin-bottom: 6px;
  }
  .col-card .label { font-size: 11px; color: var(--text2); }
  .col-card h4 { margin: 10px 0 6px; text-align: center; font-size: 13px; }
  .divider { border: none; border-top: 1px solid var(--border); margin: 32px 0; }
  .model-section {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px;
    margin: 24px 0;
  }
  .model-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .model-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
  }
  .model-dot.glm { background: var(--accent3); }
  .model-dot.ds { background: var(--accent2); }
  .model-dot.kimi { background: #00FF94; }
  .model-name { font-size: 15px; font-weight: 700; color: #fff; }
  .model-desc { font-size: 12px; color: var(--text2); margin-left: auto; }
  .insight-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 16px;
  }
  .insight-item {
    background: var(--bg2);
    border-radius: 8px;
    padding: 14px;
  }
  .insight-item h5 { font-size: 12px; color: var(--accent); margin-bottom: 6px; }
  .insight-item p { font-size: 12px; margin: 0; }
  .conclusion-banner {
    background: linear-gradient(135deg, #0F2847 0%, #0A1420 100%);
    border: 1px solid var(--accent);
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    margin: 40px 0;
  }
  .conclusion-banner h2 { color: #fff; font-size: 22px; margin-bottom: 12px; }
  .conclusion-banner p { color: var(--text2); font-size: 14px; max-width: 500px; margin: 0 auto; }
  .priority-list { counter-reset: priority; list-style: none; margin: 0; padding: 0; }
  .priority-list li {
    counter-increment: priority;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 16px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px 20px;
  }
  .priority-list li::before {
    content: counter(priority);
    background: var(--accent);
    color: #0A1420;
    width: 24px; height: 24px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .priority-list .pri-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .priority-list .pri-body { font-size: 13px; color: var(--text2); margin: 0; }
  .pri-tag { margin-left: auto; flex-shrink: 0; }
  .footer {
    text-align: center;
    padding: 40px 24px;
    border-top: 1px solid var(--border);
    color: var(--text2);
    font-size: 12px;
  }
  @media (max-width: 600px) {
    .three-col, .card-grid, .insight-grid { grid-template-columns: 1fr; }
    .model-desc { display: none; }
  }
</style>
</head>
<body>

<div class="hero">
  <div class="eyebrow">Multi-Model Research Report · April 2026</div>
  <h1>Karpathy LLM Wiki 知识库方法论<br>四模型深度研讨报告</h1>
  <p class="subtitle">MiniMax · GLM-5.1 · DeepSeek V3.2 Thinking · Kimi K2.5 并行讨论 · 福楽キャッテリー 落地分析</p>
  <div class="meta-row">
    <span class="badge">📅 2026-04-12</span>
    <span class="badge">📚 LLM Wiki</span>
    <span class="badge">🔬 四模型讨论</span>
    <span class="badge">🏠 福楽キャッテリー</span>
  </div>
</div>

<div class="container">

<!-- 目录 -->
<nav class="toc">
  <h2>目录</h2>
  <div class="toc-grid">
    <a href="#s1">1. 方法论核心：什么是 LLM Wiki</a>
    <a href="#s2">2. 三层架构与三个操作</a>
    <a href="#s3">3. v2 扩展：AgentMemory 实战教训</a>
    <a href="#s4">4. 四模型观点汇总</a>
    <a="#s5">5. 我们做到了什么</a>
    <a href="#s6">6. 差距分析</a>
    <a href="#s7">7. 下一步行动清单</a>
    <a href="#s8">8. 落地优先级排序</a>
    <a href="#s9">9. 结论与建议</a>
  </div>
</nav>

<!-- S1: 方法论核心 -->
<div class="section" id="s1">
  <span class="section-num">SECTION 01</span>
  <h2 class="section-title">方法论核心：为什么这不只是 RAG 的改进版</h2>

  <p>传统 RAG（检索增强生成）的本质是<strong>每次问答都从零开始</strong>：切片 → 检索 → 拼接 → 生成。下一次问题来了，AI 仍然要重新经历整个流程，知识没有积累，只有消耗。</p>

  <div class="highlight-box">
    <p><strong>核心洞察（DeepSeek V3.2 Thinking）</strong>：LLM Wiki 不是 RAG 的改进版，而是一个完全不同的范式——从「检索驱动」到「编译驱动」。这类似于编译型语言（Go）vs 解释型语言（Python）：RAG 每次都在「解释」上下文，Wiki 则把知识编译成了可以直接读取的「二进制」。</p>
  </div>

  <div class="three-col">
    <div class="col-card">
      <div class="num">RAG</div>
      <div class="label">每次问答从零推理</div>
      <h4>临时检索</h4>
      <p style="font-size:12px">切片 → 检索 → 拼接 → 生成<br>无积累，每次重新发明轮子</p>
    </div>
    <div class="col-card">
      <div class="num">Wiki</div>
      <div class="label">一次编译，持续复用</div>
      <h4>持久编译</h4>
      <p style="font-size:12px">Ingest → 结构化写入 → Query<br>知识网络持续生长，越来越聪明</p>
    </div>
    <div class="col-card">
      <div class="num">82%</div>
      <div class="label">Token 节省（MiniMax 估算）</div>
      <h4>成本对比</h4>
      <p style="font-size:12px">1000次查询：RAG 300万 token<br>Wiki 仅需 55万 token</p>
    </div>
  </div>

  <blockquote>
    「LLM Wiki 是把"每次问答都从零推理"变成"一次编译、持续复用"——本质是<strong>给 AI 装了一个可主动维护的长期记忆硬盘，而不是让它每次都靠即时检索碰运气</strong>。」<br>— DeepSeek V3.2 Thinking
  </blockquote>
</div>

<hr class="divider">

<!-- S2: 三层架构 -->
<div class="section" id="s2">
  <span class="section-num">SECTION 02</span>
  <h2 class="section-title">三层架构与三个操作</h2>

  <h3>三层架构</h3>
  <table>
    <tr><th>层级</th><th>内容</th><th>谁来维护</th><th>核心价值</th></tr>
    <tr>
      <td><strong>raw/</strong></td>
      <td>原始资料（论文/文章/图片/视频）</td>
      <td>用户添加，AI 只读不修改</td>
      <td>不可变信源，信任根基</td>
    </tr>
    <tr>
      <td><strong>wiki/</strong></td>
      <td>结构化 Markdown（概念页/对比页/摘要页）</td>
      <td>AI 全权维护</td>
      <td>知识编译，跨文档关联</td>
    </tr>
    <tr>
      <td><strong>AGENTS.md</strong></td>
      <td>Schema 规则手册</td>
      <td>人 + AI 共同迭代</td>
      <td>定义工作流和质量标准</td>
    </tr>
  </table>

  <h3>三个操作</h3>
  <div class="card-grid">
    <div class="card">
      <div class="card-model">Ingest · 录入</div>
      <div class="card-title">新资料入库</div>
      <p>AI 读取 raw/ → 提炼核心 → 更新相关 wiki 页面（单篇可能涉及10-15个页面）→ 更新 index → 记录 log。AI 会主动发现跨文档概念关联。</p>
    </div>
    <div class="card">
      <div class="card-model">Query · 查询</div>
      <div class="card-title">向知识库提问</div>
      <p>AI 先读 index 了解网络结构 → 深入相关页面 → 综合分析 → 给出有来源引用的回答。好答案归档回 wiki，知识持续沉淀。</p>
    </div>
    <div class="card">
      <div class="card-model">Lint · 维护</div>
      <div class="card-title">定期健康检查</div>
      <p>AI 检查矛盾/过时/孤儿页面/缺失链接 → 自动修复或标记人工审核。保持知识网络健康，防止腐烂。</p>
    </div>
  </div>

  <h3>两个关键文件</h3>
  <div class="card-grid">
    <div class="card">
      <div class="card-title">index.md</div>
      <p>按主题分类的完整目录，包含每个页面的一句话摘要、来源数量、时间戳。在 ~100篇以内足够充当 AI 的主导航。</p>
    </div>
    <div class="card">
      <div class="card-title">log.md</div>
      <p>时间线日志，每条以 <code>## [2026-04-02]</code> 开头，grep 即可解析。记录每次 ingest/query/lint，保持可追溯性。</p>
    </div>
  </div>
</div>

<hr class="divider">

<!-- S3: v2 扩展 -->
<div class="section" id="s3">
  <span class="section-num">SECTION 03</span>
  <h2 class="section-title">v2 扩展：AgentMemory 实战教训</h2>

  <p>AgentMemory 是基于 Karpathy 方法论的开源实现，源自数千个真实 session 的经验总结。比原版多出的实战经验：</p>

  <div class="card-grid">
    <div class="card">
      <div class="card-title">🔢 置信度评分</div>
      <p>每条断言带置信度（来源数 × 时效性 × 矛盾检测），不是所有内容权重相同。高置信度事实优先被引用。</p>
    </div>
    <div class="card">
      <div class="card-title">🌀 遗忘曲线</div>
      <p>不重要的事实随时间自动降权。架构决策保留很久，临时 bug 快速衰减。不是删除，是降权。</p>
    </div>
    <div class="card">
      <div class="card-title">🧠 四层记忆层次</div>
      <p>Working → Episodic → Semantic → Procedural。信息逐层晋升才有资格成为「长期知识」。</p>
    </div>
    <div class="card">
      <div class="card-title">🔗 类型化知识图谱</div>
      <p>不只是 wikilink，要提取实体类型（人/项目/库/概念）+ 关系类型（uses/depends on/contradicts/caused）。</p>
    </div>
    <div class="card">
      <div class="card-title">🔍 混合搜索</div>
      <p>BM25（精确词匹配）+ 向量搜索（语义相似）+ 图遍历（关系发现），三者融合互补盲区。</p>
    </div>
    <div class="card">
      <div class="card-title">⚡ 自动化钩子</div>
      <p>Session 结束自动归档 → Session 开始自动注入 → 定期 Lint → 知识整合。人类只做决策，记账全自动化。</p>
    </div>
  </div>

  <h3>AgentMemory 关键指标</h3>
  <table>
    <tr><th>指标</th><th>数值</th><th>说明</th></tr>
    <tr><td>R@5 准确率</td><td class="status-done">95.2%</td><td>LongMemEval ICLR 2025 基准</td></tr>
    <tr><td>Token 节省</td><td class="status-done">92%</td><td>~1,900 vs ~19,000 每 session</td></tr>
    <tr><td>MCP 工具</td><td class="status-done">43 个</td><td>搜索/记忆/遗忘/动作/信号等</td></tr>
    <tr><td>自动钩子</td><td class="status-done">12 个</td><td>零人工努力自动捕获</td></tr>
    <tr><td>外部依赖</td><td class="status-done">0</td><td>无 Postgres/Redis/向量库</td></tr>
    <tr><td>OpenClaw 支持</td><td class="status-done">✅</td><td>直接可接入</td></tr>
  </table>
</div>

<hr class="divider">

<!-- S4: 四模型观点 -->
<div class="section" id="s4">
  <span class="section-num">SECTION 04</span>
  <h2 class="section-title">四模型观点汇总</h2>

  <!-- MiniMax -->
  <div class="model-section">
    <div class="model-header">
      <div class="model-dot"></div>
      <span class="model-name">MiniMax M2.7</span>
      <span class="model-desc">技术 · 工作流 · 本土化</span>
    </div>

    <h4>① Token 账：82% 节省的前提条件</h4>
    <p>单次 RAG query 平均 3000 token，Wiki 把成本前置到 ingest 阶段。每月 1000 次查询场景：RAG 消耗 300 万 token，Wiki 仅需 55 万。但 ingest 本身不小，只有<strong>高频查询</strong>才能真正省钱。低频场景直接用 RAG 更划算。</p>

    <h4>② Ingest-Query-Lint 避坑指南</h4>
    <ul>
      <li><strong>Ingest</strong>：来源追踪是底线，每份文档必须带元数据标签（来源/时间/置信度）。常见错误：AI 把「可能 X」改写成「确定 X」，丢失不确定性。</li>
      <li><strong>Query</strong>：建立「先 wiki 后 raw」的降级策略，保证答案质量下限。</li>
      <li><strong>Lint</strong>：每月必须跑健康检查，三大任务：索引结构、孤儿页面、跨文档矛盾。index.md 长期不维护会变成新的信息孤岛。</li>
    </ul>

    <h4>③ 本土化：中文内容的特殊处理</h4>
    <p>中文互联网内容噪音多、水印重、格式乱。Ingest 前必须「去噪预处理」——提取正文、转 Markdown、去掉平台水印。中日双语场景建议：同一实体用中日双语索引，wiki 主体跟随主要业务语言（猫舍日语、AI 研修中文）。</p>

    <h4>④ Graphify + Wiki 协同关系</h4>
    <p>Graphify = 录入前哨（抽取实体/关系/矛盾检测）→ Wiki = 输出层（结构化人类可读文本）→ Query。两者结合：Wiki 读 Graphify 输出作为 source of truth，不要各自独立维护。</p>

    <div class="highlight-box orange">
      <p><strong>最大风险</strong>：领域边界模糊、概念快速演变时（AI 行业趋势分析），Wiki 强制把新知识塞进已有框架，索引重构成本极高。这时候硬上 Wiki 反而被框架拖累。</p>
    </div>
  </div>

  <!-- GLM -->
  <div class="model-section">
    <div class="model-header">
      <div class="model-dot glm"></div>
      <span class="model-name">GLM-5.1</span>
      <span class="model-desc">AI研究 · 多模态 · 质量控制</span>
    </div>

    <h4>① AI 研究方向：对模型本身的启示</h4>
    <p>当 context window 越来越大，我们的惯性思维是用更长的上下文。但 Karpathy 的方法是<strong>反过来</strong>——不是让模型记住更多，而是让知识组织得更好。未来模型的核心竞争力不是「记多少」，而是「知识结构化程度有多高」。对于训练数据快要见顶的从业者来说，这条路比单纯扩大参数量更可持续。</p>

    <h4>② 多模态扩展的三个层面</h4>
    <ul>
      <li><strong>录入层</strong>：图片不只是文件路径，要提取语义向量（品种特征/年龄段/毛色/健康状态）。音频用 Whisper 转文字再向量化，视频截帧+语音转写双轨并行。</li>
      <li><strong>关联层</strong>：建立跨模态关联——猫咪照片 + 文字描述 + LINE 对话录音 → 自动链接到同一实体。需要更强的实体识别和指代消解。</li>
      <li><strong>呈现层</strong>：Wiki 嵌入图片/视频需 caption 锚定文本，否则纯文本搜索搜不到视频内的知识点。</li>
    </ul>

    <h4>③ 知识质量控制的四层防线</h4>
    <ul>
      <li><strong>来源锚定</strong>：每条知识必须标注来源（原始文档第几页/视频几分钟），无法溯源的拒绝录入。</li>
      <li><strong>交叉验证</strong>：同一事实至少两个独立来源才能给高置信度标签。</li>
      <li><strong>时间衰减</strong>：架构决策保留久，价格/政策/联系方式必须有 TTL 标记，定期触发复核。</li>
      <li><strong>对抗性测试</strong>：随机抽取已录入知识要求 AI 反推来源，找不到则说明已变质。</li>
    </ul>

    <h4>④ Graphify 和 Wiki 的分工</h4>
    <p><strong>Wiki 是教科书，图谱是索引目录。</strong>理想工作流：先通过 Graphify 定位到正确的知识社区，再跳转到对应 Wiki 页面深入阅读。Wiki 页面的内部链接反向丰富 Graphify 的边，形成双向增强。</p>

    <h4>⑤ 未来 1-2 年的三个突破方向</h4>
    <ul>
      <li><strong>RAG → 编译式知识</strong>：AI agent 在后台持续重构个人知识网络，定期把临时发现凝固成结构化知识。</li>
      <li><strong>多模态知识图谱标准化</strong>：VLM 能力提升使「图片+文本+视频片段」混合图谱在技术上变得可行。</li>
      <li><strong>知识质量自动评估</strong>：AI 自净，从「人工维护」过渡到「AI 自净」。</li>
    </ul>
  </div>

  <!-- DeepSeek -->
  <div class="model-section">
    <div class="model-header">
      <div class="model-dot ds"></div>
      <span class="model-name">DeepSeek V3.2 Thinking</span>
      <span class="model-desc">范式颠覆 · 历史定位 · 落地判断</span>
    </div>

    <h4>① 范式颠覆的本质</h4>
    <p>RAG 本质是检索驱动，模型被动等待检索结果。LLM Wiki 是编译驱动——知识被预先消化、重组、结构化写入持久化文档。质量控制的关键区别：RAG 的输出质量取决于每次检索是否精准；Wiki 允许 AI 在录入时主动组织知识、发现矛盾、补充关联，质量在编译时就锁定了。</p>

    <h4>② 历史类比：知识管理三次跃迁</h4>
    <ul>
      <li><strong>第一次</strong>：图书馆目录卡（19世纪）——把散落书籍变成可检索元数据，检索的是「书」不是「知识」。</li>
      <li><strong>第二次</strong>：Wikipedia（2001）——把知识从专家权威中解放出来，网状链接，本质是「人类 Wiki」第一次成功实践。</li>
      <li><strong>第三次</strong>：AI Wiki——把「谁来写」从人类扩展到 AI，把「维护成本」从志愿者热情变成自动化钩子，把「质量控制」从版本投票变成置信度评分。</li>
    </ul>

    <h4>③ 收益 vs 维护成本的临界点</h4>
    <p>系统真正值得的临界点：<strong>同一个领域内，你会反复问跨文档的综合性问题，且答案需要整合超过 3 个以上的知识源。</strong></p>
    <p>量化指标：领域知识库 > 50 篇核心文档；同一个问题 30 天内问第二次以上；问题答案需要跨文档关联。低于这个门槛，Wiki 维护成本会超过收益。</p>

    <h4>④ 福楽キャッテリー 三个立刻行动切入点</h4>
    <div class="insight-grid">
      <div class="insight-item">
        <h5>🐱 猫咪健康知识库（日语+中文）</h5>
        <p>常见疾病/症状/护理方案整理为 Wiki，AI 录入时主动关联品种易感性（西伯利亚猫 HCM 遗传倾向）。每次客户问「猫咪呕吐怎么办」，AI 直接读编译好的结构化文档。</p>
      </div>
      <div class="insight-item">
        <h5>📚 AI 研修课程知识图谱</h5>
        <p>把 AI 工具评测/课程内容/学员反馈编译为关联知识网络。新员工 onboarding 时，Wiki 能告诉他们「这个问题在哪个环节讲过，谁当时提过类似问题」。</p>
      </div>
      <div class="insight-item">
        <h5>⚙️ 业务流程 SOP 的 AI 可读版本</h5>
        <p>现有 Notion 里的客户应对流程/猫咪出生记录追踪/转账确认步骤——Wiki 化之后，AI 执行任务时直接读取「编译好」的流程知识，减少每次的上下文构建消耗。</p>
      </div>
    </div>

    <h4>⑤ 反对意见：什么时候是过度工程？</h4>
    <p><strong>过度工程的标志</strong>：知识领域太窄或变化太快（追踪每日社交媒体热点）；团队小于 3 人且知识共享频率极低；现有工具（Notion/飞书）已经能很好地解决核心问题。</p>

    <div class="highlight-box green">
      <p><strong>一句话总结（DeepSeek）</strong>：LLM Wiki 是给 AI 装了一个可主动维护的长期记忆硬盘，而不是让它每次都靠即时检索碰运气。</p>
    </div>
  </div>

  <!-- Kimi -->
  <div class="model-section">
    <div class="model-header">
      <div class="model-dot kimi"></div>
      <span class="model-name">Kimi K2.5</span>
      <span class="model-desc">多语言 · 工具链定位</span>
    </div>

    <h4>① 双语/多语场景的特殊风险</h4>
    <p>最大的风险是<strong>概念漂移</strong>——同一个实体在不同语言里可能长出两套知识体系。比如「サイベリアン」在日语资料里对应血统证书/协会标准/繁殖伦理；在中文笔记里可能和「西森」「长毛猫」「涅瓦色」等标签打交道，语境完全不同。</p>
    <p><strong>解决方案</strong>：原始资料保留原文，wiki 层强制统一实体命名（用英文 ID 或标准化术语做主键）。跨语言 lint 要特别检查「翻译等价但不语义等价」的陷阱——比如日语「血液浄化」和中文「血液净化」字面一样，但适应症和监管框架可能完全不同。</p>
    <p>另一个坑：<strong>日语敬語体里隐含的人际关系和商业信息</strong>（客户焦虑程度、礼貌距离）在结构化提取时容易丢失。如果将来 Wiki 要支撑客服回复生成，需要保留足够的情境元数据。</p>

    <h4>② 工具链分工：谁最适合当载体？</h4>
    <p><strong>Obsidian 是最适合做 Wiki 载体的工具</strong>，原因：文件系统原生本地 Markdown 仓库 + 插件生态 + Web Clipper，完美匹配 Karpathy 三层架构。</p>
    <table>
      <tr><th>工具</th><th>适合角色</th><th>不适合的角色</th></tr>
      <tr>
        <td><strong>Obsidian</strong></td>
        <td>Wiki 编译中心（wiki/ 层）</td>
        <td>—</td>
      </tr>
      <tr>
        <td><strong>Notion</strong></td>
        <td>分发终端（CRM/客户视图）</td>
        <td>高频 AI 读写（API 速率限制）</td>
      </tr>
      <tr>
        <td><strong>飞书</strong></td>
        <td>原始输入源之一</td>
        <td>知识库本体（信息寿命按天算）</td>
      </tr>
      <tr>
        <td><strong>Graphify</strong></td>
        <td>季度健康检查员 + 全局模式发现</td>
        <td>Wiki 编辑和审阅体验</td>
      </tr>
    </table>
    <p><strong>务实分工</strong>：Obsidian（编译中心）+ Notion（分发终端）+ 飞书（原始输入源）+ Graphify（季度健康检查员）。每个工具干自己擅长的事。</p>
  </div>
</div>

<hr class="divider">

<!-- S5: 我们做到了什么 -->
<div class="section" id="s5">
  <span class="section-num">SECTION 05</span>
  <h2 class="section-title">我们做到了什么：Graphify 知识图谱现状</h2>

  <p>我们在 Karpathy 方法论落地上已经走得比大多数人都远。以下是已有的积累：</p>

  <div class="three-col" style="margin: 24px 0;">
    <div class="col-card">
      <div class="num">10,008</div>
      <div class="label">节点数</div>
    </div>
    <div class="col-card">
      <div class="num">19,937</div>
      <div class="label">边数</div>
    </div>
    <div class="col-card">
      <div class="num">279</div>
      <div class="label">社区数</div>
    </div>
  </div>

  <div class="card-grid">
    <div class="card">
      <div class="card-title">✅ 三级置信度标签</div>
      <p>EXTRACTED / INFERRED / AMBIGUOUS — 和 AgentMemory v2 的置信度评分体系高度一致，甚至更早在 AGENTS.md 里实现了。</p>
    </div>
    <div class="card">
      <div class="card-title">✅ OpenClaw 集成</div>
      <p>AGENTS.md 已配置，answer 架构或代码问题前先读 GRAPH_REPORT.md。Git hooks 支持 post-commit 自动重建。</p>
    </div>
    <div class="card">
      <div class="card-title">✅ 图谱+Wiki 双层潜力</div>
      <p>Graphify 的关系网络（10K 节点）是 Wiki 的天然前哨，两者协同关系已被各模型确认：Graphify = 前哨，Wiki = 输出层。</p>
    </div>
    <div class="card">
      <div class="card-title">✅ 反馈回路已设计</div>
      <p>每次 /graphify query 的结果可自动保存到 graphify-out/memory/，下次 --update 时被提取为节点，知识图谱越用越智能。</p>
    </div>
  </div>
</div>

<hr class="divider">

<!-- S6: 差距分析 -->
<div class="section" id="s6">
  <span class="section-num">SECTION 06</span>
  <h2 class="section-title">差距分析：Wiki 层 vs Graphify 层</h2>

  <table>
    <tr><th>功能维度</th><th>目标状态（LLM Wiki）</th><th>我们现状</th><th>差距</th></tr>
    <tr>
      <td>raw/ 原始资料层</td>
      <td>原始文档不可变存储</td>
      <td class="status-none">❌ 未建立</td>
      <td class="status-none">完全缺失</td>
    </tr>
    <tr>
      <td>wiki/ 编译层</td>
      <td>AI 全权维护的结构化 Markdown</td>
      <td class="status-none">❌ 未建立</td>
      <td class="status-none">完全缺失</td>
    </tr>
    <tr>
      <td>AGENTS.md 规则</td>
      <td>完整的 schema + 工作流规范</td>
      <td class="status-gap">🟡 基础版</td>
      <td class="status-gap">需扩展 Ingest/Query/Lint 规范</td>
    </tr>
    <tr>
      <td>index.md 目录</td>
      <td>按主题分类，AI 主导航</td>
      <td class="status-none">❌ 无</td>
      <td class="status-none">完全缺失</td>
    </tr>
    <tr>
      <td>log.md 时间线</td>
      <td>每次操作记录，可 grep 解析</td>
      <td class="status-none">❌ 无</td>
      <td class="status-none">完全缺失</td>
    </tr>
    <tr>
      <td>Ingest 交互流程</td>
      <td>AI 主动提问题确认概念关联</td>
      <td class="status-none">❌ 单次录入无交互</td>
      <td class="status-none">完全缺失</td>
    </tr>
    <tr>
      <td>Lint 健康检查</td>
      <td>定期体检 + 自动修复</td>
      <td class="status-gap">🟡 Graphify 有矛盾检测</td>
      <td class="status-gap">需集成到 Wiki 层</td>
    </tr>
    <tr>
      <td>置信度评分</td>
      <td>来源数×时效性×矛盾检测</td>
      <td class="status-done">✅ Graphify EXTRACTED/INFERRED</td>
      <td class="status-gap">需扩展到 Wiki 层</td>
    </tr>
    <tr>
      <td>遗忘曲线</td>
      <td>随时间自动降权</td>
      <td class="status-none">❌ 无</td>
      <td class="status-none">完全缺失</td>
    </tr>
    <tr>
      <td>四层记忆层次</td>
      <td>Working→Episodic→Semantic→Procedural</td>
      <td class="status-none">❌ 无</td>
      <td class="status-none">完全缺失</td>
    </tr>
    <tr>
      <td>Obsidian Web Clipper</td>
      <td>一键保存网页/YouTube 为 Markdown</td>
      <td class="status-none">❌ 未集成</td>
      <td class="status-none">完全缺失</td>
    </tr>
    <tr>
      <td>AgentMemory 接入</td>
      <td>零外部依赖的记忆引擎</td>
      <td class="status-none">❌ 未接入</td>
      <td class="status-none">完全缺失</td>
    </tr>
    <tr>
      <td>多语言实体统一</td>
      <td>中日英主键统一，跨语言 lint</td>
      <td class="status-none">❌ 无</td>
      <td class="status-none">完全缺失</td>
    </tr>
  </table>

  <div class="highlight-box purple">
    <p><strong>关键判断（各模型共识）</strong>：Graphify 已经实现了 Wiki 的「关系发现层」，但「结构化编译层」（wiki/ 目录）和「规则引擎层」（AGENTS.md 完整版）仍然是空白。这是接下来最值得补的短板。</p>
  </div>
</div>

<hr class="divider">

<!-- S7: 下一步行动清单 -->
<div class="section" id="s7">
  <span class="section-num">SECTION 07</span>
  <h2 class="section-title">下一步行动清单</h2>

  <ol class="priority-list">
    <li>
      <div>
        <div class="pri-title">建立 raw/ 和 wiki/ 目录结构</div>
        <p class="pri-body">在 Obsidian vault 里建立两层结构。raw/ 放原始文档（论文/文章/视频笔记），wiki/ 放 AI 编译的结构化页面。按业务分类（猫舍健康/AI研修/业务流程），初始 AGENTS.md 定义基本工作流。</p>
      </div>
      <span class="pri-tag"><span class="tag orange">P0</span></span>
    </li>
    <li>
      <div>
        <div class="pri-title">扩展 AGENTS.md：Ingest + Query + Lint 规范</div>
        <p class="pri-body">定义 AI 在录入时的行为规范：来源追踪要求、置信度标注规则、概念发现触发条件。参考 Karpathy gist 的 schema 设计，结合我们自己的业务场景（日语客户资料、中文运营笔记）做个性化定制。</p>
      </div>
      <span class="pri-tag"><span class="tag orange">P0</span></span>
    </li>
    <li>
      <div>
        <div class="pri-title">建立 index.md + log.md</div>
        <p class="pri-body">index.md 作为 wiki 的主导航（按类别列出所有页面 + 一句话摘要 + 来源数量）。log.md 记录每次 ingest/query/lint 操作，以日期为前缀，grep 即可解析。每月固定时间更新 index。</p>
      </div>
      <span class="pri-tag"><span class="tag orange">P0</span></span>
    </li>
    <li>
      <div>
        <div class="pri-title">接入 AgentMemory（OpenClaw 版本）</div>
        <p class="pri-body">AgentMemory 支持 OpenClaw，零外部依赖。安装后接入我们的 OpenClaw，12 个自动钩子 + 43 个 MCP 工具，可以无缝集成到现有工作流。优先测试「session 结束自动归档」和「开始自动注入」两个钩子。</p>
      </div>
      <span class="pri-tag"><span class="tag">P1</span></span>
    </li>
    <li>
      <div>
        <div class="pri-title">建立中日双语实体统一规则</div>
        <p class="pri-body">定义实体主键命名规范（英文/标准化术语）。品种名（サイベリアン = Siberian）、疾病名、行政手续名统一索引。中日双语的 wiki 页面可以并存，但实体必须映射到同一主键，防止概念漂移。</p>
      </div>
      <span class="pri-tag"><span class="tag">P1</span></span>
    </li>
    <li>
      <div>
        <div class="pri-title">Graphify → Wiki 协同工作流</div>
        <p class="pri-body">Graphify 作为 Ingest 的前置处理：raw 文档 → Graphify 抽取实体/关系/矛盾检测 → Wiki 写入结构化页面。Graphify 的矛盾检测算法直接服务 Lint 操作。Wiki 直接消费 Graphify 输出作为 source of truth，不各自独立维护。</p>
      </div>
      <span class="pri-tag"><span class="tag">P1</span></span>
    </li>
    <li>
      <div>
        <div class="pri-title">Obsidian Web Clipper 集成</div>
        <p class="pri-body">配置 Obsidian Web Clipper，支持一键保存日语客户文章/AI 研修视频字幕/行业报告为本地 Markdown（带离线图片）。设置自动化钩子：新 clip 入库 → 触发 Ingest 工作流。</p>
      </div>
      <span class="pri-tag"><span class="tag">P2</span></span>
    </li>
    <li>
      <div>
        <div class="pri-title">第一个 Pilot：猫咪健康知识库</div>
        <p class="pri-body">选取「猫咪健康知识库」作为首个 Wiki pilot 场景。将已有的猫咪常见疾病资料（日语 + 中文）录入 raw/ → AI 编译成 wiki/ → 建立 index/log → 测试 Query 和 Lint。这是 DS Thinking 建议的优先级最高的切入点。</p>
      </div>
      <span class="pri-tag"><span class="tag purple">Pilot</span></span>
    </li>
  </ol>
</div>

<hr class="divider">

<!-- S8: 落地优先级 -->
<div class="section" id="s8">
  <span class="section-num">SECTION 08</span>
  <h2 class="section-title">落地优先级：四模型共识 + 业务匹配</h2>

  <div class="card-grid">
    <div class="card">
      <div class="card-model">立即行动（1-2周）</div>
      <div class="card-title">猫咪健康知识库 Pilot</div>
      <p>DS Thinking + GLM 一致认为是价值最明确的切入点。将现有猫咪疾病资料系统化，建立 raw/wiki 结构，验证 Ingest-Query-Lint 完整流程。成功后再复制到 AI 研修和业务流程场景。</p>
      <span class="tag orange">最高优先级</span>
    </div>
    <div class="card">
      <div class="card-model">短期（1个月）</div>
      <div class="card-title">Wiki 层基础设施建设</div>
      <p>AGENTS.md 完整版 + index.md + log.md + Graphify→Wiki 协同工作流。搭好基础设施后，其他场景的录入成本会大幅降低。</p>
      <span class="tag">重要</span>
    </div>
    <div class="card">
      <div class="card-model">中期（1-3个月）</div>
      <div class="card-title">AgentMemory + 遗忘曲线</div>
      <p>接入 AgentMemory，实现 session 自动归档/注入。将遗忘曲线机制写入 AGENTS.md，让知识网络有自我维护能力。</p>
      <span class="tag">中等</span>
    </div>
    <div class="card">
      <div class="card-model">长期（3-6个月）</div>
      <div class="card-title">多模态 + 多 agent 同步</div>
      <p>将图片（猫咪照片）、音频（客户语音）纳入知识库。多 agent 网格同步测试，验证多实例协作场景下的知识一致性。</p>
      <span class="tag purple">探索</span>
    </div>
  </div>
</div>

<hr class="divider">

<!-- S9: 结论 -->
<div class="section" id="s9">
  <span class="section-num">SECTION 09</span>
  <h2 class="section-title">结论与建议</h2>

  <div class="conclusion-banner">
    <h2>Graphify 先行，Wiki 层跟上</h2>
    <p>我们在知识图谱层面已经领先，但 LLM Wiki 的核心价值在于「编译层」——把 Graphify 发现的关系统一翻译成 AI 可维护、人类可阅读的结构化文本。这才是知识真正开始「复利积累」的起点。</p>
  </div>

  <h3>四模型核心共识</h3>
  <ul>
    <li><strong>不是 RAG 的改进，是完全不同的范式</strong>——从检索驱动到编译驱动，从临时推理到持久积累。</li>
    <li><strong>Wiki 是教科书，图谱是索引目录</strong>——两者协同，不是竞争。Graphify = 前哨，Wiki = 输出层。</li>
    <li><strong>Obsidian 是最佳载体</strong>——文件系统原生，插件生态完整，不被任何 App 绑架。</li>
    <li><strong>高频跨文档综合查询场景最值得投入</strong>——50+ 核心文档，30 天内重复提问，答案需要跨文档关联。</li>
    <li><strong>中文内容需要去噪预处理</strong>——中文互联网噪音多，Ingest 前必须提取正文转 Markdown。</li>
    <li><strong>中日双语场景要防概念漂移</strong>——实体主键统一，跨语言 lint 特别检查翻译等价但不语义等价的情况。</li>
  </ul>

  <h3>一句话行动纲领</h3>
  <blockquote>
    「先在 Obsidian 里把 raw/ 和 wiki/ 搭起来，用猫咪健康知识库跑通 Ingest-Query-Lint 全流程，Graphify 当前哨，Wiki 当输出层，AgentMemory 当自动化钩子，1 个月验证价值，3 个月形成复利。」
  </blockquote>

  <h3>什么时候这套方法会失败</h3>
  <p>DeepSeek 的警告值得重视：知识领域太窄或变化太快（AI 行业趋势分析）；团队小于 3 人；现有工具（Notion/飞书）已经能解决核心问题——这些情况下不要强行上 Wiki，先用好现有工具。</p>
  <p>Wiki 的价值在于<strong>深度 + 持久 + 关联</strong>，如果你的问题域不需要这三点，用 Notion 搭一个数据库远比维护一个 AI 可读的 Wiki 系统高效得多。</p>
</div>

</div>

<footer class="footer">
  <p>Karpathy LLM Wiki · 四模型深度研讨报告 · 2026-04-12</p>
  <p style="margin-top: 6px; opacity: 0.5;">MiniMax M2.7 · GLM-5.1 · DeepSeek V3.2 Thinking · Kimi K2.5 并行讨论</p>
</footer>

</body>
</html>
