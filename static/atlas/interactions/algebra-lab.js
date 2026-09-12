import { completeSquare, expandMonicProduct, factorPairExpansion, perfectSquareCoefficients } from "../math/algebra.js?v=20260912-7i";

const SVG_NS = "http://www.w3.org/2000/svg";
const svgElement = (name, attrs = {}) => { const node = document.createElementNS(SVG_NS, name); Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value))); return node; };
const numberText = (value) => Number.isInteger(Number(value)) ? String(Number(value)) : Number(value).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
const signed = (value) => Number(value) < 0 ? `− ${numberText(Math.abs(value))}` : `+ ${numberText(value)}`;

function layout(container, title) {
  container.replaceChildren(); container.classList.add("atlas-algebra-lab");
  const heading = document.createElement("h3"); heading.textContent = title;
  const svg = svgElement("svg", { class: "atlas-algebra-svg", viewBox: "0 0 640 320", role: "img" });
  const result = document.createElement("p"); result.className = "atlas-algebra-result"; result.setAttribute("aria-live", "polite");
  const controls = document.createElement("div"); controls.className = "atlas-algebra-controls";
  container.append(heading, svg, result, controls); return { svg, result, controls };
}

function text(svg, x, y, value, attrs = {}) { const node = svgElement("text", { x, y, ...attrs }); node.textContent = value; svg.append(node); return node; }
function button(parent, label, onClick) { const node = document.createElement("button"); node.type = "button"; node.textContent = label; node.addEventListener("click", onClick); parent.append(node); return node; }

function parameter(config, name, fallback) {
  const definition = config.parameters?.[name] || {};
  return { min: Number.isFinite(Number(definition.min)) ? Number(definition.min) : fallback.min, max: Number.isFinite(Number(definition.max)) ? Number(definition.max) : fallback.max, step: Number.isFinite(Number(definition.step)) ? Number(definition.step) : fallback.step };
}

function mountExpansionArea(container, config) {
  const ui = layout(container, "展開を面積で見る");
  const bounds = { a: parameter(config, "a", { min: 1, max: 4, step: 1 }), b: parameter(config, "b", { min: 1, max: 4, step: 1 }) };
  const state = { a: Number(config.initial?.a ?? 2), b: Number(config.initial?.b ?? 3) };
  function render() {
    const result = expandMonicProduct(state.a, state.b); ui.svg.replaceChildren();
    const xWidth = 180, xHeight = 180, unit = 28, aHeight = state.a * unit, bWidth = state.b * unit;
    const totalWidth = xWidth + bWidth; const totalHeight = xHeight + aHeight; const x = (640 - totalWidth) / 2; const y = Math.max(28, (320 - totalHeight) / 2 + 8);
    ui.svg.append(svgElement("rect", { x, y, width: xWidth, height: xHeight, fill: "#dbeafe", stroke: "#2563eb" }), svgElement("rect", { x: x + xWidth, y, width: bWidth, height: xHeight, fill: "#fef3c7", stroke: "#d97706" }), svgElement("rect", { x, y: y + xHeight, width: xWidth, height: aHeight, fill: "#fce7f3", stroke: "#db2777" }), svgElement("rect", { x: x + xWidth, y: y + xHeight, width: bWidth, height: aHeight, fill: "#dcfce7", stroke: "#16a34a" }));
    text(ui.svg, x + xWidth / 2, y + xHeight / 2, "x²", { "text-anchor": "middle", "font-size": 25 }); text(ui.svg, x + xWidth + bWidth / 2, y + xHeight / 2, `${numberText(state.b)}x`, { "text-anchor": "middle", "font-size": 22 }); text(ui.svg, x + xWidth / 2, y + xHeight + aHeight / 2, `${numberText(state.a)}x`, { "text-anchor": "middle", "font-size": 22 }); text(ui.svg, x + xWidth + bWidth / 2, y + xHeight + aHeight / 2, `${numberText(state.a * state.b)}`, { "text-anchor": "middle", "font-size": 22 });
    text(ui.svg, x + xWidth / 2, y - 18, "x", { "text-anchor": "middle", "font-size": 18 }); text(ui.svg, x + xWidth + bWidth / 2, y - 18, numberText(state.b), { "text-anchor": "middle", "font-size": 18 }); text(ui.svg, x - 16, y + xHeight / 2, "x", { "text-anchor": "middle", "font-size": 18 }); text(ui.svg, x - 16, y + xHeight + aHeight / 2, numberText(state.a), { "text-anchor": "middle", "font-size": 18 });
    ui.result.textContent = `(x + ${numberText(state.a)})(x + ${numberText(state.b)}) = x² ${signed(result.x)}x ${signed(result.constant)} ／ 図では正の値で構造を見ています。式そのものは負の数でも成り立ちます。`;
    config.onStateChange?.({ ...state }, ui.result.textContent);
  }
  function setParameter(name, value) { if (!bounds[name]) return; const definition = bounds[name]; state[name] = Math.min(definition.max, Math.max(definition.min, Number(value))); render(); }
  render(); return { reset() { state.a = Number(config.initial?.a ?? 2); state.b = Number(config.initial?.b ?? 3); render(); }, destroy() { container.replaceChildren(); }, getState: () => ({ ...state }), setParameter };
}

