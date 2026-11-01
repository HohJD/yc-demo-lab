"use client";
import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Factory, Wand2, RotateCcw } from "lucide-react";
import { Badge, Button, Card, CardHeader, Meter, Stat, Tabs, fmt, cn, SimNotice } from "@/components/ui";

interface Option { supplier: string; origin: "US" | "CN" | "JP" | "DE" | "MX" | "KR"; cost: number; leadWeeks: number }
interface Part { id: string; name: string; qty: number; options: Option[]; chosen: number }

const ROBOT: Part[] = [
  { id: "mag", name: "NdFeB magnet set (motors)", qty: 8, chosen: 0, options: [{ supplier: "Ningbo Magnetics", origin: "CN", cost: 38, leadWeeks: 6 }, { supplier: "Ozark Magnet Works", origin: "US", cost: 71, leadWeeks: 14 }] },
  { id: "motor", name: "BLDC servo motor", qty: 8, chosen: 0, options: [{ supplier: "Shenzhen Drive", origin: "CN", cost: 120, leadWeeks: 8 }, { supplier: "Kyoto Servo", origin: "JP", cost: 190, leadWeeks: 10 }, { supplier: "Great Lakes Motion", origin: "US", cost: 210, leadWeeks: 12 }] },
  { id: "gear", name: "Strain-wave gearbox", qty: 6, chosen: 0, options: [{ supplier: "Nagano Harmonic", origin: "JP", cost: 420, leadWeeks: 16 }, { supplier: "Suzhou Gear", origin: "CN", cost: 260, leadWeeks: 9 }, { supplier: "Cascade Precision", origin: "US", cost: 510, leadWeeks: 20 }] },
  { id: "enc", name: "Absolute encoder", qty: 8, chosen: 0, options: [{ supplier: "Bavaria Sensorik", origin: "DE", cost: 65, leadWeeks: 7 }, { supplier: "Pioneer Valley Encoders", origin: "US", cost: 78, leadWeeks: 8 }] },
  { id: "fts", name: "6-axis force/torque sensor", qty: 1, chosen: 0, options: [{ supplier: "Bavaria Sensorik", origin: "DE", cost: 2400, leadWeeks: 10 }, { supplier: "Carolina Force Labs", origin: "US", cost: 2900, leadWeeks: 12 }] },
  { id: "grip", name: "Adaptive gripper", qty: 1, chosen: 1, options: [{ supplier: "Guangzhou Grip", origin: "CN", cost: 900, leadWeeks: 5 }, { supplier: "Boston End Effectors", origin: "US", cost: 1600, leadWeeks: 6 }] },
  { id: "soc", name: "Compute module (SoC)", qty: 1, chosen: 0, options: [{ supplier: "Hsinchu Silicon (assembled MX)", origin: "MX", cost: 1100, leadWeeks: 10 }, { supplier: "Austin Edge Compute", origin: "US", cost: 1450, leadWeeks: 14 }] },
  { id: "batt", name: "Battery pack 48V", qty: 1, chosen: 0, options: [{ supplier: "Seoul Cells", origin: "KR", cost: 1800, leadWeeks: 8 }, { supplier: "Nevada Pack Co.", origin: "US", cost: 2100, leadWeeks: 9 }] },
  { id: "frame", name: "Aluminum frame & chassis", qty: 1, chosen: 1, options: [{ supplier: "Monterrey Metal", origin: "MX", cost: 1300, leadWeeks: 4 }, { supplier: "Ohio Extrusion", origin: "US", cost: 1500, leadWeeks: 5 }] },
  { id: "harness", name: "Wiring harness & connectors", qty: 1, chosen: 0, options: [{ supplier: "Dongguan Cable", origin: "CN", cost: 260, leadWeeks: 4 }, { supplier: "Midwest Harness", origin: "US", cost: 410, leadWeeks: 6 }] },
];

const COLORS: Record<string, string> = { US: "#f87171", CN: "#64748b", JP: "#94a3b8", DE: "#a3a3a3", MX: "#cbd5e1", KR: "#71717a" };

function analyse(parts: Part[]) {
  let total = 0, domestic = 0, lead = 0;
  const byOrigin: Record<string, number> = {};
  for (const p of parts) {
    const o = p.options[p.chosen];
    const c = o.cost * p.qty;
    total += c;
    if (o.origin === "US") domestic += c;
    byOrigin[o.origin] = (byOrigin[o.origin] ?? 0) + c;
    lead = Math.max(lead, o.leadWeeks);
  }
  return { total, domestic, pct: domestic / total, byOrigin, lead };
}

/** Greedy: repeatedly apply the swap to a US option with the lowest added cost per added domestic point. */
function optimise(parts: Part[], target: number) {
  let cur = parts.map((p) => ({ ...p }));
  const plan: { part: string; from: string; to: string; delta: number; pctAfter: number }[] = [];
  for (let i = 0; i < parts.length && analyse(cur).pct < target; i++) {
    const base = analyse(cur);
    let best: { idx: number; opt: number; score: number } | null = null;
    cur.forEach((p, idx) => {
      if (p.options[p.chosen].origin === "US") return;
      p.options.forEach((o, oi) => {
        if (o.origin !== "US") return;
        const trial = cur.map((x, j) => (j === idx ? { ...x, chosen: oi } : x));
        const a = analyse(trial);
        const gain = a.pct - base.pct;
        const addCost = a.total - base.total;
        const score = gain / Math.max(addCost, 1);
        if (!best || score > best.score) best = { idx, opt: oi, score };
      });
    });
    if (!best) break;
    const b = best as { idx: number; opt: number };
    const p = cur[b.idx];
    const before = analyse(cur).total;
    cur = cur.map((x, j) => (j === b.idx ? { ...x, chosen: b.opt } : x));
    const after = analyse(cur);
    plan.push({ part: p.name, from: p.options[p.chosen].supplier, to: p.options[b.opt].supplier, delta: after.total - before, pctAfter: after.pct });
  }
  return { parts: cur, plan };
}

