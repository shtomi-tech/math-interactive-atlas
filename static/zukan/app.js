import { CONTENTS, INTERACTION_LABELS, contentsForSubject, getContent } from "./data.js";

const STORAGE_KEY = "math-zukan-state-v1";
const SVG_NS = "http://www.w3.org/2000/svg";
const state = {
  subject: "math1",
  activeId: CONTENTS[0].id,
  progress: loadProgress()
};

const dom = {
  catalog: document.querySelector("#catalog"),
  catalogCount: document.querySelector("#catalogCount"),
  progressSummary: document.querySelector("#progressSummary"),
  saveStatus: document.querySelector("#saveStatus"),
  favoriteButton: document.querySelector("#favoriteButton"),
  viewer: document.querySelector("#viewer"),
  breadcrumb: document.querySelector("#breadcrumb"),
  viewerTitle: document.querySelector("#viewerTitle"),
  viewerDescription: document.querySelector("#viewerDescription"),
  difficultyBadge: document.querySelector("#difficultyBadge"),
  formulaBox: document.querySelector("#formulaBox"),
  viewerFormula: document.querySelector("#viewerFormula"),
  interactionKind: document.querySelector("#interactionKind"),
  interactionHost: document.querySelector("#interactionHost"),
  discoveryList: document.querySelector("#discoveryList"),
  relatedList: document.querySelector("#relatedList"),
  sourceDetails: document.querySelector("#sourceDetails")
};

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function progressFor(id) {
  const saved = state.progress[id];
  return {
    visited: Boolean(saved?.visited),
    favorite: Boolean(saved?.favorite),
    discovered: Array.isArray(saved?.discovered) ? saved.discovered : []
  };
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
    dom.saveStatus.textContent = "この端末に保存済み";
  } catch {
    dom.saveStatus.textContent = "保存できません";
  }
}

function markVisited(content) {
  const saved = progressFor(content.id);
  state.progress[content.id] = { ...saved, visited: true };
  saveProgress();
}

function updateProgressSummary() {
  const visited = CONTENTS.filter((content) => progressFor(content.id).visited).length;
  dom.progressSummary.textContent = `${visited} / ${CONTENTS.length} 教材を見た`;
}

