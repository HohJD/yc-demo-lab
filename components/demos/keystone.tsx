"use client";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { FlaskConical, Play, Plus, Scale } from "lucide-react";
import { Badge, Button, Card, CardHeader, Slider, Stat, fmt, cn, SimNotice } from "@/components/ui";

interface Gold { category: string; priority: "low" | "high"; refundEligible: boolean }
interface Case { id: string; ticket: string; gold: Gold }
type ModelId = "frontier" | "base" | "tuned";
const MODELS: { id: ModelId; name: string; desc: string }[] = [
  { id: "frontier", name: "Frontier API (rented)", desc: "General model via API" },
  { id: "base", name: "Open 8B (base)", desc: "Off-the-shelf open weights" },
  { id: "tuned", name: "Open 8B + your LoRA", desc: "Fine-tuned on your tickets" },
];

const CASES: Case[] = [
  { id: "T1", ticket: "I was charged twice for my March invoice, please fix ASAP.", gold: { category: "billing", priority: "high", refundEligible: true } },
  { id: "T2", ticket: "How do I export my dashboard to PDF?", gold: { category: "how-to", priority: "low", refundEligible: false } },
  { id: "T3", ticket: "The API returns 500 on every request since this morning. Production is down.", gold: { category: "outage", priority: "high", refundEligible: false } },
  { id: "T4", ticket: "Can I get a refund? I bought the annual plan 40 days ago and don't use it.", gold: { category: "billing", priority: "low", refundEligible: false } },
  { id: "T5", ticket: "Please delete all my personal data under GDPR.", gold: { category: "privacy", priority: "high", refundEligible: false } },
  { id: "T6", ticket: "SSO login loops back to the sign-in page for our whole team.", gold: { category: "outage", priority: "high", refundEligible: false } },
];

// Pre-recorded sample outputs (JSON strings) — not live inference.
const OUTPUTS: Record<ModelId, Record<string, string>> = {
  frontier: {
    T1: '{"category":"billing","priority":"high","refund_eligible":true,"reply":"Sorry about that! I have refunded the duplicate charge."}',
    T2: '{"category":"how-to","priority":"low","refund_eligible":false,"reply":"Open the dashboard menu and choose Export > PDF."}',
    T3: '{"category":"bug","priority":"high","refund_eligible":false,"reply":"Our engineers are looking into it."}',
    T4: '{"category":"billing","priority":"low","refund_eligible":true,"reply":"Absolutely, I will process a full refund for you."}',
    T5: '{"category":"privacy","priority":"high","refund_eligible":false,"reply":"We will process your deletion request within 30 days."}',
    T6: '{"category":"authentication","priority":"high","refund_eligible":false,"reply":"Try clearing cookies."}',
  },
  base: {
    T1: '{"category":"billing","priority":"low","reply":"Please contact billing."}',
    T2: 'Sure! To export to PDF, go to the menu.',
    T3: '{"category":"outage","priority":"high","refund_eligible":false,"reply":"Escalated to on-call."}',
    T4: '{"category":"refund","priority":"low","refund_eligible":true,"reply":"I will refund you."}',
    T5: '{"category":"account","priority":"low","refund_eligible":false,"reply":"Go to settings."}',
    T6: '{"category":"outage","priority":"low","refund_eligible":false,"reply":"Escalated."}',
  },
  tuned: {
    T1: '{"category":"billing","priority":"high","refund_eligible":true,"reply":"I see the duplicate charge and have flagged it for a refund."}',
    T2: '{"category":"how-to","priority":"low","refund_eligible":false,"reply":"Dashboard menu > Export > PDF."}',
    T3: '{"category":"outage","priority":"high","refund_eligible":false,"reply":"Escalated to on-call; status page updated."}',
    T4: '{"category":"billing","priority":"low","refund_eligible":false,"reply":"Annual plans are refundable within 30 days, so this one isn\'t, but I can switch you to monthly at renewal."}',
    T5: '{"category":"privacy","priority":"high","refund_eligible":false,"reply":"Deletion request logged; you will get confirmation within 30 days."}',
    T6: '{"category":"outage","priority":"high","refund_eligible":false,"reply":"Escalated to identity on-call."}',
  },
};

