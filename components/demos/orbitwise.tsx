"use client";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";
import { Rocket, Satellite } from "lucide-react";
import { Card, CardHeader, Slider, Stat, fmt, cn, SimNotice } from "@/components/ui";

interface Model { id: string; name: string; unit: string; mass: number; hardware: number; life: number; revenue: number; opex: number; note: string }

const PRESETS: Model[] = [
  { id: "compute", name: "Orbital compute node", unit: "node", mass: 20000, hardware: 60e6, life: 5, revenue: 22e6, opex: 2e6, note: "Solar-powered GPU racks with radiative cooling." },
  { id: "pharma", name: "Microgravity pharma capsule", unit: "mission", mass: 300, hardware: 3e6, life: 1, revenue: 6e6, opex: 1e6, note: "Crystallise drug compounds in orbit and return them." },
  { id: "ssp", name: "Space-based solar power", unit: "50 MW plant", mass: 100000, hardware: 400e6, life: 15, revenue: 30e6, opex: 3e6, note: "Beam power to ground rectennas, sold at ~$70/MWh." },
  { id: "debris", name: "Debris-removal servicer", unit: "servicer", mass: 800, hardware: 40e6, life: 5, revenue: 12e6, opex: 2e6, note: "Capture and deorbit dead satellites for operators." },
  { id: "zblan", name: "ZBLAN fiber factory", unit: "mission", mass: 150, hardware: 1.5e6, life: 1, revenue: 2e6, opex: 0.3e6, note: "Draw ultra-low-loss optical fiber in microgravity." },
  { id: "hotel", name: "Orbital hotel module", unit: "module", mass: 50000, hardware: 500e6, life: 15, revenue: 100e6, opex: 60e6, note: "Rooms for 12 guests, 26 stays a year." },
];

const MARKERS = [
  { x: 2700, label: "Falcon 9 (est.)" },
  { x: 500, label: "Early Starship" },
  { x: 100, label: "Starship target" },
  { x: 20, label: "Aspirational" },
];

function annualProfit(m: Model, perKg: number) {
  const capexPerYear = (m.hardware + m.mass * perKg) / m.life;
  return m.revenue - m.opex - capexPerYear;
}
function breakeven(m: Model) {
  const v = ((m.revenue - m.opex) * m.life - m.hardware) / m.mass;
  return v > 0 ? v : null;
}

