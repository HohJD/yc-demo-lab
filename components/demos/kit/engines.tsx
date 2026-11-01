"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, CircleDashed, Loader2, Play, RotateCcw, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Badge, Button, Card, CardHeader, Meter, Select, SimNotice, Slider, Stat, Textarea, cn, fmt } from "@/components/ui";

const tip = { background: "#0e1016", border: "1px solid #222633", fontSize: 12 } as const;
type Tone = "good" | "bad" | "warn" | undefined;

/* ------------------------------------------------------------------ */
/* 1. Rules-based queue triage                                         */
/* ------------------------------------------------------------------ */
export type Fields = Record<string, string | number | boolean>;
export interface TriageItem { id: string; title: string; detail: string; fields: Fields }
export interface TriageRule { id: string; label: string; weight: number; test: (f: Fields, it: TriageItem) => boolean; explain?: string }
export interface TriageConfig {
  title: string; subtitle?: string; itemNoun: string;
  items: TriageItem[]; rules: TriageRule[];
  threshold?: number; actionHigh: string; actionLow: string; actionMid?: string;
  impact?: (flagged: TriageItem[], all: TriageItem[]) => { label: string; value: string; tone?: Tone }[];
  notice: ReactNode;
}

export function QueueTriage(c: TriageConfig) {
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(c.rules.map((r) => [r.id, true])));
  const [th, setTh] = useState(c.threshold ?? 50);
  const [sel, setSel] = useState(c.items[0].id);
  const [ran, setRan] = useState(false);
  const maxScore = c.rules.reduce((s, r) => s + Math.max(r.weight, 0), 0) || 1;
  const scored = useMemo(() => c.items.map((it) => {
    const hits = c.rules.filter((r) => on[r.id] && r.test(it.fields, it));
    const raw = hits.reduce((s, r) => s + r.weight, 0);
    const score = Math.max(0, Math.min(100, Math.round((raw / maxScore) * 100)));
    const action = score >= th ? c.actionHigh : c.actionMid && score >= th / 2 ? c.actionMid : c.actionLow;
    return { it, hits, score, action, high: score >= th };
  }).sort((a, b) => b.score - a.score), [c, on, th, maxScore]);
  const cur = scored.find((s) => s.it.id === sel) ?? scored[0];
  const flagged = scored.filter((s) => s.high).map((s) => s.it);
  const impact = c.impact?.(flagged, c.items);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader title="Rules" subtitle="Toggle signals and tune the threshold" icon={<SlidersHorizontal className="h-4 w-4" />} />
          <div className="space-y-2 p-4">
            {c.rules.map((r) => (
              <label key={r.id} className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" checked={on[r.id]} onChange={(e) => setOn((x) => ({ ...x, [r.id]: e.target.checked }))} />
                <span>{r.label} <span className="font-mono text-xs text-muted">{r.weight > 0 ? "+" : ""}{r.weight}</span></span>
              </label>
            ))}
            <div className="pt-2"><Slider label="Escalation threshold" value={th} min={5} max={95} onChange={setTh} format={(v) => `${v}/100`} /></div>
            <Button className="w-full" onClick={() => setRan(true)}><Play className="h-4 w-4" />Run triage on {c.items.length} {c.itemNoun}s</Button>
          </div>
        </Card>
        <Card>
          <CardHeader title={c.title} subtitle={c.subtitle} right={ran ? <Badge tone="amber">{flagged.length} escalated</Badge> : <Badge>not run</Badge>} />
          <div className="divide-y divide-line" data-testid="engine-output">
            {(ran ? scored : scored.map((s) => ({ ...s, score: -1 }))).map((s) => (
              <button key={s.it.id} onClick={() => setSel(s.it.id)} className={cn("flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-panel-2", sel === s.it.id && "bg-accent/10")}>
                <div className="min-w-0 flex-1"><div className="truncate font-medium">{s.it.title}</div><div className="truncate text-xs text-muted">{s.it.detail}</div></div>
                {s.score >= 0 ? (<><div className="hidden w-24 sm:block"><Meter value={s.score} tone={s.high ? "#f87171" : "#34d399"} /></div><Badge tone={s.high ? "red" : s.action === c.actionMid ? "amber" : "green"}>{s.action}</Badge></>) : <span className="text-xs text-muted">—</span>}
              </button>
            ))}
          </div>
        </Card>
      </div>
      {ran && (
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader title={`Why: ${cur.it.title}`} subtitle={`Score ${cur.score}/100 → ${cur.action}`} />
            <div className="space-y-2 p-4 text-sm">
              <div className="grid grid-cols-2 gap-1 text-xs">{Object.entries(cur.it.fields).map(([k, v]) => <div key={k} className="rounded bg-panel-2 px-2 py-1"><span className="text-muted">{k}: </span>{String(v)}</div>)}</div>
              {cur.hits.length === 0 ? <div className="text-muted">No signals fired.</div> : cur.hits.map((h) => (
                <div key={h.id} className="flex justify-between gap-2 rounded border border-line px-2 py-1.5 text-xs"><span>{h.label}{h.explain && <span className="text-muted"> — {h.explain}</span>}</span><span className="font-mono">{h.weight > 0 ? "+" : ""}{h.weight}</span></div>
              ))}
            </div>
          </Card>
          {impact && <div className="grid grid-cols-2 content-start gap-2">{impact.map((i) => <Stat key={i.label} label={i.label} value={i.value} tone={i.tone} />)}</div>}
        </div>
      )}
      <SimNotice>{c.notice}</SimNotice>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Model calculator                                                 */