function setActiveSubject(subject) {
  state.subject = subject;
  const visible = contentsForSubject(subject);
  if (!visible.some((content) => content.id === state.activeId)) {
    state.activeId = visible[0].id;
  }
  document.querySelectorAll(".subject-tab").forEach((tab) => {
    const selected = tab.dataset.subject === subject;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
  renderCatalog();
  renderViewer();
}

function selectContent(id) {
  const content = getContent(id);
  state.activeId = content.id;
  state.subject = content.subject;
  document.querySelectorAll(".subject-tab").forEach((tab) => {
    const selected = tab.dataset.subject === state.subject;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
  markVisited(content);
  renderCatalog();
  renderViewer();
  dom.viewer.focus({ preventScroll: true });
  window.scrollTo({ top: dom.viewer.getBoundingClientRect().top + window.scrollY - 18, behavior: "smooth" });
}

function renderCatalog() {
  const visible = contentsForSubject(state.subject);
  dom.catalogCount.textContent = String(visible.length);
  dom.catalog.replaceChildren();
  const grouped = new Map();
  visible.forEach((content) => {
    if (!grouped.has(content.unit)) grouped.set(content.unit, []);
    grouped.get(content.unit).push(content);
  });

  grouped.forEach((items, unit) => {
    const unitGroup = document.createElement("section");
    unitGroup.className = "unit-group";
    const unitTitle = document.createElement("h3");
    unitTitle.textContent = unit;
    unitGroup.append(unitTitle);
    const list = document.createElement("div");
    list.className = "catalog-items";
    items.forEach((content) => {
      const saved = progressFor(content.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "catalog-item";
      if (content.id === state.activeId) button.classList.add("is-active");
      button.setAttribute("aria-current", content.id === state.activeId ? "page" : "false");
      button.dataset.contentId = content.id;

      const itemTop = document.createElement("span");
      itemTop.className = "catalog-item-top";
      const title = document.createElement("strong");
      title.textContent = content.title;
      const mark = document.createElement("span");
      mark.className = saved.visited ? "visited-mark is-visited" : "visited-mark";
      mark.textContent = saved.visited ? "見た" : "未読";
      itemTop.append(title, mark);
      const meta = document.createElement("span");
      meta.className = "catalog-item-meta";
      meta.textContent = `${content.topic}　${INTERACTION_LABELS[content.interactionType]}`;
      button.append(itemTop, meta);
      button.addEventListener("click", () => selectContent(content.id));
      list.append(button);
    });
    unitGroup.append(list);
    dom.catalog.append(unitGroup);
  });
}

function renderViewer() {
  const content = getContent(state.activeId);
  const saved = progressFor(content.id);
  dom.breadcrumb.textContent = `${content.subject === "math1" ? "数学I" : "数学A"}　/　${content.unit}　/　${content.topic}`;
  dom.viewerTitle.textContent = content.title;
  dom.viewerDescription.textContent = content.shortDescription;
  dom.difficultyBadge.textContent = content.difficulty === "basic" ? "基礎" : "標準";
  dom.formulaBox.hidden = !content.formula;
  dom.viewerFormula.textContent = content.formula || "";
  dom.interactionKind.textContent = INTERACTION_LABELS[content.interactionType];
  dom.interactionHost.replaceChildren();
  renderInteraction(content, dom.interactionHost);
  renderDiscoveries(content, saved);
  renderRelated(content);
  renderSource(content);
  dom.favoriteButton.textContent = saved.favorite ? "★" : "☆";
  dom.favoriteButton.setAttribute("aria-pressed", String(saved.favorite));
  dom.favoriteButton.setAttribute("aria-label", saved.favorite ? "お気に入りから外す" : "この教材をお気に入りにする");
  updateProgressSummary();
}

function renderDiscoveries(content, saved) {
  dom.discoveryList.replaceChildren();
  content.discoveryPoints.forEach((point, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "discovery-item";
    const discovered = saved.discovered.includes(String(index));
    button.classList.toggle("is-discovered", discovered);
    button.setAttribute("aria-pressed", String(discovered));
    button.innerHTML = `<span class="discovery-check" aria-hidden="true">${discovered ? "✓" : "○"}</span><span>${point}</span>`;
    button.addEventListener("click", () => {
      const next = progressFor(content.id);
      const key = String(index);
      const discoveredSet = new Set(next.discovered);
      if (discoveredSet.has(key)) discoveredSet.delete(key);
      else discoveredSet.add(key);
      state.progress[content.id] = { ...next, discovered: [...discoveredSet] };
      saveProgress();
      renderDiscoveries(content, progressFor(content.id));
    });
    item.append(button);
    dom.discoveryList.append(item);
  });
}

function renderRelated(content) {
  dom.relatedList.replaceChildren();
  content.related.map(getContent).forEach((related) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "related-item";
    button.innerHTML = `<span>${related.unit}</span><strong>${related.title}</strong><b aria-hidden="true">→</b>`;
    button.addEventListener("click", () => selectContent(related.id));
    dom.relatedList.append(button);
  });
}

function renderSource(content) {
  const source = content.source;
  dom.sourceDetails.replaceChildren();
  const text = document.createElement("p");
  text.textContent = `教材データ：${source.usage}　／　ライセンス：${source.license}`;
  const link = document.createElement("a");
  link.href = source.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = source.repository;
  dom.sourceDetails.append(text, link);
}

function createInteractionFrame(host, instructions, reset) {
  const frame = document.createElement("div");
  frame.className = "interaction-frame";
  const stage = document.createElement("div");
  stage.className = "interaction-stage";
  const controls = document.createElement("div");
  controls.className = "interaction-controls";
  const footer = document.createElement("div");
  footer.className = "interaction-footer";
  const instruction = document.createElement("p");
  instruction.className = "interaction-instruction";
  instruction.innerHTML = `<span aria-hidden="true">●</span><span>${instructions}</span>`;
  const status = document.createElement("p");
  status.className = "interaction-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "reset-button";
  resetButton.textContent = "↻ リセット";
  resetButton.addEventListener("click", reset);
  footer.append(instruction, status, resetButton);
  frame.append(stage, controls, footer);
  host.append(frame);
  return { frame, stage, controls, status };
}

function addRangeControl(container, label, min, max, step, value, onInput, format = formatNumber) {
  const wrap = document.createElement("label");
  wrap.className = "range-control";
  const line = document.createElement("span");
  line.className = "range-label";
  const name = document.createElement("span");
  name.textContent = label;
  const output = document.createElement("output");
  output.textContent = format(value);
  line.append(name, output);
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.addEventListener("input", () => {
    output.textContent = format(Number(input.value));
    onInput(Number(input.value));
  });
  wrap.append(line, input);
  container.append(wrap);
  return input;
}

function addSelectControl(container, label, options, value, onChange) {
  const wrap = document.createElement("label");
  wrap.className = "select-control";
  const text = document.createElement("span");
  text.textContent = label;
  const select = document.createElement("select");
  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = String(option.value);
    item.textContent = option.label;
    item.selected = option.value === value;
    select.append(item);
  });
  select.addEventListener("change", () => onChange(select.value));
  wrap.append(text, select);
  container.append(wrap);
  return select;
}

function createSvg(width = 640, height = 360, label = "数学の図") {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "group");
  svg.setAttribute("aria-label", label);
  svg.classList.add("math-svg");
  return svg;
}

function svgEl(tag, attrs = {}, text = "") {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
  if (text) element.textContent = text;
  return element;
}

function clearSvg(svg) {
  while (svg.firstChild) svg.firstChild.remove();
}

function plotMapper(width = 640, height = 360, xMin = -8, xMax = 8, yMin = -8, yMax = 8) {
  const left = 54;
  const right = width - 20;
  const top = 24;
  const bottom = height - 38;
  return {
    x: (value) => left + (value - xMin) / (xMax - xMin) * (right - left),
    y: (value) => bottom - (value - yMin) / (yMax - yMin) * (bottom - top),
    invX: (value) => xMin + (value - left) / (right - left) * (xMax - xMin),
    left,
    right,
    top,
    bottom,
    xMin,
    xMax,
    yMin,
    yMax
  };
}

function drawPlotGrid(svg, mapper) {
  const group = svgEl("g", { class: "plot-grid" });
  for (let x = mapper.xMin; x <= mapper.xMax; x += 1) {
    group.append(svgEl("line", { x1: mapper.x(x), y1: mapper.top, x2: mapper.x(x), y2: mapper.bottom, class: x === 0 ? "axis" : "grid-line" }));
  }
  for (let y = mapper.yMin; y <= mapper.yMax; y += 1) {
    group.append(svgEl("line", { x1: mapper.left, y1: mapper.y(y), x2: mapper.right, y2: mapper.y(y), class: y === 0 ? "axis" : "grid-line" }));
  }
  group.append(svgEl("text", { x: mapper.right - 4, y: mapper.y(0) - 8, class: "axis-label", "text-anchor": "end" }, "x"));
  group.append(svgEl("text", { x: mapper.x(0) + 8, y: mapper.top + 10, class: "axis-label" }, "y"));
  svg.append(group);
}

function graphPath(mapper, fn) {
  let path = "";
  let started = false;
  for (let x = mapper.xMin; x <= mapper.xMax; x += 0.08) {
    const y = fn(x);
    if (!Number.isFinite(y) || y < mapper.yMin - 1 || y > mapper.yMax + 1) {
      started = false;
      continue;
    }
    path += `${started ? "L" : "M"}${mapper.x(x).toFixed(2)},${mapper.y(y).toFixed(2)} `;
    started = true;
  }
  return path;
}

function renderQuadraticVertex(content, host) {
  const frame = createInteractionFrame(host, content.instructions, () => {
    a = 1;
    p = 0;
    q = 0;
    controls.forEach((control) => { control.value = "0"; });
    controls[0].value = "1";
    controls.forEach((control) => control.dispatchEvent(new Event("input")));
  });
  const controls = [];
  let a = 1;
  let p = 0;
  let q = 0;
  controls.push(addRangeControl(frame.controls, "a", -3, 3, 0.5, a, (value) => { a = value; draw(); }));
  controls.push(addRangeControl(frame.controls, "p", -4, 4, 0.5, p, (value) => { p = value; draw(); }));
  controls.push(addRangeControl(frame.controls, "q", -4, 4, 0.5, q, (value) => { q = value; draw(); }));
  const svg = createSvg(640, 360, "頂点を動かす放物線");
  frame.stage.append(svg);
  const mapper = plotMapper();
  function draw() {
    clearSvg(svg);
    drawPlotGrid(svg, mapper);
    svg.append(svgEl("path", { d: graphPath(mapper, (x) => a * (x - p) ** 2 + q), class: "curve-primary" }));
    svg.append(svgEl("line", { x1: mapper.x(p), y1: mapper.top, x2: mapper.x(p), y2: mapper.bottom, class: "guide-line" }));
    svg.append(svgEl("circle", { cx: mapper.x(p), cy: mapper.y(q), r: 7, class: "point-primary" }));
    svg.append(svgEl("text", { x: mapper.x(p) + 10, y: mapper.y(q) - 12, class: "point-label" }, `(${formatNumber(p)}, ${formatNumber(q)})`));
    frame.status.textContent = `頂点 (${formatNumber(p)}, ${formatNumber(q)})　軸 x = ${formatNumber(p)}　a = ${formatNumber(a)}`;
  }
  draw();
}

function renderQuadraticDiscriminant(content, host) {
  let b = 0;
  let c = -2;
  const frame = createInteractionFrame(host, content.instructions, () => {
    b = 0;
    c = -2;
    controls[0].value = "0";
    controls[1].value = "-2";
    controls.forEach((control) => control.dispatchEvent(new Event("input")));
  });
  const controls = [];
  controls.push(addRangeControl(frame.controls, "b", -8, 8, 1, b, (value) => { b = value; draw(); }));
  controls.push(addRangeControl(frame.controls, "c", -8, 8, 1, c, (value) => { c = value; draw(); }));
  const svg = createSvg(640, 360, "判別式と放物線の交点");
  frame.stage.append(svg);
  const mapper = plotMapper();
  function draw() {
    clearSvg(svg);
    drawPlotGrid(svg, mapper);
    const discriminant = b * b - 4 * c;
    const roots = discriminant > 0 ? [(-b - Math.sqrt(discriminant)) / 2, (-b + Math.sqrt(discriminant)) / 2] : discriminant === 0 ? [-b / 2] : [];
    svg.append(svgEl("path", { d: graphPath(mapper, (x) => x * x + b * x + c), class: "curve-primary" }));
    roots.filter((root) => root >= mapper.xMin && root <= mapper.xMax).forEach((root) => {
      svg.append(svgEl("circle", { cx: mapper.x(root), cy: mapper.y(0), r: 7, class: "point-accent" }));
    });
    const count = discriminant > 0 ? 2 : discriminant === 0 ? 1 : 0;
    frame.status.textContent = `D = ${formatNumber(discriminant)}　／　x軸との交点 ${count}個　（a = 1）`;
  }
  draw();
}

function renderQuadraticRange(content, host) {
  let leftValue = -2;
  let rightValue = 3;
  const frame = createInteractionFrame(host, content.instructions, () => {
    leftValue = -2;
    rightValue = 3;
    draw();
  });
  const svg = createSvg(640, 360, "定義域と二次関数の最大最小");
  frame.stage.append(svg);
  const mapper = plotMapper();
  let dragging = null;
  function svgX(event) {
    const rect = svg.getBoundingClientRect();
    return mapper.invX((event.clientX - rect.left) / rect.width * 640);
  }
  function updateFromPointer(event, handle) {
    let value = clamp(svgX(event), -6, 6);
    if (handle === "left") leftValue = Math.min(value, rightValue - 0.5);
    else rightValue = Math.max(value, leftValue + 0.5);
    draw();
  }
  function bindHandle(handle) {
    const circle = svgEl("circle", {
      cx: mapper.x(handle === "left" ? leftValue : rightValue),
      cy: mapper.y((handle === "left" ? leftValue : rightValue - 1) ** 2 + 1),
      r: 10,
      class: "drag-handle",
      tabindex: 0,
      role: "slider",
      "aria-label": handle === "left" ? "定義域の左端 l" : "定義域の右端 r",
      "aria-valuemin": -6,
      "aria-valuemax": 6,
      "aria-valuenow": handle === "left" ? leftValue : rightValue
    });
    circle.addEventListener("pointerdown", (event) => {
      dragging = handle;
      circle.setPointerCapture(event.pointerId);
    });
    circle.addEventListener("pointermove", (event) => {
      if (dragging === handle) updateFromPointer(event, handle);
    });
    circle.addEventListener("pointerup", () => { dragging = null; });
    circle.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      updateFromKeyboard(handle, event.key === "ArrowRight" ? 0.5 : -0.5);
    });
    svg.append(circle);
  }
  function updateFromKeyboard(handle, delta) {
    if (handle === "left") leftValue = Math.min(6, Math.min(leftValue + delta, rightValue - 0.5));
    else rightValue = Math.max(-6, Math.max(rightValue + delta, leftValue + 0.5));
    draw();
  }
  function draw() {
    clearSvg(svg);
    drawPlotGrid(svg, mapper);
    svg.append(svgEl("rect", { x: mapper.x(leftValue), y: mapper.top, width: mapper.x(rightValue) - mapper.x(leftValue), height: mapper.bottom - mapper.top, class: "domain-band" }));
    svg.append(svgEl("path", { d: graphPath(mapper, (x) => (x - 1) ** 2 + 1), class: "curve-primary" }));
    svg.append(svgEl("line", { x1: mapper.x(1), y1: mapper.y(1), x2: mapper.x(1), y2: mapper.bottom, class: "guide-line" }));
    bindHandle("left");
    bindHandle("right");
    svg.append(svgEl("text", { x: mapper.x(leftValue), y: mapper.bottom + 25, class: "point-label", "text-anchor": "middle" }, `l=${formatNumber(leftValue)}`));
    svg.append(svgEl("text", { x: mapper.x(rightValue), y: mapper.bottom + 25, class: "point-label", "text-anchor": "middle" }, `r=${formatNumber(rightValue)}`));
    const samples = [leftValue, rightValue];
    if (leftValue <= 1 && rightValue >= 1) samples.push(1);
    const values = samples.map((x) => (x - 1) ** 2 + 1);
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    frame.status.textContent = `定義域 [${formatNumber(leftValue)}, ${formatNumber(rightValue)}]　／　最小値 ${formatNumber(minimum)}　最大値 ${formatNumber(maximum)}`;
  }
  draw();
}

