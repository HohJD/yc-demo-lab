export type Level = "real" | "simulation" | "concept" | "planned";

export type Category =
  | "Space"
  | "AI Services"
  | "Robotics & Hardware"
  | "AI Models"
  | "GovTech"
  | "Fintech"
  | "Infrastructure"
  | "Enterprise AI"
  | "Developer Tools"
  | "Defense"
  | "Healthcare"
  | "Consumer"
  | "Education"
  | "Crypto"
  | "Industrial";

export interface Competitor {
  name: string;
  url?: string;
  note: string;
}

export interface Analysis {
  targetCustomer: string;
  pain: string;
  whyNow: string;
  competitors: Competitor[];
  businessModel: string;
  difficulty: string;
  firstChannel: string;
  mainRisk: string;
  founderFit: string;
}

export interface Limitations {
  real: string[];
  simulated: string[];
  mock: string[];
  unavailable: string[];
}

export interface StartupDemo {
  slug: string;
  edition: string;
  rfsTitle: string;
  author: string;
  category: Category;
  productName: string;
  tagline: string;
  problem: string;
  solution: string;
  functionality: string;
  tech: string[];
  level: Level;
  complexity: "Low" | "Medium" | "High";
  accent: string;
  explanation: string;
  toProduction: string[];
  limitations: Limitations;
  analysis: Analysis;
  tested?: boolean;
}

export interface RfsRequest {
  slug: string;
  edition: string;
  title: string;
  author: string;
  excerpt: string;
  sourceUrl: string;
  latest: boolean;
}
