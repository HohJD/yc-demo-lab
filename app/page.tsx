import Gallery from "@/components/dashboard/Gallery";
import { CATALOG, stats } from "@/lib/catalog";
import { EDITIONS, LATEST_EDITION, EDITION_INTROS } from "@/lib/rfs";

export default function Home() {
  const all = stats();
  const latest = stats(CATALOG.filter((c) => c.request.edition === LATEST_EDITION));
  const cards = [
    { label: "YC requests identified", value: all.total, sub: `${EDITIONS.length} editions · ${all.latest} in ${LATEST_EDITION}` },
    { label: "Working prototypes", value: all.real, sub: "Level 1 · real logic" },
    { label: "Interactive simulations", value: all.simulation, sub: "Level 2 · illustrative data" },
    { label: "Concept demos", value: all.concept, sub: "Level 3 · workflow walkthrough" },
    { label: "Demos built", value: `${all.built}/${all.total}`, sub: `${latest.built}/${latest.total} of the latest edition` },
  ];
  return (
    <div className="grid-bg">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
        <div className="max-w-3xl">
          <div className="text-xs font-medium uppercase tracking-widest text-indigo-300">Unofficial · independent project</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">YC Startup Demo Lab</h1>
          <p className="mt-4 text-base text-muted sm:text-lg">
            A gallery of interactive startup prototypes, one for each idea in Y Combinator&apos;s public Requests for Startups. Every card is a
            different product with its own interface, sample data and a working main interaction, labelled honestly as a real prototype,
            a simulation or a concept demo.
          </p>
          <p className="mt-3 text-sm text-muted">
            <span className="text-foreground/80">{LATEST_EDITION}:</span> {EDITION_INTROS[LATEST_EDITION]}
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5" data-testid="stats">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-line bg-panel/80 p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted">{c.label}</div>
              <div className="mt-1 font-mono text-2xl font-semibold">{c.value}</div>
              <div className="text-[11px] text-muted">{c.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Gallery entries={CATALOG} editions={EDITIONS} latest={LATEST_EDITION} />
        </div>
      </div>
    </div>
  );
}
