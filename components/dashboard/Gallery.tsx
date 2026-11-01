"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search, ExternalLink } from "lucide-react";
import type { CatalogEntry } from "@/lib/catalog";
import { LEVEL_META } from "@/lib/catalog";
import { Badge, cn } from "@/components/ui";
import type { Level } from "@/lib/types";

export default function Gallery({ entries, editions, latest }: { entries: CatalogEntry[]; editions: string[]; latest: string }) {
  const [q, setQ] = useState("");
  const [edition, setEdition] = useState<string>(latest);
  const [cat, setCat] = useState<string>("All");
  const [level, setLevel] = useState<Level | "All">("All");

  const inEdition = useMemo(() => entries.filter((e) => edition === "All" || e.request.edition === edition), [entries, edition]);
  const cats = useMemo(() => ["All", ...Array.from(new Set(inEdition.map((e) => e.demo?.category ?? "Uncategorized"))).sort()], [inEdition]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return inEdition.filter((e) => {
      const c = e.demo?.category ?? "Uncategorized";
      if (cat !== "All" && c !== cat) return false;
      const lv = e.demo?.level ?? "planned";
      if (level !== "All" && lv !== level) return false;
      if (!s) return true;
      const hay = [e.request.title, e.request.excerpt, e.demo?.productName, e.demo?.problem, e.demo?.solution, c, e.request.author].join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [inEdition, q, cat, level]);

  return (
    <div>
      <div className="sticky top-14 z-30 -mx-4 border-b border-line bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              aria-label="Search startup ideas"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ideas, products, problems…"
              className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 lg:flex">
            <select aria-label="Edition" value={edition} onChange={(e) => { setEdition(e.target.value); setCat("All"); }} className="h-10 rounded-lg border border-line bg-panel px-2 text-sm">
              <option value="All">All editions</option>
              {editions.map((ed) => (
                <option key={ed} value={ed}>{ed}{ed === latest ? " (latest)" : ""}</option>
              ))}
            </select>
            <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)} className="h-10 rounded-lg border border-line bg-panel px-2 text-sm">
              {cats.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>
              ))}
            </select>
            <select aria-label="Status" value={level} onChange={(e) => setLevel(e.target.value as Level | "All")} className="h-10 rounded-lg border border-line bg-panel px-2 text-sm">
              <option value="All">All statuses</option>
              {(Object.keys(LEVEL_META) as Level[]).map((l) => (
                <option key={l} value={l}>{LEVEL_META[l].label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted" data-testid="result-count">{shown.length} of {inEdition.length} ideas</div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((e) => <IdeaCard key={e.request.slug} e={e} />)}
        {shown.length === 0 && <div className="col-span-full rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">No ideas match those filters.</div>}
      </div>
    </div>
  );
}

function IdeaCard({ e }: { e: CatalogEntry }) {
  const d = e.demo;
  const lv = d?.level ?? "planned";
  const meta = LEVEL_META[lv];
  return (
    <article
      data-testid="idea-card"
      className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-panel transition hover:border-[color:var(--c)]/60"
      style={{ ["--c" as string]: d?.accent ?? "#8b91a3" }}
    >
      <div className="h-1 w-full" style={{ background: d?.accent ?? "#222633" }} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge>{d?.category ?? "Uncategorized"}</Badge>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-tight">{d?.productName ?? e.request.title}</h3>
        <div className="text-xs text-muted">
          YC RFS: <span className="text-foreground/80">{e.request.title}</span> · {e.request.edition}
        </div>
        {d ? (
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-[11px] uppercase tracking-wide text-muted">Problem</dt><dd>{d.problem}</dd></div>
            <div><dt className="text-[11px] uppercase tracking-wide text-muted">Solution</dt><dd>{d.solution}</dd></div>
            <div><dt className="text-[11px] uppercase tracking-wide text-muted">Try it</dt><dd className="text-foreground/80">{d.functionality}</dd></div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-foreground/80">&ldquo;{e.request.excerpt}&rdquo;</p>
        )}
        {d && (
          <div className="mt-3 flex flex-wrap gap-1">
            {d.tech.map((t) => <span key={t} className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">{t}</span>)}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          {d ? (
            <Link href={`/demos/${e.request.slug}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-black transition hover:brightness-110" style={{ background: d.accent }}>
              Launch Demo <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link href={`/demos/${e.request.slug}`} className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm text-muted hover:text-foreground")}>
              View request
            </Link>
          )}
          <a href={e.request.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground">
            Source <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
