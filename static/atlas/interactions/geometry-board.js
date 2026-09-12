import { angleBisectorFoot, angleDegrees, centroid, circumcenter, distance, excenterA, incenter, lawOfCosinesSide, lineCircleIntersections, orthocenter, pointOnCircle, triangleArea2 } from "../math/geometry.js?v=20260912-3c";

let sequence = 0;
const COLORS = { primary: "#2563eb", secondary: "#0f766e", highlight: "#d97706", helper: "#64748b", construction: "#94a3b8" };
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const rad = (degrees) => degrees * Math.PI / 180;
const fixed = (value, digits = 2) => Number(value).toFixed(digits);

function createContext(container, config, boundingbox) {
  container.replaceChildren(); container.classList.add("atlas-geometry-stage");
  const boardHost = document.createElement("div");
  boardHost.id = `atlas-geometry-board-${++sequence}`; boardHost.className = "jxgbox atlas-geometry-canvas";
  const touchLayer = document.createElement("div"); touchLayer.className = "atlas-geometry-touch-layer";
  const controls = document.createElement("div"); controls.className = "atlas-geometry-scene-controls";
  const summary = document.createElement("p"); summary.className = "atlas-geometry-summary"; summary.setAttribute("aria-live", "polite");
  container.append(boardHost, touchLayer, controls, summary);
  const board = globalThis.JXG?.JSXGraph?.initBoard(boardHost.id, { boundingbox, axis: true, showCopyright: false, showNavigation: false, keepAspectRatio: true, pan: { enabled: false }, zoom: { enabled: false } }) || null;
  const cleanups = [];
  const context = {
    board, controls, summary, config,
    point(coords, options = {}) { return board?.create("point", coords, { size: 4, strokeColor: COLORS.primary, fillColor: COLORS.primary, fixed: true, highlight: false, ...options }); },
    segment(a, b, options = {}) { return board?.create("segment", [a, b], { strokeWidth: 3, strokeColor: COLORS.primary, fixed: true, highlight: false, ...options }); },
    circle(center, radius, options = {}) { return board?.create("circle", [center, radius], { strokeWidth: 2, strokeColor: COLORS.helper, fixed: true, highlight: false, ...options }); },
    text(x, y, text, options = {}) { return board?.create("text", [x, y, text], { fixed: true, highlight: false, fontSize: 14, strokeColor: COLORS.helper, ...options }); },
    button(label, active, onClick) { const button = document.createElement("button"); button.type = "button"; button.textContent = label; button.setAttribute("aria-pressed", String(active)); button.addEventListener("click", onClick); controls.append(button); return button; },
    touchTarget({ label, position, onMove, onKey }) {
      const button = document.createElement("button"); button.type = "button"; button.className = "atlas-geometry-touch-target"; button.setAttribute("aria-label", label);
      const place = () => { if (!board) return; const [x, y] = position(); const c = new globalThis.JXG.Coords(globalThis.JXG.COORDS_BY_USER, [x, y], board); button.style.left = `${c.scrCoords[1]}px`; button.style.top = `${c.scrCoords[2]}px`; };
      const move = (event) => { if (!board) return; const rect = boardHost.getBoundingClientRect(); const c = new globalThis.JXG.Coords(globalThis.JXG.COORDS_BY_SCREEN, [event.clientX - rect.left, event.clientY - rect.top], board); onMove(c.usrCoords[1], c.usrCoords[2]); };
      button.addEventListener("pointerdown", (event) => { button.setPointerCapture(event.pointerId); move(event); }); button.addEventListener("pointermove", (event) => { if (button.hasPointerCapture(event.pointerId)) move(event); });
      button.addEventListener("keydown", onKey); touchLayer.append(button); cleanups.push(() => button.remove()); return place;
    },
    update(text, placers = []) { board?.update(); placers.forEach((place) => place()); summary.textContent = text; }
  };
  const observer = globalThis.ResizeObserver ? new ResizeObserver(() => { board?.resizeContainer(boardHost.clientWidth, boardHost.clientHeight); board?.fullUpdate(); }) : null;
  observer?.observe(boardHost); cleanups.push(() => observer?.disconnect());
  context.destroy = () => { cleanups.forEach((cleanup) => cleanup()); if (board) globalThis.JXG.JSXGraph.freeBoard(board); container.replaceChildren(); };
  return context;
}

