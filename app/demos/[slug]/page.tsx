import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, CheckCircle2, FlaskConical, Database, PlugZap } from "lucide-react";
import { CATALOG, getEntry, LEVEL_META } from "@/lib/catalog";
import DemoHost from "@/components/shared/DemoHost";
import { Badge } from "@/components/ui";

export function generateStaticParams() {
  return CATALOG.map((c) => ({ slug: c.request.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = getEntry(slug);
  return { title: e ? `${e.demo?.productName ?? e.request.title} · YC Startup Demo Lab` : "Not found" };
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEntry(slug);
  if (!e) notFound();
  const d = e.demo;
  const lv = d?.level ?? "planned";
  const meta = LEVEL_META[lv];

  return (
    <div style={d ? ({ ["--accent" as string]: d.accent } as React.CSSProperties) : undefined}>
      <div className="border-b border-line bg-panel/40">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> All demos
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {d && <Badge>{d.category}</Badge>}
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <Badge>{e.request.edition}</Badge>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight" style={{ color: d?.accent }}>{d?.productName ?? e.request.title}</h1>
          {d && <p className="mt-1 text-lg text-foreground/90">{d.tagline}</p>}
          <p className="mt-2 text-xs text-muted">
            Inspired by the YC request <span className="text-foreground/80">&ldquo;{e.request.title}&rdquo;</span> by {e.request.author}.{" "}
            <a href={e.request.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline hover:text-foreground">
              Source <ExternalLink className="h-3 w-3" />
            </a>{" "}
            · Fictional product, not affiliated with YC.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {d ? (
          <>
            <section className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-line bg-panel p-4">
                <div className="text-[11px] uppercase tracking-wide text-muted">The problem</div>
                <p className="mt-1 text-sm">{d.problem}</p>
              </div>
              <div className="rounded-xl border border-line bg-panel p-4">
                <div className="text-[11px] uppercase tracking-wide text-muted">What this prototype does</div>
                <p className="mt-1 text-sm">{d.functionality}</p>
              </div>
            </section>

            <section className="mt-6" aria-label="Interactive demo" data-testid="demo-root">
              <DemoHost slug={e.request.slug} />
            </section>

            <section className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-line bg-panel p-5 lg:col-span-2">
                <h2 className="font-semibold">What this demonstrates</h2>
                <p className="mt-2 text-sm text-foreground/85">{d.explanation}</p>
                <h3 className="mt-4 text-sm font-semibold">To turn it into a real startup</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/85">
                  {d.toProduction.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>
              <div className="rounded-xl border border-line bg-panel p-5">
                <h2 className="font-semibold">Limitations</h2>
                <LimitGroup icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} title="Real functionality" items={d.limitations.real} />
                <LimitGroup icon={<FlaskConical className="h-4 w-4 text-amber-400" />} title="Simulated" items={d.limitations.simulated} />
                <LimitGroup icon={<Database className="h-4 w-4 text-sky-400" />} title="Mock / sample data" items={d.limitations.mock} />
                <LimitGroup icon={<PlugZap className="h-4 w-4 text-rose-400" />} title="Unavailable integrations" items={d.limitations.unavailable} />
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-line bg-panel p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold">Startup analysis</h2>
                <span className="text-xs text-muted">Competitors are real companies (public websites); everything else is our hypothesis.</span>
              </div>
              <div className="mt-3 grid gap-x-6 gap-y-3 text-sm md:grid-cols-2">
                <Field k="Target customer" v={d.analysis.targetCustomer} />
                <Field k="Customer pain" v={d.analysis.pain} />
                <Field k="Why now" v={d.analysis.whyNow} />
                <Field k="Business model (hypothesis)" v={d.analysis.businessModel} />
                <Field k="Technical difficulty" v={d.analysis.difficulty} />
                <Field k="First acquisition channel (hypothesis)" v={d.analysis.firstChannel} />
                <Field k="Main risk" v={d.analysis.mainRisk} />
                <Field k="Founder-market fit" v={d.analysis.founderFit} />
              </div>
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-wide text-muted">Existing players</div>
                <ul className="mt-1 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {d.analysis.competitors.map((c) => (
                    <li key={c.name} className="rounded-lg border border-line bg-panel-2 p-3 text-sm">
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">{c.name}</a>
                      ) : (
                        <span className="font-medium">{c.name}</span>
                      )}
                      <div className="text-xs text-muted">{c.note}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-line bg-panel p-8">
            <p className="text-sm">&ldquo;{e.request.excerpt}&rdquo;</p>
            <p className="mt-3 text-sm text-muted">This request is in the inventory, but its demo has not been built yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LimitGroup({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 text-xs font-medium">{icon}{title}</div>
      <ul className="mt-1 space-y-1 pl-6 text-xs text-foreground/80">
        {items.map((t) => <li key={t} className="list-disc">{t}</li>)}
      </ul>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted">{k}</div>
      <div className="text-foreground/90">{v}</div>
    </div>
  );
}
