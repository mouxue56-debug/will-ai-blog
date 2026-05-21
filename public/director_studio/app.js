const STORAGE_KEY = "director_studio_project_v1";
const CONNECTOR_KEY = "director_studio_connector_v1";

const state = {
  project: null,
  currentId: "",
  selectedIds: new Set(),
  activeTab: "story",
  dirty: false
};

const els = {
  save: document.querySelector("#save-project"),
  exportJson: document.querySelector("#export-json"),
  exportMd: document.querySelector("#export-md"),
  newProject: document.querySelector("#new-project"),
  loadSeed: document.querySelector("#load-seed"),
  importJson: document.querySelector("#import-json"),
  addSegment: document.querySelector("#add-segment"),
  segmentList: document.querySelector("#segment-list"),
  story: document.querySelector("#tab-story"),
  segment: document.querySelector("#tab-segment"),
  batch: document.querySelector("#tab-batch"),
  saveState: document.querySelector("#save-state"),
  toast: document.querySelector("#toast")
};

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 1400);
}

function emptyProject() {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    project: {
      title: "新短剧项目",
      logline: "",
      storyline: "",
      characterLock: "",
      visualStyle: "9:16竖屏，真实可信，镜头连续。",
      productionRules: [
        "每段只讲清一个核心因果动作。",
        "每段图片提示词和视频提示词必须互相呼应。",
        "默认不调用任何视频生成或 AI 服务。"
      ]
    },
    segments: []
  };
}

function normalizeSegment(raw, index = 0) {
  const id = String(raw?.id || String(index + 1).padStart(2, "0"));
  return {
    id,
    title: raw?.title || `第${id}段`,
    duration: raw?.duration || "10s",
    status: raw?.status || "draft",
    location: raw?.location || raw?.lockedLocation || "",
    goal: raw?.goal || raw?.storyBeat || "",
    startBridge: raw?.startBridge || "",
    endBridge: raw?.endBridge || "",
    panels: Array.isArray(raw?.panels) ? raw.panels : [],
    narration: raw?.narration || "",
    dialogue: Array.isArray(raw?.dialogue) ? raw.dialogue : [],
    sound: raw?.sound || "",
    templatePrompt: raw?.templatePrompt || "",
    videoPrompt: raw?.videoPrompt || "",
    image: typeof raw?.image === "string"
      ? { src: raw.image, notes: "", status: raw.image ? "draft" : "empty" }
      : {
          src: raw?.image?.src || "",
          notes: raw?.image?.notes || "",
          status: raw?.image?.status || (raw?.image?.src ? "draft" : "empty")
        },
    review: {
      logic: raw?.review?.logic || "",
      imagePrompt: raw?.review?.imagePrompt || "",
      videoPrompt: raw?.review?.videoPrompt || ""
    }
  };
}

function normalizeProject(raw) {
  const seed = raw || emptyProject();
  const seedProject = seed.project || seed;
  const segments = Array.isArray(seed.segments) ? seed.segments : [];
  const normalized = {
    schemaVersion: seed.schemaVersion || 1,
    updatedAt: seed.updatedAt || new Date().toISOString(),
    project: {
      title: seedProject.title || seed.title || "短剧项目",
      logline: seedProject.logline || seed.subtitle || "",
      storyline: seedProject.storyline || "",
      characterLock: seedProject.characterLock || seed.characterLock || "",
      visualStyle: seedProject.visualStyle || seed.visualStyle || "",
      productionRules: seedProject.productionRules || seed.productionRules || []
    },
    segments: segments.map(normalizeSegment)
  };
  normalized.segments.forEach((seg, index) => {
    seg.id = String(index + 1).padStart(2, "0");
  });
  return normalized;
}

function seedProject() {
  return normalizeProject(window.EDEN_PLAN || emptyProject());
}

function markDirty() {
  state.dirty = true;
  state.project.updatedAt = new Date().toISOString();
  els.saveState.textContent = "有未保存修改";
}

function saveProject() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
  state.dirty = false;
  els.saveState.textContent = "已保存";
  showToast("已保存到本机浏览器");
}

function loadProject(project) {
  state.project = normalizeProject(project);
  state.currentId = state.project.segments[0]?.id || "";
  state.selectedIds = new Set(state.project.segments.map((seg) => seg.id));
  state.dirty = false;
  els.saveState.textContent = "已载入";
  render();
}