function mountFactorizationReverse(container, config) {
  const ui = layout(container, "因数分解を逆再生する"); const mDef = parameter(config, "m", { min: -5, max: 5, step: 1 }); const nDef = parameter(config, "n", { min: -5, max: 5, step: 1 }); const state = { m: Number(config.initial?.m ?? 2), n: Number(config.initial?.n ?? 3) };
  function factor(value) { return Number(value) < 0 ? `(x − ${numberText(Math.abs(value))})` : `(x + ${numberText(value)})`; }
  function render() { const result=factorPairExpansion(state.m,state.n); ui.svg.replaceChildren(); text(ui.svg,320,66,`${factor(state.m)}${factor(state.n)}`,{"text-anchor":"middle","font-size":28}); text(ui.svg,320,118,"↓",{"text-anchor":"middle","font-size":25}); text(ui.svg,320,170,`和 = ${numberText(result.x)}（xの係数）`,{"text-anchor":"middle","font-size":22}); text(ui.svg,320,216,"↓",{"text-anchor":"middle","font-size":25}); text(ui.svg,320,264,`積 = ${numberText(result.constant)}（定数項）`,{"text-anchor":"middle","font-size":22}); ui.result.textContent=`x² ${signed(result.x)}x ${signed(result.constant)} = ${factor(state.m)}${factor(state.n)}`; config.onStateChange?.({...state},ui.result.textContent); }
  function setParameter(name,value){const def=name==="m"?mDef:name==="n"?nDef:null;if(!def)return;state[name]=Math.min(def.max,Math.max(def.min,Math.round(Number(value))));render();} render(); return {reset(){state.m=Number(config.initial?.m??2);state.n=Number(config.initial?.n??3);render();},destroy(){container.replaceChildren();},getState:()=>({...state}),setParameter};
}

function mountPerfectSquareBuild(container, config) {
  const ui = layout(container, "平方公式の形を作る"); const state = { a: Number(config.initial?.a ?? 3), step: Number(config.initial?.step ?? 1) }; const definition = parameter(config, "a", { min: 1, max: 4, step: 1 });
  const previous = button(ui.controls, "前へ", () => setStep(state.step - 1)); const next = button(ui.controls, "次へ", () => setStep(state.step + 1)); const first = button(ui.controls, "最初から", () => setStep(1));
  previous.setAttribute("aria-label", "平方公式の手順を一つ戻る"); next.setAttribute("aria-label", "平方公式の手順を一つ進める"); first.setAttribute("aria-label", "平方公式の手順を最初から見る");
  const aLabel = document.createElement("label"); aLabel.className = "atlas-algebra-range"; const aCaption = document.createElement("span"); aCaption.textContent = "a"; const aInput = document.createElement("input"); aInput.type = "range"; aInput.min = String(definition.min); aInput.max = String(definition.max); aInput.step = String(definition.step); aInput.value = String(state.a); aInput.setAttribute("aria-label", "aを操作"); const aOutput = document.createElement("output"); aOutput.textContent = String(state.a); aInput.addEventListener("input", () => { state.a = Number(aInput.value); aOutput.textContent = String(state.a); render(); }); aLabel.append(aCaption, aInput, aOutput); ui.controls.append(aLabel);
  function render() { const xLength=150, aPixel=state.a*28, total=xLength+aPixel, left=(640-total)/2, top=42; ui.svg.replaceChildren(); const blocks=[[left,top,xLength,xLength,"#dbeafe","x²"]]; if(state.step>=2)blocks.push([left+xLength,top,aPixel,xLength,"#fce7f3",`${numberText(state.a)}x`]); if(state.step>=3)blocks.push([left,top+xLength,xLength,aPixel,"#fbcfe8",`${numberText(state.a)}x`]); if(state.step>=4)blocks.push([left+xLength,top+xLength,aPixel,aPixel,"#dcfce7",`${numberText(state.a*state.a)} = a²`]); blocks.forEach(([x,y,width,height,fill,label])=>{ui.svg.append(svgElement("rect",{x,y,width,height,fill,stroke:"#64748b",rx:4}));text(ui.svg,x+width/2,y+height/2+6,label,{"text-anchor":"middle","font-size":18});}); text(ui.svg,left+xLength/2,top-12,"x",{"text-anchor":"middle","font-size":16});text(ui.svg,left+xLength+aPixel/2,top-12,numberText(state.a),{"text-anchor":"middle","font-size":16});text(ui.svg,left-15,top+xLength/2,"x",{"text-anchor":"middle","font-size":16});text(ui.svg,left-15,top+xLength+aPixel/2,numberText(state.a),{"text-anchor":"middle","font-size":16}); const final=`x² + ${numberText(state.a)}x + ${numberText(state.a)}x + ${numberText(state.a*state.a)} = x² + ${numberText(2*state.a)}x + ${numberText(state.a*state.a)} = (x + ${numberText(state.a)})²`; ui.result.textContent=state.step===4?final:`Step ${state.step}：${["x²","x² + ax","x² + ax + ax","x² + 2ax + a²"][state.step-1]}`;previous.disabled=state.step===1;next.disabled=state.step===4;config.onStateChange?.({...state},ui.result.textContent); }
  function setStep(step){state.step=Math.min(4,Math.max(1,Number(step)));render();} ui.controls.addEventListener("keydown",(event)=>{if(event.key==="ArrowLeft")setStep(state.step-1);if(event.key==="ArrowRight")setStep(state.step+1);});ui.controls.tabIndex=0;render();return{reset(){state.a=Number(config.initial?.a??3);aInput.value=String(state.a);aOutput.textContent=String(state.a);setStep(1);},destroy(){container.replaceChildren();},getState:()=>({...state}),setParameter(name,value){if(name==="step")setStep(value);if(name==="a"){state.a=Math.min(definition.max,Math.max(definition.min,Number(value)));aInput.value=String(state.a);aOutput.textContent=String(state.a);}render();}};
}