function polarScene(context, initial, min, max, draw, summaryFor) {
  const state = { ...initial }; const placers = [];
  const set = (name, value) => { state[name] = Math.min(max[name] ?? Infinity, Math.max(min[name] ?? -Infinity, finite(value, state[name]))); draw(state, placers); context.update(summaryFor(state), placers); };
  draw(state, placers);
  return { state, setParameter: set, reset() { Object.entries(initial).forEach(([k,v]) => state[k]=v); draw(state, placers); context.update(summaryFor(state), placers); }, placers };
}

function mountUnitCircleScene(context, config) {
  return makeScene(context,config,{initial:{theta:30},clamp:(n,v)=>Math.max(0,Math.min(180,v)),derive:s=>{s.P=pointOnCircle([0,0],1,s.theta);},build:(c,s,api,p)=>{const O=c.point([0,0],{name:"O"});const P=c.point([()=>s.P.x,()=>s.P.y],{name:"P"});c.circle(O,1);c.segment(O,P);c.segment([()=>s.P.x,0],P,{strokeColor:COLORS.secondary,dash:2});c.text(-1.7,1.45,()=>`P = (${fixed(s.P.x)}, ${fixed(s.P.y)})`);p.push(c.touchTarget({label:"円周上の点P",position:()=>[s.P.x,s.P.y],onMove:(x,y)=>api.setParameter("theta",Math.atan2(y,x)*180/Math.PI),onKey:e=>{if(e.key.startsWith("Arrow"))api.setParameter("theta",s.theta+(e.key==="ArrowLeft"||e.key==="ArrowDown"?-1:1));}}));},summary:s=>`θ=${fixed(s.theta,0)}°、cosθ=${fixed(s.P.x)}、sinθ=${fixed(s.P.y)}`});
}

// The following factory keeps numeric state inside each scene; the shared context only owns lifecycle and input surfaces.
function makeScene(context, config, spec) {
  const initial = { ...spec.initial, ...(config.initial || {}) }; const state = { ...initial }; let built = false; const placers=[];
  const api = { state, setParameter(name,value){ if (!(name in state)) return; state[name]=spec.clamp?.(name,finite(value,state[name]),state) ?? finite(value,state[name]); spec.derive(state); if(!built){ spec.build(context,state,api,placers); built=true; } context.update(spec.summary(state),placers); }, reset(){Object.assign(state,initial); spec.derive(state); context.update(spec.summary(state),placers);}, placers };
  spec.derive(state); spec.build(context,state,api,placers); built=true; context.update(spec.summary(state),placers); return api;
}

function triangleAreaScene(context, config) { return makeScene(context,config,{ initial:{theta:60}, clamp:(n,v)=>Math.max(10,Math.min(170,v)), derive:s=>{s.B={x:4*Math.cos(rad(s.theta)),y:4*Math.sin(rad(s.theta))};s.areaByHeight=0.5*5*s.B.y;s.areaBySine=0.5*4*5*Math.sin(rad(s.theta));s.areaCalculationError=Math.abs(s.areaByHeight-s.areaBySine);}, build:(c,s,api,p)=>{c.segment([0,0],[5,0]);c.segment([0,0],[()=>s.B.x,()=>s.B.y]);c.segment([5,0],[()=>s.B.x,()=>s.B.y]);c.segment([()=>s.B.x,0],[()=>s.B.x,()=>s.B.y],{dash:2,strokeColor:COLORS.secondary});p.push(c.touchTarget({label:"頂点B",position:()=>[s.B.x,s.B.y],onMove:(x,y)=>api.setParameter("theta",Math.atan2(y,x)*180/Math.PI),onKey:e=>{if(e.key.startsWith("Arrow"))api.setParameter("theta",s.theta+(e.key==="ArrowLeft"?-1:1));}}));}, summary:s=>`C=${fixed(s.theta,0)}°、高さ=${fixed(s.B.y)}、面積=${fixed(s.areaBySine)}` }); }