function getCurrentSegment() {
  return state.project.segments.find((seg) => seg.id === state.currentId) || state.project.segments[0] || null;
}

function renumberSegments() {
  const selectedBefore = new Set(state.selectedIds);
  const idMap = new Map();
  state.project.segments.forEach((seg, index) => {
    const oldId = seg.id;
    seg.id = String(index + 1).padStart(2, "0");
    idMap.set(oldId, seg.id);
    if (state.currentId === oldId) state.currentId = seg.id;
  });
  state.selectedIds = new Set(
    [...selectedBefore]
      .map((id) => idMap.get(id))
      .filter(Boolean)
  );
}

function selectedSegments() {
  const selected = state.project.segments.filter((seg) => state.selectedIds.has(seg.id));
  return selected.length ? selected : state.project.segments;
}

function updateProjectField(field, value) {
  state.project.project[field] = value;
  markDirty();
}

function updateSegmentField(id, field, value) {
  const seg = state.project.segments.find((item) => item.id === id);
  if (!seg) return;
  if (field.includes(".")) {
    const [parent, child] = field.split(".");
    seg[parent][child] = value;
  } else {
    seg[field] = value;
  }
  markDirty();
}

function render() {
  renderSegmentList();
  renderStory();
  renderSegmentEditor();
  renderBatch();
}

function renderSegmentList() {
  els.segmentList.innerHTML = state.project.segments.map((seg) => `
    <div class="segment-row ${seg.id === state.currentId ? "active" : ""}">
      <input type="checkbox" data-select-id="${seg.id}" ${state.selectedIds.has(seg.id) ? "checked" : ""} aria-label="选择第${seg.id}段">
      <button type="button" data-open-id="${seg.id}">
        <span class="seg-title">${seg.id} ${esc(seg.title)}</span>
        <span class="seg-meta">${esc(seg.duration)} · ${esc(seg.location || "未设场景")}</span>
      </button>
      <span class="seg-status">${esc(seg.status || "draft")}</span>
    </div>
  `).join("");
}

function renderStory() {
  const p = state.project.project;
  els.story.innerHTML = `
    <section class="section storyline">
      <div class="section-header">
        <h2>故事主线</h2>
        <span class="status-pill">${state.project.segments.length} 段 · 总时长 ${totalDuration()} 秒</span>
      </div>
      <div class="grid-2">
        <label>项目标题
          <input data-project-field="title" value="${esc(p.title)}">
        </label>
        <label>一句话钩子
          <input data-project-field="logline" value="${esc(p.logline)}">
        </label>
      </div>
      <label>完整故事主线
        <textarea data-project-field="storyline">${escText(p.storyline)}</textarea>
      </label>
      <div class="grid-2">
        <label>人物锁定
          <textarea data-project-field="characterLock">${escText(p.characterLock)}</textarea>
        </label>
        <label>视觉风格
          <textarea data-project-field="visualStyle">${escText(p.visualStyle)}</textarea>
        </label>
      </div>
      <label>生产规则（一行一条）
        <textarea data-project-field="productionRules">${escText((p.productionRules || []).join("\n"))}</textarea>
      </label>
    </section>
  `;
}