function fraction(value) {
  if (Number.isInteger(value)) return String(value);
  const numerator = Math.round(value * 4);
  if (numerator % 4 === 0) return String(numerator / 4);
  if (numerator % 2 === 0) return `${numerator / 2}/2`;
  return `${numerator}/4`;
}

function mountCompletingSquare(container, config) {
  const ui = layout(container, "平方完成をアニメーションする");
  const state = { b: Number(config.initial?.b ?? 4), c: Number(config.initial?.c ?? 1), step: 1 };
  const buttons = [button(ui.controls, "前へ", () => setStep(state.step - 1)), button(ui.controls, "次へ", () => setStep(state.step + 1)), button(ui.controls, "最初から", () => setStep(1))];
  const bTerm = (value) => value === 0 ? "" : `${value > 0 ? "+" : "−"} ${fraction(Math.abs(value))}x`;
  const cTerm = (value) => value === 0 ? "" : `${value > 0 ? "+" : "−"} ${fraction(Math.abs(value))}`;
  function render() {
    const { h, q } = completeSquare(state); ui.svg.replaceChildren();
    const x = 170, y = 55, side = 150, piece = 34;
    const blocks = state.step === 1 ? [[x, y, side, side, "#dbeafe", "x²"]] : state.step === 2 ? [[x,y,side,side,"#dbeafe","x²"],[x+side,y,piece,side,"#fce7f3","bx"],[x,y+side,side,piece,"#fce7f3","bx"]] : [[x,y,side,side,"#dbeafe","x²"],[x+side,y,piece,side,"#fce7f3","bx"],[x,y+side,side,piece,"#fce7f3","bx"],[x+side,y+side,piece,piece,"#dcfce7","(b/2)²"]];
    blocks.forEach(([left,top,width,height,fill,label]) => { ui.svg.append(svgElement("rect",{x:left,y:top,width,height,fill,stroke:"#64748b",rx:4})); text(ui.svg,left+width/2,top+height/2+7,label,{"text-anchor":"middle","font-size":18}); });
    const lines = [`x² ${bTerm(state.b)} ${cTerm(state.c)}`, `x² ${bTerm(state.b)} + (${fraction(h)})² − (${fraction(h)})² ${cTerm(state.c)}`, `(x + ${fraction(h)})² ${cTerm(-(h ** 2) + state.c)}`, `(x + ${fraction(h)})² ${cTerm(q)}`];
    text(ui.svg,320,270,lines[state.step-1],{"text-anchor":"middle","font-size":20});
    ui.result.textContent = state.step === 4 ? `${lines[3]}（q = c − b²/4 = ${fraction(q)}）` : `Step ${state.step}：${lines[state.step-1]}`;
    buttons[0].disabled = state.step === 1; buttons[1].disabled = state.step === 4; config.onStateChange?.({...state},ui.result.textContent);
  }
  function setStep(value) { state.step = Math.min(4, Math.max(1, Number(value))); render(); }
  render(); return { reset() { state.b=Number(config.initial?.b??4); state.c=Number(config.initial?.c??1); setStep(1); }, destroy() { container.replaceChildren(); }, getState:()=>({...state}), setParameter(name,value) { if (name === "step") setStep(value); if (name === "b" || name === "c") { state[name]=Number(value); render(); } } };
}

const ALGEBRA_MODES = Object.freeze({ "expansion-area": mountExpansionArea, "factorization-reverse": mountFactorizationReverse, "perfect-square-build": mountPerfectSquareBuild, "completing-square": mountCompletingSquare });
export function mountAlgebraLab(container, config = {}) { const mount = ALGEBRA_MODES[config.mode]; if (!mount) throw new Error(`Unsupported AlgebraLab mode: ${config.mode || "(empty)"}`); return mount(container, config); }