function renderUnitCircle(content, host) {
  let angle = Math.PI / 4;
  const frame = createInteractionFrame(host, content.instructions, () => { angle = Math.PI / 4; draw(); });
  const svg = createSvg(640, 360, "単位円上の点とsin cos");
  frame.stage.append(svg);
  const cx = 260;
  const cy = 174;
  const radius = 122;
  let dragging = false;
  function getPoint(event) {
    const rect = svg.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * 640 / rect.width, y: (event.clientY - rect.top) * 360 / rect.height };
  }
  function setAngle(event) {
    const point = getPoint(event);
    angle = Math.atan2(cy - point.y, point.x - cx);
    if (angle < 0) angle += Math.PI * 2;
    draw();
  }
  function draw() {
    clearSvg(svg);
    svg.append(svgEl("line", { x1: cx - radius - 24, y1: cy, x2: cx + radius + 24, y2: cy, class: "axis" }));
    svg.append(svgEl("line", { x1: cx, y1: cy - radius - 24, x2: cx, y2: cy + radius + 24, class: "axis" }));
    svg.append(svgEl("circle", { cx, cy, r: radius, class: "circle-outline" }));
    const point = { x: cx + radius * Math.cos(angle), y: cy - radius * Math.sin(angle) };
    svg.append(svgEl("line", { x1: cx, y1: cy, x2: point.x, y2: point.y, class: "radius-line" }));
    svg.append(svgEl("line", { x1: point.x, y1: point.y, x2: point.x, y2: cy, class: "projection-line" }));
    svg.append(svgEl("line", { x1: point.x, y1: point.y, x2: cx, y2: point.y, class: "projection-line" }));
    const handle = svgEl("circle", { cx: point.x, cy: point.y, r: 11, class: "drag-handle", tabindex: 0, role: "slider", "aria-label": "単位円上の角度", "aria-valuemin": 0, "aria-valuemax": 360, "aria-valuenow": Math.round(angle * 180 / Math.PI) });
    handle.addEventListener("pointerdown", (event) => { dragging = true; handle.setPointerCapture(event.pointerId); });
    handle.addEventListener("pointermove", (event) => { if (dragging) setAngle(event); });
    handle.addEventListener("pointerup", () => { dragging = false; });
    handle.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      angle += event.key === "ArrowRight" ? Math.PI / 36 : -Math.PI / 36;
      draw();
    });
    svg.append(handle);
    svg.append(svgEl("text", { x: point.x + 14, y: point.y - 12, class: "point-label" }, `(${formatDecimal(Math.cos(angle))}, ${formatDecimal(Math.sin(angle))})`));
    svg.append(svgEl("text", { x: cx + 12, y: cy + radius + 25, class: "axis-label" }, "cos θ"));
    svg.append(svgEl("text", { x: cx + radius + 8, y: cy - 8, class: "axis-label" }, "sin θ"));
    frame.status.textContent = `θ = ${Math.round(angle * 180 / Math.PI)}°　／　cos θ = ${formatDecimal(Math.cos(angle))}　／　sin θ = ${formatDecimal(Math.sin(angle))}`;
  }
  draw();
}

