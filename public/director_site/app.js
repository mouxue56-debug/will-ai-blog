const data = window.EDEN_PLAN;
const segmentsEl = document.querySelector("#segments");
const searchEl = document.querySelector("#search");
const jumpEl = document.querySelector("#jump");
const copyAllEl = document.querySelector("#copy-all");

document.querySelector("#subtitle").textContent = data.subtitle;
document.querySelector("#style").textContent = `${data.characterLock} ${data.visualStyle}`;
document.querySelector("#rules").innerHTML = data.productionRules
  .map((rule) => `<div class="rule">${escapeHtml(rule)}</div>`)
  .join("");

jumpEl.innerHTML = data.segments
  .map((seg) => `<option value="${seg.id}">${seg.id} ${escapeHtml(seg.title)}</option>`)
  .join("");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function promptPackage(seg) {
  return [
    `# ${seg.id} ${seg.title}`,
    "",
    "## 模板图提示词",
    seg.templatePrompt,
    "",
    "## 视频生成提示词",
    seg.videoPrompt
  ].join("\n");
}

function renderSegments(filter = "") {
  const needle = filter.trim().toLowerCase();
  const matches = data.segments.filter((seg) => {
    if (!needle) return true;
    return JSON.stringify(seg).toLowerCase().includes(needle);
  });

  segmentsEl.innerHTML = matches.map((seg) => {
    const panels = seg.panels.map((panel) => `<div class="panel">${escapeHtml(panel)}</div>`).join("");
    const dialogue = seg.dialogue.map((line) => `<p class="info">${escapeHtml(line)}</p>`).join("");
    const imagePath = `../assets/templates/seg_${seg.id}_storyboard_image2_v1.png`;
    return `
      <article class="segment" id="seg-${seg.id}">
        <div class="segment-header">
          <div class="badge">${seg.id}</div>
          <div>
            <h3>${escapeHtml(seg.title)}</h3>
            <div class="meta">${escapeHtml(seg.location)} · ${escapeHtml(seg.goal)}</div>
          </div>
          <div class="duration">${escapeHtml(seg.duration)}</div>
        </div>
        <div class="segment-body">
          <div class="block">
            <h4>分镜模板图</h4>
            <img class="storyboard-image" src="${imagePath}" alt="第${seg.id}段分镜模板图">
            <h4>首尾衔接</h4>
            <div class="bridges">
              <div class="bridge">起：${escapeHtml(seg.startBridge)}</div>
              <div class="bridge">收：${escapeHtml(seg.endBridge)}</div>
            </div>
            <h4>六格连续分镜</h4>
            <div class="panels">${panels}</div>
            <h4>声音内容</h4>
            <p class="info"><strong>旁白：</strong>${escapeHtml(seg.narration)}</p>
            ${dialogue}
          </div>
          <div class="block">
            <h4>模板图提示词</h4>
            <textarea readonly id="tpl-${seg.id}">${seg.templatePrompt}</textarea>
            <div class="prompt-actions">
              <button type="button" data-copy="tpl-${seg.id}">复制模板图提示词</button>
            </div>
            <h4>视频生成提示词</h4>
            <textarea readonly id="vid-${seg.id}">${seg.videoPrompt}</textarea>
            <div class="prompt-actions">
              <button type="button" data-copy="vid-${seg.id}">复制视频提示词</button>
              <button type="button" class="secondary" data-copy-package="${seg.id}">复制本段完整包</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const copyId = target.dataset.copy;
  if (copyId) {
    await copyText(document.querySelector(`#${copyId}`).value);
    target.textContent = "已复制";
    setTimeout(() => target.textContent = copyId.startsWith("tpl") ? "复制模板图提示词" : "复制视频提示词", 900);
  }

  const packageId = target.dataset.copyPackage;
  if (packageId) {
    const seg = data.segments.find((item) => item.id === packageId);
    await copyText(promptPackage(seg));
    target.textContent = "已复制";
    setTimeout(() => target.textContent = "复制本段完整包", 900);
  }
});

searchEl.addEventListener("input", () => renderSegments(searchEl.value));
jumpEl.addEventListener("change", () => {
  document.querySelector(`#seg-${jumpEl.value}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
});
copyAllEl.addEventListener("click", async () => {
  const all = data.segments.map((seg) => `# ${seg.id} ${seg.title}\n${seg.videoPrompt}`).join("\n\n---\n\n");
  await copyText(all);
  copyAllEl.textContent = "已复制18段";
  setTimeout(() => copyAllEl.textContent = "复制18段视频提示词", 1000);
});

renderSegments();
