"use client";
import { useMemo, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { Activity, Play, Zap } from "lucide-react";
import { Badge, Button, Card, CardHeader, Slider, Stat, Tabs, Textarea, fmt, cn, SimNotice } from "@/components/ui";
import { forecastEnsemble } from "@/lib/demo-utils/forecast";
import { gaussian, mulberry32 } from "@/lib/demo-utils/rng";

type DS = "grid" | "factory" | "solar" | "custom";

function makeSeries(kind: Exclude<DS, "custom">): { y: number[]; m: number; unit: string; label: string; step: string } {
  const r = mulberry32(kind === "grid" ? 11 : kind === "factory" ? 22 : 33);
  if (kind === "grid") {
    const y = Array.from({ length: 24 * 21 }, (_, t) => {
      const h = t % 24, d = Math.floor(t / 24) % 7;
      const daily = 420 + 160 * Math.sin(((h - 6) / 24) * 2 * Math.PI) + 90 * Math.exp(-((h - 19) ** 2) / 6);
      return daily * (d >= 5 ? 0.86 : 1) + t * 0.08 + 18 * gaussian(r);
    });
    return { y, m: 24, unit: "MW", label: "Regional grid load (hourly)", step: "hour" };
  }
  if (kind === "factory") {
    const y = Array.from({ length: 7 * 20 }, (_, t) => {
      const d = t % 7;
      return 1200 + t * 3.5 + (d === 6 ? -520 : d === 5 ? -300 : 0) + 45 * gaussian(r);
    });
    return { y, m: 7, unit: "units", label: "Factory line output (daily)", step: "day" };
  }
  const y = Array.from({ length: 24 * 14 }, (_, t) => {
    const h = t % 24;
    const sun = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI));
    const cloud = 0.75 + 0.25 * Math.sin(t / 37) + 0.08 * gaussian(r);
    return Math.max(0, 85 * sun * cloud);
  });
  return { y, m: 24, unit: "MW", label: "Solar farm generation (hourly)", step: "hour" };
}

const CUSTOM_DEFAULT = "112,118,132,129,121,135,148,148,136,119,104,118,115,126,141,135,125,149,170,170,158,133,114,140,145,150,178,163,172,178,199,199,184,162,146,166,171,180,193,181,183,218,230,242,209,191,172,194";

