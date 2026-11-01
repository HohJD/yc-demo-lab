"use client";
import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Cpu, Bot, Play, Landmark } from "lucide-react";
import { Button, Card, CardHeader, Slider, Stat, Tabs, fmt, SimNotice } from "@/components/ui";
import { gaussian, mulberry32, quantile } from "@/lib/demo-utils/rng";

interface Pool {
  units: number; unitCost: number; revenuePerUnitYr: number; utilization: number; utilVol: number; priceDecayYr: number; opexPct: number; residualPctAt5y: number;
}
const PRESETS: Record<"robots" | "gpus", { label: string; pool: Pool; unitLabel: string }> = {
  robots: { label: "Warehouse robot fleet", unitLabel: "robots", pool: { units: 40, unitCost: 250000, revenuePerUnitYr: 180000, utilization: 0.8, utilVol: 0.12, priceDecayYr: 0.03, opexPct: 0.25, residualPctAt5y: 0.25 } },
  gpus: { label: "GPU cluster (H100-class)", unitLabel: "GPUs", pool: { units: 1024, unitCost: 30000, revenuePerUnitYr: 2.1 * 8760, utilization: 0.72, utilVol: 0.18, priceDecayYr: 0.22, opexPct: 0.3, residualPctAt5y: 0.1 } },
};

interface Loan { ltv: number; ratePct: number; termMonths: number; reserveMonths: number }

function payment(P: number, r: number, n: number) {
  return r === 0 ? P / n : (P * r) / (1 - (1 + r) ** -n);
}

function simulate(pool: Pool, loan: Loan, paths = 2000, seed = 7) {
  const rand = mulberry32(seed);
  const assetValue = pool.units * pool.unitCost;
  const principal = assetValue * loan.ltv;
  const r = loan.ratePct / 100 / 12;
  const pmt = payment(principal, r, loan.termMonths);
  const months = loan.termMonths;
  const losses: number[] = [];
  const dscrs: number[] = [];
  let defaults = 0;
  const cfByMonth: number[][] = Array.from({ length: months }, () => []);
  for (let p = 0; p < paths; p++) {
    let util = pool.utilization;
    let reserve = pmt * loan.reserveMonths;
    let bal = principal;
    let minDscr = Infinity;
    let sumNoi = 0;
    let defaulted = false;
    for (let m = 0; m < months; m++) {
      util = Math.min(0.98, Math.max(0.05, util + 0.25 * (pool.utilization - util) + (pool.utilVol / Math.sqrt(12)) * gaussian(rand)));
      const price = (pool.revenuePerUnitYr / 12) * (1 - pool.priceDecayYr) ** (m / 12);
      const rev = pool.units * price * util;
      const noi = rev * (1 - pool.opexPct);
      sumNoi += noi;
      cfByMonth[m].push(noi - pmt);
      if ((m + 1) % 12 === 0 || m === months - 1) {
        minDscr = Math.min(minDscr, sumNoi / (pmt * ((m % 12) + 1)));
        sumNoi = 0;
      }
      reserve += noi - pmt;
      const interest = bal * r;
      bal -= pmt - interest;
      if (reserve < 0) {
        defaulted = true;
        const age = (m + 1) / 12;
        const residual = assetValue * Math.max(0.02, 1 - (1 - pool.residualPctAt5y) * Math.min(1, age / 5)) * (0.7 + 0.2 * rand());
        const loss = Math.max(0, bal - residual * 0.85);
        losses.push(loss / principal);
        break;
      }
    }
    if (defaulted) defaults++;
    else losses.push(0);
    dscrs.push(minDscr === Infinity ? 0 : minDscr);
  }
  const sortedL = [...losses].sort((a, b) => a - b);
  const el = losses.reduce((a, b) => a + b, 0) / paths;
  const seniorAttach = Math.max(0, 1 - quantile(sortedL, 0.995));
  const mezzAttach = Math.max(0, 1 - quantile(sortedL, 0.97));
  const fan = cfByMonth.map((arr, m) => {
    const s = [...arr].sort((a, b) => a - b);
    return { m: m + 1, p10: quantile(s, 0.1), p50: quantile(s, 0.5), p90: quantile(s, 0.9) };
  });
  const sortedD = [...dscrs].sort((a, b) => a - b);
  const hist: { bucket: string; n: number }[] = [];
  for (let b = 0; b < 12; b++) {
    const lo = b * 0.25, hi = lo + 0.25;
    hist.push({ bucket: lo.toFixed(2), n: dscrs.filter((d) => d >= lo && (b === 11 ? true : d < hi)).length });
  }
  return { principal, pmt, pd: defaults / paths, el, medianDscr: quantile(sortedD, 0.5), p5Dscr: quantile(sortedD, 0.05), seniorAttach, mezzAttach, fan, hist, assetValue };
}