function renderTriangleArea(content, host) {
  let point = { x: 325, y: 80 };
  const frame = createInteractionFrame(host, content.instructions, () => { point = { x: 325, y: 80 }; draw(); });
  const svg = createSvg(640, 360, "三角形の面積とsin");
  frame.stage.append(svg);
  const A = { x: 100, y: 278 };
  const B = { x: 540, y: 278 };
  let dragging = false;
  function getPoint(event) {
    const rect = svg.getBoundingClientRect();
    return { x: clamp((event.clientX - rect.left) * 640 / rect.width, 110, 530), y: clamp((event.clientY - rect.top) * 360 / rect.height, 52, 270) };
  }
  function draw() {
    clearSvg(svg);
    const base = B.x - A.x;
    const side = Math.hypot(point.x - A.x, point.y - A.y);
    const angle = Math.atan2(Math.abs(A.y - point.y), point.x - A.x);
    const height = Math.abs(A.y - point.y);
    const area = base * height / 2;
    svg.append(svgEl("polygon", { points: `${A.x},${A.y} ${B.x},${B.y} ${point.x},${point.y}`, class: "triangle-fill" }));
    svg.append(svgEl("line", { x1: A.x, y1: A.y, x2: B.x, y2: B.y, class: "geometry-line" }));
    svg.append(svgEl("line", { x1: point.x, y1: point.y, x2: point.x, y2: A.y, class: "guide-line" }));
    svg.append(svgEl("line", { x1: A.x, y1: A.y, x2: point.x, y2: point.y, class: "geometry-line" }));
    svg.append(svgEl("line", { x1: point.x, y1: point.y, x2: B.x, y2: B.y, class: "geometry-line" }));
    svg.append(svgEl("text", { x: (A.x + B.x) / 2, y: B.y + 26, class: "point-label", "text-anchor": "middle" }, `底辺 ${formatNumber(base / 100)}`));
    svg.append(svgEl("text", { x: point.x + 10, y: (point.y + A.y) / 2, class: "point-label" }, `高さ ${formatNumber(height / 100)}`));
    const handle = svgEl("circle", { cx: point.x, cy: point.y, r: 11, class: "drag-handle", tabindex: 0, role: "slider", "aria-label": "三角形の頂点C" });
    handle.addEventListener("pointerdown", (event) => { dragging = true; handle.setPointerCapture(event.pointerId); });
    handle.addEventListener("pointermove", (event) => { if (dragging) { point = getPoint(event); draw(); } });
    handle.addEventListener("pointerup", () => { dragging = false; });
    handle.addEventListener("keydown", (event) => {
      const delta = event.shiftKey ? 10 : 4;
      if (event.key === "ArrowLeft") point.x = clamp(point.x - delta, 110, 530);
      else if (event.key === "ArrowRight") point.x = clamp(point.x + delta, 110, 530);
      else if (event.key === "ArrowUp") point.y = clamp(point.y - delta, 52, 270);
      else if (event.key === "ArrowDown") point.y = clamp(point.y + delta, 52, 270);
      else return;
      event.preventDefault();
      draw();
    });
    svg.append(handle);
    svg.append(svgEl("text", { x: A.x - 18, y: A.y + 5, class: "point-label" }, "A"));
    svg.append(svgEl("text", { x: B.x + 8, y: B.y + 5, class: "point-label" }, "B"));
    svg.append(svgEl("text", { x: point.x + 8, y: point.y - 8, class: "point-label" }, "C"));
    frame.status.textContent = `面積 = ${formatNumber(area / 10000)}　／　∠A = ${Math.round(angle * 180 / Math.PI)}°　／　sin A = ${formatDecimal(Math.sin(angle))}　（½ab sin A = ${formatNumber(0.5 * (base / 100) * (side / 100) * Math.sin(angle))}）`;
  }
  draw();
}

