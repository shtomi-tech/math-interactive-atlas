import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const contents = readJson("static/atlas/content-data.json");
const library = readJson("data/interactions.json");
const map = readJson("data/candidate-canonical-map.json");
const interactionTitles = new Map(library.interactions.map((interaction) => [interaction.id, interaction.title]));
const records = map.candidates;
const statusCounts = records.reduce((counts, record) => { counts[record.coverageStatus] += 1; return counts; }, { covered: 0, partial: 0, gap: 0 });
const bySubject = new Map();
const byUnit = new Map();
const usage = new Map(library.interactions.map((interaction) => [interaction.id, { direct: 0, partial: 0, supporting: 0 }]));
const contentById = new Map(contents.map((content) => [content.id, content]));

for (const record of records) {
  const content = contentById.get(record.candidateId);
  const subject = content?.subject || "unknown";
  const unit = content?.unit || "unknown";
  bySubject.set(subject, (bySubject.get(subject) || 0) + 1);
  byUnit.set(unit, (byUnit.get(unit) || 0) + 1);
  for (const match of record.matches) {
    const item = usage.get(match.interactionId);
    if (item) item[match.relation] += 1;
  }
}

console.log("Legacy Candidate Coverage");
console.log(`total: ${records.length}`);
console.log(`covered: ${statusCounts.covered}`);
console.log(`partial: ${statusCounts.partial}`);
console.log(`gap: ${statusCounts.gap}`);
console.log("\nby subject:");
for (const [subject, count] of [...bySubject.entries()].sort()) console.log(`${subject}: ${count}`);
console.log("\nby unit:");
for (const [unit, count] of [...byUnit.entries()].sort()) console.log(`${unit}: ${count}`);
console.log("\nCanonical usage:");
for (const [interactionId, counts] of usage) console.log(`${interactionId} (${interactionTitles.get(interactionId)}): direct ${counts.direct} / partial ${counts.partial} / supporting ${counts.supporting}`);
console.log(`\nResearch gaps: ${statusCounts.gap}`);
