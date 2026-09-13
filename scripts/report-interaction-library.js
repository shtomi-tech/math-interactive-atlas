import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const library = readJson("data/interactions.json");
const external = readJson("research/external-repositories.json");
const interactions = Array.isArray(library.interactions) ? library.interactions : [];
const repositories = Array.isArray(external.repositories) ? external.repositories : [];
const features = repositories.flatMap((repository) => (repository.features || []).map((feature) => ({ ...feature, repository: repository.repository })));
const categories = [...new Set(interactions.map((interaction) => interaction.category))].sort();
const relations = [...new Set(interactions.flatMap((interaction) => (interaction.sources || []).map((source) => source.relation)))].sort();
const runtimeImplemented = interactions.filter((interaction) => interaction.implementationStatus !== "research-only").length;

console.log("Canonical Interaction Library Summary");
console.log("");
console.log(`Interactions:            ${interactions.length}`);
console.log(`External repositories:   ${repositories.length}`);
console.log(`External features:       ${features.length}`);
console.log(`Categories:              ${categories.join(", ")}`);
console.log(`Relations:               ${relations.join(", ")}`);
console.log(`Runtime implemented:     ${runtimeImplemented}`);