export default function Steelyard() {
  const [kind, setKind] = useState<"robots" | "gpus">("robots");
  const [pool, setPool] = useState<Pool>(PRESETS.robots.pool);
  const [loan, setLoan] = useState<Loan>({ ltv: 0.75, ratePct: 11, termMonths: 48, reserveMonths: 3 });
  const [runId, setRunId] = useState(1);
  const [ran, setRan] = useState<{ pool: Pool; loan: Loan; seed: number } | null>(null);
  const res = useMemo(() => (ran ? simulate(ran.pool, ran.loan, 2000, ran.seed) : null), [ran]);
  const up = (p: Partial<Pool>) => setPool((x) => ({ ...x, ...p }));
  const run = () => { setRan({ pool, loan, seed: runId }); setRunId((n) => n + 1); };
  const isGpu = kind === "gpus";
  const senior = res ? Math.min(res.seniorAttach, 0.85) : 0;
  const mezz = res ? Math.max(0, Math.min(res.mezzAttach, 0.97) - senior) : 0;
  const equity = res ? 1 - senior - mezz : 0;
  const seniorRate = res ? 5.5 + res.el * 100 * 0.3 : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader title="Collateral pool" icon={isGpu ? <Cpu className="h-4 w-4" /> : <Bot className="h-4 w-4" />} />
          <div className="space-y-3 p-4">
            <Tabs tabs={[{ id: "robots", label: "Robots" }, { id: "gpus", label: "GPUs" }]} value={kind} onChange={(k) => { setKind(k); setPool(PRESETS[k].pool); setRan(null); }} />
            <div className="text-xs text-muted">{PRESETS[kind].label}</div>
            <Slider label={`Units (${PRESETS[kind].unitLabel})`} value={pool.units} min={isGpu ? 64 : 5} max={isGpu ? 8192 : 400} step={isGpu ? 64 : 5} onChange={(v) => up({ units: v })} />
            <Slider label="Cost per unit" value={pool.unitCost} min={isGpu ? 10000 : 50000} max={isGpu ? 50000 : 600000} step={isGpu ? 1000 : 10000} onChange={(v) => up({ unitCost: v })} format={fmt.usdShort} />
            {isGpu ? (
              <Slider label="Rental price ($/GPU-hr)" value={Math.round((pool.revenuePerUnitYr / 8760) * 100) / 100} min={0.5} max={5} step={0.05} onChange={(v) => up({ revenuePerUnitYr: v * 8760 })} format={(v) => `$${v.toFixed(2)}`} />
            ) : (
              <Slider label="Revenue per robot / yr at 100%" value={pool.revenuePerUnitYr} min={30000} max={600000} step={10000} onChange={(v) => up({ revenuePerUnitYr: v })} format={fmt.usdShort} />
            )}
            <Slider label="Avg utilization" value={pool.utilization} min={0.2} max={0.95} step={0.01} onChange={(v) => up({ utilization: v })} format={(v) => fmt.pct(v)} />
            <Slider label="Utilization volatility" value={pool.utilVol} min={0} max={0.5} step={0.01} onChange={(v) => up({ utilVol: v })} format={(v) => fmt.pct(v)} />
            <Slider label="Price decay / yr" value={pool.priceDecayYr} min={0} max={0.5} step={0.01} onChange={(v) => up({ priceDecayYr: v })} format={(v) => fmt.pct(v)} />
            <Slider label="Opex (% of revenue)" value={pool.opexPct} min={0.05} max={0.7} step={0.01} onChange={(v) => up({ opexPct: v })} format={(v) => fmt.pct(v)} />
          </div>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Loan terms" icon={<Landmark className="h-4 w-4" />} right={<Button onClick={run}><Play className="h-4 w-4" />Run 2,000 scenarios</Button>} />
            <div className="grid gap-4 p-4 md:grid-cols-4">
              <Slider label="Loan-to-value" value={loan.ltv} min={0.3} max={0.95} step={0.01} onChange={(v) => setLoan((l) => ({ ...l, ltv: v }))} format={(v) => fmt.pct(v)} />
              <Slider label="Interest rate" value={loan.ratePct} min={4} max={20} step={0.25} onChange={(v) => setLoan((l) => ({ ...l, ratePct: v }))} format={(v) => `${v}%`} />
              <Slider label="Term (months)" value={loan.termMonths} min={12} max={84} step={6} onChange={(v) => setLoan((l) => ({ ...l, termMonths: v }))} />
              <Slider label="Cash reserve (months)" value={loan.reserveMonths} min={0} max={12} onChange={(v) => setLoan((l) => ({ ...l, reserveMonths: v }))} />
            </div>
          </Card>
          {res ? (
            <div className="space-y-4" data-testid="underwriting-result">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <Stat label="Loan amount" value={fmt.usdShort(res.principal)} sub={`${fmt.usdShort(res.pmt)}/mo debt service`} />
                <Stat label="Default probability" value={fmt.pct(res.pd, 1)} tone={res.pd < 0.05 ? "good" : res.pd < 0.15 ? "warn" : "bad"} sub="over loan term" />
                <Stat label="Expected loss" value={fmt.pct(res.el, 2)} sub="% of principal" tone={res.el < 0.02 ? "good" : res.el < 0.06 ? "warn" : "bad"} />
                <Stat label="Median min-DSCR" value={`${res.medianDscr.toFixed(2)}x`} sub={`5th pct: ${res.p5Dscr.toFixed(2)}x`} tone={res.medianDscr >= 1.25 ? "good" : res.medianDscr >= 1 ? "warn" : "bad"} />
              </div>
              <Card>
                <CardHeader title="Monthly cash after debt service" subtitle="10th–90th percentile across scenarios" />
                <div className="h-56 p-2">
                  <ResponsiveContainer>
                    <AreaChart data={res.fan}>
                      <CartesianGrid stroke="#222633" strokeDasharray="3 3" />
                      <XAxis dataKey="m" stroke="#8b91a3" fontSize={11} />
                      <YAxis stroke="#8b91a3" fontSize={11} tickFormatter={(v) => fmt.usdShort(v)} />
                      <Tooltip contentStyle={{ background: "#0e1016", border: "1px solid #222633", fontSize: 12 }} formatter={(v) => fmt.usdShort(Number(v))} labelFormatter={(l) => `Month ${l}`} />
                      <Area dataKey="p90" stroke="none" fill="var(--accent)" fillOpacity={0.15} isAnimationActive={false} />
                      <Area dataKey="p50" stroke="var(--accent)" fill="none" isAnimationActive={false} />
                      <Area dataKey="p10" stroke="#f87171" fill="#07080b" fillOpacity={1} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader title="Min-DSCR distribution" subtitle="Worst annual debt-service coverage per scenario" />
                  <div className="h-48 p-2">
                    <ResponsiveContainer>
                      <BarChart data={res.hist}>
                        <XAxis dataKey="bucket" stroke="#8b91a3" fontSize={10} />
                        <YAxis stroke="#8b91a3" fontSize={10} />
                        <Tooltip contentStyle={{ background: "#0e1016", border: "1px solid #222633", fontSize: 12 }} />
                        <Bar dataKey="n" fill="var(--accent)" isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card>
                  <CardHeader title="Suggested capital stack" subtitle="Senior sized to survive the 99.5th pct loss" />
                  <div className="space-y-3 p-4">
                    <div className="flex h-8 overflow-hidden rounded-lg text-[11px] font-medium text-black">
                      <div className="grid place-items-center bg-emerald-400" style={{ width: `${senior * 100}%` }}>{senior > 0.1 && "Senior"}</div>
                      <div className="grid place-items-center bg-amber-400" style={{ width: `${mezz * 100}%` }}>{mezz > 0.08 && "Mezz"}</div>
                      <div className="grid place-items-center bg-rose-400" style={{ width: `${equity * 100}%` }}>{equity > 0.08 && "Equity"}</div>
                    </div>
                    <ul className="space-y-1 text-sm">
                      <li className="flex justify-between"><span>Senior ({fmt.pct(senior)})</span><span className="font-mono">{fmt.usdShort(res.principal * senior)} @ ~{seniorRate.toFixed(1)}%</span></li>
                      <li className="flex justify-between"><span>Mezzanine ({fmt.pct(mezz)})</span><span className="font-mono">{fmt.usdShort(res.principal * mezz)}</span></li>
                      <li className="flex justify-between"><span>First-loss ({fmt.pct(equity)})</span><span className="font-mono">{fmt.usdShort(res.principal * equity)}</span></li>
                    </ul>
                    <p className="text-xs text-muted">{res.pd < 0.05 ? "Pool looks financeable as an asset-backed facility." : res.pd < 0.15 ? "Financeable with tighter LTV or a bigger reserve." : "Too risky at these terms — lower LTV or extend reserve."}</p>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="grid h-48 place-items-center rounded-xl border border-dashed border-line text-sm text-muted">Set terms and run the simulation to underwrite the pool.</div>
          )}
          <SimNotice>Utilization paths are random (seeded) simulations; asset prices, rents and residual curves are illustrative assumptions. Not investment advice.</SimNotice>
        </div>
      </div>
    </div>
  );
}
