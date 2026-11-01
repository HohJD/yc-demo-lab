"use client";
import type { ComponentType } from "react";
import { AgentPipeline, ModelCalculator, QueueTriage, WeightedRanker, fmt } from "../kit/engines";

const usd = fmt.usdShort;
const MAT: Record<number, { name: string; E: number; fy: number }> = { 1: { name: "Steel", E: 200e9, fy: 250e6 }, 2: { name: "Aluminum 6061", E: 69e9, fy: 240e6 }, 3: { name: "Timber (GL24)", E: 11.5e9, fy: 24e6 } };

const C: Record<string, ComponentType> = {
  "government-software": () => (
    <ModelCalculator title="Pursuit expected value" inputs={[
      { id: "val", label: "Contract value per year ($M)", min: 0.1, max: 100, step: 0.1, value: 4 },
      { id: "years", label: "Years (incl. options)", min: 1, max: 10, value: 5 },
      { id: "win", label: "Win probability (%)", min: 1, max: 90, value: 25 },
      { id: "cost", label: "Pursuit cost ($k)", min: 5, max: 2000, step: 5, value: 150 },
      { id: "cycle", label: "Sales cycle (months)", min: 1, max: 36, value: 14 },
      { id: "margin", label: "Gross margin (%)", min: 5, max: 90, value: 60 },
    ]}
      compute={(v) => { const gp = v.val * 1e6 * v.years * (v.margin / 100); const ev = (v.win / 100) * gp - v.cost * 1000; const disc = ev / Math.pow(1.15, v.cycle / 12); return { stats: [{ label: "Gross profit if won", value: usd(gp) }, { label: "Expected value", value: usd(ev), tone: ev > 0 ? "good" : "bad" }, { label: "Discounted EV (15%/yr)", value: usd(disc), tone: disc > 0 ? "good" : "bad" }, { label: "EV / pursuit $", value: `${(ev / (v.cost * 1000)).toFixed(1)}x` }], series: [5, 10, 20, 30, 50, 70].map((w) => ({ win: `${w}%`, EV: Math.round((w / 100) * gp - v.cost * 1000) })) }; }}
      chart={{ x: "win", type: "bar", title: "Expected value vs win probability", lines: [{ key: "EV", color: "#38bdf8" }], yFormat: usd }}
      notice="Expected-value math only; ignores option-exercise risk and protests." />
  ),
  "public-safety-technology": () => (
    <QueueTriage title="Incoming 911 calls" subtitle="Fictional · last 10 minutes" itemNoun="call" actionHigh="Priority 1" actionMid="Priority 2" actionLow="Non-emergency line" threshold={50}
      items={[
        { id: "k1", title: "Shots heard, Elm St", detail: "Caller hiding, in progress", fields: { weapon: true, injury: false, inProgress: true, repeat: false, noise: false } },
        { id: "k2", title: "Loud party, 5th Ave", detail: "Third call this week", fields: { weapon: false, injury: false, inProgress: true, repeat: true, noise: true } },
        { id: "k3", title: "Car crash, I-80 exit 12", detail: "Driver bleeding", fields: { weapon: false, injury: true, inProgress: false, repeat: false, noise: false } },
        { id: "k4", title: "Stolen bike report", detail: "Happened yesterday", fields: { weapon: false, injury: false, inProgress: false, repeat: false, noise: false } },
        { id: "k5", title: "Domestic dispute", detail: "Yelling, prior calls at address", fields: { weapon: false, injury: false, inProgress: true, repeat: true, noise: false } },
      ]}
      rules={[
        { id: "w", label: "Weapon mentioned", weight: 50, test: (f) => f.weapon === true },
        { id: "inj", label: "Injury", weight: 40, test: (f) => f.injury === true },
        { id: "ip", label: "In progress", weight: 20, test: (f) => f.inProgress === true },
        { id: "rep", label: "Repeat address", weight: 15, test: (f) => f.repeat === true },
        { id: "noise", label: "Noise complaint", weight: -20, test: (f) => f.noise === true },
      ]}
      impact={(fl, all) => [{ label: "Dispatched now", value: String(fl.length) }, { label: "Diverted", value: String(all.length - fl.length) }]}
      notice="Fictional calls; suggestions only — dispatchers decide." />
  ),
  "manufacture-in-the-usa": () => (
    <ModelCalculator title="Landed unit cost" inputs={[
      { id: "off", label: "Overseas ex-works unit cost ($)", min: 1, max: 500, step: 0.5, value: 42 },
      { id: "tariff", label: "Tariff (%)", min: 0, max: 150, value: 25 },
      { id: "freight", label: "Freight + duties handling per unit ($)", min: 0, max: 50, step: 0.5, value: 4.5 },
      { id: "lead", label: "Overseas lead time (weeks)", min: 2, max: 26, value: 10 },
      { id: "us", label: "US manual unit cost ($)", min: 1, max: 800, step: 0.5, value: 78 },
      { id: "auto", label: "Automation labor reduction (%)", min: 0, max: 90, value: 55 },
      { id: "laborShare", label: "Labor share of US cost (%)", min: 10, max: 80, value: 50 },
      { id: "vol", label: "Annual units (k)", min: 1, max: 1000, value: 100 },
    ]}
      compute={(v) => { const landed = v.off * (1 + v.tariff / 100) + v.freight; const us = v.us * (1 - (v.laborShare / 100) * (v.auto / 100)); const wcOff = (landed * v.vol * 1000 * v.lead) / 52; const wcUs = (us * v.vol * 1000 * 2) / 52; return { stats: [{ label: "Overseas landed", value: `$${landed.toFixed(2)}` }, { label: "Automated US", value: `$${us.toFixed(2)}`, tone: us < landed ? "good" : "warn" }, { label: "Annual difference", value: usd((landed - us) * v.vol * 1000), tone: us < landed ? "good" : "bad" }, { label: "Inventory in transit", value: `${usd(wcOff)} vs ${usd(wcUs)}` }], series: [0, 10, 25, 50, 100, 145].map((t) => ({ tariff: `${t}%`, Overseas: +(v.off * (1 + t / 100) + v.freight).toFixed(2), US: +us.toFixed(2) })) }; }}
      chart={{ x: "tariff", title: "Unit cost vs tariff", lines: [{ key: "Overseas", color: "#f87171" }, { key: "US", color: "#34d399" }] }}
      notice="Assumes 2-week US pipeline inventory; excludes automation capex amortization." />
  ),
  "stablecoins-2-0": () => (
    <ModelCalculator title="Merchant payments" inputs={[
      { id: "vol", label: "Monthly volume ($k)", min: 10, max: 50000, step: 10, value: 1500 },
      { id: "card", label: "Card cost (%)", min: 1, max: 5, step: 0.05, value: 2.9 },
      { id: "sc", label: "Stablecoin cost (%)", min: 0, max: 2, step: 0.05, value: 0.5 },
      { id: "adopt", label: "Share paid in stablecoin (%)", min: 0, max: 100, value: 15 },
      { id: "days", label: "Card settlement days", min: 1, max: 7, value: 2 },
    ]}
      compute={(v) => { const shifted = v.vol * 1000 * (v.adopt / 100); const save = (shifted * (v.card - v.sc)) / 100; const freed = (shifted * 12 / 365) * v.days; return { stats: [{ label: "Monthly savings", value: usd(save), tone: "good" }, { label: "Annual savings", value: usd(save * 12), tone: "good" }, { label: "Cash freed by instant settlement", value: usd(freed) }], series: [0, 10, 25, 50, 75, 100].map((a) => ({ adoption: `${a}%`, Savings: Math.round(((v.vol * 1000 * (a / 100)) * (v.card - v.sc)) / 100 * 12) })) }; }}
      chart={{ x: "adoption", type: "bar", title: "Annual savings vs adoption", lines: [{ key: "Savings", color: "#c084fc" }], yFormat: usd }}
      notice="Illustrative fees; ignores off-ramp FX and refunds handling." />
  ),
  "llms-for-chip-design": () => (
    <AgentPipeline title="Block spec" subtitle="RTL agent loop"
      cases={[{ id: "fifo", label: "8-deep sync FIFO", input: "Spec: synchronous FIFO, 8 entries × 32 bits, full/empty flags, single clock, active-low reset." }]}
      steps={[
        { name: "Write RTL", actor: "RTL agent", log: () => "module fifo #(W=32,D=8)(input clk,rst_n,wr,rd, input [W-1:0] din, output [W-1:0] dout, output full,empty);\n  reg [2:0] wp, rp; reg [3:0] cnt; …" },
        { name: "Lint", actor: "Verilator (scripted)", log: () => "%Warning-WIDTH: cnt compared to 8 (4-bit) ✓ fixed" },
        { name: "Testbench", actor: "Verif agent", log: () => "Random wr/rd, scoreboard, 10k cycles" },
        { name: "Simulate", actor: "Simulator (scripted)", log: () => "FAIL @ cycle 1,204: simultaneous wr+rd when full drops data" },
        { name: "Fix", actor: "RTL agent", log: () => "Allow write when full && rd (count unchanged)" },
        { name: "Re-simulate", actor: "Simulator (scripted)", log: () => "PASS 10,000 cycles · coverage 97%" },
      ]}
      output={() => ({ title: "Result", body: "fifo.sv: 48 lines · lint clean · 10k-cycle random test passes · functional coverage 97%\nBug caught: full + simultaneous read/write corner case.", stats: [{ label: "Iterations", value: "2" }, { label: "Coverage", value: "97%", tone: "good" }] })}
      notice="RTL excerpts and simulator output are scripted examples." />
  ),
  "fintech-2-0": () => (
    <QueueTriage title="SMB loan applications" subtitle="Fictional · cash-flow underwriting" itemNoun="application" actionHigh="Decline / manual" actionMid="Smaller offer" actionLow="Approve" threshold={40}
      items={[
        { id: "l1", title: "Corner Bakery", detail: "$40k request · 4 yrs", fields: { dscr: 1.8, volatility: 12, nsf: 0, months: 48, concentration: 10 } },
        { id: "l2", title: "Fresh Fleet Logistics", detail: "$150k · 1 yr", fields: { dscr: 1.1, volatility: 35, nsf: 3, months: 14, concentration: 60 } },
        { id: "l3", title: "Bright Dental", detail: "$90k · 6 yrs", fields: { dscr: 2.4, volatility: 8, nsf: 0, months: 72, concentration: 5 } },
        { id: "l4", title: "Pop-up Apparel", detail: "$25k · 8 months", fields: { dscr: 1.3, volatility: 55, nsf: 1, months: 8, concentration: 30 } },
      ]}
      rules={[
        { id: "dscr", label: "DSCR < 1.25", weight: 35, test: (f) => Number(f.dscr) < 1.25 },
        { id: "vol", label: "Revenue volatility > 30%", weight: 20, test: (f) => Number(f.volatility) > 30 },
        { id: "nsf", label: "NSF events in 90 days", weight: 20, test: (f) => Number(f.nsf) > 0 },
        { id: "age", label: "< 12 months of history", weight: 20, test: (f) => Number(f.months) < 12 },
        { id: "conc", label: "Customer concentration > 50%", weight: 15, test: (f) => Number(f.concentration) > 50 },
      ]}
      impact={(fl, all) => [{ label: "Auto-approved", value: `${all.length - fl.length}/${all.length}`, tone: "good" }]}
      notice="Fictional applicants; real lending needs fair-lending compliance and adverse-action notices." />
  ),
  "new-space-companies": () => (
    <ModelCalculator title="Constellation economics" inputs={[
      { id: "n", label: "Satellites", min: 1, max: 500, value: 24 },
      { id: "mass", label: "Mass per satellite (kg)", min: 1, max: 1000, value: 150 },
      { id: "launch", label: "Launch $/kg", min: 1000, max: 30000, step: 500, value: 6000 },
      { id: "build", label: "Build cost per satellite ($M)", min: 0.1, max: 50, step: 0.1, value: 2.5 },
      { id: "rev", label: "Revenue per satellite ($M/yr)", min: 0.1, max: 20, step: 0.1, value: 1.8 },
      { id: "life", label: "Lifetime (years)", min: 1, max: 15, value: 5 },
    ]}
      compute={(v) => { const capex = v.n * (v.build * 1e6 + v.mass * v.launch); const rev = v.n * v.rev * 1e6; const payback = capex / rev; return { stats: [{ label: "Capex", value: usd(capex) }, { label: "Launch share", value: fmt.pct((v.n * v.mass * v.launch) / capex) }, { label: "Revenue / yr", value: usd(rev) }, { label: "Payback", value: `${payback.toFixed(1)} yrs`, tone: payback < v.life ? "good" : "bad", sub: `lifetime ${v.life} yrs` }], series: [30000, 15000, 10000, 6000, 3000, 1500].map((l) => ({ launch: `$${l / 1000}k`, Payback: +((v.n * (v.build * 1e6 + v.mass * l)) / rev).toFixed(2) })) }; }}
      chart={{ x: "launch", type: "bar", title: "Payback years vs launch $/kg", lines: [{ key: "Payback", color: "#60a5fa" }] }}
      notice="Excludes ground segment, opex and insurance." />
  ),
  "ai-aided-engineering-tools": () => (
    <ModelCalculator title="Simply supported beam, uniform load" inputs={[
      { id: "mat", label: "Material (1 Steel · 2 Aluminum · 3 Timber)", min: 1, max: 3, value: 1, format: (v) => MAT[v].name },
      { id: "L", label: "Span (m)", min: 1, max: 15, step: 0.1, value: 6 },
      { id: "w", label: "Uniform load (kN/m)", min: 0.5, max: 50, step: 0.5, value: 8 },
      { id: "b", label: "Section width b (mm)", min: 20, max: 400, value: 100 },
      { id: "h", label: "Section depth h (mm)", min: 50, max: 800, step: 5, value: 300 },
    ]}
      compute={(v) => { const m = MAT[v.mat]; const b = v.b / 1000, h = v.h / 1000, L = v.L, w = v.w * 1000; const I = (b * h ** 3) / 12; const d = (5 * w * L ** 4) / (384 * m.E * I); const M = (w * L * L) / 8; const s = (M * (h / 2)) / I; const lim = L / 360; const util = Math.max(d / lim, s / m.fy); return { stats: [{ label: "Deflection", value: `${(d * 1000).toFixed(1)} mm`, sub: `limit L/360 = ${(lim * 1000).toFixed(1)} mm`, tone: d <= lim ? "good" : "bad" }, { label: "Bending stress", value: `${(s / 1e6).toFixed(1)} MPa`, sub: `yield ${(m.fy / 1e6).toFixed(0)} MPa`, tone: s <= m.fy ? "good" : "bad" }, { label: "Max moment", value: `${(M / 1000).toFixed(1)} kN·m` }, { label: "Utilization", value: fmt.pct(util), tone: util <= 1 ? "good" : "bad" }], series: Array.from({ length: 11 }, (_, i) => { const x = (L * i) / 10; return { x: `${x.toFixed(1)}m`, "Deflection mm": +(((w * x) / (24 * m.E * I)) * (L ** 3 - 2 * L * x * x + x ** 3) * 1000).toFixed(2) }; }) }; }}
      chart={{ x: "x", title: "Deflected shape (mm)", lines: [{ key: "Deflection mm", color: "#fdba74" }] }}
      notice="Textbook formulas for a solid rectangular section without safety factors or code checks — not for real design." />
  ),
  "one-million-jobs-2-0": () => (
    <WeightedRanker title="AI-assisted work for Sam (no degree)" subtitle="Illustrative job types" pickLabel="Best match"
      criteria={[{ id: "pay", label: "Hourly pay", weight: 8 }, { id: "flex", label: "Schedule flexibility", weight: 6 }, { id: "train", label: "Training needed", weight: 5, invert: true }, { id: "demand", label: "Demand", weight: 7 }, { id: "ai", label: "AI leverage", weight: 4 }]}
      options={[{ name: "AI-assisted home energy auditor", scores: { pay: 7, flex: 6, train: 5, demand: 7, ai: 8 }, note: "$32/hr" }, { name: "Remote insurance claims adjuster (copilot)", scores: { pay: 6, flex: 8, train: 4, demand: 8, ai: 9 }, note: "$28/hr" }, { name: "Delivery driver", scores: { pay: 4, flex: 9, train: 1, demand: 8, ai: 2 }, note: "$20/hr" }, { name: "AI model trainer (domain tasks)", scores: { pay: 6, flex: 10, train: 3, demand: 6, ai: 7 }, note: "$25/hr" }]}
      notice="Illustrative scores and pay." />
  ),
};
export default C;
