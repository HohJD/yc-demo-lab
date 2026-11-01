import { RFS_REQUESTS } from "../rfs";
import type { Analysis, Category, Competitor, Level, StartupDemo } from "../types";

const ACCENT: Record<Category, string> = {
  Space: "#60a5fa", "AI Services": "#34d399", "Robotics & Hardware": "#f59e0b", "AI Models": "#a78bfa", GovTech: "#38bdf8",
  Fintech: "#4ade80", Infrastructure: "#fb923c", "Enterprise AI": "#818cf8", "Developer Tools": "#22d3ee", Defense: "#f87171",
  Healthcare: "#f472b6", Consumer: "#facc15", Education: "#2dd4bf", Crypto: "#c084fc", Industrial: "#fdba74",
};

export interface Spec {
  slug: string; category: Category; productName: string; tagline: string; problem: string; solution: string;
  functionality: string; tech: string[]; level: Exclude<Level, "planned">; complexity: "Low" | "Medium" | "High";
  explanation: string; toProduction: string[];
  real?: string[]; simulated?: string[]; mock?: string[]; unavailable?: string[];
  analysis: Omit<Analysis, "competitors"> & { competitors: Competitor[] };
}

export function spec(s: Spec): StartupDemo {
  const r = RFS_REQUESTS.find((x) => x.slug === s.slug);
  if (!r) throw new Error(`Unknown RFS slug ${s.slug}`);
  return {
    slug: s.slug, edition: r.edition, rfsTitle: r.title, author: r.author, category: s.category, productName: s.productName,
    tagline: s.tagline, problem: s.problem, solution: s.solution, functionality: s.functionality, tech: s.tech, level: s.level,
    complexity: s.complexity, accent: ACCENT[s.category], explanation: s.explanation, toProduction: s.toProduction,
    limitations: { real: s.real ?? [], simulated: s.simulated ?? [], mock: s.mock ?? [], unavailable: s.unavailable ?? [] },
    analysis: s.analysis,
  };
}