function renderSetRegions(content, host) {
  const selected = new Set(["overlap"]);
  const frame = createInteractionFrame(host, content.instructions, () => { selected.clear(); selected.add("overlap"); draw(); });
  const regionGrid = document.createElement("div");
  regionGrid.className = "region-grid";
  frame.stage.append(regionGrid);
  const regions = [
    ["a-only", "Aだけ", "A ∩ Bᶜ"],
    ["overlap", "AとBの共通部分", "A ∩ B"],
    ["b-only", "Bだけ", "Aᶜ ∩ B"],
    ["outside", "どちらにも入らない", "Aᶜ ∩ Bᶜ"]
  ];
  function draw() {
    regionGrid.replaceChildren();
    regions.forEach(([id, label, formula]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `region-cell region-${id}`;
      const active = selected.has(id);
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
      button.innerHTML = `<span class="region-symbol" aria-hidden="true">${id === "overlap" ? "A∩B" : id === "outside" ? "外側" : id === "a-only" ? "A" : "B"}</span><strong>${label}</strong><small>${formula}</small>`;
      button.addEventListener("click", () => {
        if (selected.has(id)) selected.delete(id);
        else selected.add(id);
        draw();
      });
      regionGrid.append(button);
    });
    const formula = selectedFormula(selected);
    frame.status.textContent = `選択中：${formula}`;
  }
  draw();
}

