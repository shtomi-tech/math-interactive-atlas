import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = fs.readFileSync(path.join(root, "static/asset-version.txt"), "utf8").trim();
const files = ["atlas.html", "practice.html", "sets.html", "worksheet.html", "progress.html"];
for (const folder of ["static/atlas", "static/practice", "static/sets", "static/worksheet", "static/progress"]) {
  const walk = (directory) => {
    for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
      const relative = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(relative);
      else if (entry.name.endsWith(".js") || entry.name.endsWith(".css")) files.push(relative);
    }
  };
  walk(folder);
}
const errors = [];
for (const relative of files) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  const tokens = [...source.matchAll(/\?v=([^"'\s)]+)/g)].map((match) => match[1]);
  if (tokens.some((token) => token !== version)) errors.push(`${relative}: mixed asset version`);
  const imports = [...source.matchAll(/\b(?:from\s+|import\s*\(\s*)["']([^"']+\.js)(?:\?v=([^"']+))?["']/g)];
  imports.forEach((match) => { if (match[1].startsWith(".") && match[2] !== version) errors.push(`${relative}: unversioned module import ${match[1]}`); });
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Asset version: PASS (${version}, ${files.length} files)`);