function sineLawScene(context,config){return makeScene(context,config,{initial:{thetaC:80},clamp:(n,v)=>Math.max(20,Math.min(160,v)),derive:s=>{s.A=pointOnCircle([0,0],3,210);s.B=pointOnCircle([0,0],3,330);s.C=pointOnCircle([0,0],3,s.thetaC);s.a=distance(s.B,s.C);s.b=distance(s.C,s.A);s.c=distance(s.A,s.B);s.Adeg=angleDegrees(s.B,s.A,s.C);s.Bdeg=angleDegrees(s.A,s.B,s.C);s.Cdeg=angleDegrees(s.A,s.C,s.B);},build:(c,s,api,p)=>{c.circle([0,0],3);[["A","A"],["B","B"],["C","C"]].forEach(([key,name])=>c.point([()=>s[key].x,()=>s[key].y],{name}));c.segment([()=>s.A.x,()=>s.A.y],[()=>s.B.x,()=>s.B.y]);c.segment([()=>s.B.x,()=>s.B.y],[()=>s.C.x,()=>s.C.y]);c.segment([()=>s.C.x,()=>s.C.y],[()=>s.A.x,()=>s.A.y]);p.push(c.touchTarget({label:"円周上の頂点C",position:()=>[s.C.x,s.C.y],onMove:(x,y)=>api.setParameter("thetaC",Math.atan2(y,x)*180/Math.PI),onKey:e=>{if(e.key.startsWith("Arrow"))api.setParameter("thetaC",s.thetaC+(e.key==="ArrowLeft"?-1:1));}}));},summary:s=>`a/sin A=${fixed(s.a/Math.sin(rad(s.Adeg)))}、b/sin B=${fixed(s.b/Math.sin(rad(s.Bdeg)))}、c/sin C=${fixed(s.c/Math.sin(rad(s.Cdeg)))} = 2R`});}

function cosineLawScene(context,config){return makeScene(context,config,{initial:{b:4,c:3,angleA:60},clamp:(n,v)=>n==="angleA"?Math.max(20,Math.min(160,v)):v,derive:s=>{s.C={x:s.b,y:0};s.B={x:s.c*Math.cos(rad(s.angleA)),y:s.c*Math.sin(rad(s.angleA))};s.a=lawOfCosinesSide(s.b,s.c,s.angleA);},build:(c,s)=>{c.segment([0,0],[()=>s.B.x,()=>s.B.y]);c.segment([0,0],[()=>s.C.x,()=>s.C.y]);c.segment([()=>s.B.x,()=>s.B.y],[()=>s.C.x,()=>s.C.y],{strokeColor:COLORS.highlight});},summary:s=>`a=${fixed(s.a)}、a²=${fixed(s.a*s.a)} = ${s.b}²+${s.c}²−2·${s.b}·${s.c}·cos ${fixed(s.angleA,0)}°${Math.abs(s.angleA-90)<.1?"（直角では余弦項が0）":""}`});}

const CENTER_FUNCS={centroid,circumcenter,incenter,orthocenter,excenterA};
function centersScene(context,config){const scene=makeScene(context,config,{initial:{cx:0,cy:2.5},derive:s=>{s.A={x:-3,y:-2};s.B={x:3,y:-2};s.C={x:s.cx,y:s.cy};s.center=CENTER_FUNCS[s.selected||"centroid"](s.A,s.B,s.C);},build:(c,s,api,p)=>{s.selected="centroid";c.segment([()=>s.A.x,()=>s.A.y],[()=>s.B.x,()=>s.B.y]);c.segment([()=>s.B.x,()=>s.B.y],[()=>s.C.x,()=>s.C.y]);c.segment([()=>s.C.x,()=>s.C.y],[()=>s.A.x,()=>s.A.y]);c.point([()=>s.center?.x??0,()=>s.center?.y??0],{name:()=>s.selected,fillColor:COLORS.highlight,strokeColor:COLORS.highlight});const buttons={};Object.keys(CENTER_FUNCS).forEach(key=>buttons[key]=c.button({centroid:"重心",circumcenter:"外心",incenter:"内心",orthocenter:"垂心",excenterA:"傍心"}[key],key===s.selected,()=>{s.selected=key;Object.entries(buttons).forEach(([k,b])=>b.setAttribute("aria-pressed",String(k===key)));api.setParameter("cx",s.cx);}));p.push(c.touchTarget({label:"頂点C",position:()=>[s.C.x,s.C.y],onMove:(x,y)=>{api.setParameter("cx",x);api.setParameter("cy",y);},onKey:e=>{if(e.key.startsWith("Arrow"))api.setParameter(e.key==="ArrowUp"||e.key==="ArrowDown"?"cy":"cx",(e.key==="ArrowLeft"||e.key==="ArrowDown"?-0.1:0.1)+(e.key==="ArrowUp"||e.key==="ArrowDown"?s.cy:s.cx));}}));},summary:s=>`${{centroid:"重心",circumcenter:"外心",incenter:"内心",orthocenter:"垂心",excenterA:"傍心"}[s.selected]}：(${fixed(s.center?.x??0)}, ${fixed(s.center?.y??0)})`});return scene;}

