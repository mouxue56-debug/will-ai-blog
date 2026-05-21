const STORAGE_KEY = "director_studio_project_v2";
const LEGACY_STORAGE_KEY = "director_studio_project_v1";
const CONNECTOR_KEY = "director_studio_connector_v1";
const HISTORY_KEY = "director_studio_history_v2";
const MAX_HISTORY = 30;

const STATUS_OPTIONS = [
  ["draft", "草稿"],
  ["needs-image", "待补图"],
  ["needs-rewrite", "待润色"],
  ["needs-review", "待审"],
  ["approved", "已通过"],
  ["ready", "可生成"],
  ["rendered", "已生成"]
];

const PACKAGE_MODES = {
  full: {
    label: "完整交接包",
    instruction: "完整检查故事、参考、图片提示词和视频提示词，返回必要的 JSON merge patch。"
  },
  rewrite: {
    label: "给 Kimi 润色",
    instruction: "只润色视频提示词和声音脚本，保持剧情因果、镜头顺序和参考图用途不变。"
  },
  image: {
    label: "给员工制图",
    instruction: "聚焦图片模板提示词，保证每段是6-9格连续分镜、场景简洁真实、图文一致。"
  },
  video: {
    label: "给视频生成",
    instruction: "聚焦手动视频生成。输出每段可直接复制给 Seedance/Gemini/Grok 的执行提示词。"
  },
  review: {
    label: "给审稿",
    instruction: "检查故事因果、情绪节奏、世界观表达、镜头承接和生成风险，返回审稿备注。"
  }
};

const REF_DEFS = {
  characters: {
    prefix: "char",
    title: "人物参考库",
    addLabel: "新增角色",
    primaryLabel: "角色名",
    secondaryLabel: "身份/关系",
    helper: "用于锁定多人物外貌、服装、年龄、性格和说话方式。可以上传角色参考图。"
  },
  styleRefs: {
    prefix: "style",
    title: "视觉风格参考",
    addLabel: "新增风格",
    primaryLabel: "风格名",
    secondaryLabel: "",
    helper: "用于统一画风、光线、色彩和摄影语言。糖果色只作为工具台视觉，不会强加到短剧内容里。"
  },
  sceneRefs: {
    prefix: "scene",
    title: "场景参考库",
    addLabel: "新增场景",
    primaryLabel: "场景名",
    secondaryLabel: "",
    helper: "用于锁定接入中心、伊甸世界、核心区等地点，减少视频生成时的场景漂移。"
  }
};

const SEG_REF_FIELDS = {
  characters: "characterRefs",
  styleRefs: "styleRefs",
  sceneRefs: "sceneRefs"
};

const state = {
  project: null,
  currentId: "",
  selectedIds: new Set(),
  activeTab: "story",
  undoSnapshot: null,
  dragUid: "",
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

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function stableUid(raw, index = 0) {
  return String(raw?.uid || raw?.stableId || raw?._uid || `seg_${String(raw?.id || index + 1).padStart(2, "0")}`);
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
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 1500);
}

function emptyProject() {
  return {
    schemaVersion: 2,
    updatedAt: new Date().toISOString(),
    project: {
      title: "新短剧项目",
      logline: "",
      storyline: "",
      characterLock: "",
      visualStyle: "9:16竖屏，真实可信，镜头连续。",
      productionRules: [
        "每段只讲清一个核心因果动作。",
        "每段模板图必须包含6-9格连续分镜，首尾要承接前后段。",
        "视频提示词以画面、旁白、台词和声音为主，不堆负面限制。",
        "默认不调用任何视频生成或 AI 服务。"
      ],
      characters: [],
      styleRefs: [],
      sceneRefs: []
    },
    segments: []
  };
}

function normalizeImage(raw) {
  if (typeof raw === "string") {
    return { src: raw, notes: "", status: raw ? "draft" : "empty", mode: inferImageMode(raw) };
  }
  return {
    src: raw?.src || "",
    notes: raw?.notes || "",
    status: raw?.status || (raw?.src ? "draft" : "empty"),
    mode: raw?.mode || inferImageMode(raw?.src || "")
  };
}

function inferImageMode(src) {
  if (!src) return "empty";
  if (String(src).startsWith("data:")) return "dataurl";
  if (/^https?:\/\//.test(String(src))) return "url";
  return "asset";
}

function normalizeReference(raw, index, type, fallback = {}) {
  const def = REF_DEFS[type];
  const id = String(raw?.id || fallback.id || `${def.prefix}_${String(index + 1).padStart(2, "0")}`);
  const primary = raw?.name || raw?.title || fallback.name || fallback.title || `${def.addLabel}${index + 1}`;
  return {
    uid: stableUid(raw, index),
    id,
    name: raw?.name || primary,
    title: raw?.title || primary,
    role: raw?.role || fallback.role || "",
    description: raw?.description || fallback.description || "",
    image: normalizeImage(raw?.image || fallback.image || "")
  };
}

function normalizeReferenceList(items, type) {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => normalizeReference(item, index, type));
}

function audioScriptFromLegacy(raw) {
  if (typeof raw?.audioScript === "string" && raw.audioScript.trim()) return raw.audioScript;
  const lines = [];
  if (raw?.narration) lines.push(`旁白：${raw.narration}`);
  if (Array.isArray(raw?.dialogue)) lines.push(...raw.dialogue);
  if (raw?.sound) lines.push(`声音：${raw.sound}`);
  return lines.join("\n");
}

function normalizeSegment(raw, index = 0) {
  const id = String(raw?.id || String(index + 1).padStart(2, "0"));
  return {
    uid: stableUid(raw, index),
    id,
    title: raw?.title || `第${id}段`,
    duration: raw?.duration || "10s",
    status: raw?.status || "draft",
    location: raw?.location || raw?.lockedLocation || "",
    scenePlan: raw?.scenePlan || [
      raw?.location || raw?.lockedLocation || "",
      raw?.startBridge ? `开头：${raw.startBridge}` : "",
      raw?.endBridge ? `结尾：${raw.endBridge}` : ""
    ].filter(Boolean).join("\n"),
    goal: raw?.goal || raw?.storyBeat || "",
    startBridge: raw?.startBridge || "",
    endBridge: raw?.endBridge || "",
    panels: Array.isArray(raw?.panels) ? raw.panels : [],
    audioScript: audioScriptFromLegacy(raw),
    narration: raw?.narration || "",
    dialogue: Array.isArray(raw?.dialogue) ? raw.dialogue : [],
    sound: raw?.sound || "",
    characterRefs: Array.isArray(raw?.characterRefs) ? raw.characterRefs : [],
    styleRefs: Array.isArray(raw?.styleRefs) ? raw.styleRefs : [],
    sceneRefs: Array.isArray(raw?.sceneRefs) ? raw.sceneRefs : [],
    templatePrompt: raw?.templatePrompt || "",
    videoPrompt: raw?.videoPrompt || "",
    image: normalizeImage(raw?.image || ""),
    review: {
      logic: raw?.review?.logic || "",
      imagePrompt: raw?.review?.imagePrompt || "",
      videoPrompt: raw?.review?.videoPrompt || ""
    }
  };
}

