import assert from "node:assert/strict";
import fs from "node:fs";
const contents = JSON.parse(fs.readFileSync(new URL("../static/atlas/content-data.json", import.meta.url), "utf8")); const ids = new Set(contents.map((content) => content.id)); const warnings=[];
contents.forEach((content)=>{assert.equal(new Set(content.related).size,content.related.length,`${content.id} has duplicate related id`);content.related.forEach((id)=>assert.ok(ids.has(id),`${content.id} links to unknown ${id}`));assert.ok(!content.related.includes(content.id),`${content.id} self references`);content.related.forEach((id)=>{if(!contents.find((item)=>item.id===id)?.related.includes(content.id))warnings.push(`${content.id} -> ${id}`);});});
console.log(`Related content: PASS (${warnings.length ? `asymmetric links: ${warnings.join(", ")}` : "no asymmetric links"})`);
