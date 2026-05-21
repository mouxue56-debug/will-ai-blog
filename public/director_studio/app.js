const STORAGE_KEY = "director_studio_project_v2";
const LEGACY_STORAGE_KEY = "director_studio_project_v1";
const CONNECTOR_KEY = "director_studio_connector_v1";

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
    return { src: raw, notes: "", status: raw ? "draft" : "empty" };
  }
  return {
    src: raw?.src || "",
    notes: raw?.notes || "",
    status: raw?.status || (raw?.src ? "draft" : "empty")
  };
}

function normalizeReference(raw, index, type, fallback = {}) {
  const def = REF_DEFS[type];
  const id = String(raw?.id || fallback.id || `${def.prefix}_${String(index + 1).padStart(2, "0")}`);
  const primary = raw?.name || raw?.title || fallback.name || fallback.title || `${def.addLabel}${index + 1}`;
  return {
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
  state.selectedIds = new Set([...selectedBefore].map((id) => idMap.get(id)).filter(Boolean));
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
  setPath(seg, field, value);
  markDirty();
}

function updateReference(type, id, field, value) {
  const ref = state.project.project[type]?.find((item) => item.id === id);
  if (!ref) return;
  setPath(ref, field, value);
  if (field === "name") ref.title = value;
  if (field === "title") ref.name = value;
  if (field === "image.src") ref.image.status = value ? "draft" : "empty";
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
    <div class="segment-row ${seg.id === state.currentId ? "active" : ""}">
      <input type="checkbox" data-select-id="${seg.id}" ${state.selectedIds.has(seg.id) ? "checked" : ""} aria-label="选择第${seg.id}段">
      <button type="button" class="segment-open" data-open-id="${seg.id}">
        <span class="seg-title">${seg.id} ${esc(seg.title)}</span>
        <span class="seg-meta">${esc(seg.duration)} · ${esc(seg.location || String(seg.scenePlan || "").split("\n")[0] || "未设场景")}</span>
      </button>
      <div class="row-sort" aria-label="排序">
        <button type="button" data-row-move-id="${seg.id}" data-row-move="-1" title="上移">↑</button>
        <button type="button" data-row-move-id="${seg.id}" data-row-move="1" title="下移">↓</button>
      </div>
      <span class="seg-status status-${esc(seg.status || "draft")}">${esc(seg.status || "draft")}</span>
    </div>
  `).join("");

  els.segmentList.innerHTML = `
    <p class="rail-note">勾选用于批量导出；↑↓ 直接调整段落顺序；点标题进入本段镜头包。</p>
    ${rows}
  `;
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
            ${["draft", "needs-review", "needs-image", "approved", "ready"].map((s) => `<option value="${s}" ${seg.status === s ? "selected" : ""}>${s}</option>`).join("")}
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
  els.batch.innerHTML = `
    <section class="section">
      <div class="section-header">
        <div>
          <h2>批量导出给员工 / AI</h2>
          <p class="section-kicker">勾选左侧段落后，这里会导出任务包；不会自动调用 AI 或视频平台。</p>
        </div>
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
        <button type="button" data-apply-replace>应用到选中段</button>
      </div>
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
        <button type="button" data-apply-patch class="primary">应用 Patch</button>
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
    "",
    `时长：${seg.duration}`,
    `导演意图：${seg.goal}`,
    `场景与承接：${seg.scenePlan || [seg.location, seg.startBridge ? `开头：${seg.startBridge}` : "", seg.endBridge ? `结尾：${seg.endBridge}` : ""].filter(Boolean).join(" / ")}`,
    "",
    "## 本段参考",
    segmentReferenceText(seg),
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

function generateAiPackage(segments) {
  return [
    "你是 AI 短剧导演与中文短剧编剧。请基于下面 JSON 修改项目。",
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
  moveSegmentById(state.currentId, delta);
}

function moveSegmentById(id, delta) {
  const index = state.project.segments.findIndex((seg) => seg.id === id);
  const next = index + delta;
  if (index < 0 || next < 0 || next >= state.project.segments.length) return;
  const [seg] = state.project.segments.splice(index, 1);
  state.project.segments.splice(next, 0, seg);
  state.currentId = seg.id;
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
  const current = state.currentId;
  state.project = normalizeProject(state.project);
  if (state.project.segments.some((seg) => seg.id === current)) state.currentId = current;
  else state.currentId = state.project.segments[0]?.id || "";
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
    updateSegmentField(seg.id, segField, target.value);
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
    const seg = state.project.segments.find((item) => item.id === target.dataset.imageUpload);
    if (!seg) return;
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

  if (target.dataset.refUpload && target.dataset.refId && target.files?.[0]) {
    const ref = state.project.project[target.dataset.refUpload]?.find((item) => item.id === target.dataset.refId);
    if (!ref) return;
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      ref.image.src = String(reader.result);
      ref.image.status = "draft";
      markDirty();
      render();
    };
    reader.readAsDataURL(file);
  }
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
      item[field] = replaceInValue(item[field], from, to);
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
