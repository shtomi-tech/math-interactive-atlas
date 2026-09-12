import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["static", "scripts", "tests"];

function collectJavaScriptFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : collectJavaScriptFiles(fullPath);
    return entry.isFile() && fullPath.endsWith(".js") ? [fullPath] : [];
  });
}

const files = roots.flatMap((root) => collectJavaScriptFiles(path.resolve(root))).sort();
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || `${file}: syntax check failed\n`);
    process.exit(result.status || 1);
  }
}

console.log(`JavaScript syntax: PASS (${files.length} files)`);
