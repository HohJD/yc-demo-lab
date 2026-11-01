import Link from "next/link";
import { CATALOG, stats, LEVEL_META } from "@/lib/catalog";
import { EDITIONS, LATEST_EDITION } from "@/lib/rfs";
import { Badge } from "@/components/ui";

export const metadata = { title: "Implementation status · YC Startup Demo Lab" };

export default function Status() {
  const s = stats();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Implementation status</h1>
      <p className="mt-2 text-sm text-muted">
        {s.total} requests across {EDITIONS.length} editions · {s.built} demos built ({s.real} working, {s.simulation} simulations, {s.concept} concept) · {s.planned} not built yet.
      </p>
      {EDITIONS.map((ed) => {
        const rows = CATALOG.filter((c) => c.request.edition === ed);
        const es = stats(rows);
        return (
          <section key={ed} className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              {ed} {ed === LATEST_EDITION && <Badge tone="accent">latest</Badge>}
              <span className="text-sm font-normal text-muted">{es.built}/{es.total} built</span>
            </h2>
            <div className="mt-2 overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-panel-2 text-left text-xs text-muted">
                  <tr><th className="p-2">YC request</th><th className="p-2">Demo</th><th className="p-2">Category</th><th className="p-2">Complexity</th><th className="p-2">Status</th><th className="p-2">Tested</th></tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const lv = r.demo?.level ?? "planned";
                    return (
                      <tr key={r.request.slug} className="border-t border-line">
                        <td className="p-2">{r.request.title}</td>
                        <td className="p-2">
                          <Link className="hover:underline" href={`/demos/${r.request.slug}`} style={{ color: r.demo?.accent }}>{r.demo?.productName ?? "—"}</Link>
                        </td>
                        <td className="p-2 text-muted">{r.demo?.category ?? "—"}</td>
                        <td className="p-2 text-muted">{r.demo?.complexity ?? "—"}</td>
                        <td className="p-2"><Badge tone={LEVEL_META[lv].tone}>{LEVEL_META[lv].label}</Badge></td>
                        <td className="p-2 text-muted">{r.demo ? (r.demo.tested === false ? "No" : "Playwright") : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