function deriveSceneRefs(segments) {
  const seen = new Set();
  return segments
    .map((seg) => String(seg.location || "").trim())
    .filter(Boolean)
    .filter((location) => {
      if (seen.has(location)) return false;
      seen.add(location);
      return true;
    })
    .slice(0, 12)
    .map((location, index) => normalizeReference({
      title: location,
      description: `${location}。上传一张可信、简洁、可复用的场景参考图，用来锁定本地点的空间、光线和材质。`
    }, index, "sceneRefs"));
}

function normalizeProject(raw) {
  const seed = raw || emptyProject();
  const seedProject = seed.project || seed;
  const rawSegments = Array.isArray(seed.segments) ? seed.segments : [];
  const segments = rawSegments.map(normalizeSegment);

  const legacyCharacterLock = seedProject.characterLock || seed.characterLock || "";
  const legacyVisualStyle = seedProject.visualStyle || seed.visualStyle || "";
  let characters = normalizeReferenceList(seedProject.characters || seed.characters, "characters");
  let styleRefs = normalizeReferenceList(seedProject.styleRefs || seed.styleRefs, "styleRefs");
  let sceneRefs = normalizeReferenceList(seedProject.sceneRefs || seed.sceneRefs, "sceneRefs");

  if (!characters.length && legacyCharacterLock) {
    characters = [normalizeReference({
      name: "落雪",
      role: "主角",
      description: legacyCharacterLock,
      image: { src: "", notes: "以用户上传的个人照片为脸部参考。", status: "empty" }
    }, 0, "characters")];
  }

  if (!styleRefs.length && legacyVisualStyle) {
    styleRefs = [normalizeReference({
      title: "整体影像风格",
      description: legacyVisualStyle
    }, 0, "styleRefs")];
  }

  if (!sceneRefs.length && segments.length) {
    sceneRefs = deriveSceneRefs(segments);
  }

  const productionRules = Array.isArray(seedProject.productionRules || seed.productionRules)
    ? (seedProject.productionRules || seed.productionRules)
    : String(seedProject.productionRules || seed.productionRules || "").split("\n").map((line) => line.trim()).filter(Boolean);

  const normalized = {
    schemaVersion: 2,
    updatedAt: seed.updatedAt || new Date().toISOString(),
    project: {
      title: seedProject.title || seed.title || "短剧项目",
      logline: seedProject.logline || seed.subtitle || "",
      storyline: seedProject.storyline || "",
      characterLock: legacyCharacterLock,
      visualStyle: legacyVisualStyle,
      productionRules,
      characters,
      styleRefs,
      sceneRefs
    },
    segments
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
  saveSnapshot("手动保存");
  state.dirty = false;
  els.saveState.textContent = "已保存";
  showToast("已保存到本机浏览器");
}

function historyList() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistoryList(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
}

function saveSnapshot(reason = "自动快照") {
  if (!state.project) return;
  const list = historyList();
  list.unshift({
    id: uid("snap"),
    savedAt: new Date().toISOString(),
    reason,
    title: state.project.project?.title || "短剧项目",
    segmentCount: state.project.segments?.length || 0,
    project: state.project
  });
  saveHistoryList(list);
}

function restoreSnapshot(snapshotId) {
  const item = historyList().find((snap) => snap.id === snapshotId);
  if (!item) return showToast("没有找到这个版本");
  state.undoSnapshot = JSON.stringify(state.project);
  loadProject(item.project);
  saveProject();
  showToast("已恢复历史版本");
}

function loadProject(project) {
  state.project = normalizeProject(project);
  state.currentId = state.project.segments[0]?.uid || "";
  state.selectedIds = new Set(state.project.segments.map((seg) => seg.uid));
  state.dirty = false;
  els.saveState.textContent = "已载入";
  render();
}

function getCurrentSegment() {
  return state.project.segments.find((seg) => seg.uid === state.currentId || seg.id === state.currentId) || state.project.segments[0] || null;
}

function renumberSegments() {
  state.project.segments.forEach((seg, index) => {
    seg.id = String(index + 1).padStart(2, "0");
  });
}

function selectedSegments() {
  const selected = state.project.segments.filter((seg) => state.selectedIds.has(seg.uid));
  return selected.length ? selected : state.project.segments;
}

function updateProjectField(field, value) {
  state.project.project[field] = value;
  markDirty();
}

function updateSegmentField(id, field, value) {
  const seg = state.project.segments.find((item) => item.uid === id || item.id === id);
  if (!seg) return;
  setPath(seg, field, value);
  if (field === "image.src") {
    seg.image.status = value ? "draft" : "empty";
    seg.image.mode = inferImageMode(value);
  }
  markDirty();
}

function updateReference(type, id, field, value) {
  const ref = state.project.project[type]?.find((item) => item.id === id);
  if (!ref) return;
  setPath(ref, field, value);
  if (field === "name") ref.title = value;
  if (field === "title") ref.name = value;
  if (field === "image.src") {
    ref.image.status = value ? "draft" : "empty";
    ref.image.mode = inferImageMode(value);
  }
  markDirty();
}

function setPath(target, path, value) {
  const parts = path.split(".");
  let cursor = target;
  parts.slice(0, -1).forEach((part) => {
    if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
    cursor = cursor[part];
  });
  cursor[parts.at(-1)] = value;
}

function render() {
  renderSegmentList();
  renderStory();
  renderSegmentEditor();
  renderBatch();
}

function renderSegmentList() {
  const rows = state.project.segments.map((seg) => `
    <div class="segment-row ${seg.uid === state.currentId ? "active" : ""}" draggable="true" data-drag-uid="${seg.uid}">
      <input type="checkbox" data-select-id="${seg.uid}" ${state.selectedIds.has(seg.uid) ? "checked" : ""} aria-label="选择第${seg.id}段">
      <button type="button" class="segment-open" data-open-id="${seg.uid}">
        <span class="seg-title">${seg.id} ${esc(seg.title)}</span>
        <span class="seg-meta">${esc(seg.duration)} · ${esc(seg.location || String(seg.scenePlan || "").split("\n")[0] || "未设场景")}</span>
      </button>
      <div class="row-sort" aria-label="排序">
        <button type="button" data-row-move-id="${seg.uid}" data-row-move="-1" title="上移">↑</button>
        <button type="button" data-row-move-id="${seg.uid}" data-row-move="1" title="下移">↓</button>
      </div>
      <span class="seg-status status-${esc(seg.status || "draft")}">${esc(statusLabel(seg.status))}</span>
    </div>
  `).join("");

  els.segmentList.innerHTML = `
    <p class="rail-note">勾选用于批量导出；↑↓ 直接调整段落顺序；点标题进入本段镜头包。</p>
    ${rows}
  `;
}

function statusLabel(value) {
  return STATUS_OPTIONS.find(([key]) => key === value)?.[1] || value || "草稿";
}

function renderStory() {
  const p = state.project.project;
  els.story.innerHTML = `
    <section class="section storyline">
      <div class="section-header">
        <div>
          <h2>项目主线</h2>
          <p class="section-kicker">先把故事因果讲顺，再让每段模板图和视频提示词互相咬合。</p>
        </div>
        <span class="status-pill">${state.project.segments.length} 段 · ${totalDuration()} 秒</span>
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
    </section>

    ${referenceLibrary("characters")}
    ${referenceLibrary("sceneRefs")}
    ${referenceLibrary("styleRefs")}

    <section class="section">
      <div class="section-header">
        <div>
          <h2>生产规则</h2>
          <p class="section-kicker">这些规则会进入批量任务包，用来约束员工、Kimi、Codex 或 Hermes。</p>
        </div>
      </div>
      <label>一行一条
        <textarea data-project-field="productionRules">${escText((p.productionRules || []).join("\n"))}</textarea>
      </label>
    </section>
  `;
}

function referenceLibrary(type) {
  const def = REF_DEFS[type];
  const refs = state.project.project[type] || [];
  return `
    <section class="section">
      <div class="section-header">
        <div>
          <h2>${def.title}</h2>
          <p class="section-kicker">${def.helper}</p>
        </div>
        <button type="button" data-add-ref="${type}">${def.addLabel}</button>
      </div>
      <div class="reference-grid ${type}">
        ${refs.map((ref) => referenceCard(type, ref)).join("") || `<p class="helper">还没有参考项。点击“${def.addLabel}”添加。</p>`}
      </div>
    </section>
  `;
}

function referenceCard(type, ref) {
  const def = REF_DEFS[type];
  const primaryField = type === "characters" ? "name" : "title";
  return `
    <article class="ref-card">
      <div class="ref-preview">
        ${ref.image.src ? `<img src="${esc(ref.image.src)}" alt="${esc(ref.name || ref.title)}">` : `<span>参考图</span>`}
      </div>
      <div class="ref-fields">
        <label>${def.primaryLabel}
          <input data-ref-type="${type}" data-ref-id="${ref.id}" data-ref-field="${primaryField}" value="${esc(ref[primaryField] || ref.name || ref.title)}">
        </label>
        ${def.secondaryLabel ? `<label>${def.secondaryLabel}
          <input data-ref-type="${type}" data-ref-id="${ref.id}" data-ref-field="role" value="${esc(ref.role)}">
        </label>` : ""}
        <label>描述
          <textarea data-ref-type="${type}" data-ref-id="${ref.id}" data-ref-field="description">${escText(ref.description)}</textarea>
        </label>
        <label>参考图 URL / data URL
          <input data-ref-type="${type}" data-ref-id="${ref.id}" data-ref-field="image.src" value="${esc(ref.image.src)}">
        </label>
        <label>图片模式
          <select data-ref-type="${type}" data-ref-id="${ref.id}" data-ref-field="image.mode">
            ${imageModeOptions(ref.image.mode)}
          </select>
        </label>
        <div class="button-row">
          <label class="file-button compact">
            上传图片
            <input type="file" accept="image/*" data-ref-upload="${type}" data-ref-id="${ref.id}">
          </label>
          <button type="button" class="danger" data-remove-ref="${type}" data-ref-id="${ref.id}">删除</button>
        </div>
        <label>图片备注
          <input data-ref-type="${type}" data-ref-id="${ref.id}" data-ref-field="image.notes" value="${esc(ref.image.notes)}">
        </label>
      </div>
    </article>
  `;
}

function imageModeOptions(value) {
  return [
    ["empty", "未设置"],
    ["asset", "项目资产路径"],
    ["url", "外链 URL"],
    ["dataurl", "内嵌 dataURL"]
  ].map(([key, label]) => `<option value="${key}" ${value === key ? "selected" : ""}>${label}</option>`).join("");
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
        <div>
          <h2>${seg.id} Seedance 镜头包</h2>
          <p class="section-kicker">本页只保留视频模型真正需要的信息：参考、镜头、声音、图片提示词、视频提示词。</p>
        </div>
        <div class="button-row">
          <button type="button" data-move="-1">上移</button>
          <button type="button" data-move="1">下移</button>
          <button type="button" data-duplicate="${seg.id}">复制</button>
          <button type="button" class="danger" data-delete="${seg.id}">删除</button>
        </div>
      </div>
      <div class="grid-3 compact-grid">
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
            ${STATUS_OPTIONS.map(([value, label]) => `<option value="${value}" ${seg.status === value ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
      </div>
      <p class="helper">Seedance/Gemini/Grok 手动生成时，本段建议按 4-15 秒控制；长内容拆成多段，不靠一个死镜头解释世界观。</p>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>本段导演意图</h2>
          <p class="section-kicker">把复杂字段合成两件事：这一段讲清什么，如何承接前后段。</p>
        </div>
      </div>
      <div class="grid-2">
        <label>这一段要讲清什么
          <textarea data-seg-field="goal">${escText(seg.goal)}</textarea>
        </label>
        <label>场景名
          <input data-seg-field="location" value="${esc(seg.location)}" placeholder="用于左侧列表和场景参考匹配">
        </label>
      </div>
      <label>场景与承接
        <textarea data-seg-field="scenePlan">${escText(seg.scenePlan)}</textarea>
      </label>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>本段引用</h2>
          <p class="section-kicker">对应即梦/Seedance 的全能参考：人物、场景、风格图都在这里指定。</p>
        </div>
      </div>
      <div class="picker-grid">
        ${referencePicker(seg, "characters", "人物")}
        ${referencePicker(seg, "sceneRefs", "场景")}
        ${referencePicker(seg, "styleRefs", "风格")}
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>模板图占位</h2>
          <p class="section-kicker">一段一个6-9格连续分镜模板图，图和提示词必须讲同一件事。</p>
        </div>
        <span class="status-pill">${esc(seg.image.status)}</span>
      </div>
      <div class="image-area">
        <div class="image-frame">
          ${seg.image.src ? `<img src="${esc(seg.image.src)}" alt="第${seg.id}段参考图">` : `<div class="placeholder">第${seg.id}段模板图<br>可粘贴URL或上传本地图片</div>`}
        </div>
        <div class="field-stack">
          <label>图片 URL 或 data URL
            <input data-seg-field="image.src" value="${esc(seg.image.src)}" placeholder="/assets/... 或 https://...">
          </label>
          <label>图片模式
            <select data-seg-field="image.mode">
              ${imageModeOptions(seg.image.mode)}
            </select>
          </label>
          <label class="file-button">
            上传本地图片到当前项目 JSON
            <input type="file" accept="image/*" data-image-upload="${seg.uid}">
          </label>
          <label>图片备注
            <textarea data-seg-field="image.notes">${escText(seg.image.notes)}</textarea>
          </label>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>镜头与声音</h2>
          <p class="section-kicker">提示词不必啰嗦，重点是镜头连续、旁白不断、台词短促、结尾能接下一段。</p>
        </div>
        <button type="button" data-add-list="panels">新增分镜格</button>
      </div>
      ${listEditor("panels", seg.panels, "分镜")}
      <label>声音脚本（旁白 / 人物台词 / 系统音 / 环境音）
        <textarea data-seg-field="audioScript" class="audio-script">${escText(seg.audioScript)}</textarea>
      </label>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>图片提示词 + 视频提示词</h2>
          <p class="section-kicker">图片提示词负责母版；视频提示词负责10秒内要拍什么、说什么。</p>
        </div>
        <div class="button-row">
          <button type="button" data-copy-package="${seg.id}">复制本段完整包</button>
          <button type="button" data-compose-prompt="${seg.uid}">按参考重组视频提示词</button>
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

    <details class="section compact-details">
      <summary>审稿备注</summary>
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
    </details>
  `;
}

function referencePicker(seg, type, label) {
  const refs = state.project.project[type] || [];
  const segField = SEG_REF_FIELDS[type];
  const selected = new Set(seg[segField] || []);
  if (!refs.length) {
    return `<div class="picker-card"><h3>${label}</h3><p class="helper">项目设定里还没有${label}参考。</p></div>`;
  }
  return `
    <div class="picker-card">
      <h3>${label}</h3>
      ${refs.map((ref) => `
        <label class="check-line">
          <input type="checkbox" data-seg-ref-type="${type}" data-seg-ref-id="${ref.id}" ${selected.has(ref.id) ? "checked" : ""}>
          <span>${esc(ref.name || ref.title)}</span>
        </label>
      `).join("")}
    </div>
  `;
}

function listEditor(field, items, label) {
  return `
    <div class="list-editor">
      ${(items || []).map((item, index) => `
        <div class="list-row">
          <span class="list-index">${index + 1}</span>
          <textarea data-list-field="${field}" data-list-index="${index}" aria-label="${label}${index + 1}">${escText(item)}</textarea>
          <button type="button" class="danger" data-remove-list="${field}" data-list-index="${index}">删除</button>
        </div>
      `).join("")}
    </div>
  `;
}

function renderBatch() {
  const connector = JSON.parse(localStorage.getItem(CONNECTOR_KEY) || "{}");
  const history = historyList();
  const dashboard = productionDashboard();
  els.batch.innerHTML = `
    <section class="section">
      <div class="section-header">
        <div>
          <h2>生产看板</h2>
          <p class="section-kicker">先看项目是不是具备手动生成条件，再导出给员工或 AI。</p>
        </div>
        <span class="status-pill">${dashboard.ready} 段可生成</span>
      </div>
      <div class="metric-grid">
        <div class="metric"><strong>${dashboard.total}</strong><span>总段落</span></div>
        <div class="metric"><strong>${dashboard.missingImages}</strong><span>缺模板图</span></div>
        <div class="metric"><strong>${dashboard.missingPrompts}</strong><span>缺提示词</span></div>
        <div class="metric"><strong>${dashboard.invalidDuration}</strong><span>时长风险</span></div>
        <div class="metric"><strong>${dashboard.noSceneRef}</strong><span>未选场景</span></div>
      </div>
      <div class="button-row">
        <button type="button" data-run-audit="selected">检查选中段</button>
        <button type="button" data-run-audit="all">检查全项目</button>
      </div>
      <label>检查结果
        <textarea id="audit-output" class="batch-output small-output" placeholder="点击检查后显示 Seedance 执行风险和图文一致性问题。"></textarea>
      </label>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>批量导出给员工 / AI</h2>
          <p class="section-kicker">勾选左侧段落后，这里会导出任务包；不会自动调用 AI 或视频平台。</p>
        </div>
        <span class="status-pill">选中 ${selectedSegments().length} 段</span>
      </div>
      <div class="grid-2">
        <label>导出类型
          <select id="package-mode">
            ${Object.entries(PACKAGE_MODES).map(([key, item]) => `<option value="${key}">${item.label}</option>`).join("")}
          </select>
        </label>
        <label>说明
          <input value="任务包会带上人物/场景/风格参考和选中段落，不会自动调用模型。" readonly>
        </label>
      </div>
      <div class="button-row">
        <button type="button" data-select-all="1">全选</button>
        <button type="button" data-select-all="0">全不选</button>
        <button type="button" data-generate-package="selected">生成选中段任务包</button>
        <button type="button" data-generate-package="all">生成全项目任务包</button>
        <button type="button" data-export-csv="selected">导出选中段 CSV</button>
        <button type="button" data-export-sanitized>导出脱敏示例 JSON</button>
        <button type="button" data-copy-batch-output>复制输出框</button>
      </div>
      <label>任务包 / 导出内容
        <textarea id="batch-output" class="batch-output"></textarea>
      </label>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>批量查找替换</h2>
          <p class="section-kicker">适合统一替换风格词、模型名、角色名或口播语气。</p>
        </div>
      </div>
      <div class="grid-3">
        <label>字段
          <select id="replace-field">
            <option value="templatePrompt">图片提示词</option>
            <option value="videoPrompt">视频提示词</option>
            <option value="audioScript">声音脚本</option>
            <option value="goal">导演意图</option>
            <option value="panels">分镜格</option>
          </select>
        </label>
        <label>查找文字
          <input id="replace-from" placeholder="要替换的文字">
        </label>
        <label>替换为
          <input id="replace-to" placeholder="新文字">
        </label>
      </div>
      <div class="button-row">
        <button type="button" data-preview-replace>预览命中</button>
        <button type="button" data-apply-replace>应用到选中段</button>
      </div>
      <label>命中预览
        <textarea id="replace-preview" class="batch-output small-output"></textarea>
      </label>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>JSON Patch 回填</h2>
          <p class="section-kicker">让 Kimi、Codex、Hermes 或员工返回 merge patch；工具台按 id 合并。</p>
        </div>
      </div>
      <label>粘贴 JSON Patch
        <textarea id="patch-input" class="batch-output" placeholder='{"project":{},"segments":[{"id":"01","videoPrompt":"..."}]}'></textarea>
      </label>
      <div class="button-row">
        <button type="button" data-preview-patch>预览 Patch</button>
        <button type="button" data-apply-patch class="primary">应用 Patch</button>
        <button type="button" data-undo-patch>撤销上一次应用</button>
      </div>
      <label>Patch 预览
        <textarea id="patch-preview" class="batch-output small-output"></textarea>
      </label>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>本机版本历史</h2>
          <p class="section-kicker">每次手动保存和应用 Patch 都会留下快照，可回滚。</p>
        </div>
        <span class="status-pill">${history.length} 个快照</span>
      </div>
      <div class="grid-2">
        <label>历史版本
          <select id="history-select">
            ${history.map((snap) => `<option value="${snap.id}">${esc(new Date(snap.savedAt).toLocaleString())} · ${esc(snap.reason)} · ${snap.segmentCount}段</option>`).join("")}
          </select>
        </label>
        <label>说明
          <input value="恢复前会把当前项目放入撤销快照。" readonly>
        </label>
      </div>
      <div class="button-row">
        <button type="button" data-save-snapshot>保存当前快照</button>
        <button type="button" data-restore-snapshot>恢复选中版本</button>
        <button type="button" class="danger" data-clear-history>清空历史</button>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>可选：本地 Hermes / Codex 接口</h2>
          <p class="section-kicker">只在你填写 endpoint 并点击发送时 POST。本工具不会内置任何云端密钥。</p>
        </div>
      </div>
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

function productionDashboard() {
  const audits = state.project.segments.map((seg) => auditSegment(seg));
  return {
    total: state.project.segments.length,
    ready: audits.filter((item) => item.errors.length === 0).length,
    missingImages: state.project.segments.filter((seg) => !seg.image?.src).length,
    missingPrompts: state.project.segments.filter((seg) => !seg.templatePrompt || !seg.videoPrompt).length,
    invalidDuration: audits.filter((item) => item.errors.concat(item.warnings).some((line) => line.includes("时长"))).length,
    noSceneRef: state.project.segments.filter((seg) => !(seg.sceneRefs || []).length).length
  };
}

function auditSegments(segments) {
  const lines = [
    `# Seedance 执行检查`,
    `检查时间：${new Date().toLocaleString()}`,
    `范围：${segments.length} 段`,
    ""
  ];
  segments.forEach((seg) => {
    const audit = auditSegment(seg);
    const level = audit.errors.length ? "阻塞" : audit.warnings.length ? "需注意" : "通过";
    lines.push(`## ${seg.id} ${seg.title}：${level}`);
    if (!audit.errors.length && !audit.warnings.length) lines.push("- 可以进入手动生成。");
    audit.errors.forEach((item) => lines.push(`- [阻塞] ${item}`));
    audit.warnings.forEach((item) => lines.push(`- [注意] ${item}`));
    lines.push("");
  });
  return lines.join("\n");
}

function auditSegment(seg) {
  const errors = [];
  const warnings = [];
  const seconds = durationSeconds(seg.duration);
  const panels = seg.panels || [];
  const refText = segmentReferenceText(seg);

  if (!seconds || seconds < 4 || seconds > 15) errors.push(`时长 ${seg.duration || "未填"} 不适合直接生成，建议 4-15s。`);
  if (panels.length < 6 || panels.length > 9) errors.push(`分镜格为 ${panels.length} 格，建议 6-9 格连续分镜。`);
  if (!seg.image?.src) errors.push("缺少本段模板图。");
  if (!seg.templatePrompt) errors.push("缺少图片模板提示词。");
  if (!seg.videoPrompt) errors.push("缺少视频生成提示词。");
  if (!seg.audioScript) warnings.push("缺少声音脚本，短剧会显得空。");
  if (!seg.goal) warnings.push("缺少本段导演意图。");
  if (!seg.scenePlan) warnings.push("缺少场景与承接。");
  if (!(seg.sceneRefs || []).length) warnings.push("本段没有选择场景参考图，容易场景漂移。");
  if (!(seg.characterRefs || []).length) warnings.push("本段没有选择人物参考，涉及人物时容易脸变。");
  if (seg.videoPrompt && !/旁白|说|台词|系统音|声音/.test(seg.videoPrompt + seg.audioScript)) warnings.push("视频提示词没有明确声音/台词。");
  if (seg.templatePrompt && seg.videoPrompt) {
    const consistency = consistencyWarnings(seg);
    warnings.push(...consistency);
  }
  if (refText.includes("默认遵循项目参考库") && (state.project.project.characters || []).length > 1) {
    warnings.push("项目有多角色，但本段未指定角色，建议显式勾选。");
  }
  return { errors, warnings };
}

function consistencyWarnings(seg) {
  const warnings = [];
  const terms = importantTerms(seg);
  const imageText = `${seg.templatePrompt} ${seg.panels.join(" ")}`;
  const videoText = `${seg.videoPrompt} ${seg.audioScript}`;
  const missingInImage = terms.filter((term) => !imageText.includes(term)).slice(0, 4);
  const missingInVideo = terms.filter((term) => !videoText.includes(term)).slice(0, 4);
  if (missingInImage.length) warnings.push(`图片提示词可能缺少关键元素：${missingInImage.join("、")}。`);
  if (missingInVideo.length) warnings.push(`视频提示词可能缺少关键元素：${missingInVideo.join("、")}。`);
  if (seg.panels[0] && seg.videoPrompt && !sharesAny(seg.panels[0], seg.videoPrompt)) warnings.push("视频提示词没有明显承接第一格画面。");
  if (seg.panels.at(-1) && seg.videoPrompt && !sharesAny(seg.panels.at(-1), seg.videoPrompt)) warnings.push("视频提示词没有明显覆盖结尾格/下一段钩子。");
  return warnings;
}

function importantTerms(seg) {
  const raw = [
    seg.title,
    seg.location,
    ...selectedRefObjects(seg, "characters").map((ref) => ref.name || ref.title),
    ...selectedRefObjects(seg, "sceneRefs").map((ref) => ref.name || ref.title),
    ...selectedRefObjects(seg, "styleRefs").map((ref) => ref.name || ref.title)
  ].join(" ");
  return [...new Set((raw.match(/[\u4e00-\u9fa5A-Za-z0-9#-]{2,}/g) || [])
    .filter((term) => !["第一个", "现实", "生成", "参考", "镜头"].includes(term))
    .slice(0, 10))];
}

function sharesAny(a, b) {
  const terms = (String(a).match(/[\u4e00-\u9fa5A-Za-z0-9#-]{2,}/g) || []).filter((term) => term.length >= 2);
  return terms.some((term) => String(b).includes(term));
}

function durationSeconds(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function totalDuration() {
  return state.project.segments.reduce((sum, seg) => {
    const match = String(seg.duration || "").match(/\d+/);
    return sum + (match ? Number(match[0]) : 0);
  }, 0);
}

function refName(type, id) {
  const ref = state.project.project[type]?.find((item) => item.id === id);
  return ref ? (ref.name || ref.title) : id;
}

function selectedRefObjects(seg, type) {
  const ids = new Set(seg[SEG_REF_FIELDS[type]] || []);
  return (state.project.project[type] || []).filter((ref) => ids.has(ref.id));
}

function refsBlock(seg) {
  const blocks = [];
  [
    ["characters", "人物"],
    ["sceneRefs", "场景"],
    ["styleRefs", "风格"]
  ].forEach(([type, label]) => {
    const refs = selectedRefObjects(seg, type);
    if (!refs.length) return;
    blocks.push(`${label}参考：`);
    refs.forEach((ref) => {
      blocks.push(`- ${ref.name || ref.title}${ref.role ? `（${ref.role}）` : ""}：${ref.description || "无描述"}${ref.image?.src ? `；参考图：${ref.image.mode || inferImageMode(ref.image.src)}` : ""}`);
    });
  });
  return blocks.length ? blocks.join("\n") : "本段未单独指定参考，默认遵循项目参考库。";
}

function segmentReferenceText(seg) {
  const lines = [];
  Object.entries(SEG_REF_FIELDS).forEach(([type, field]) => {
    const ids = seg[field] || [];
    if (ids.length) lines.push(`${REF_DEFS[type].title}：${ids.map((id) => refName(type, id)).join("、")}`);
  });
  return lines.length ? lines.join("\n") : "本段未单独指定参考项，默认遵循项目参考库。";
}

function segmentPackage(seg) {
  return [
    `# ${seg.id} ${seg.title}`,
    `稳定ID：${seg.uid}`,
    "",
    `时长：${seg.duration}`,
    `导演意图：${seg.goal}`,
    `场景与承接：${seg.scenePlan || [seg.location, seg.startBridge ? `开头：${seg.startBridge}` : "", seg.endBridge ? `结尾：${seg.endBridge}` : ""].filter(Boolean).join(" / ")}`,
    "",
    "## 本段参考",
    refsBlock(seg),
    "",
    "## 分镜顺序",
    ...(seg.panels || []).map((panel, index) => `${index + 1}. ${panel}`),
    "",
    "## 声音脚本",
    seg.audioScript || audioScriptFromLegacy(seg),
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
    "## 人物参考库",
    ...p.characters.map((ref) => `- ${ref.name}${ref.role ? `（${ref.role}）` : ""}：${ref.description}`),
    "",
    "## 场景参考库",
    ...p.sceneRefs.map((ref) => `- ${ref.title}：${ref.description}`),
    "",
    "## 视觉风格参考",
    ...p.styleRefs.map((ref) => `- ${ref.title}：${ref.description}`),
    "",
    "## 生产规则",
    ...(p.productionRules || []).map((rule) => `- ${rule}`),
    "",
    "## 段落包",
    ...segments.map(segmentPackage)
  ].join("\n");
}

function compactProjectForAI() {
  const p = state.project.project;
  return {
    title: p.title,
    logline: p.logline,
    storyline: p.storyline,
    productionRules: p.productionRules,
    characters: p.characters,
    sceneRefs: p.sceneRefs,
    styleRefs: p.styleRefs
  };
}

function compactSegment(seg) {
  return {
    uid: seg.uid,
    id: seg.id,
    title: seg.title,
    duration: seg.duration,
    status: seg.status,
    goal: seg.goal,
    location: seg.location,
    scenePlan: seg.scenePlan,
    startBridge: seg.startBridge,
    endBridge: seg.endBridge,
    characterRefs: seg.characterRefs,
    sceneRefs: seg.sceneRefs,
    styleRefs: seg.styleRefs,
    panels: seg.panels,
    audioScript: seg.audioScript,
    templatePrompt: seg.templatePrompt,
    videoPrompt: seg.videoPrompt,
    image: seg.image,
    review: seg.review
  };
}

function generateAiPackage(segments, mode = "full") {
  const modeInfo = PACKAGE_MODES[mode] || PACKAGE_MODES.full;
  return [
    `你是 AI 短剧导演与中文短剧编剧。任务类型：${modeInfo.label}。`,
    modeInfo.instruction,
    "",
    "硬规则：",
    "1. 保持故事因果清楚，人物动机连续。",
    "2. 每段模板图提示词和视频提示词必须互相呼应。",
    "3. 视频提示词重点写画面、旁白、人物台词、系统音/环境音，不要堆无效负面词。",
    "4. 不要调用视频生成服务，只返回严格 JSON merge patch。",
    "5. patch 格式：{\"project\":{},\"segments\":[{\"id\":\"01\",\"videoPrompt\":\"...\"}]}。",
    "",
    "项目数据：",
    JSON.stringify({
      project: compactProjectForAI(),
      segments: segments.map(compactSegment)
    }, null, 2)
  ].join("\n");
}

function composeExecutionPrompt(seg) {
  return [
    `参考图是第${seg.id}段的6-9格连续分镜模板，请按全能参考理解，不要拍摄故事板本身。`,
    "",
    `段落标题：${seg.title}`,
    `时长：${seg.duration}，比例：9:16。`,
    "",
    "本段引用：",
    refsBlock(seg),
    "",
    "导演意图：",
    seg.goal || "本段只推进一个清楚的因果动作。",
    "",
    "场景与承接：",
    seg.scenePlan || seg.location || "沿用项目设定。",
    "",
    "镜头顺序：",
    ...(seg.panels || []).map((panel, index) => `${index + 1}. ${panel}`),
    "",
    "声音脚本：",
    seg.audioScript || "旁白和人物短句要持续推进剧情，避免空镜。",
    "",
    "生成要求：真实短剧感，镜头连续，人物和场景保持一致；旁白、人物台词、系统音或环境音要服务剧情推进。"
  ].filter(Boolean).join("\n");
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

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportCsv(segments) {
  const rows = [
    ["段号", "稳定ID", "标题", "时长", "状态", "场景", "人物参考", "场景参考", "模板图", "图片提示词", "视频提示词"]
  ];
  segments.forEach((seg) => {
    rows.push([
      seg.id,
      seg.uid,
      seg.title,
      seg.duration,
      statusLabel(seg.status),
      seg.location,
      (seg.characterRefs || []).map((id) => refName("characters", id)).join("、"),
      (seg.sceneRefs || []).map((id) => refName("sceneRefs", id)).join("、"),
      seg.image?.src || "",
      seg.templatePrompt || "",
      seg.videoPrompt || ""
    ]);
  });
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function sanitizedProject() {
  const clone = JSON.parse(JSON.stringify(state.project));
  const scrubImage = (image) => {
    if (!image) return image;
    return { ...image, src: image.src ? "[已脱敏图片]" : "", notes: image.notes || "", mode: image.mode || "empty" };
  };
  ["characters", "sceneRefs", "styleRefs"].forEach((type) => {
    clone.project[type] = (clone.project[type] || []).map((ref) => ({ ...ref, image: scrubImage(ref.image) }));
  });
  clone.segments = clone.segments.map((seg) => ({ ...seg, image: scrubImage(seg.image) }));
  clone.updatedAt = new Date().toISOString();
  clone.publicDemo = true;
  return clone;
}

function previewReplace(field, from) {
  if (!from) return "请先填写查找文字。";
  const lines = [`# 替换预览：字段 ${field}，查找「${from}」`, ""];
  selectedSegments().forEach((seg) => {
    const value = seg[field];
    const text = Array.isArray(value) ? value.join("\n") : String(value || "");
    const count = text.split(from).length - 1;
    if (count > 0) lines.push(`- ${seg.id} ${seg.title}：${count} 处`);
  });
  return lines.length > 2 ? lines.join("\n") : "没有命中。";
}

function describePatch(patch) {
  const lines = ["# Patch 预览", ""];
  if (patch.project) {
    lines.push(`项目字段：${Object.keys(patch.project).join("、") || "无"}`);
  }
  if (Array.isArray(patch.segments)) {
    patch.segments.forEach((incoming) => {
      const target = findSegmentByIncoming(incoming);
      const fields = Object.keys(incoming).filter((key) => key !== "id" && key !== "uid");
      lines.push(`- ${incoming.id || incoming.uid || "新段落"} ${target ? target.title : "新增段落"}：${fields.join("、") || "无字段"}`);
    });
  }
  return lines.join("\n");
}

function findSegmentByIncoming(incoming) {
  return state.project.segments.find((seg) => {
    if (incoming.uid && seg.uid === incoming.uid) return true;
    return incoming.id && seg.id === String(incoming.id);
  });
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
  state.currentId = seg.uid;
  state.selectedIds.add(seg.uid);
  markDirty();
  render();
}

function moveCurrent(delta) {
  moveSegmentById(state.currentId, delta);
}

function moveSegmentById(id, delta) {
  const index = state.project.segments.findIndex((seg) => seg.uid === id || seg.id === id);
  const next = index + delta;
  if (index < 0 || next < 0 || next >= state.project.segments.length) return;
  const [seg] = state.project.segments.splice(index, 1);
  state.project.segments.splice(next, 0, seg);
  state.currentId = seg.uid;
  renumberSegments();
  markDirty();
  render();
}

function addReference(type) {
  const refs = state.project.project[type];
  refs.push(normalizeReference({
    title: REF_DEFS[type].addLabel,
    name: REF_DEFS[type].addLabel
  }, refs.length, type, { id: uid(REF_DEFS[type].prefix) }));
  markDirty();
  renderStory();
  renderSegmentEditor();
  renderBatch();
}

function removeReference(type, id) {
  state.project.project[type] = state.project.project[type].filter((ref) => ref.id !== id);
  const segField = SEG_REF_FIELDS[type];
  state.project.segments.forEach((seg) => {
    seg[segField] = (seg[segField] || []).filter((refId) => refId !== id);
  });
  markDirty();
  render();
}

function toggleSegmentRef(seg, type, id, checked) {
  const field = SEG_REF_FIELDS[type];
  const current = new Set(seg[field] || []);
  if (checked) current.add(id);
  else current.delete(id);
  seg[field] = [...current];
  markDirty();
}

function applyMergePatch(patch) {
  state.undoSnapshot = JSON.stringify(state.project);
  saveSnapshot("应用 Patch 前");
  if (patch.project && typeof patch.project === "object") {
    Object.assign(state.project.project, patch.project);
  }
  if (Array.isArray(patch.segments)) {
    patch.segments.forEach((incoming) => {
      const target = findSegmentByIncoming(incoming);
      if (target) {
        Object.entries(incoming).forEach(([key, value]) => {
          if (key === "id" || key === "uid") return;
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
  const current = state.currentId;
  state.project = normalizeProject(state.project);
  if (state.project.segments.some((seg) => seg.uid === current)) state.currentId = current;
  else state.currentId = state.project.segments[0]?.uid || "";
  markDirty();
  render();
}

function replaceInValue(value, from, to) {
  if (Array.isArray(value)) return value.map((item) => String(item).replaceAll(from, to));
  return String(value || "").replaceAll(from, to);
}

document.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;

  const refType = target.dataset.refType;
  const refId = target.dataset.refId;
  const refField = target.dataset.refField;
  if (refType && refId && refField) {
    updateReference(refType, refId, refField, target.value);
    return;
  }

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
    updateSegmentField(seg.uid, segField, target.value);
    if (["title", "duration", "location", "scenePlan", "status", "image.src"].includes(segField)) {
      renderSegmentList();
    }
    if (segField === "duration") renderStory();
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

  if (target.dataset.segRefType && target.dataset.segRefId) {
    const seg = getCurrentSegment();
    if (seg) {
      toggleSegmentRef(seg, target.dataset.segRefType, target.dataset.segRefId, target.checked);
      renderBatch();
    }
  }

  if (target.id === "import-json" && target.files?.[0]) {
    const text = await target.files[0].text();
    loadProject(JSON.parse(text));
    saveProject();
  }

  if (target.dataset.imageUpload && target.files?.[0]) {
    const seg = state.project.segments.find((item) => item.uid === target.dataset.imageUpload || item.id === target.dataset.imageUpload);
    if (!seg) return;
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      seg.image.src = String(reader.result);
      seg.image.status = "draft";
      seg.image.mode = "dataurl";
      markDirty();
      render();
    };
    reader.readAsDataURL(file);
  }

  if (target.dataset.refUpload && target.dataset.refId && target.files?.[0]) {
    const ref = state.project.project[target.dataset.refUpload]?.find((item) => item.id === target.dataset.refId);
    if (!ref) return;
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      ref.image.src = String(reader.result);
      ref.image.status = "draft";
      ref.image.mode = "dataurl";
      markDirty();
      render();
    };
    reader.readAsDataURL(file);
  }
});

document.addEventListener("dragstart", (event) => {
  const row = event.target instanceof HTMLElement ? event.target.closest("[data-drag-uid]") : null;
  if (!row) return;
  state.dragUid = row.dataset.dragUid;
  event.dataTransfer?.setData("text/plain", state.dragUid);
  event.dataTransfer?.setDragImage(row, 20, 20);
});

document.addEventListener("dragover", (event) => {
  if (event.target instanceof HTMLElement && event.target.closest("[data-drag-uid]")) {
    event.preventDefault();
  }
});

document.addEventListener("drop", (event) => {
  const row = event.target instanceof HTMLElement ? event.target.closest("[data-drag-uid]") : null;
  if (!row || !state.dragUid || row.dataset.dragUid === state.dragUid) return;
  event.preventDefault();
  const from = state.project.segments.findIndex((seg) => seg.uid === state.dragUid);
  const to = state.project.segments.findIndex((seg) => seg.uid === row.dataset.dragUid);
  if (from < 0 || to < 0) return;
  const [seg] = state.project.segments.splice(from, 1);
  state.project.segments.splice(to, 0, seg);
  state.currentId = seg.uid;
  renumberSegments();
  markDirty();
  render();
});

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const rowMove = target.closest("[data-row-move-id]");
  if (rowMove) {
    moveSegmentById(rowMove.dataset.rowMoveId, Number(rowMove.dataset.rowMove));
    return;
  }

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

  if (target.dataset.addRef) addReference(target.dataset.addRef);
  if (target.dataset.removeRef && target.dataset.refId) removeReference(target.dataset.removeRef, target.dataset.refId);

  const seg = getCurrentSegment();
  if (!seg) return;

  if (target.dataset.move) moveCurrent(Number(target.dataset.move));

  if (target.dataset.duplicate) {
    const clone = JSON.parse(JSON.stringify(seg));
    clone.uid = uid("seg");
    clone.title = `${clone.title} 副本`;
    state.project.segments.splice(state.project.segments.findIndex((item) => item.uid === seg.uid) + 1, 0, clone);
    renumberSegments();
    markDirty();
    render();
  }

  if (target.dataset.delete) {
    state.project.segments = state.project.segments.filter((item) => item.uid !== seg.uid);
    state.currentId = state.project.segments[0]?.uid || "";
    renumberSegments();
    markDirty();
    render();
  }

  if (target.dataset.addList) {
    if (!Array.isArray(seg[target.dataset.addList])) seg[target.dataset.addList] = [];
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
  if (target.dataset.composePrompt) {
    seg.videoPrompt = composeExecutionPrompt(seg);
    markDirty();
    renderSegmentEditor();
    renderBatch();
    showToast("已按参考重组视频提示词");
  }

  if (target.dataset.runAudit) {
    const segments = target.dataset.runAudit === "all" ? state.project.segments : selectedSegments();
    document.querySelector("#audit-output").value = auditSegments(segments);
  }

  if (target.dataset.selectAll !== undefined) {
    state.selectedIds = target.dataset.selectAll === "1"
      ? new Set(state.project.segments.map((item) => item.uid))
      : new Set();
    render();
  }

  if (target.dataset.generatePackage) {
    const segments = target.dataset.generatePackage === "all" ? state.project.segments : selectedSegments();
    const mode = document.querySelector("#package-mode")?.value || "full";
    document.querySelector("#batch-output").value = generateAiPackage(segments, mode);
  }

  if (target.dataset.exportCsv) {
    const segments = target.dataset.exportCsv === "all" ? state.project.segments : selectedSegments();
    download(`${state.project.project.title || "director-project"}-segments.csv`, exportCsv(segments), "text/csv;charset=utf-8");
  }

  if (target.dataset.exportSanitized !== undefined) {
    download(`${state.project.project.title || "director-project"}-public-demo.json`, JSON.stringify(sanitizedProject(), null, 2));
  }

  if (target.dataset.copyBatchOutput !== undefined) {
    copy(document.querySelector("#batch-output").value);
  }

  if (target.dataset.previewReplace !== undefined) {
    const field = document.querySelector("#replace-field").value;
    const from = document.querySelector("#replace-from").value;
    document.querySelector("#replace-preview").value = previewReplace(field, from);
  }

  if (target.dataset.applyReplace !== undefined) {
    const field = document.querySelector("#replace-field").value;
    const from = document.querySelector("#replace-from").value;
    const to = document.querySelector("#replace-to").value;
    if (!from) return showToast("请填写查找内容");
    selectedSegments().forEach((item) => {
      item[field] = replaceInValue(item[field], from, to);
    });
    markDirty();
    render();
  }

  if (target.dataset.previewPatch !== undefined) {
    try {
      const patch = JSON.parse(document.querySelector("#patch-input").value);
      document.querySelector("#patch-preview").value = describePatch(patch);
    } catch (error) {
      document.querySelector("#patch-preview").value = `Patch 解析失败：${error.message}`;
    }
  }

  if (target.dataset.applyPatch !== undefined) {
    try {
      applyMergePatch(JSON.parse(document.querySelector("#patch-input").value));
      showToast("Patch 已应用");
    } catch (error) {
      showToast(`Patch 解析失败：${error.message}`);
    }
  }

  if (target.dataset.undoPatch !== undefined) {
    if (!state.undoSnapshot) return showToast("没有可撤销的上一次应用");
    loadProject(JSON.parse(state.undoSnapshot));
    state.undoSnapshot = null;
    saveProject();
    showToast("已撤销上一次应用");
  }

  if (target.dataset.saveSnapshot !== undefined) {
    saveSnapshot("手动快照");
    renderBatch();
    showToast("快照已保存");
  }

  if (target.dataset.restoreSnapshot !== undefined) {
    const id = document.querySelector("#history-select")?.value;
    if (!id) return showToast("没有可恢复的历史版本");
    restoreSnapshot(id);
  }

  if (target.dataset.clearHistory !== undefined) {
    localStorage.removeItem(HISTORY_KEY);
    renderBatch();
    showToast("历史已清空");
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
        body: JSON.stringify({
          instruction,
          project: compactProjectForAI(),
          segments: selectedSegments().map(compactSegment)
        })
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
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    loadProject(stored ? JSON.parse(stored) : seedProject());
    setActiveTab("story");
  } catch (error) {
    console.error(error);
    loadProject(seedProject());
    setActiveTab("story");
    showToast("本地项目读取失败，已载入示例");
  }
}

boot();