function renderSegmentEditor() {
  const seg = getCurrentSegment();
  if (!seg) {
    els.segment.innerHTML = `
      <section class="section">
        <h2>还没有段落</h2>
        <p class="helper">点击左侧“新增”创建第一段。</p>
      </section>
    `;
    return;
  }

  els.segment.innerHTML = `
    <section class="section">
      <div class="section-header">
        <h2>${seg.id} 段落编辑</h2>
        <div class="button-row">
          <button type="button" data-move="-1">上移</button>
          <button type="button" data-move="1">下移</button>
          <button type="button" data-duplicate="${seg.id}">复制段落</button>
          <button type="button" class="danger" data-delete="${seg.id}">删除</button>
        </div>
      </div>
      <div class="grid-3">
        <label>标题
          <input data-seg-field="title" value="${esc(seg.title)}">
        </label>
        <label>时长
          <select data-seg-field="duration">
            ${["5s", "8s", "10s", "12s", "15s", "30s", "60s"].map((d) => `<option value="${d}" ${seg.duration === d ? "selected" : ""}>${d}</option>`).join("")}
          </select>
        </label>
        <label>状态
          <select data-seg-field="status">
            ${["draft", "needs-review", "approved", "needs-image", "ready"].map((s) => `<option value="${s}" ${seg.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="grid-2">
        <label>固定场景
          <input data-seg-field="location" value="${esc(seg.location)}">
        </label>
        <label>本段目标
          <input data-seg-field="goal" value="${esc(seg.goal)}">
        </label>
      </div>
      <div class="grid-2">
        <label>起始桥接
          <textarea data-seg-field="startBridge">${escText(seg.startBridge)}</textarea>
        </label>
        <label>结尾桥接
          <textarea data-seg-field="endBridge">${escText(seg.endBridge)}</textarea>
        </label>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>图片占位与替换</h2>
        <span class="status-pill">${esc(seg.image.status)}</span>
      </div>
      <div class="image-area">
        <div class="image-frame">
          ${seg.image.src ? `<img src="${esc(seg.image.src)}" alt="第${seg.id}段参考图">` : `<div class="placeholder">这里预留第${seg.id}段模板图<br>可粘贴URL或上传本地图片</div>`}
        </div>
        <div class="field-stack">
          <label>图片 URL 或 data URL
            <input data-seg-field="image.src" value="${esc(seg.image.src)}" placeholder="/assets/... 或 https://...">
          </label>
          <label class="file-button">
            上传本地图片到当前项目 JSON
            <input type="file" accept="image/*" data-image-upload="${seg.id}">
          </label>
          <label>图片备注
            <textarea data-seg-field="image.notes">${escText(seg.image.notes)}</textarea>
          </label>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>分镜、旁白、台词</h2>
        <button type="button" data-add-list="panels">新增分镜格</button>
      </div>
      ${listEditor("panels", seg.panels, "分镜")}
      <div class="grid-2">
        <label>旁白
          <textarea data-seg-field="narration">${escText(seg.narration)}</textarea>
        </label>
        <label>声音设计
          <textarea data-seg-field="sound">${escText(seg.sound)}</textarea>
        </label>
      </div>
      <div class="section-header">
        <h2>台词</h2>
        <button type="button" data-add-list="dialogue">新增台词</button>
      </div>
      ${listEditor("dialogue", seg.dialogue, "台词")}
    </section>

    <section class="section">
      <div class="section-header">
        <h2>图片提示词 + 视频提示词</h2>
        <div class="button-row">
          <button type="button" data-copy-package="${seg.id}">复制本段完整包</button>
          <button type="button" data-copy-field="templatePrompt">复制图片提示词</button>
          <button type="button" data-copy-field="videoPrompt">复制视频提示词</button>
        </div>
      </div>
      <div class="prompt-pair">
        <label>图片模板提示词
          <textarea data-seg-field="templatePrompt">${escText(seg.templatePrompt)}</textarea>
        </label>
        <label>视频生成提示词
          <textarea data-seg-field="videoPrompt">${escText(seg.videoPrompt)}</textarea>
        </label>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>审稿备注</h2>
      </div>
      <div class="grid-3">
        <label>故事逻辑
          <textarea data-seg-field="review.logic">${escText(seg.review.logic)}</textarea>
        </label>
        <label>图片提示词问题
          <textarea data-seg-field="review.imagePrompt">${escText(seg.review.imagePrompt)}</textarea>
        </label>
        <label>视频提示词问题
          <textarea data-seg-field="review.videoPrompt">${escText(seg.review.videoPrompt)}</textarea>
        </label>
      </div>
    </section>
  `;
}

function listEditor(field, items, label) {
  return `
    <div class="list-editor">
      ${(items || []).map((item, index) => `
        <div class="list-row">
          <textarea data-list-field="${field}" data-list-index="${index}" aria-label="${label}${index + 1}">${escText(item)}</textarea>
          <button type="button" class="danger" data-remove-list="${field}" data-list-index="${index}">删除</button>
        </div>
      `).join("")}
    </div>
  `;
}

function renderBatch() {
  const connector = JSON.parse(localStorage.getItem(CONNECTOR_KEY) || "{}");
  els.batch.innerHTML = `
    <section class="section">
      <div class="section-header">
        <h2>批量导出与修改</h2>
        <span class="status-pill">选中 ${selectedSegments().length} 段</span>
      </div>
      <div class="button-row">
        <button type="button" data-select-all="1">全选</button>
        <button type="button" data-select-all="0">全不选</button>
        <button type="button" data-generate-package="selected">生成选中段任务包</button>
        <button type="button" data-generate-package="all">生成全项目任务包</button>
        <button type="button" data-copy-batch-output>复制输出框</button>
      </div>
      <label>任务包 / 导出内容
        <textarea id="batch-output" class="batch-output"></textarea>
      </label>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>批量查找替换</h2>
      </div>
      <div class="grid-3">
        <label>字段
          <select id="replace-field">
            <option value="templatePrompt">图片提示词</option>
            <option value="videoPrompt">视频提示词</option>
            <option value="narration">旁白</option>
            <option value="dialogue">台词</option>
            <option value="panels">分镜</option>
          </select>
        </label>
        <label>查找
          <input id="replace-from" placeholder="要替换的文字">
        </label>
        <label>替换为
          <input id="replace-to" placeholder="新文字">
        </label>
      </div>
      <div class="button-row">
        <button type="button" data-apply-replace>应用到选中段</button>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>JSON Patch 回填</h2>
      </div>
      <p class="helper">让 Kimi、Codex 或员工返回 merge patch：{"project":{...},"segments":[{"id":"01","videoPrompt":"..."}]}。工具台会按 id 合并，不会自动调用模型。</p>
      <label>粘贴 JSON Patch
        <textarea id="patch-input" class="batch-output"></textarea>
      </label>
      <div class="button-row">
        <button type="button" data-apply-patch class="primary">预览并应用 Patch</button>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>本地接口预留</h2>
      </div>
      <p class="helper">默认不会请求任何外部服务。只有填写 endpoint 并点击发送时，才会把选中段 JSON POST 给你自己的 Hermes/Codex 本地服务。</p>
      <div class="grid-2">
        <label>Endpoint
          <input id="connector-endpoint" value="${esc(connector.endpoint || "")}" placeholder="http://127.0.0.1:8788/director-studio/rewrite">
        </label>
        <label>任务说明
          <input id="connector-instruction" value="${esc(connector.instruction || "润色视频提示词，保持剧情因果不变，返回 JSON patch。")}">
        </label>
      </div>
      <div class="button-row">
        <button type="button" data-save-connector>保存接口设置</button>
        <button type="button" data-send-connector>发送选中段到接口</button>
      </div>
    </section>
  `;
}

function totalDuration() {
  return state.project.segments.reduce((sum, seg) => {
    const match = String(seg.duration || "").match(/\d+/);
    return sum + (match ? Number(match[0]) : 0);
  }, 0);
}

function segmentPackage(seg) {
  return [
    `# ${seg.id} ${seg.title}`,
    "",
    `时长：${seg.duration}`,
    `固定场景：${seg.location}`,
    `本段目标：${seg.goal}`,
    `起始桥接：${seg.startBridge}`,
    `结尾桥接：${seg.endBridge}`,
    "",
    "## 分镜",
    ...(seg.panels || []).map((panel, index) => `${index + 1}. ${panel}`),
    "",
    "## 声音",
    `旁白：${seg.narration}`,
    ...(seg.dialogue || []),
    seg.sound ? `声音设计：${seg.sound}` : "",
    "",
    "## 图片模板提示词",
    seg.templatePrompt,
    "",
    "## 视频生成提示词",
    seg.videoPrompt
  ].filter(Boolean).join("\n");
}