const GRADERS = [
  { id: "json", name: "Valid JSON with required fields" },
  { id: "category", name: "Category matches label" },
  { id: "priority", name: "Priority matches label" },
  { id: "policy", name: "Refund policy respected (no unapproved promises)" },
] as const;
type GraderId = (typeof GRADERS)[number]["id"];

function grade(out: string, gold: Gold): Record<GraderId, boolean> {
  let j: Record<string, unknown> | null = null;
  try { j = JSON.parse(out); } catch { j = null; }
  const has = !!j && ["category", "priority", "refund_eligible", "reply"].every((k) => k in j!);
  const reply = String(j?.reply ?? out).toLowerCase();
  const promises = /\b(refund(ed)?|process a (full )?refund|will refund)\b/.test(reply) && !/flagged|isn't|not/.test(reply);
  return {
    json: has,
    category: j?.category === gold.category,
    priority: j?.priority === gold.priority,
    policy: gold.refundEligible ? true : !(promises || j?.refund_eligible === true),
  };
}

export default function Keystone() {
  const [cases, setCases] = useState(CASES);
  const [enabled, setEnabled] = useState<Record<GraderId, boolean>>({ json: true, category: true, priority: true, policy: true });
  const [ran, setRan] = useState(false);
  const [vol, setVol] = useState(2_000_000);
  const [tokens, setTokens] = useState(1500);
  const [apiPrice, setApiPrice] = useState(5);
  const [gpuHr, setGpuHr] = useState(2.5);
  const [gpus, setGpus] = useState(2);
  const [tuneCost, setTuneCost] = useState(40000);
  const [engCost, setEngCost] = useState(15000);

  const results = useMemo(() => {
    return MODELS.map((m) => {
      const rows = cases.map((c) => ({ id: c.id, g: grade(OUTPUTS[m.id][c.id] ?? "", c.gold) }));
      const active = GRADERS.filter((g) => enabled[g.id]);
      const total = rows.length * active.length || 1;
      const passed = rows.reduce((s, r) => s + active.filter((g) => r.g[g.id]).length, 0);
      return { ...m, rows, score: passed / total };
    });
  }, [cases, enabled]);

  const rentMonthly = (vol * tokens) / 1e6 * apiPrice;
  const ownMonthly = gpus * gpuHr * 730 + engCost;
  const breakeven = rentMonthly > ownMonthly ? tuneCost / (rentMonthly - ownMonthly) : null;
  const tco = Array.from({ length: 25 }, (_, m) => ({ month: m, Rent: rentMonthly * m, Own: tuneCost + ownMonthly * m }));

  const addFailure = () => {
    const n = cases.length + 1;
    setCases((cs) => [...cs, { id: `T${n}`, ticket: "Production trace: 'Your plan auto-renewed and I want my money back, it's been 3 days.'", gold: { category: "billing", priority: "low", refundEligible: true } }]);
    OUTPUTS.frontier[`T${n}`] = '{"category":"billing","priority":"low","refund_eligible":true,"reply":"We can refund renewals within 7 days — flagged."}';
    OUTPUTS.base[`T${n}`] = '{"category":"billing","priority":"high","refund_eligible":false,"reply":"Contact support."}';
    OUTPUTS.tuned[`T${n}`] = '{"category":"billing","priority":"low","refund_eligible":true,"reply":"Renewals are refundable within 7 days; I have flagged this for a refund."}';
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Eval set from your workflow" subtitle="Support-ticket triage → structured JSON" icon={<FlaskConical className="h-4 w-4" />} right={<Button size="sm" variant="outline" onClick={addFailure} disabled={cases.length > 6}><Plus className="h-3 w-3" />Promote a production failure</Button>} />
          <div className="divide-y divide-line">
            {cases.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
                <span><span className="font-mono text-xs text-muted">{c.id}</span> {c.ticket}</span>
                <span className="flex gap-1"><Badge>{c.gold.category}</Badge><Badge tone={c.gold.priority === "high" ? "red" : "default"}>{c.gold.priority}</Badge>{c.gold.refundEligible && <Badge tone="amber">refundable</Badge>}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Graders" subtitle="Toggle what 'good' means" />
          <div className="space-y-2 p-4">
            {GRADERS.map((g) => (
              <label key={g.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled[g.id]} onChange={(e) => setEnabled((x) => ({ ...x, [g.id]: e.target.checked }))} />{g.name}</label>
            ))}
            <Button className="mt-2 w-full" onClick={() => setRan(true)}><Play className="h-4 w-4" />Run evals</Button>
          </div>
        </Card>
      </div>
      {ran && (
        <div className="grid gap-3 md:grid-cols-3" data-testid="eval-results">
          {results.map((r) => (
            <Card key={r.id} className={cn(r.score === Math.max(...results.map((x) => x.score)) && "border-emerald-500/50")}>
              <CardHeader title={r.name} subtitle={r.desc} right={<span className="font-mono text-xl font-semibold">{fmt.pct(r.score)}</span>} />
              <div className="flex flex-wrap gap-1 p-3">
                {r.rows.map((row) => {
                  const ok = GRADERS.filter((g) => enabled[g.id]).every((g) => row.g[g.id]);
                  return <span key={row.id} title={GRADERS.filter((g) => enabled[g.id] && !row.g[g.id]).map((g) => g.name).join(", ") || "all pass"} className={cn("rounded px-1.5 py-0.5 font-mono text-[10px]", ok ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300")}>{row.id}</span>;
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
      <Card>
        <CardHeader title="Rent vs own" subtitle="24-month total cost of ownership" icon={<Scale className="h-4 w-4" />} />
        <div className="grid gap-4 p-4 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3">
            <Slider label="Requests / month" value={vol} min={50000} max={20000000} step={50000} onChange={setVol} format={(v) => fmt.num(v)} />
            <Slider label="Tokens / request" value={tokens} min={200} max={8000} step={100} onChange={setTokens} />
            <Slider label="API price ($ / 1M tokens, blended)" value={apiPrice} min={0.5} max={30} step={0.5} onChange={setApiPrice} format={(v) => `$${v}`} />
            <Slider label="GPU $ / hour" value={gpuHr} min={0.5} max={8} step={0.1} onChange={setGpuHr} format={(v) => `$${v.toFixed(1)}`} />
            <Slider label="GPUs for serving" value={gpus} min={1} max={32} onChange={setGpus} />
            <Slider label="Fine-tune + eval build (one-off)" value={tuneCost} min={5000} max={300000} step={5000} onChange={setTuneCost} format={fmt.usdShort} />
            <Slider label="ML eng / month" value={engCost} min={0} max={60000} step={1000} onChange={setEngCost} format={fmt.usdShort} />
          </div>
          <div>
            <div className="grid grid-cols-3 gap-2" data-testid="tco">
              <Stat label="Rent / month" value={fmt.usdShort(rentMonthly)} />
              <Stat label="Own / month" value={fmt.usdShort(ownMonthly)} />
              <Stat label="Break-even" value={breakeven ? `${breakeven.toFixed(1)} mo` : "Never"} tone={breakeven && breakeven < 12 ? "good" : "bad"} />
            </div>
            <div className="mt-2 h-56">
              <ResponsiveContainer>
                <LineChart data={tco}>
                  <CartesianGrid stroke="#222633" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#8b91a3" fontSize={11} />
                  <YAxis stroke="#8b91a3" fontSize={11} tickFormatter={fmt.usdShort} />
                  <Tooltip contentStyle={{ background: "#0e1016", border: "1px solid #222633", fontSize: 12 }} formatter={(v) => fmt.usdShort(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line dataKey="Rent" stroke="#f87171" dot={false} isAnimationActive={false} />
                  <Line dataKey="Own" stroke="var(--accent)" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>
      <SimNotice>Graders run for real, but model outputs are pre-recorded samples (no live inference). Prices are illustrative inputs.</SimNotice>
    </div>
  );
}