export default function Tessera() {
  const [ds, setDs] = useState<DS>("grid");
  const [custom, setCustom] = useState(CUSTOM_DEFAULT);
  const [customM, setCustomM] = useState(12);
  const [horizonSeasons, setHorizonSeasons] = useState(2);
  const [ran, setRan] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const series = useMemo(() => {
    if (ds !== "custom") return makeSeries(ds);
    const y = custom.split(/[\s,;]+/).map(Number).filter((v) => Number.isFinite(v));
    return { y, m: customM, unit: "", label: "Your series", step: "step" };
  }, [ds, custom, customM]);

  const horizon = series.m * horizonSeasons;

  const result = useMemo(() => {
    if (!ran) return null;
    try {
      const t0 = performance.now();
      const r = forecastEnsemble(series.y, series.m, horizon);
      return { ...r, ms: performance.now() - t0 };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [ran, series, horizon]);

  const run = () => { setErr(null); setRan(true); };
  const res = result && !("error" in result) ? result : null;
  const errorMsg = err ?? (result && "error" in result ? result.error : null);

  const chart = useMemo(() => {
    const tail = series.y.slice(-series.m * 4);
    const off = series.y.length - tail.length;
    const rows: { t: number; actual?: number; forecast?: number; band?: [number, number] }[] = tail.map((v, i) => ({ t: off + i, actual: v }));
    if (res) res.forecast.forEach((v, i) => rows.push({ t: series.y.length + i, forecast: v, band: [res.lower[i], res.upper[i]] }));
    return rows;
  }, [series, res]);

  // Rough compute comparison: ~flops for this model vs prompting a 70B LLM with the series as text tokens.
  const hwFlops = res ? res.evals * series.y.length * 12 : 0;
  const llmFlops = (series.y.length * 4 + horizon * 4) * 2 * 70e9;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs tabs={[{ id: "grid", label: "Grid load" }, { id: "factory", label: "Factory output" }, { id: "solar", label: "Solar generation" }, { id: "custom", label: "Paste your own" }]} value={ds} onChange={(v) => { setDs(v); setRan(false); }} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader title="Context window" subtitle="Bring your history; no training step" icon={<Activity className="h-4 w-4" />} />
          <div className="space-y-4 p-4">
            <div className="text-sm"><div className="font-medium">{series.label}</div><div className="text-xs text-muted">{series.y.length} points · season = {series.m} {series.step}s</div></div>
            {ds === "custom" && (
              <>
                <Textarea aria-label="Custom series" rows={5} value={custom} onChange={(e) => { setCustom(e.target.value); setRan(false); }} className="font-mono text-xs" />
                <Slider label="Season length" value={customM} min={2} max={52} onChange={(v) => { setCustomM(v); setRan(false); }} />
              </>
            )}
            <Slider label="Horizon (seasons)" value={horizonSeasons} min={1} max={4} onChange={(v) => { setHorizonSeasons(v); setRan(false); }} format={(v) => `${v} × ${series.m} = ${v * series.m} steps`} />
            <Button className="w-full" onClick={run}><Play className="h-4 w-4" />Forecast (zero-shot)</Button>
            {errorMsg && <div className="rounded-lg border border-rose-500/40 bg-rose-500/5 p-2 text-xs text-rose-200">{errorMsg}</div>}
          </div>
        </Card>
        <Card>
          <CardHeader title="Forecast" subtitle="Last 4 seasons of history + forecast with 90% interval" right={res && <Badge tone="green">{res.ms.toFixed(1)} ms in your browser</Badge>} />
          <div className="h-72 p-2" data-testid="forecast-chart">
            <ResponsiveContainer>
              <ComposedChart data={chart} margin={{ right: 12 }}>
                <CartesianGrid stroke="#222633" strokeDasharray="3 3" />
                <XAxis dataKey="t" stroke="#8b91a3" fontSize={11} />
                <YAxis stroke="#8b91a3" fontSize={11} tickFormatter={(v) => fmt.num(v)} />
                <Tooltip contentStyle={{ background: "#0e1016", border: "1px solid #222633", fontSize: 12 }} formatter={(v) => (Array.isArray(v) ? `${fmt.num(Number(v[0]))}–${fmt.num(Number(v[1]))}` : fmt.num(Number(v), 1))} />
                <Area dataKey="band" stroke="none" fill="var(--accent)" fillOpacity={0.18} isAnimationActive={false} />
                <Line dataKey="actual" stroke="#e7e9ee" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                <Line dataKey="forecast" stroke="var(--accent)" dot={false} strokeWidth={2} isAnimationActive={false} />
                {res && <ReferenceLine x={series.y.length} stroke="#8b91a3" strokeDasharray="4 4" />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      {res && (
        <div className="grid gap-4 md:grid-cols-2" data-testid="backtest">
          <Card>
            <CardHeader title="Backtest" subtitle={`Hold-out of the last ${res.backtest.holdout} points`} />
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted"><tr><th className="px-4 py-2">Model</th><th className="px-4 py-2">MAE</th><th className="px-4 py-2">sMAPE</th></tr></thead>
              <tbody>
                {[["Seasonal naive", res.backtest.sn], ["Holt-Winters", res.backtest.hw], ["Tessera ensemble", res.backtest.ens]].map(([n, v]) => {
                  const m = v as { mae: number; smape: number };
                  const best = Math.min(res.backtest.sn.mae, res.backtest.hw.mae, res.backtest.ens.mae) === m.mae;
                  return (
                    <tr key={n as string} className={cn("border-t border-line", best && "text-emerald-300")}>
                      <td className="px-4 py-2">{n as string}{best && " ★"}</td><td className="px-4 py-2 font-mono">{fmt.num(m.mae, 2)}</td><td className="px-4 py-2 font-mono">{m.smape.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 text-xs text-muted">Fitted α={res.params.alpha}, β={res.params.beta}, γ={res.params.gamma} · ensemble weight on Holt-Winters {fmt.pct(res.weightHW)}</div>
          </Card>
          <Card>
            <CardHeader title="Compute budget" subtitle="Why vertical models can run on everything" icon={<Zap className="h-4 w-4" />} />
            <div className="grid grid-cols-2 gap-2 p-4">
              <Stat label="This model (est.)" value={`${(hwFlops / 1e6).toFixed(1)} MFLOP`} tone="good" />
              <Stat label="70B LLM on text (est.)" value={`${(llmFlops / 1e12).toFixed(0)} TFLOP`} tone="bad" />
              <div className="col-span-2 text-xs text-muted">≈ {fmt.num(llmFlops / Math.max(hwFlops, 1))}x less compute. Rough estimate: 2 × params FLOPs per token, ~4 tokens per number.</div>
            </div>
          </Card>
        </div>
      )}
      <SimNotice>Sample series are synthetic. The forecaster is a classical Holt-Winters + seasonal-naive ensemble standing in for a pretrained vertical foundation model.</SimNotice>
    </div>
  );
}