function projectMarkdown(segments = state.project.segments) {
  const p = state.project.project;
  return [
    `# ${p.title}`,
    "",
    `一句话钩子：${p.logline}`,
    "",
    "## 故事主线",
    p.storyline,
    "",
    "## 人物锁定",
    p.characterLock,
    "",
    "## 视觉风格",
    p.visualStyle,
    "",
    "## 生产规则",
    ...(p.productionRules || []).map((rule) => `- ${rule}`),
    "",
    "## 段落包",
    ...segments.map(segmentPackage)
  ].join("\n");
}

function generateAiPackage(segments) {
  return [
    "你是 AI 短剧导演与中文短剧编剧。请基于下面 JSON/文本修改项目。",
    "",
    "硬规则：",
    "1. 保持每段故事因果清楚。",
    "2. 图片提示词和视频提示词必须互相呼应。",
    "3. 不要直接调用视频生成服务。",
    "4. 返回严格 JSON merge patch，格式为 {\"project\":{},\"segments\":[{\"id\":\"01\"}]}。",
    "",
    "项目：",
    JSON.stringify({
      project: state.project.project,
      segments
    }, null, 2)
  ].join("\n");
}

function download(filename, content, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function copy(text) {
  await navigator.clipboard.writeText(text);
  showToast("已复制");
}

function addSegment() {
  const id = String(state.project.segments.length + 1).padStart(2, "0");
  const seg = normalizeSegment({
    id,
    title: `第${id}段`,
    duration: "10s",
    status: "draft",
    panels: ["", "", "", "", "", ""]
  });
  state.project.segments.push(seg);
  state.currentId = id;
  state.selectedIds.add(id);
  markDirty();
  render();
}

function moveCurrent(delta) {
  const index = state.project.segments.findIndex((seg) => seg.id === state.currentId);
  const next = index + delta;
  if (index < 0 || next < 0 || next >= state.project.segments.length) return;
  const [seg] = state.project.segments.splice(index, 1);
  state.project.segments.splice(next, 0, seg);
  renumberSegments();
  markDirty();
  render();
}

function applyMergePatch(patch) {
  if (patch.project && typeof patch.project === "object") {
    Object.assign(state.project.project, patch.project);
  }
  if (Array.isArray(patch.segments)) {
    patch.segments.forEach((incoming) => {
      const target = state.project.segments.find((seg) => seg.id === String(incoming.id));
      if (target) {
        Object.entries(incoming).forEach(([key, value]) => {
          if (key === "id") return;
          if (key === "image" && typeof value === "object" && !Array.isArray(value)) {
            target.image = { ...target.image, ...value };
          } else if (key === "review" && typeof value === "object" && !Array.isArray(value)) {
            target.review = { ...target.review, ...value };
          } else {
            target[key] = value;
          }
        });
      } else {
        state.project.segments.push(normalizeSegment(incoming, state.project.segments.length));
      }
    });
  }
  markDirty();
  render();
}

document.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;

  const projectField = target.dataset.projectField;
  if (projectField) {
    const value = projectField === "productionRules"
      ? target.value.split("\n").map((line) => line.trim()).filter(Boolean)
      : target.value;
    updateProjectField(projectField, value);
    return;
  }

  const seg = getCurrentSegment();
  if (!seg) return;

  const segField = target.dataset.segField;
  if (segField) {
    updateSegmentField(seg.id, segField, target.value);
    if (["title", "duration", "location", "status", "image.src"].includes(segField)) {
      renderSegmentList();
    }
    if (segField === "duration") {
      renderStory();
    }
    return;
  }

  const listField = target.dataset.listField;
  if (listField) {
    seg[listField][Number(target.dataset.listIndex)] = target.value;
    markDirty();
  }
});