export default function Orbitwise() {
  const [models, setModels] = useState(PRESETS);
  const [sel, setSel] = useState("compute");
  const [logCost, setLogCost] = useState(Math.log10(2700));
  const perKg = Math.round(10 ** logCost);
  const m = models.find((x) => x.id === sel)!;
  const update = (patch: Partial<Model>) => setModels((ms) => ms.map((x) => (x.id === sel ? { ...x, ...patch } : x)));

  const curve = useMemo(() => {
    const pts = [];
    for (let l = 1; l <= 4.3; l += 0.05) {
      const x = Math.round(10 ** l);
      pts.push({ x, profit: annualProfit(m, x) / 1e6 });
    }
    return pts;
  }, [m]);

  const profit = annualProfit(m, perKg);
  const be = breakeven(m);
  const launchCost = m.mass * perKg;
  const launchShare = launchCost / (launchCost + m.hardware);
  const payback = profit > 0 ? (m.hardware + launchCost) / (m.revenue - m.opex) : null;
  const portfolio = models.map((x) => ({ name: x.name, be: breakeven(x), viable: annualProfit(x, perKg) > 0 }));

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader title="Business model" subtitle="Pick a model, then tune its unit economics" icon={<Satellite className="h-4 w-4" />} />
        <div className="space-y-1 p-3">
          {models.map((x) => (
            <button key={x.id} onClick={() => setSel(x.id)} className={cn("w-full rounded-lg border px-3 py-2 text-left text-sm transition", sel === x.id ? "border-accent bg-accent/10" : "border-transparent hover:bg-panel-2")}>
              <div className="flex items-center justify-between font-medium">
                {x.name}
                <span className={cn("h-2 w-2 rounded-full", annualProfit(x, perKg) > 0 ? "bg-emerald-400" : "bg-rose-400")} />
              </div>
              <div className="text-xs text-muted">{x.note}</div>
            </button>
          ))}
        </div>
        <div className="space-y-3 border-t border-line p-4">
          <Slider label="Payload mass (kg)" value={m.mass} min={50} max={200000} step={50} onChange={(v) => update({ mass: v })} format={(v) => fmt.num(v)} />
          <Slider label="Hardware cost" value={m.hardware / 1e6} min={0.5} max={800} step={0.5} onChange={(v) => update({ hardware: v * 1e6 })} format={(v) => `$${v}M`} />
          <Slider label="Revenue / year" value={m.revenue / 1e6} min={0.5} max={200} step={0.5} onChange={(v) => update({ revenue: v * 1e6 })} format={(v) => `$${v}M`} />
          <Slider label="Opex / year" value={m.opex / 1e6} min={0} max={100} step={0.1} onChange={(v) => update({ opex: v * 1e6 })} format={(v) => `$${v}M`} />
          <Slider label="Asset life (years)" value={m.life} min={1} max={20} onChange={(v) => update({ life: v })} />
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader title="Launch price" subtitle="Drag to simulate falling launch costs" icon={<Rocket className="h-4 w-4" />} right={<span className="font-mono text-xl font-semibold text-accent" data-testid="launch-price">{fmt.usd(perKg)}/kg</span>} />
          <div className="p-4">
            <input aria-label="Launch price per kg" type="range" min={1} max={4.3} step={0.01} value={logCost} onChange={(e) => setLogCost(Number(e.target.value))} className="w-full" style={{ direction: "rtl" }} />
            <div className="mt-1 flex justify-between text-[10px] text-muted"><span>$20,000/kg</span><span>$10/kg</span></div>
            <div className="mt-2 flex flex-wrap gap-2">
              {MARKERS.map((mk) => (
                <button key={mk.x} onClick={() => setLogCost(Math.log10(mk.x))} className="rounded-full border border-line px-2 py-0.5 text-xs text-muted hover:border-accent hover:text-foreground">
                  {mk.label} · ${fmt.num(mk.x)}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
              <Stat label="Annual profit / unit" value={fmt.usdShort(profit)} tone={profit > 0 ? "good" : "bad"} sub={profit > 0 ? "Viable" : "Loses money"} />
              <Stat label="Break-even launch price" value={be ? `${fmt.usd(be)}/kg` : "Never"} sub={be ? (perKg <= be ? "You're below it" : `${(perKg / be).toFixed(1)}x cut needed`) : "Unprofitable even at $0/kg"} tone={be ? undefined : "bad"} />
              <Stat label="Launch share of capex" value={fmt.pct(launchShare)} sub={`${fmt.usdShort(launchCost)} launch per ${m.unit}`} />
              <Stat label="Payback" value={payback ? `${payback.toFixed(1)} yrs` : "—"} sub={payback && payback > m.life ? "Longer than asset life" : "Simple payback"} tone={payback && payback <= m.life ? "good" : undefined} />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title={`${m.name}: annual profit vs launch price`} subtitle="$M per unit per year, log-scale launch price" />
          <div className="h-64 p-2">
            <ResponsiveContainer>
              <LineChart data={curve} margin={{ left: 8, right: 16, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="#222633" strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" scale="log" domain={[10, 20000]} reversed ticks={[10, 100, 1000, 10000]} tickFormatter={(v) => `$${fmt.num(v)}`} stroke="#8b91a3" fontSize={11} />
                <YAxis stroke="#8b91a3" fontSize={11} tickFormatter={(v) => `${v}`} />
                <Tooltip contentStyle={{ background: "#0e1016", border: "1px solid #222633", fontSize: 12 }} formatter={(v) => [`$${Number(v).toFixed(1)}M`, "Profit"]} labelFormatter={(l) => `$${fmt.num(Number(l))}/kg`} />
                <ReferenceLine y={0} stroke="#f87171" />
                <ReferenceLine x={perKg} stroke="var(--accent)" strokeDasharray="4 4" />
                <Line dataKey="profit" stroke="var(--accent)" dot={false} strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Which models unlock first?" subtitle="Break-even launch price per model (higher = viable sooner)" />
          <div className="h-56 p-2">
            <ResponsiveContainer>
              <BarChart data={portfolio.map((p) => ({ ...p, v: p.be ?? 0 }))} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" scale="log" domain={[1, 100000]} allowDataOverflow stroke="#8b91a3" fontSize={11} tickFormatter={(v) => `$${fmt.num(v)}`} />
                <YAxis type="category" dataKey="name" width={150} stroke="#8b91a3" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0e1016", border: "1px solid #222633", fontSize: 12 }} formatter={(v) => [Number(v) > 0 ? `$${fmt.num(Number(v))}/kg` : "Never", "Break-even"]} />
                <ReferenceLine x={perKg} stroke="var(--accent)" strokeDasharray="4 4" />
                <Bar dataKey="v" isAnimationActive={false}>
                  {portfolio.map((p) => <Cell key={p.name} fill={p.viable ? "#34d399" : "#f87171"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="px-4 pb-4"><SimNotice>Default figures are illustrative order-of-magnitude assumptions, not quotes. Edit them to match your own business case.</SimNotice></div>
        </Card>
      </div>
    </div>
  );
}
