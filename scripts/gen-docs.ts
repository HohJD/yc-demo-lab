import { writeFileSync } from "node:fs";
import { CATALOG } from "../lib/catalog";

const editions = [...new Set(CATALOG.map((e) => e.request.edition))];
const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");
const levelName: Record<string, string> = { real: "Real prototype", simulation: "Simulation", concept: "Concept demo", planned: "Planned" };

let inv = `# YC RFS Inventory\n\nUnofficial. Scraped from the official YC Requests for Startups pages (https://www.ycombinator.com/rfs) across ${editions.length} editions — ${CATALOG.length} requests in total. Every request has a route at \`/demos/<slug>\`.\n\nLevels: **Real prototype** = genuine logic runs on your input; **Simulation** = interactive model with illustrative data; **Concept demo** = scripted interactive workflow; **Planned** = not built.\n\n`;
for (const ed of editions) {
  const rows = CATALOG.filter((e) => e.request.edition === ed);
  inv += `## ${ed} (${rows.length})\n\n| # | Official RFS title | Underlying customer problem | Demo concept | Complexity | Status | Source |\n|---|---|---|---|---|---|---|\n`;
  rows.forEach((e, i) => {
    const d = e.demo;
    inv += `| ${i + 1} | ${esc(e.request.title)} | ${esc(d?.problem ?? e.request.excerpt)} | ${d ? `**${esc(d.productName)}** — ${esc(d.functionality)}` : "—"} | ${d?.complexity ?? "—"} | ${levelName[d?.level ?? "planned"]} | [link](${e.request.sourceUrl}) |\n`;
  });
  inv += "\n";
}
writeFileSync("YC_RFS_INVENTORY.md", inv);

const count = (l: string) => CATALOG.filter((e) => (e.demo?.level ?? "planned") === l).length;
const byEd = editions.map((ed) => {
  const r = CATALOG.filter((e) => e.request.edition === ed);
  const c = (l: string) => r.filter((e) => e.demo?.level === l).length;
  return `| ${ed} | ${r.length} | ${r.filter((e) => e.demo).length} | ${c("real")} | ${c("simulation")} | ${c("concept")} |`;
}).join("\n");
writeFileSync("data/stats.json", JSON.stringify({ total: CATALOG.length, real: count("real"), simulation: count("simulation"), concept: count("concept"), planned: count("planned"), byEdition: byEd }, null, 2));
console.log(JSON.stringify({ total: CATALOG.length, real: count("real"), simulation: count("simulation"), concept: count("concept"), planned: count("planned") }));
console.log(byEd);