document.addEventListener("change", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;

  if (target.dataset.selectId) {
    if (target.checked) state.selectedIds.add(target.dataset.selectId);
    else state.selectedIds.delete(target.dataset.selectId);
    renderBatch();
  }

  if (target.id === "import-json" && target.files?.[0]) {
    const text = await target.files[0].text();
    loadProject(JSON.parse(text));
    saveProject();
  }

  if (target.dataset.imageUpload && target.files?.[0]) {
    const seg = state.project.segments.find((item) => item.id === target.dataset.imageUpload);
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      seg.image.src = String(reader.result);
      seg.image.status = "draft";
      markDirty();
      render();
    };
    reader.readAsDataURL(file);
  }
});

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const openId = target.closest("[data-open-id]")?.dataset.openId;
  if (openId) {
    state.currentId = openId;
    state.activeTab = "segment";
    setActiveTab("segment");
    render();
    return;
  }

  const tab = target.closest("[data-tab]")?.dataset.tab;
  if (tab) {
    setActiveTab(tab);
    return;
  }

  if (target.id === "save-project") saveProject();
  if (target.id === "export-json") download(`${state.project.project.title || "director-project"}.json`, JSON.stringify(state.project, null, 2));
  if (target.id === "export-md") download(`${state.project.project.title || "director-project"}.md`, projectMarkdown(), "text/markdown");
  if (target.id === "new-project") loadProject(emptyProject());
  if (target.id === "load-seed") loadProject(seedProject());
  if (target.id === "add-segment") addSegment();

  const seg = getCurrentSegment();
  if (!seg) return;

  if (target.dataset.move) moveCurrent(Number(target.dataset.move));

  if (target.dataset.duplicate) {
    const clone = JSON.parse(JSON.stringify(seg));
    clone.title = `${clone.title} 副本`;
    state.project.segments.splice(state.project.segments.findIndex((item) => item.id === seg.id) + 1, 0, clone);
    renumberSegments();
    markDirty();
    render();
  }

  if (target.dataset.delete) {
    state.project.segments = state.project.segments.filter((item) => item.id !== seg.id);
    state.currentId = state.project.segments[0]?.id || "";
    renumberSegments();
    markDirty();
    render();
  }

  if (target.dataset.addList) {
    seg[target.dataset.addList].push("");
    markDirty();
    renderSegmentEditor();
  }

  if (target.dataset.removeList) {
    seg[target.dataset.removeList].splice(Number(target.dataset.listIndex), 1);
    markDirty();
    renderSegmentEditor();
  }

  if (target.dataset.copyPackage) copy(segmentPackage(seg));
  if (target.dataset.copyField) copy(seg[target.dataset.copyField] || "");

  if (target.dataset.selectAll !== undefined) {
    state.selectedIds = target.dataset.selectAll === "1"
      ? new Set(state.project.segments.map((item) => item.id))
      : new Set();
    render();
  }

  if (target.dataset.generatePackage) {
    const segments = target.dataset.generatePackage === "all" ? state.project.segments : selectedSegments();
    document.querySelector("#batch-output").value = generateAiPackage(segments);
  }

  if (target.dataset.copyBatchOutput !== undefined) {
    copy(document.querySelector("#batch-output").value);
  }

  if (target.dataset.applyReplace !== undefined) {
    const field = document.querySelector("#replace-field").value;
    const from = document.querySelector("#replace-from").value;
    const to = document.querySelector("#replace-to").value;
    if (!from) return showToast("请填写查找内容");
    selectedSegments().forEach((item) => {
      if (Array.isArray(item[field])) {
        item[field] = item[field].map((value) => String(value).replaceAll(from, to));
      } else {
        item[field] = String(item[field] || "").replaceAll(from, to);
      }
    });
    markDirty();
    render();
  }

  if (target.dataset.applyPatch !== undefined) {
    try {
      applyMergePatch(JSON.parse(document.querySelector("#patch-input").value));
      showToast("Patch 已应用");
    } catch (error) {
      showToast(`Patch 解析失败：${error.message}`);
    }
  }

  if (target.dataset.saveConnector !== undefined) {
    const payload = {
      endpoint: document.querySelector("#connector-endpoint").value,
      instruction: document.querySelector("#connector-instruction").value
    };
    localStorage.setItem(CONNECTOR_KEY, JSON.stringify(payload));
    showToast("接口设置已保存");
  }

  if (target.dataset.sendConnector !== undefined) {
    const endpoint = document.querySelector("#connector-endpoint").value.trim();
    const instruction = document.querySelector("#connector-instruction").value.trim();
    if (!endpoint) return showToast("请先填写本地接口地址");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, project: state.project.project, segments: selectedSegments() })
      });
      const patch = await response.json();
      document.querySelector("#patch-input").value = JSON.stringify(patch, null, 2);
      showToast("接口返回已放入 Patch 框");
    } catch (error) {
      showToast(`接口请求失败：${error.message}`);
    }
  }
});

function setActiveTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll(".tab").forEach((item) => {
    item.classList.toggle("active", item.dataset.tab === tab);
  });
  document.querySelectorAll(".tab-panel").forEach((item) => {
    item.classList.toggle("active", item.id === `tab-${tab}`);
  });
}

function boot() {
  const stored = localStorage.getItem(STORAGE_KEY);
  loadProject(stored ? JSON.parse(stored) : seedProject());
  setActiveTab("story");
}

boot();
