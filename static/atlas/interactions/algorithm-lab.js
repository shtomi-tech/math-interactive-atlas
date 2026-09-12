import { euclideanSteps, gcd } from "../math/number-theory.js?v=20260912-4b";

function mountAlgorithmLab(container, config = {}) {
  container.replaceChildren(); container.classList.add("atlas-algorithm-lab");
  const heading = document.createElement("h3"); heading.textContent = "ユークリッド互除法を動かす";
  const controls = document.createElement("div"); controls.className = "atlas-algorithm-controls";
  const list = document.createElement("ol"); list.className = "atlas-algorithm-steps";
  const result = document.createElement("p"); result.className = "atlas-algorithm-result"; result.setAttribute("aria-live", "polite");
  container.append(heading, controls, list, result);
  const initial = { a: Math.max(1, Math.abs(Number(config.initial?.a ?? 84))), b: Math.max(1, Math.abs(Number(config.initial?.b ?? 30))) };
  if (initial.a < initial.b) [initial.a, initial.b] = [initial.b, initial.a];
  const steps = euclideanSteps(initial.a, initial.b); let visible = 0;
  const first = document.createElement("button"); first.type="button"; first.textContent="最初";
  const next = document.createElement("button"); next.type="button"; next.textContent="次の割り算";
  const all = document.createElement("button"); all.type="button"; all.textContent="すべて表示";
  const reset = document.createElement("button"); reset.type="button"; reset.textContent="リセット";
  controls.append(first,next,all,reset);
  function render() { list.replaceChildren(); steps.slice(0,visible).forEach((step,index)=>{const item=document.createElement("li");item.className=index===visible-1?"is-current":"";item.textContent=`${step.dividend} = ${step.divisor} × ${step.quotient} + ${step.remainder}`;list.append(item);});const lastNonZero=steps.findLast((step)=>step.remainder===0)?.divisor??initial.b;result.textContent=visible===steps.length?`最後の0でない余り = ${lastNonZero} ／ gcd(${initial.a}, ${initial.b}) = ${gcd(initial.a,initial.b)}`:`${visible} / ${steps.length} 段階を表示中。大きい数を小さい数で割り、余りへ縮約します。`;first.disabled=false;next.disabled=visible>=steps.length;all.disabled=visible>=steps.length;config.onStateChange?.({step:visible},result.textContent); }
  first.addEventListener("click",()=>{visible=1;render();}); next.addEventListener("click",()=>{visible=Math.min(steps.length,visible+1);render();}); all.addEventListener("click",()=>{visible=steps.length;render();}); reset.addEventListener("click",()=>{visible=0;render();}); controls.addEventListener("keydown",(event)=>{if(event.key==="ArrowRight")next.click();if(event.key==="ArrowLeft")first.click();}); render();
  return { reset(){visible=0;render();}, destroy(){container.replaceChildren();}, getState:()=>({a:initial.a,b:initial.b,step:visible}), setParameter(name,value){if(name==="step"){visible=Math.max(0,Math.min(steps.length,Number(value)));render();}} };
}

export { mountAlgorithmLab };
