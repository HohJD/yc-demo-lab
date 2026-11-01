import { RFS_REQUESTS, LATEST_EDITION } from "./rfs";
import { W27_DEMOS } from "./demos-w27";
import { ARCHIVE_DEMOS } from "./demos-archive";
import type { RfsRequest, StartupDemo, Level } from "./types";

export interface CatalogEntry {
  request: RfsRequest;
  demo?: StartupDemo;
}

const DEMOS: StartupDemo[] = [...W27_DEMOS, ...ARCHIVE_DEMOS];
const bySlug = new Map(DEMOS.map((d) => [d.slug, d]));

export const CATALOG: CatalogEntry[] = RFS_REQUESTS.map((r) => ({ request: r, demo: bySlug.get(r.slug) }));

export function getEntry(slug: string) {
  return CATALOG.find((c) => c.request.slug === slug);
}

export function stats(entries: CatalogEntry[] = CATALOG) {
  const count = (l: Level) => entries.filter((e) => e.demo?.level === l).length;
  return {
    total: entries.length,
    latest: entries.filter((e) => e.request.edition === LATEST_EDITION).length,
    real: count("real"),
    simulation: count("simulation"),
    concept: count("concept"),
    built: entries.filter((e) => e.demo).length,
    planned: entries.filter((e) => !e.demo).length,
  };
}

export const LEVEL_META: Record<Level, { label: string; tone: "green" | "amber" | "blue" | "default"; desc: string }> = {
  real: { label: "Working prototype", tone: "green", desc: "Level 1: genuine logic runs on your input" },
  simulation: { label: "Interactive simulation", tone: "amber", desc: "Level 2: interactive, with illustrative data/outcomes" },
  concept: { label: "Concept demo", tone: "blue", desc: "Level 3: interactive walkthrough of the product workflow" },
  planned: { label: "Not built yet", tone: "default", desc: "Inventoried; demo not built yet" },
};