export default function HomegrownBom() {
  const [parts, setParts] = useState(ROBOT);
  const [target, setTarget] = useState<"0.65" | "0.75">("0.65");
  const [plan, setPlan] = useState<ReturnType<typeof optimise>["plan"] | null>(null);
  const t = Number(target);
  const a = useMemo(() => analyse(parts), [parts]);
  const pass = a.pct >= t;
  const pie = Object.entries(a.byOrigin).map(([k, v]) => ({ name: k, value: v }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="AMR-7 mobile manipulator — bill of materials" subtitle="Click a supplier to swap it. Costs are per robot." icon={<Factory className="h-4 w-4" />} right={<Button size="sm" variant="ghost" onClick={() => { setParts(ROBOT); setPlan(null); }}><RotateCcw className="h-3 w-3" />Reset</Button>} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="text-left text-xs text-muted"><tr><th className="p-3">Component</th><th className="p-3">Qty</th><th className="p-3">Supplier options</th><th className="p-3 text-right">Line cost</th></tr></thead>
              <tbody>
                {parts.map((p, pi) => {
                  const o = p.options[p.chosen];
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="p-3">{p.name}</td>
                      <td className="p-3 font-mono">{p.qty}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {p.options.map((op, oi) => (
                            <button
                              key={op.supplier}
                              onClick={() => { setParts((ps) => ps.map((x, j) => (j === pi ? { ...x, chosen: oi } : x))); setPlan(null); }}
                              className={cn("rounded-md border px-2 py-1 text-xs", oi === p.chosen ? "border-accent bg-accent/15 text-foreground" : "border-line text-muted hover:text-foreground")}
                            >
                              <span className="font-mono">{op.origin}</span> {op.supplier} · ${op.cost}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono">{fmt.usd(o.cost * p.qty)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Domestic content" subtitle="Share of component cost from US suppliers" />
          <div className="space-y-4 p-4">
            <Tabs tabs={[{ id: "0.65", label: "65% (today)" }, { id: "0.75", label: "75% (2029)" }]} value={target} onChange={(v) => { setTarget(v); setPlan(null); }} />
            <div>
              <div className="flex items-baseline justify-between">
                <span className={cn("font-mono text-4xl font-semibold", pass ? "text-emerald-300" : "text-rose-300")} data-testid="domestic-pct">{fmt.pct(a.pct, 1)}</span>
                <Badge tone={pass ? "green" : "red"}>{pass ? "Meets threshold" : "Below threshold"}</Badge>
              </div>
              <div className="relative mt-2"><Meter value={a.pct * 100} tone={pass ? "#34d399" : "#f87171"} /><div className="absolute top-[-3px] h-3.5 w-0.5 bg-white" style={{ left: `${t * 100}%` }} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="BOM cost" value={fmt.usd(a.total)} />
              <Stat label="Longest lead" value={`${a.lead} wks`} />
            </div>
            <div className="h-40">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={2} isAnimationActive={false}>
                    {pie.map((p) => <Cell key={p.name} fill={COLORS[p.name]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0e1016", border: "1px solid #222633", fontSize: 12 }} formatter={(v, n) => [fmt.usd(Number(v)), String(n)]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <Button className="w-full" onClick={() => setPlan(optimise(parts, t).plan)}><Wand2 className="h-4 w-4" />Find cheapest path to {fmt.pct(t)}</Button>
          </div>
        </Card>
      </div>

      {plan && (
        <Card>
          <CardHeader title="Swap plan" subtitle="Ranked by added cost per domestic-content point" />
          <div className="p-4" data-testid="swap-plan">
            {plan.length === 0 ? (
              <p className="text-sm text-emerald-300">Already compliant — no swaps needed.</p>
            ) : (
              <>
                <ol className="space-y-2">
                  {plan.map((s, i) => (
                    <li key={s.part} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-panel-2 p-3 text-sm">
                      <span><span className="font-mono text-muted">{i + 1}.</span> <span className="font-medium">{s.part}</span>: {s.from} → <span className="text-accent">{s.to}</span></span>
                      <span className="font-mono text-xs">+{fmt.usd(s.delta)} · {fmt.pct(s.pctAfter, 1)} domestic</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="text-sm">Total added cost: <span className="font-mono">{fmt.usd(plan.reduce((s, p) => s + p.delta, 0))}</span> per robot</span>
                  <Button size="sm" onClick={() => { setParts(optimise(parts, t).parts); setPlan(null); }}>Apply plan</Button>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
      <SimNotice>Suppliers and prices are fictional. Thresholds come from the YC RFS text; this is not a legal reading of the FCC rule.</SimNotice>
    </div>
  );
}