/* ------------------------------------------------------------------ */
export interface CalcInput { id: string; label: string; min: number; max: number; step?: number; value: number; format?: (v: number) => string }
export interface CalcResult { stats: { label: string; value: string; sub?: string; tone?: Tone }[]; series?: Record<string, number | string>[]; insight?: string }
export interface CalcConfig {
  title: string; subtitle?: string; inputs: CalcInput[];
  presets?: { label: string; values: Record<string, number> }[];
  compute: (v: Record<string, number>) => CalcResult;
  chart?: { x: string; lines: { key: string; color: string }[]; type?: "line" | "bar"; yFormat?: (v: number) => string; title: string };
  notice: ReactNode;
}

export function ModelCalculator(c: CalcConfig) {
  const init = Object.fromEntries(c.inputs.map((i) => [i.id, i.value]));
  const [v, setV] = useState<Record<string, number>>(init);
  const r = useMemo(() => c.compute(v), [c, v]);
  const Chart = c.chart?.type === "bar" ? BarChart : LineChart;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader title={c.title} subtitle={c.subtitle} right={<Button size="sm" variant="ghost" onClick={() => setV(init)}><RotateCcw className="h-3 w-3" />Reset</Button>} />
          <div className="space-y-3 p-4">
            {c.presets && <Select aria-label="Scenario" defaultValue="" onChange={(e) => { const p = c.presets![Number(e.target.value)]; if (p) setV((x) => ({ ...x, ...p.values })); }} options={[{ value: "", label: "Load a scenario…" }, ...c.presets.map((p, i) => ({ value: String(i), label: p.label }))]} />}
            {c.inputs.map((i) => <Slider key={i.id} name={i.id} label={i.label} value={v[i.id]} min={i.min} max={i.max} step={i.step} onChange={(x) => setV((s) => ({ ...s, [i.id]: x }))} format={i.format} />)}
          </div>
        </Card>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4" data-testid="engine-output">{r.stats.map((s) => <Stat key={s.label} {...s} />)}</div>
          {r.insight && <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm">{r.insight}</div>}
          {c.chart && r.series && (
            <Card>
              <CardHeader title={c.chart.title} />
              <div className="h-64 p-2">
                <ResponsiveContainer>
                  <Chart data={r.series}>
                    <CartesianGrid stroke="#222633" strokeDasharray="3 3" />
                    <XAxis dataKey={c.chart.x} stroke="#8b91a3" fontSize={11} />
                    <YAxis stroke="#8b91a3" fontSize={11} tickFormatter={c.chart.yFormat} width={60} />
                    <Tooltip contentStyle={tip} formatter={(x) => (c.chart!.yFormat ? c.chart!.yFormat(Number(x)) : String(x))} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {c.chart.lines.map((l) => c.chart!.type === "bar"
                      ? <Bar key={l.key} dataKey={l.key} fill={l.color} isAnimationActive={false} />
                      : <Line key={l.key} dataKey={l.key} stroke={l.color} dot={false} strokeWidth={2} isAnimationActive={false} />)}
                  </Chart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      </div>
      <SimNotice>{c.notice}</SimNotice>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Agent / workflow pipeline                                        */
/* ------------------------------------------------------------------ */
export interface PipelineCase { id: string; label: string; input: string; data?: Fields }
export interface PipelineStep { name: string; actor: string; ms?: number; log: (c: PipelineCase) => string; gate?: boolean }
export interface PipelineConfig {
  title: string; subtitle?: string; cases: PipelineCase[]; steps: PipelineStep[];
  output: (c: PipelineCase) => { title: string; body: string; stats?: { label: string; value: string; tone?: Tone }[] };
  editable?: boolean; notice: ReactNode;
}

export function AgentPipeline(c: PipelineConfig) {
  const [cid, setCid] = useState(c.cases[0].id);
  const [input, setInput] = useState(c.cases[0].input);
  const [step, setStep] = useState(-1);
  const [waiting, setWaiting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cs = { ...c.cases.find((x) => x.id === cid)!, input };
  const done = step >= c.steps.length;
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (step < 0 || done || waiting) return;
    const s = c.steps[step];
    timer.current = setTimeout(() => { if (s.gate) setWaiting(true); else setStep((x) => x + 1); }, s.ms ?? 450);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [step, done, waiting, c.steps]);
  const pick = (id: string) => { setCid(id); setInput(c.cases.find((x) => x.id === id)!.input); setStep(-1); setWaiting(false); };
  const out = done ? c.output(cs) : null;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader title={c.title} subtitle={c.subtitle} />
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap gap-1">{c.cases.map((x) => <button key={x.id} onClick={() => pick(x.id)} className={cn("rounded-full border px-2.5 py-1 text-xs", cid === x.id ? "border-accent bg-accent/10" : "border-line text-muted hover:text-foreground")}>{x.label}</button>)}</div>
            <Textarea aria-label="Input" rows={5} value={input} readOnly={!c.editable} onChange={(e) => setInput(e.target.value)} className="font-mono text-xs" />
            <div className="flex gap-2">
              <Button onClick={() => { setStep(0); setWaiting(false); }} disabled={step >= 0 && !done}><Play className="h-4 w-4" />Run workflow</Button>
              {step >= 0 && <Button variant="ghost" onClick={() => { setStep(-1); setWaiting(false); }}><RotateCcw className="h-3 w-3" />Reset</Button>}
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Execution trace" subtitle={`${c.steps.length} steps`} />
          <ol className="space-y-1 p-4">
            {c.steps.map((s, i) => {
              const st = i < step ? "done" : i === step && !done ? (waiting ? "gate" : "run") : "idle";
              return (
                <li key={s.name} className={cn("rounded-lg border px-3 py-2 text-xs", st === "gate" ? "border-amber-400/60 bg-amber-400/5" : "border-line", st === "idle" && "opacity-50")}>
                  <div className="flex items-center gap-2">
                    {st === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : st === "run" ? <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> : st === "gate" ? <ShieldCheck className="h-3.5 w-3.5 text-amber-300" /> : <CircleDashed className="h-3.5 w-3.5" />}
                    <span className="font-medium">{s.name}</span><span className="ml-auto text-muted">{s.actor}</span>
                  </div>
                  {(st === "done" || st === "gate") && <div className="mt-1 whitespace-pre-wrap pl-5 font-mono text-[11px] text-foreground/75">{s.log(cs)}</div>}
                  {st === "gate" && <div className="mt-2 flex gap-2 pl-5"><Button size="sm" onClick={() => { setWaiting(false); setStep((x) => x + 1); }}>Approve</Button><Button size="sm" variant="outline" onClick={() => { setStep(-1); setWaiting(false); }}>Reject</Button></div>}
                </li>
              );
            })}
          </ol>
        </Card>
      </div>
      {out && (
        <Card>
          <CardHeader title={out.title} right={<Badge tone="green">complete</Badge>} />
          <div className="space-y-3 p-4" data-testid="engine-output">
            {out.stats && <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{out.stats.map((s) => <Stat key={s.label} {...s} />)}</div>}
            <pre className="whitespace-pre-wrap rounded-lg bg-panel-2 p-3 font-mono text-xs leading-5">{out.body}</pre>
          </div>
        </Card>
      )}
      <SimNotice>{c.notice}</SimNotice>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Weighted multi-criteria ranker                                   */
/* ------------------------------------------------------------------ */
export interface RankOption { name: string; scores: Record<string, number>; note?: string }
export interface RankConfig {
  title: string; subtitle?: string; criteria: { id: string; label: string; weight: number; invert?: boolean }[];
  options: RankOption[]; unit?: string; notice: ReactNode; pickLabel?: string;
}

export function WeightedRanker(c: RankConfig) {
  const [w, setW] = useState<Record<string, number>>(() => Object.fromEntries(c.criteria.map((k) => [k.id, k.weight])));
  const ranked = useMemo(() => {
    const tot = Object.values(w).reduce((a, b) => a + b, 0) || 1;
    return c.options.map((o) => {
      const parts = c.criteria.map((k) => ({ id: k.id, v: ((k.invert ? 10 - o.scores[k.id] : o.scores[k.id]) * w[k.id]) / tot }));
      return { ...o, total: parts.reduce((s, p) => s + p.v, 0) * 10, parts };
    }).sort((a, b) => b.total - a.total);
  }, [c, w]);
  const colors = ["#7c8cff", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#c084fc"];
  const data = ranked.map((r) => ({ name: r.name, ...Object.fromEntries(r.parts.map((p) => [p.id, +(p.v * 10).toFixed(1)])) }));
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader title="What matters to you" subtitle="Drag weights; ranking updates live" icon={<SlidersHorizontal className="h-4 w-4" />} />
          <div className="space-y-3 p-4">{c.criteria.map((k) => <Slider key={k.id} label={`${k.label}${k.invert ? " (lower is better)" : ""}`} value={w[k.id]} min={0} max={10} onChange={(x) => setW((s) => ({ ...s, [k.id]: x }))} />)}</div>
        </Card>
        <Card>
          <CardHeader title={c.title} subtitle={c.subtitle} right={<Badge tone="green">{c.pickLabel ?? "Top pick"}: {ranked[0].name}</Badge>} />
          <div className="h-72 p-2" data-testid="engine-output">
            <ResponsiveContainer>
              <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke="#222633" strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} stroke="#8b91a3" fontSize={11} />
                <YAxis type="category" dataKey="name" width={130} stroke="#8b91a3" fontSize={11} />
                <Tooltip contentStyle={tip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {c.criteria.map((k, i) => <Bar key={k.id} dataKey={k.id} name={k.label} stackId="a" fill={colors[i % colors.length]} isAnimationActive={false} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="divide-y divide-line border-t border-line">
            {ranked.map((r, i) => <div key={r.name} className="flex gap-3 px-4 py-2 text-xs"><span className="w-5 font-mono text-muted">#{i + 1}</span><span className="w-36 shrink-0 font-medium">{r.name}</span><span className="text-muted">{r.note}</span><span className="ml-auto font-mono">{r.total.toFixed(0)}</span></div>)}
          </div>
        </Card>
      </div>
      <SimNotice>{c.notice}</SimNotice>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Explainable text/feature scorer                                  */
/* ------------------------------------------------------------------ */
export interface ScoreFeature { label: string; pattern: RegExp; weight: number; explain?: string }
export interface ScorerConfig {
  title: string; subtitle?: string; samples: { label: string; text: string }[];
  features: ScoreFeature[]; base?: number; scoreLabel: string;
  verdicts: { min: number; label: string; tone: "good" | "bad" | "warn"; advice?: string }[];
  notice: ReactNode;
}

export function ExplainableScorer(c: ScorerConfig) {
  const [text, setText] = useState(c.samples[0].text);
  const [run, setRun] = useState(false);
  const r = useMemo(() => {
    const hits = c.features.map((f) => ({ ...f, n: (text.match(new RegExp(f.pattern.source, f.pattern.flags.includes("g") ? f.pattern.flags : f.pattern.flags + "g")) ?? []).length })).filter((f) => f.n > 0);
    const raw = (c.base ?? 50) + hits.reduce((s, h) => s + h.weight * Math.min(h.n, 3), 0);
    const score = Math.max(0, Math.min(100, Math.round(raw)));
    const v = [...c.verdicts].sort((a, b) => b.min - a.min).find((x) => score >= x.min) ?? c.verdicts[0];
    return { hits, score, v };
  }, [c, text]);
  const data = r.hits.map((h) => ({ name: h.label, impact: h.weight * Math.min(h.n, 3) }));
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader title={c.title} subtitle={c.subtitle} />
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap gap-1">{c.samples.map((s) => <button key={s.label} onClick={() => { setText(s.text); setRun(false); }} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:text-foreground">{s.label}</button>)}</div>
            <Textarea aria-label="Input" rows={9} value={text} onChange={(e) => { setText(e.target.value); setRun(false); }} className="text-sm" />
            <Button onClick={() => setRun(true)}><Play className="h-4 w-4" />Analyse</Button>
          </div>
        </Card>
        <Card>
          <CardHeader title="Result" subtitle="Every point of the score is attributable to a visible signal" />
          {run ? (
            <div className="space-y-3 p-4" data-testid="engine-output">
              <div className="grid grid-cols-2 gap-2"><Stat label={c.scoreLabel} value={`${r.score}/100`} tone={r.v.tone} /><Stat label="Verdict" value={r.v.label} tone={r.v.tone} /></div>
              {r.v.advice && <div className="rounded-lg border border-line bg-panel-2 p-3 text-sm">{r.v.advice}</div>}
              {data.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer>
                    <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" stroke="#8b91a3" fontSize={11} />
                      <YAxis type="category" dataKey="name" width={150} stroke="#8b91a3" fontSize={10} />
                      <Tooltip contentStyle={tip} />
                      <Bar dataKey="impact" isAnimationActive={false}>{data.map((d) => <Cell key={d.name} fill={d.impact >= 0 ? "#f87171" : "#34d399"} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="text-sm text-muted">No signals matched — score is the baseline.</div>}
              <ul className="space-y-1 text-xs">{r.hits.map((h) => <li key={h.label}><span className="font-mono">{h.weight > 0 ? "+" : ""}{h.weight}×{Math.min(h.n, 3)}</span> {h.label}{h.explain && <span className="text-muted"> — {h.explain}</span>}</li>)}</ul>
            </div>
          ) : <div className="grid h-64 place-items-center text-sm text-muted">Pick a sample or paste your own, then Analyse.</div>}
        </Card>
      </div>
      <SimNotice>{c.notice}</SimNotice>
    </div>
  );
}

export { fmt };
