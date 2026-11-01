"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { ARCHIVE_DEMOS } from "@/lib/demos-archive";

const loading = () => <div className="h-64 animate-pulse rounded-xl border border-line bg-panel" />;

export const DEMO_COMPONENTS: Record<string, ComponentType> = {
  "startups-in-a-world-of-abundant-space-access": dynamic(() => import("./orbitwise"), { ssr: false, loading }),
  "the-15-an-hour-expert": dynamic(() => import("./claimcoach"), { ssr: false, loading }),
  "robots-made-in-america": dynamic(() => import("./homegrown-bom"), { ssr: false, loading }),
  "llms-that-write-well": dynamic(() => import("./plainspoken"), { ssr: false, loading }),
  "plaid-for-government-benefits": dynamic(() => import("./oneproof"), { ssr: false, loading }),
  "wall-street-for-the-physical-buildout": dynamic(() => import("./steelyard"), { ssr: false, loading }),
  "vertical-foundation-models": dynamic(() => import("./tessera"), { ssr: false, loading }),
  "ai-for-city-hall": dynamic(() => import("./permitpilot"), { ssr: false, loading }),
  "data-center-supply-chain": dynamic(() => import("./critical-path"), { ssr: false, loading }),
  "ai-for-the-air-gapped-economy": dynamic(() => import("./bunker"), { ssr: false, loading }),
  "own-your-intelligence": dynamic(() => import("./keystone"), { ssr: false, loading }),
};

const ARCHIVE_LOADERS: Record<string, () => Promise<{ default: Record<string, ComponentType> }>> = {
  "Fall 2026": () => import("./archive/fall-2026"),
  "Summer 2026": () => import("./archive/summer-2026"),
};

for (const d of ARCHIVE_DEMOS) {
  const load = ARCHIVE_LOADERS[d.edition];
  if (!load) continue;
  DEMO_COMPONENTS[d.slug] = dynamic(() => load().then((m) => ({ default: m.default[d.slug] ?? (() => <div className="p-6 text-sm text-muted">Demo missing.</div>) })), { ssr: false, loading });
}
