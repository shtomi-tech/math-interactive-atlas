const INTERACTION_LABELS = {
  slider: "SLIDER",
  drag: "DRAG",
  geometry: "GEOMETRY",
  select: "SELECT",
  cards: "CARDS",
  data: "DATA",
  simulation: "SIMULATION",
  build: "BUILD"
};

import { SUBJECT_ORDER, SUBJECT_UNIT_ORDER, orderedContents } from "./curriculum.js?v=20260912-5c";

function createCard(content, onSelect) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "atlas-catalog-card";
  card.dataset.contentId = content.id;
  card.setAttribute("aria-label", `${content.title}を開く`);

  const body = document.createElement("span");
  const location = document.createElement("span");
  location.className = "atlas-card-location";
  location.textContent = `${content.subjectLabel}　＞　${content.unitLabel}`;
  const title = document.createElement("h3");
  title.textContent = content.title;
  const description = document.createElement("span");
  description.className = "atlas-card-description";
  description.textContent = content.shortDescription;
  body.append(location, title, description);

  const type = document.createElement("span");
  type.className = "atlas-card-type";
  type.textContent = INTERACTION_LABELS[content.interactionType] || String(content.interactionType).toUpperCase();
  card.append(body, type);
  card.addEventListener("click", () => onSelect(content.id));
  return card;
}

function uniqueOptions(contents, key) {
  return [...new Map(contents.map((content) => [content[key], content[`${key}Label`] || content[key]])).entries()];
}

function searchMatch(content, query) {
  if (!query) return true;
  const haystack = [content.title, content.shortDescription, content.subjectLabel, content.unitLabel, content.formula, ...(content.discoveryPoints || [])].join(" ").toLocaleLowerCase();
  return haystack.includes(query.toLocaleLowerCase());
}

export function renderCatalog(root, contents, { subject = null, unit = null, type = null, query = "", onSelect, onFilterChange = () => {} }) {
  root.replaceChildren();
  const toolbar = document.createElement("div"); toolbar.className = "atlas-catalog-filters"; toolbar.setAttribute("aria-label", "教材の検索と絞り込み");
  const search = document.createElement("input"); search.type = "search"; search.placeholder = "例：判別式、sin、確率、箱ひげ図"; search.setAttribute("aria-label", "教材を検索"); search.value = query || "";
  const subjectSelect = document.createElement("select"); subjectSelect.setAttribute("aria-label", "科目");
  const unitSelect = document.createElement("select"); unitSelect.setAttribute("aria-label", "単元");
  const typeSelect = document.createElement("select"); typeSelect.setAttribute("aria-label", "インタラクション種別");
  const subjectOptions = [["", "すべての科目"], ...uniqueOptions(contents, "subject")]; const unitOptions = [["", "すべての単元"], ...uniqueOptions(contents, "unit")]; const typeOptions = [["", "すべての種別"], ...[...new Set(contents.map((content) => content.interactionType))].map((value) => [value, INTERACTION_LABELS[value] || value])];
  [[subjectSelect,subjectOptions],[unitSelect,unitOptions],[typeSelect,typeOptions]].forEach(([select,options])=>options.forEach(([value,label])=>{const option=document.createElement("option");option.value=value;option.textContent=label;select.append(option);}));
  subjectSelect.value=subject||"";unitSelect.value=unit||"";typeSelect.value=type||"";
  const clear = document.createElement("button"); clear.type="button"; clear.textContent="条件をクリア"; clear.setAttribute("aria-label","検索と絞り込み条件をクリア");
  const count = document.createElement("p"); count.className="atlas-catalog-result-count"; count.setAttribute("aria-live","polite"); const results=document.createElement("div");results.className="atlas-catalog-results";
  toolbar.append(search,subjectSelect,unitSelect,typeSelect,clear);root.append(toolbar,count,results);
  function currentFilters(){return{subject:subjectSelect.value,unit:unitSelect.value,type:typeSelect.value,query:search.value};}
  function renderResults(){const filters=currentFilters();const visible=contents.filter((content)=>(!filters.subject||content.subject===filters.subject)&&(!filters.unit||content.unit===filters.unit)&&(!filters.type||content.interactionType===filters.type)&&searchMatch(content,filters.query.trim()));count.textContent=`${visible.length}件の教材`;results.replaceChildren();if(visible.length===0){const empty=document.createElement("p");empty.className="atlas-empty-state";empty.textContent="この条件の教材はまだありません。";results.append(empty);return;}const subjects=[...SUBJECT_ORDER,...visible.map((contentItem)=>contentItem.subject).filter((value,index,values)=>!SUBJECT_ORDER.includes(value)&&values.indexOf(value)===index)];subjects.filter((subjectId)=>visible.some((contentItem)=>contentItem.subject===subjectId)).forEach((subjectId)=>{const subjectContents=visible.filter((contentItem)=>contentItem.subject===subjectId);const subjectHeading=document.createElement("h2");subjectHeading.className="atlas-catalog-subject";subjectHeading.textContent=subjectContents[0].subjectLabel;results.append(subjectHeading);const unitOrder=SUBJECT_UNIT_ORDER[subjectId]||[];const units=[...unitOrder,...subjectContents.map((contentItem)=>contentItem.unit).filter((value,index,values)=>!unitOrder.includes(value)&&values.indexOf(value)===index)];units.filter((unitId)=>subjectContents.some((contentItem)=>contentItem.unit===unitId)).forEach((unitId)=>{const items=orderedContents(subjectContents.filter((contentItem)=>contentItem.unit===unitId));const section=document.createElement("section");section.className="atlas-catalog-unit";const title=document.createElement("h3");title.className="atlas-catalog-unit-title";title.textContent=items[0].unitLabel;const grid=document.createElement("div");grid.className="atlas-catalog-unit-grid";items.forEach((contentItem)=>grid.append(createCard(contentItem,onSelect)));section.append(title,grid);results.append(section);});});}
  function notify(){onFilterChange(currentFilters());renderResults();}
  search.addEventListener("input",notify);subjectSelect.addEventListener("change",notify);unitSelect.addEventListener("change",notify);typeSelect.addEventListener("change",notify);clear.addEventListener("click",()=>{search.value="";subjectSelect.value="";unitSelect.value="";typeSelect.value="";notify();});renderResults();
}