function selectedFormula(selected) {
  const key = [...selected].sort().join(",");
  const formulas = {
    "overlap": "A ∩ B",
    "a-only,overlap": "A",
    "b-only,overlap": "B",
    "a-only,b-only,overlap": "A ∪ B",
    "b-only,outside": "Aᶜ",
    "a-only,b-only,overlap,outside": "全体"
  };
  return formulas[key] || ([...selected].map((id) => ({ "a-only": "A ∩ Bᶜ", overlap: "A ∩ B", "b-only": "Aᶜ ∩ B", outside: "Aᶜ ∩ Bᶜ" }[id])).join("　∪　") || "まだ領域を選んでいません");
}

function renderPermutationCards(content, host) {
  let count = 3;
  const frame = createInteractionFrame(host, content.instructions, () => { count = 3; select.value = "3"; draw(); });
  const select = addSelectControl(frame.controls, "カードの枚数", [
    { value: 3, label: "3枚（ABC）" },
    { value: 4, label: "4枚（ABCD）" }
  ], count, (value) => { count = Number(value); draw(); });
  const list = document.createElement("div");
  list.className = "permutation-list";
  frame.stage.append(list);
  function draw() {
    const cards = Array.from({ length: count }, (_, index) => String.fromCharCode(65 + index));
    const permutations = permute(cards);
    list.replaceChildren();
    const summary = document.createElement("p");
    summary.className = "card-count";
    summary.innerHTML = `<strong>${permutations.length}通り</strong>　${count}! = ${cards.join(" × ")} の並べ方`;
    list.append(summary);
    const grid = document.createElement("div");
    grid.className = "permutation-grid";
    permutations.forEach((permutation, index) => {
      const item = document.createElement("div");
      item.className = "permutation-card";
      item.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><strong>${permutation.join("　")}</strong>`;
      grid.append(item);
    });
    list.append(grid);
    frame.status.textContent = `${count}枚のカードは ${permutations.length} 通りに並ぶ`;
  }
  draw();
}

function permute(items) {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) => permute([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [item, ...rest]));
}

function renderConditionalProbability(content, host) {
  let condition = "all";
  const outcomes = ["AB", "AB", "AB", "nAB", "nAB", "nAB", "nAB", "AnB", "AnB", "AnB", "AnB", "nAnB"];
  const frame = createInteractionFrame(host, content.instructions, () => { condition = "all"; updateButtons(); draw(); });
  const buttons = document.createElement("div");
  buttons.className = "choice-controls";
  const allButton = makeChoiceButton("全体を見る", "all", () => { condition = "all"; updateButtons(); draw(); });
  const bButton = makeChoiceButton("Bだけに絞る", "b", () => { condition = "b"; updateButtons(); draw(); });
  buttons.append(allButton, bButton);
  frame.stage.append(buttons);
  const outcomeGrid = document.createElement("div");
  outcomeGrid.className = "outcome-grid";
  frame.stage.append(outcomeGrid);
  function updateButtons() {
    allButton.classList.toggle("is-selected", condition === "all");
    bButton.classList.toggle("is-selected", condition === "b");
    allButton.setAttribute("aria-pressed", String(condition === "all"));
    bButton.setAttribute("aria-pressed", String(condition === "b"));
  }
  function draw() {
    outcomeGrid.replaceChildren();
    outcomes.forEach((type, index) => {
      const card = document.createElement("div");
      const isB = type === "AB" || type === "nAB";
      const isA = type === "AB" || type === "AnB";
      card.className = "outcome-dot";
      card.classList.toggle("is-in-condition", condition === "b" && isB);
      card.classList.toggle("is-a", isA);
      card.setAttribute("aria-label", `${index + 1}番目：${typeLabel(type)}`);
      card.textContent = isA ? "A" : "—";
      outcomeGrid.append(card);
    });
    const denominator = condition === "b" ? outcomes.filter((type) => type === "AB" || type === "nAB").length : outcomes.length;
    const numerator = condition === "b" ? outcomes.filter((type) => type === "AB").length : outcomes.filter((type) => type === "AB").length;
    const probability = numerator / denominator;
    frame.status.textContent = condition === "b" ? `Bの世界：${denominator}個　そのうちA∩B：${numerator}個　／　P(A｜B) = ${numerator}/${denominator} = ${formatDecimal(probability)}` : `全体：${denominator}個　A∩B：${numerator}個　／　P(A) = ${numerator}/${denominator} = ${formatDecimal(probability)}`;
  }
  updateButtons();
  draw();
}

function typeLabel(type) {
  return ({ AB: "AかつB", nAB: "AでなくB", AnB: "AかつBでない", nAnB: "AでもBでもない" })[type];
}

function makeChoiceButton(label, value, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-button";
  button.textContent = label;
  button.dataset.value = value;
  button.addEventListener("click", onClick);
  return button;
}

function renderMeanMedian(content, host) {
  let values = [2, 4, 5, 6, 8];
  const frame = createInteractionFrame(host, content.instructions, () => { values = [2, 4, 5, 6, 8]; draw(); });
  const svg = createSvg(640, 300, "平均と中央値のデータ点");
  frame.stage.append(svg);
  const left = 70;
  const right = 590;
  const mapX = (value) => left + value / 30 * (right - left);
  const invX = (value) => clamp((value - left) / (right - left) * 30, 0, 30);
  let draggingIndex = null;
  function getX(event) {
    const rect = svg.getBoundingClientRect();
    return (event.clientX - rect.left) * 640 / rect.width;
  }
  function draw() {
    clearSvg(svg);
    svg.append(svgEl("line", { x1: left, y1: 150, x2: right, y2: 150, class: "data-axis" }));
    for (let value = 0; value <= 30; value += 5) {
      svg.append(svgEl("line", { x1: mapX(value), y1: 143, x2: mapX(value), y2: 157, class: "data-tick" }));
      svg.append(svgEl("text", { x: mapX(value), y: 182, class: "axis-label", "text-anchor": "middle" }, String(value)));
    }
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    svg.append(svgEl("line", { x1: mapX(mean), y1: 44, x2: mapX(mean), y2: 238, class: "mean-line" }));
    svg.append(svgEl("line", { x1: mapX(median), y1: 66, x2: mapX(median), y2: 238, class: "median-line" }));
    svg.append(svgEl("text", { x: mapX(mean), y: 32, class: "point-label", "text-anchor": "middle" }, `平均 ${formatDecimal(mean)}`));
    svg.append(svgEl("text", { x: mapX(median), y: 258, class: "point-label", "text-anchor": "middle" }, `中央値 ${formatNumber(median)}`));
    values.forEach((value, index) => {
      const handle = svgEl("circle", { cx: mapX(value), cy: 150 - (index % 2) * 28, r: 12, class: "data-point", tabindex: 0, role: "slider", "aria-label": `${index + 1}番目のデータ`, "aria-valuemin": 0, "aria-valuemax": 30, "aria-valuenow": value });
      handle.addEventListener("pointerdown", (event) => { draggingIndex = index; handle.setPointerCapture(event.pointerId); });
      handle.addEventListener("pointermove", (event) => { if (draggingIndex === index) { values[index] = Math.round(invX(getX(event))); draw(); } });
      handle.addEventListener("pointerup", () => { draggingIndex = null; });
      handle.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        values[index] = clamp(values[index] + (event.key === "ArrowRight" ? 1 : -1), 0, 30);
        draw();
      });
      svg.append(handle);
      svg.append(svgEl("text", { x: mapX(value), y: 225 - (index % 2) * 28, class: "data-label", "text-anchor": "middle" }, formatNumber(value)));
    });
    frame.status.textContent = `平均 ${formatDecimal(mean)}　／　中央値 ${formatNumber(median)}　／　データ：${values.map(formatNumber).join("・")}`;
  }
  draw();
}

function renderTriangleCenters(content, host) {
  let C = { x: 322, y: 65 };
  const frame = createInteractionFrame(host, content.instructions, () => { C = { x: 322, y: 65 }; draw(); });
  const svg = createSvg(640, 360, "三角形の五心");
  frame.stage.append(svg);
  const A = { x: 115, y: 275 };
  const B = { x: 525, y: 275 };
  let dragging = false;
  function getPoint(event) {
    const rect = svg.getBoundingClientRect();
    return { x: clamp((event.clientX - rect.left) * 640 / rect.width, 150, 490), y: clamp((event.clientY - rect.top) * 360 / rect.height, 45, 260) };
  }
  function draw() {
    clearSvg(svg);
    const centers = triangleCenters(A, B, C);
    svg.append(svgEl("polygon", { points: `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`, class: "triangle-fill" }));
    svg.append(svgEl("line", { x1: A.x, y1: A.y, x2: B.x, y2: B.y, class: "geometry-line" }));
    svg.append(svgEl("line", { x1: B.x, y1: B.y, x2: C.x, y2: C.y, class: "geometry-line" }));
    svg.append(svgEl("line", { x1: C.x, y1: C.y, x2: A.x, y2: A.y, class: "geometry-line" }));
    svg.append(svgEl("line", { x1: centers.G.x, y1: centers.G.y, x2: centers.O.x, y2: centers.O.y, class: "euler-line" }));
    svg.append(svgEl("circle", { cx: centers.O.x, cy: centers.O.y, r: Math.max(4, Math.hypot(centers.O.x - A.x, centers.O.y - A.y)), class: "circumcircle" }));
    const labels = [["G", centers.G, "center-g"], ["O", centers.O, "center-o"], ["H", centers.H, "center-h"], ["I", centers.I, "center-i"], ["N", centers.N, "center-n"]];
    labels.forEach(([label, point, className]) => {
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
      svg.append(svgEl("circle", { cx: point.x, cy: point.y, r: 7, class: `center-point ${className}` }));
      svg.append(svgEl("text", { x: point.x + 9, y: point.y - 9, class: "center-label" }, label));
    });
    const handle = svgEl("circle", { cx: C.x, cy: C.y, r: 11, class: "drag-handle", tabindex: 0, role: "slider", "aria-label": "三角形の頂点C" });
    handle.addEventListener("pointerdown", (event) => { dragging = true; handle.setPointerCapture(event.pointerId); });
    handle.addEventListener("pointermove", (event) => { if (dragging) { C = getPoint(event); draw(); } });
    handle.addEventListener("pointerup", () => { dragging = false; });
    handle.addEventListener("keydown", (event) => {
      const delta = event.shiftKey ? 10 : 4;
      if (event.key === "ArrowLeft") C.x = clamp(C.x - delta, 150, 490);
      else if (event.key === "ArrowRight") C.x = clamp(C.x + delta, 150, 490);
      else if (event.key === "ArrowUp") C.y = clamp(C.y - delta, 45, 260);
      else if (event.key === "ArrowDown") C.y = clamp(C.y + delta, 45, 260);
      else return;
      event.preventDefault();
      draw();
    });
    svg.append(handle);
    svg.append(svgEl("text", { x: A.x - 20, y: A.y + 5, class: "point-label" }, "A"));
    svg.append(svgEl("text", { x: B.x + 8, y: B.y + 5, class: "point-label" }, "B"));
    svg.append(svgEl("text", { x: C.x + 8, y: C.y - 8, class: "point-label" }, "C"));
    frame.status.textContent = `G 重心　O 外心　H 垂心　I 内心　N 九点中心　／　G-O-Hはオイラー線上`;
  }
  draw();
}

function triangleCenters(A, B, C) {
  const sideA = Math.hypot(B.x - C.x, B.y - C.y);
  const sideB = Math.hypot(A.x - C.x, A.y - C.y);
  const sideC = Math.hypot(A.x - B.x, A.y - B.y);
  const perimeter = sideA + sideB + sideC || 1;
  const G = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
  const denominator = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  let O;
  if (Math.abs(denominator) < 0.001) O = { x: 320, y: 180 };
  else {
    const aa = A.x ** 2 + A.y ** 2;
    const bb = B.x ** 2 + B.y ** 2;
    const cc = C.x ** 2 + C.y ** 2;
    O = {
      x: (aa * (B.y - C.y) + bb * (C.y - A.y) + cc * (A.y - B.y)) / denominator,
      y: (aa * (C.x - B.x) + bb * (A.x - C.x) + cc * (B.x - A.x)) / denominator
    };
  }
  const H = { x: A.x + B.x + C.x - 2 * O.x, y: A.y + B.y + C.y - 2 * O.y };
  const I = { x: (sideA * A.x + sideB * B.x + sideC * C.x) / perimeter, y: (sideA * A.y + sideB * B.y + sideC * C.y) / perimeter };
  const N = { x: (O.x + H.x) / 2, y: (O.y + H.y) / 2 };
  return { G, O, H, I, N };
}

function renderInteraction(content, host) {
  const renderers = {
    "quadratic-vertex": renderQuadraticVertex,
    "quadratic-discriminant": renderQuadraticDiscriminant,
    "quadratic-range": renderQuadraticRange,
    "unit-circle": renderUnitCircle,
    "triangle-area-sine": renderTriangleArea,
    "set-regions": renderSetRegions,
    "permutation-cards": renderPermutationCards,
    "conditional-probability": renderConditionalProbability,
    "mean-median": renderMeanMedian,
    "triangle-centers": renderTriangleCenters
  };
  renderers[content.component](content, host);
}

function formatNumber(value) {
  if (Object.is(value, -0)) return "0";
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

function formatDecimal(value) {
  return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

document.querySelectorAll(".subject-tab").forEach((tab) => {
  tab.addEventListener("click", () => setActiveSubject(tab.dataset.subject));
});

dom.favoriteButton.addEventListener("click", () => {
  const content = getContent(state.activeId);
  const saved = progressFor(content.id);
  state.progress[content.id] = { ...saved, favorite: !saved.favorite };
  saveProgress();
  renderCatalog();
  renderViewer();
});

renderCatalog();
markVisited(getContent(state.activeId));
renderViewer();
