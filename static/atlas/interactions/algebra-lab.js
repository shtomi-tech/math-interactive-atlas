import { expandMonicProduct, factorPairExpansion, perfectSquareCoefficients } from "../math/algebra.js?v=20260912-4b";

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
    const x = 160, y = 62, xWidth = 280, bWidth = 80, xHeight = 130, aHeight = 62;
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
  const ui = layout(container, "平方公式の形を作る"); const a = Number(config.initial?.a ?? 3); const state = { a, step: 1 }; const steps = ["x²", "x² + ax", "x² + ax + ax", "x² + 2ax + a²"]; const stepButtons = [];
  const previous = button(ui.controls, "前へ", () => setStep(state.step - 1)); const next = button(ui.controls, "次へ", () => setStep(state.step + 1)); const first = button(ui.controls, "最初から", () => setStep(1)); previous.setAttribute("aria-label", "平方公式の手順を一つ戻る"); next.setAttribute("aria-label", "平方公式の手順を一つ進める"); first.setAttribute("aria-label", "平方公式の手順を最初から見る");
  function render() { ui.svg.replaceChildren(); for(let index=0;index<state.step;index+=1){const x=70+index*140;ui.svg.append(svgElement("rect",{x,y:70,width:110,height:90,fill:["#dbeafe","#fce7f3","#fbcfe8","#dcfce7"][index],stroke:"#64748b",rx:6}));text(ui.svg,x+55,122,index===0?"x²":index===3?`${a}²`:`${a}x`,{"text-anchor":"middle","font-size":22});} text(ui.svg,320,218,steps[state.step-1].replace("a",numberText(a)),{"text-anchor":"middle","font-size":25}); ui.result.textContent=state.step===4?`x² + ${numberText(a)}x + ${numberText(a)}x + ${numberText(a*a)} = x² + ${numberText(2*a)}x + ${numberText(a*a)}`:`Step ${state.step}：${steps[state.step-1]}`; [previous,next,first].forEach((node)=>node.disabled=false); previous.disabled=state.step===1; next.disabled=state.step===4; config.onStateChange?.({...state},ui.result.textContent); }
  function setStep(step){state.step=Math.min(4,Math.max(1,Number(step)));render();} ui.controls.addEventListener("keydown",(event)=>{if(event.key==="ArrowLeft")setStep(state.step-1);if(event.key==="ArrowRight")setStep(state.step+1);}); ui.controls.tabIndex=0; render(); return {reset(){setStep(1);},destroy(){container.replaceChildren();},getState:()=>({...state}),setParameter(name,value){if(name==="step")setStep(value);}};
}

const ALGEBRA_MODES = Object.freeze({ "expansion-area": mountExpansionArea, "factorization-reverse": mountFactorizationReverse, "perfect-square-build": mountPerfectSquareBuild });
export function mountAlgebraLab(container, config = {}) { const mount = ALGEBRA_MODES[config.mode]; if (!mount) throw new Error(`Unsupported AlgebraLab mode: ${config.mode || "(empty)"}`); return mount(container, config); }
