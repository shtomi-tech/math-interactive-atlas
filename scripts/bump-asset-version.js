import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = String(process.argv[2] || "").trim();
if (!/^\d{8}-[a-z0-9]+$/.test(version)) {
  console.error("Usage: node scripts/bump-asset-version.js YYYYMMDD-label");
  process.exit(1);
}

const targets = ["atlas.html", "practice.html", "sets.html", "worksheet.html", "progress.html", "static/tokens.css", "static/atlas.css", "static/practice.css", "static/sets.css", "static/worksheet.css", "static/progress.css"];
for (const folder of ["static/atlas", "static/practice", "static/sets", "static/worksheet", "static/progress"]) {
  const walk = (directory) => {
    for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
      const relative = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(relative);
      else if (entry.name.endsWith(".js") || entry.name.endsWith(".css")) targets.push(relative);
    }
  };
  walk(folder);
}

for (const relative of targets) {
  const file = path.join(root, relative);
  const source = fs.readFileSync(file, "utf8");
  const updated = source.replace(/\?v=[^"'\s)]+/g, `?v=${version}`);
  if (updated !== source) fs.writeFileSync(file, updated);
}
fs.writeFileSync(path.join(root, "static/asset-version.txt"), `${version}\n`);
console.log(`Asset version updated: ${version} (${targets.length} files scanned)`);
