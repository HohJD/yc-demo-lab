"use client";
import "@xyflow/react/dist/style.css";
import { useMemo, useState } from "react";
import { ReactFlow, Background, Controls, type Edge, type Node, MarkerType } from "@xyflow/react";
import { CalendarClock, Sparkles, RotateCcw } from "lucide-react";
import { Badge, Button, Card, CardHeader, Slider, Stat, fmt, cn, SimNotice } from "@/components/ui";

interface Alt { supplier: string; lead: number; premium: number }
interface Task { id: string; name: string; kind: "equipment" | "construction" | "milestone"; duration: number; deps: string[]; orderWeek?: number; alts?: Alt[]; chosen?: number; col: number; row: number }

const BASE: Task[] = [
  { id: "permit", name: "Permits & site prep", kind: "construction", duration: 20, deps: [], col: 0, row: 0 },
  { id: "interconnect", name: "Utility interconnect", kind: "construction", duration: 104, deps: [], col: 0, row: 1 },
  { id: "lpt", name: "Large power transformer", kind: "equipment", duration: 156, deps: [], orderWeek: 0, col: 0, row: 2, chosen: 0, alts: [{ supplier: "Primary OEM", lead: 156, premium: 0 }, { supplier: "Overseas OEM + air freight", lead: 110, premium: 2.4e6 }, { supplier: "Refurbished unit (secondary mkt)", lead: 60, premium: 1.1e6 }] },
  { id: "switchgear", name: "MV switchgear", kind: "equipment", duration: 80, deps: [], orderWeek: 0, col: 0, row: 3, chosen: 0, alts: [{ supplier: "Primary OEM", lead: 80, premium: 0 }, { supplier: "Alt OEM (re-engineer)", lead: 52, premium: 0.6e6 }] },
  { id: "gens", name: "Backup generators", kind: "equipment", duration: 70, deps: [], orderWeek: 0, col: 0, row: 4, chosen: 0, alts: [{ supplier: "Primary OEM", lead: 70, premium: 0 }, { supplier: "Rental fleet (bridge)", lead: 12, premium: 0.9e6 }] },
  { id: "cooling", name: "Liquid cooling (CDUs/chillers)", kind: "equipment", duration: 60, deps: [], orderWeek: 0, col: 0, row: 5, chosen: 0, alts: [{ supplier: "Primary OEM", lead: 60, premium: 0 }, { supplier: "Second-source vendor", lead: 40, premium: 0.4e6 }] },
  { id: "shell", name: "Building shell", kind: "construction", duration: 40, deps: ["permit"], col: 1, row: 0 },
  { id: "substation", name: "Substation build", kind: "construction", duration: 16, deps: ["interconnect", "lpt"], col: 1, row: 2 },
  { id: "elec", name: "Electrical install", kind: "construction", duration: 18, deps: ["shell", "switchgear", "gens"], col: 2, row: 3 },
  { id: "mech", name: "Mechanical install", kind: "construction", duration: 14, deps: ["shell", "cooling"], col: 2, row: 5 },
  { id: "commission", name: "Commissioning (L1–L5)", kind: "construction", duration: 10, deps: ["substation", "elec", "mech"], col: 3, row: 3 },
  { id: "live", name: "Energize · go-live", kind: "milestone", duration: 0, deps: ["commission"], col: 4, row: 3 },
];

function dur(t: Task) {
  return t.alts ? t.alts[t.chosen ?? 0].lead : t.duration;
}

function cpm(tasks: Task[]) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const ef = new Map<string, number>();
  const via = new Map<string, string | null>();
  const calc = (id: string): number => {
    if (ef.has(id)) return ef.get(id)!;
    const t = byId.get(id)!;
    let start = t.orderWeek ?? 0;
    let drv: string | null = null;
    for (const d of t.deps) {
      const v = calc(d);
      if (v > start) { start = v; drv = d; }
    }
    const f = start + dur(t);
    ef.set(id, f);
    via.set(id, drv);
    return f;
  };
  tasks.forEach((t) => calc(t.id));
  const critical = new Set<string>();
  let cur: string | null = "live";
  while (cur) { critical.add(cur); cur = via.get(cur) ?? null; }
  return { ef, critical, goLive: ef.get("live")! };
}