function bisectorScene(context,config){return makeScene(context,config,{initial:{ax:0,ay:3},derive:s=>{s.A={x:s.ax,y:s.ay};s.B={x:-3,y:-2};s.C={x:3,y:-2};s.D=angleBisectorFoot(s.A,s.B,s.C);},build:(c,s)=>{c.segment([()=>s.A.x,()=>s.A.y],[()=>s.B.x,()=>s.B.y]);c.segment([()=>s.A.x,()=>s.A.y],[()=>s.C.x,()=>s.C.y]);c.segment([()=>s.B.x,()=>s.B.y],[()=>s.C.x,()=>s.C.y]);c.segment([()=>s.A.x,()=>s.A.y],[()=>s.D.x,()=>s.D.y],{strokeColor:COLORS.highlight});},summary:s=>`BD/DC=${fixed(distance(s.B,s.D)/distance(s.D,s.C))}、AB/AC=${fixed(distance(s.A,s.B)/distance(s.A,s.C))}`});}
function inscribedScene(context,config){return makeScene(context,config,{initial:{pointAngle:90},clamp:(n,v)=>Math.max(30,Math.min(150,v)),derive:s=>{s.O={x:0,y:0};s.A=pointOnCircle(s.O,3,200);s.B=pointOnCircle(s.O,3,340);s.P=pointOnCircle(s.O,3,s.pointAngle);s.central=angleDegrees(s.A,s.O,s.B);s.inscribed=angleDegrees(s.A,s.P,s.B);},build:(c,s)=>{c.circle([0,0],3);c.segment([()=>s.P.x,()=>s.P.y],[()=>s.A.x,()=>s.A.y]);c.segment([()=>s.P.x,()=>s.P.y],[()=>s.B.x,()=>s.B.y]);c.segment([0,0],[()=>s.A.x,()=>s.A.y],{strokeColor:COLORS.helper});c.segment([0,0],[()=>s.B.x,()=>s.B.y],{strokeColor:COLORS.helper});},summary:s=>`中心角=${fixed(s.central,1)}°、円周角=${fixed(s.inscribed,1)}°、中心角=2×円周角`});}
function powerScene(context,config){return makeScene(context,config,{initial:{secantAngle:180},clamp:(n,v)=>Math.max(150,Math.min(210,v)),derive:s=>{s.P={x:5,y:0};const d={x:Math.cos(rad(s.secantAngle)),y:Math.sin(rad(s.secantAngle))};[s.C,s.D]=lineCircleIntersections(s.P,d,[0,0],3);},build:(c,s)=>{c.circle([0,0],3);c.point([5,0],{name:"P"});c.segment([5,0],[()=>s.D.x,()=>s.D.y],{strokeColor:COLORS.highlight});},summary:s=>`PC·PD=${fixed(distance(s.P,s.C)*distance(s.P,s.D))} = OP²−R² = 16`});}

const GEOMETRY_MODES=Object.freeze({"unit-circle":mountUnitCircleScene,"triangle-area-sine":triangleAreaScene,"sine-law-circumcircle":sineLawScene,"cosine-law":cosineLawScene,"triangle-centers":centersScene,"angle-bisector-ratio":bisectorScene,"inscribed-angle":inscribedScene,"power-of-point":powerScene});
export function mountGeometryBoard(container,config={}){const mount=GEOMETRY_MODES[config.mode];if(!mount)throw new Error(`Unsupported geometry mode: ${config.mode||"(empty)"}`);const bounds=config.boundingbox||[-6,5,6,-5];const context=createContext(container,config,bounds);const scene=mount(context,config);return{reset:scene.reset,destroy:context.destroy,getState:()=>({...scene.state}),setParameter:scene.setParameter};}
