import { LEVEL_META } from "@/lib/catalog";
import type { Level } from "@/lib/types";

export const metadata = { title: "About · YC Startup Demo Lab" };

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">About this lab</h1>
      <p className="mt-4 text-foreground/85">
        YC Startup Demo Lab is an independent project. It takes each idea from Y Combinator&apos;s public{" "}
        <a className="underline" href="https://www.ycombinator.com/rfs" target="_blank" rel="noreferrer">Requests for Startups</a> page and builds a
        small, fictional product that shows how a startup might tackle it. Product names are invented. Nothing here is a YC product, a YC company or
        endorsed by YC.
      </p>
      <h2 className="mt-8 text-lg font-semibold">Implementation levels</h2>
      <ul className="mt-2 space-y-2">
        {(Object.keys(LEVEL_META) as Level[]).map((l) => (
          <li key={l} className="rounded-lg border border-line bg-panel p-3">
            <span className="font-medium">{LEVEL_META[l].label}</span> <span className="text-muted">— {LEVEL_META[l].desc}</span>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-lg font-semibold">Honesty rules</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/85">
        <li>Every demo page lists what is real, simulated, mock data, and unavailable.</li>
        <li>No demo calls a paid AI API; everything runs in your browser.</li>
        <li>Competitor names in the analyses are real companies with public websites; business models, channels and risks are hypotheses.</li>
      </ul>
    </div>
  );
}