export default function CriticalPath() {
  const [tasks, setTasks] = useState(BASE);
  const [mw, setMw] = useState(60);
  const [revPerMwMonth, setRev] = useState(150000);
  const [sel, setSel] = useState<string>("lpt");
  const r = useMemo(() => cpm(tasks), [tasks]);
  const base = useMemo(() => cpm(BASE), []);
  const weeklyRevenue = (mw * revPerMwMonth * 12) / 52;
  const spend = tasks.reduce((s, t) => s + (t.alts ? t.alts[t.chosen ?? 0].premium : 0), 0);

  const mitigations = useMemo(() => {
    const out: { id: string; name: string; supplier: string; idx: number; saved: number; premium: number; roi: number }[] = [];
    tasks.forEach((t, ti) => {
      t.alts?.forEach((a, ai) => {
        if (ai === (t.chosen ?? 0)) return;
        const trial = tasks.map((x, j) => (j === ti ? { ...x, chosen: ai } : x));
        const saved = r.goLive - cpm(trial).goLive;
        const premium = a.premium - t.alts![t.chosen ?? 0].premium;
        if (saved > 0) out.push({ id: t.id, name: t.name, supplier: a.supplier, idx: ai, saved, premium, roi: (saved * weeklyRevenue) / Math.max(premium, 1) });
      });
    });
    return out.sort((a, b) => b.roi - a.roi);
  }, [tasks, r.goLive, weeklyRevenue]);

  const nodes: Node[] = tasks.map((t) => {
    const crit = r.critical.has(t.id);
    return {
      id: t.id,
      position: { x: t.col * 210, y: t.row * 82 },
      data: { label: <div className="text-left"><div className="text-[11px] font-semibold">{t.name}</div><div className="font-mono text-[10px] opacity-70">{t.kind === "milestone" ? `wk ${r.ef.get(t.id)}` : `${dur(t)} wks · done wk ${r.ef.get(t.id)}`}</div></div> },
      style: { background: crit ? "rgba(251,146,60,0.15)" : "#141720", color: "#e7e9ee", border: `1px solid ${crit ? "#fb923c" : sel === t.id ? "#8b91a3" : "#222633"}`, borderRadius: 8, width: 180, padding: 6 },
    };
  });
  const edges: Edge[] = tasks.flatMap((t) => t.deps.map((d) => {
    const crit = r.critical.has(t.id) && r.critical.has(d);
    return { id: `${d}-${t.id}`, source: d, target: t.id, animated: crit, style: { stroke: crit ? "#fb923c" : "#3a3f50" }, markerEnd: { type: MarkerType.ArrowClosed, color: crit ? "#fb923c" : "#3a3f50" } };
  }));
  const st = tasks.find((t) => t.id === sel)!;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4" data-testid="cpm-stats">
        <Stat label="Go-live" value={`Week ${r.goLive}`} sub={`${(r.goLive / 52).toFixed(1)} years from today`} />
        <Stat label="vs baseline" value={`${base.goLive - r.goLive >= 0 ? "-" : "+"}${Math.abs(base.goLive - r.goLive)} wks`} tone={r.goLive < base.goLive ? "good" : undefined} />
        <Stat label="Expediting spend" value={fmt.usdShort(spend)} />
        <Stat label="Revenue pulled forward" value={fmt.usdShort((base.goLive - r.goLive) * weeklyRevenue)} tone={r.goLive < base.goLive ? "good" : undefined} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Build dependency graph" subtitle="Orange = critical path. Click a node to edit it." icon={<CalendarClock className="h-4 w-4" />} right={<Button size="sm" variant="ghost" onClick={() => setTasks(BASE)}><RotateCcw className="h-3 w-3" />Reset</Button>} />
          <div className="h-[460px]">
            <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={(_, n) => setSel(n.id)} nodesDraggable={false} proOptions={{ hideAttribution: true }} colorMode="dark">
              <Background color="#222633" />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader title={st.name} subtitle={st.kind === "equipment" ? "Long-lead equipment" : st.kind} right={r.critical.has(st.id) ? <Badge tone="amber">critical</Badge> : <Badge>slack</Badge>} />
            <div className="space-y-3 p-4">
              {st.alts ? (
                <>
                  <div className="space-y-1">
                    {st.alts.map((a, i) => (
                      <button key={a.supplier} onClick={() => setTasks((ts) => ts.map((x) => (x.id === st.id ? { ...x, chosen: i } : x)))} className={cn("w-full rounded-lg border px-3 py-2 text-left text-xs", (st.chosen ?? 0) === i ? "border-accent bg-accent/10" : "border-line hover:bg-panel-2")}>
                        <div className="font-medium">{a.supplier}</div><div className="text-muted">{a.lead} wk lead · {a.premium ? `+${fmt.usdShort(a.premium)}` : "base price"}</div>
                      </button>
                    ))}
                  </div>
                  <Slider label="Order placed in week" value={st.orderWeek ?? 0} min={0} max={52} onChange={(v) => setTasks((ts) => ts.map((x) => (x.id === st.id ? { ...x, orderWeek: v } : x)))} />
                </>
              ) : (
                <Slider label="Duration (weeks)" value={st.duration} min={0} max={160} onChange={(v) => setTasks((ts) => ts.map((x) => (x.id === st.id ? { ...x, duration: v } : x)))} />
              )}
            </div>
          </Card>
          <Card>
            <CardHeader title="Mitigations" subtitle="Ranked by revenue pulled forward per $ premium" icon={<Sparkles className="h-4 w-4" />} />
            <div className="space-y-3 p-4">
              <Slider label="Facility size (MW)" value={mw} min={5} max={500} step={5} onChange={setMw} />
              <Slider label="Revenue per MW-month" value={revPerMwMonth} min={50000} max={400000} step={10000} onChange={setRev} format={fmt.usdShort} />
              <ul className="space-y-2" data-testid="mitigations">
                {mitigations.length === 0 && <li className="text-xs text-muted">No single swap shortens the critical path right now.</li>}
                {mitigations.slice(0, 4).map((m) => (
                  <li key={m.id + m.idx} className="rounded-lg border border-line bg-panel-2 p-2 text-xs">
                    <div className="font-medium">{m.name} → {m.supplier}</div>
                    <div className="text-muted">-{m.saved} wks · +{fmt.usdShort(m.premium)} · {m.roi.toFixed(1)}x return</div>
                    <Button size="sm" variant="outline" className="mt-1" onClick={() => setTasks((ts) => ts.map((x) => (x.id === m.id ? { ...x, chosen: m.idx } : x)))}>Apply</Button>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
      <SimNotice>Lead times, suppliers and premiums are illustrative (the YC RFS cites ~3-year transformer lead times). Scheduling uses a real CPM forward pass.</SimNotice>
    </div>
  );
}
