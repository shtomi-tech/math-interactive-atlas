import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "research/repository-audit.json");
let audit;

try {
  audit = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  console.error(`Unable to read repository audit: ${error.message}`);
  process.exitCode = 1;
}

if (audit) {
  const records = Array.isArray(audit.contents) ? audit.contents : [];
  const count = (status) => records.filter((record) => record.auditStatus === status).length;
  const references = records.flatMap((record) => Array.isArray(record.references) ? record.references : []);
  const relationCount = (relation) => references.filter((reference) => reference.relation === relation).length;

  console.log("Repository Audit Summary");
  console.log("");
  console.log(`Candidates:   ${records.length}`);
  console.log(`Verified:     ${count("verified")}`);
  console.log(`Needs Review: ${count("needs-review")}`);
  console.log(`Pending:      ${count("pending")}`);
  console.log("");
  console.log("Relations:");
  console.log(`inspired-by:  ${relationCount("inspired-by")}`);
  console.log(`adapted-from: ${relationCount("adapted-from")}`);
}
