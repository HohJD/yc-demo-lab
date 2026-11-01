"use client";
import type { ComponentType } from "react";
import { AgentPipeline, ModelCalculator, QueueTriage, fmt } from "../kit/engines";
import { mulberry32, gaussian } from "@/lib/demo-utils/rng";

const usd = fmt.usdShort;

function backtest(v: Record<string, number>) {
  const r = mulberry32(42);
  const px: number[] = [100];
  for (let i = 1; i < 756; i++) { const regime = Math.floor(i / 126) % 2 ? 0.0006 : -0.0002; px.push(px[i - 1] * Math.exp(regime + 0.012 * gaussian(r))); }
  let eq = 1, pos = 0, peak = 1, mdd = 0; const rets: number[] = []; const series: Record<string, number>[] = [];
  for (let i = 1; i < px.length; i++) {
    const ret = px[i] / px[i - 1] - 1;
    const day = pos * ret; eq *= 1 + day; rets.push(day);
    peak = Math.max(peak, eq); mdd = Math.max(mdd, 1 - eq / peak);
    if (i >= v.look) { const mom = px[i] / px[i - v.look] - 1; const np = mom > v.th / 100 ? 1 : v.short && mom < -v.th / 100 ? -1 : 0; if (np !== pos) { eq *= 1 - (v.cost / 10000) * Math.abs(np - pos); pos = np; } }
    if (i % 21 === 0) series.push({ day: i, Strategy: +(eq * 100).toFixed(1), "Buy & hold": +px[i].toFixed(1) });
  }
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length, sd = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length);
  return { eq, sharpe: sd ? (mean / sd) * Math.sqrt(252) : 0, mdd, bh: px[px.length - 1] / 100, series };
}

const SCENE: Record<string, { objs: [string, number, number, number, number][]; q: string }> = {
  kitchen: { objs: [["fridge", 0, 0, 0.9, 0.8], ["island", 2.0, 1.5, 1.8, 1.0], ["oven", 3.6, 0, 0.8, 0.7]], q: "Can a robot 0.7 m wide pass between the fridge and the island?" },
  warehouse: { objs: [["rack A", 0, 0, 1.2, 10], ["rack B", 3.0, 0, 1.2, 10], ["pallet", 1.4, 4, 1.2, 1.0]], q: "Is the aisle between rack A and B wide enough for a 1.5 m forklift with the pallet there?" },
};
const gap = (a: [string, number, number, number, number], b: [string, number, number, number, number]) => {
  const dx = Math.max(0, b[1] - (a[1] + a[3]), a[1] - (b[1] + b[3])), dy = Math.max(0, b[2] - (a[2] + a[4]), a[2] - (b[2] + b[4]));
  return Math.hypot(dx, dy);
};

const C: Record<string, ComponentType> = {
  "cursor-for-product-managers": () => (
    <AgentPipeline title="Feedback → PRD → tickets" subtitle="Sample batch: 212 items"
      cases={[{ id: "b2b", label: "B2B analytics app", input: "212 items from Intercom, Gong, G2 (last 30 days)\n• 'Need to schedule reports to Slack' ×41\n• 'SSO is required by IT' ×28\n• 'Dashboards slow with >1M rows' ×36" }]}
      steps={[
        { name: "Cluster themes", actor: "Specwise", log: () => "1. Scheduled reports → Slack (41, $1.2M ARR)\n2. Large-dashboard performance (36, $2.1M ARR)\n3. SAML SSO (28, $0.9M ARR, 3 blocked deals)" },
        { name: "Prioritize by revenue", actor: "Specwise", log: () => "Rank: Performance > Scheduled reports > SSO (SSO unblocks pipeline)" },
        { name: "Pick bet", actor: "PM", gate: true, log: () => "Draft PRD for 'Large-dashboard performance'?" },
        { name: "Draft PRD", actor: "Specwise", log: () => "Problem, evidence (12 quotes), goals, non-goals, metrics" },
        { name: "Break into tickets", actor: "Specwise", log: () => "5 tickets with acceptance criteria → Linear" },
      ]}
      output={() => ({ title: "PRD: Fast dashboards at 10M rows", body: "Problem: 36 accounts ($2.1M ARR) report dashboards >8s at >1M rows.\nGoal: p95 render < 2s at 10M rows.\nNon-goals: real-time streaming.\nEvidence: 'we export to Excel because it's faster' — Acme (Gong 09/12)\n\nTickets\n1. Pre-aggregate rollups (5d)\n2. Query result cache (3d)\n3. Virtualized table rendering (3d)\n4. Perf telemetry dashboard (2d)\n5. Load test at 10M rows (2d)", stats: [{ label: "Themes", value: "3" }, { label: "ARR at stake", value: "$2.1M" }, { label: "Tickets", value: "5" }] })}
      notice="Clusters, PRD and tickets are scripted for the sample batch." />
  ),
  "ai-native-hedge-funds": () => (
    <ModelCalculator title="Momentum strategy backtest" subtitle="3 years of seeded synthetic daily prices" inputs={[
      { id: "look", label: "Lookback (days)", min: 5, max: 200, value: 60 },
      { id: "th", label: "Entry threshold (%)", min: 0, max: 20, step: 0.5, value: 2 },
      { id: "cost", label: "Trading cost (bps per trade)", min: 0, max: 50, value: 5 },
      { id: "short", label: "Allow shorts (0/1)", min: 0, max: 1, value: 0 },
    ]}
      compute={(v) => { const b = backtest(v); return { stats: [{ label: "Strategy return", value: fmt.pct(b.eq - 1), tone: b.eq > b.bh ? "good" : "bad" }, { label: "Buy & hold", value: fmt.pct(b.bh - 1) }, { label: "Sharpe", value: b.sharpe.toFixed(2), tone: b.sharpe > 1 ? "good" : undefined }, { label: "Max drawdown", value: fmt.pct(b.mdd), tone: b.mdd > 0.25 ? "bad" : undefined }], series: b.series, insight: "Try tuning lookback until it looks great — then remember: that's overfitting one synthetic path. Real research needs walk-forward tests." }; }}
      chart={{ x: "day", title: "Equity curve (start = 100)", lines: [{ key: "Strategy", color: "#4ade80" }, { key: "Buy & hold", color: "#8b91a3" }] }}
      notice="The backtest is real but runs on a synthetic price series; results say nothing about real markets. Not investment advice." />
  ),
  "ai-native-agencies": () => (
    <AgentPipeline title="Client brief" subtitle="AI-native creative pipeline"
      cases={[{ id: "coffee", label: "DTC coffee brand", input: "Brief: launch cold-brew cans to Gen Z on TikTok/IG. Budget $40k. KPI: CPA < $18." }, { id: "saas", label: "B2B SaaS", input: "Brief: LinkedIn ads for an expense tool aimed at CFOs. KPI: demo bookings." }]}
      steps={[
        { name: "Audience research", actor: "Research agent", log: (c) => (c.id === "coffee" ? "Top hooks: study sessions, gym, 'cheaper than café'" : "Top pains: month-end close, receipt chasing") },
        { name: "Concepts", actor: "Creative agent", log: () => "6 concepts → 40 variants (copy × visual × hook)" },
        { name: "Brand & policy check", actor: "Guardrail", log: () => "2 variants removed (claims), 38 pass" },
        { name: "Client approval", actor: "Client", gate: true, log: () => "Approve top 12 for launch?" },
        { name: "Launch & learn", actor: "Media agent", log: () => "Day-3 winners: 3 variants, budget shifted" },
      ]}
      output={(c) => ({ title: "Delivery report", body: c.id === "coffee" ? "Winning hook: 'Your 2am study buddy is $1.80'\nPredicted CPA: $14.20 (target $18)\nTeam time: 3h human review" : "Winning hook: 'Close the month in 2 days, not 10'\nPredicted cost/demo: $210\nTeam time: 2h human review", stats: [{ label: "Variants made", value: "40" }, { label: "Human hours", value: c.id === "coffee" ? "3" : "2", tone: "good" }] })}
      notice="Scripted walkthrough: no generation or ad platforms are used and performance figures are illustrative." />
  ),
  "stablecoin-financial-services": () => (
    <ModelCalculator title="Business treasury on stablecoins" inputs={[
      { id: "bal", label: "Average idle balance ($k)", min: 50, max: 50000, step: 50, value: 2000 },
      { id: "bank", label: "Bank yield (%)", min: 0, max: 5, step: 0.1, value: 0.5 },
      { id: "sc", label: "Tokenized T-bill / stablecoin yield (%)", min: 0, max: 6, step: 0.1, value: 4 },
      { id: "pay", label: "Cross-border payables / month ($k)", min: 0, max: 5000, step: 10, value: 400 },
      { id: "fx", label: "Bank FX + wire cost (%)", min: 0, max: 4, step: 0.1, value: 1.5 },
      { id: "ramp", label: "Stablecoin ramp cost (%)", min: 0, max: 2, step: 0.05, value: 0.3 },
    ]}
      compute={(v) => { const y = (v.bal * 1000 * (v.sc - v.bank)) / 100, f = (v.pay * 1000 * 12 * (v.fx - v.ramp)) / 100; return { stats: [{ label: "Extra yield / yr", value: usd(y), tone: "good" }, { label: "Payment savings / yr", value: usd(f), tone: "good" }, { label: "Total benefit / yr", value: usd(y + f), tone: "good" }, { label: "Settlement", value: "minutes vs 1–3 days" }], series: [{ item: "Yield", Benefit: Math.round(y) }, { item: "Payments", Benefit: Math.round(f) }] }; }}
      chart={{ x: "item", type: "bar", title: "Annual benefit breakdown", lines: [{ key: "Benefit", color: "#c084fc" }], yFormat: usd }}
      notice="Illustrative rates; stablecoin and tokenized-fund yields carry counterparty and regulatory risk." />
  ),
  "ai-for-government": () => (
    <QueueTriage title="Business licence applications" subtitle="Fictional · submitted today" itemNoun="application" actionHigh="Caseworker" actionLow="Auto-approve" threshold={30}
      items={[
        { id: "a1", title: "Rosa's Tacos LLC", detail: "Food vendor licence", fields: { docsComplete: true, addrMatch: true, ein: true, priorViolations: 0, duplicate: false, aiFilledMismatch: false } },
        { id: "a2", title: "QuickFix Auto", detail: "Repair shop", fields: { docsComplete: false, addrMatch: true, ein: true, priorViolations: 0, duplicate: false, aiFilledMismatch: false } },
        { id: "a3", title: "Sunrise Daycare", detail: "Childcare licence", fields: { docsComplete: true, addrMatch: false, ein: true, priorViolations: 2, duplicate: false, aiFilledMismatch: true } },
        { id: "a4", title: "Bean There Café", detail: "Food service", fields: { docsComplete: true, addrMatch: true, ein: true, priorViolations: 0, duplicate: true, aiFilledMismatch: false } },
        { id: "a5", title: "Lin Consulting", detail: "Home occupation", fields: { docsComplete: true, addrMatch: true, ein: true, priorViolations: 0, duplicate: false, aiFilledMismatch: false } },
      ]}
      rules={[
        { id: "docs", label: "Missing required documents", weight: 35, test: (f) => f.docsComplete === false },
        { id: "addr", label: "Address doesn't match property records", weight: 25, test: (f) => f.addrMatch === false },
        { id: "viol", label: "Prior violations", weight: 20, test: (f) => Number(f.priorViolations) > 0 },
        { id: "dup", label: "Possible duplicate submission", weight: 30, test: (f) => f.duplicate === true },
        { id: "ai", label: "AI-filled fields contradict attachments", weight: 25, test: (f) => f.aiFilledMismatch === true },
      ]}
      impact={(fl, all) => [{ label: "Auto-approved", value: `${all.length - fl.length}/${all.length}`, tone: "good" }, { label: "Caseworker queue", value: String(fl.length) }]}
      notice="Fictional applications; rules are illustrative. Real systems need due process and appeal rights." />
  ),
  "modern-metal-mills": () => (
    <ModelCalculator title="EAF micro-mill" inputs={[
      { id: "cap", label: "Capacity (kt/yr)", min: 50, max: 1000, step: 10, value: 350 },
      { id: "util", label: "Utilization (%)", min: 30, max: 100, value: 80 },
      { id: "price", label: "Rebar price ($/t)", min: 400, max: 1200, step: 10, value: 820 },
      { id: "scrap", label: "Scrap price ($/t)", min: 200, max: 600, step: 10, value: 380 },
      { id: "kwh", label: "Electricity (kWh/t)", min: 300, max: 700, step: 10, value: 450 },
      { id: "power", label: "Power price ($/MWh)", min: 20, max: 150, value: 65 },
      { id: "fixed", label: "Fixed costs ($M/yr)", min: 10, max: 200, value: 45 },
    ]}
      compute={(v) => { const t = v.cap * 1000 * (v.util / 100); const varCost = v.scrap * 1.1 + (v.kwh * v.power) / 1000 + 60; const ebitda = t * (v.price - varCost) - v.fixed * 1e6; const be = (v.fixed * 1e6) / Math.max(v.price - varCost, 1) / (v.cap * 1000); return { stats: [{ label: "Output", value: `${fmt.num(Math.round(t / 1000))} kt` }, { label: "Variable cost / t", value: `$${varCost.toFixed(0)}` }, { label: "EBITDA", value: usd(ebitda), tone: ebitda > 0 ? "good" : "bad" }, { label: "Breakeven utilization", value: fmt.pct(be), tone: be < 0.7 ? "good" : "warn" }], series: [40, 50, 60, 70, 80, 90, 100].map((u) => ({ util: `${u}%`, EBITDA: Math.round(v.cap * 1000 * (u / 100) * (v.price - varCost) - v.fixed * 1e6) })) }; }}
      chart={{ x: "util", type: "bar", title: "EBITDA vs utilization", lines: [{ key: "EBITDA", color: "#fdba74" }], yFormat: usd }}
      notice="Assumes 1.1 t scrap per t steel and $60/t other consumables. Defaults are illustrative." />
  ),
  "ai-guidance-for-physical-work": () => (
    <AgentPipeline title="Guided task" subtitle="Camera-verified steps"
      cases={[{ id: "faucet", label: "Replace faucet cartridge", input: "Task: replace a single-handle kitchen faucet cartridge (Moen 1225)." }, { id: "breaker", label: "Swap light switch", input: "Task: replace a single-pole light switch." }]}
      steps={[
        { name: "Safety first", actor: "Coach", gate: true, log: (c) => (c.id === "faucet" ? "Shut off both supply valves under the sink. Confirm when done." : "Switch the breaker OFF and verify with a non-contact tester. Confirm.") },
        { name: "Step 1 · Remove handle", actor: "Vision (simulated)", log: (c) => (c.id === "faucet" ? "Detected: handle removed, retaining clip visible ✓" : "Detected: cover plate removed ✓") },
        { name: "Step 2 · Extract part", actor: "Vision (simulated)", log: (c) => (c.id === "faucet" ? "Clip pulled up ✓ · cartridge orientation noted (hot = left)" : "Wires: black ×2, ground ✓") },
        { name: "Step 3 · Install new", actor: "Vision (simulated)", log: (c) => (c.id === "faucet" ? "⚠ Cartridge rotated 180° — fix before continuing" : "Wires on screws clockwise ✓") },
        { name: "Step 4 · Test", actor: "Coach", log: () => "Restore supply; check for leaks/function" },
      ]}
      output={(c) => ({ title: "Job complete", body: c.id === "faucet" ? "4 steps · 1 correction caught (reversed cartridge would swap hot/cold).\nTime: 18 min (est. 45 min unguided)." : "4 steps · 0 corrections · 12 min.", stats: [{ label: "Corrections caught", value: c.id === "faucet" ? "1" : "0", tone: "good" }] })}
      notice="Vision checks are simulated text; no camera is used. Illustrative only — follow local codes and safety practice." />
  ),
  "large-spatial-models": () => (
    <AgentPipeline title="Spatial question" subtitle="Scene geometry (metres)"
      cases={Object.entries(SCENE).map(([id, s]) => ({ id, label: id, input: `${s.q}\n\nObjects (name, x, y, w, d):\n${s.objs.map((o) => o.join(", ")).join("\n")}` }))}
      steps={[
        { name: "Reconstruct scene", actor: "Spatial model (stub)", log: (c) => `${SCENE[c.id].objs.length} objects localized` },
        { name: "Compute clearances", actor: "Geometry", log: (c) => { const o = SCENE[c.id].objs; return `${o[0][0]} ↔ ${o[1][0]}: ${gap(o[0], o[1]).toFixed(2)} m\n${o[1][0]} ↔ ${o[2][0]}: ${gap(o[1], o[2]).toFixed(2)} m`; } },
        { name: "Answer", actor: "Reasoner", log: () => "Compare clearance to required width + 10% margin" },
      ]}
      output={(c) => { const o = SCENE[c.id].objs; const g = c.id === "kitchen" ? gap(o[0], o[1]) : Math.min(o[1][1] - (o[0][1] + o[0][3]), o[2][1] - (o[0][1] + o[0][3])); const need = c.id === "kitchen" ? 0.77 : 1.65; return { title: "Answer", body: `Clearance: ${g.toFixed(2)} m · required: ${need.toFixed(2)} m\n→ ${g >= need ? "Yes, it fits." : "No — blocked. Move the obstacle or choose another path."}`, stats: [{ label: "Fits?", value: g >= need ? "Yes" : "No", tone: g >= need ? "good" : "bad" }] }; }}
      notice="Scenes are hand-specified boxes; the clearance math is real. No learned spatial model runs." />
  ),
  "infra-for-government-fraud-hunters": () => (
    <QueueTriage title="Provider billing anomalies" subtitle="Fictional providers · 12 months" itemNoun="provider" actionHigh="Investigate" actionMid="Monitor" actionLow="Normal" threshold={45}
      items={[
        { id: "p1", title: "Dr. A (internal medicine)", detail: "Billed 26 hrs/day on 14 days", fields: { maxHoursDay: 26, level5Pct: 72, peerZ: 4.1, deceasedPatients: 0, sameAddrProviders: 1 } },
        { id: "p2", title: "Clinic B", detail: "Typical profile", fields: { maxHoursDay: 9, level5Pct: 18, peerZ: 0.4, deceasedPatients: 0, sameAddrProviders: 1 } },
        { id: "p3", title: "DME Supplier C", detail: "Claims for 3 deceased patients", fields: { maxHoursDay: 0, level5Pct: 0, peerZ: 3.2, deceasedPatients: 3, sameAddrProviders: 7 } },
        { id: "p4", title: "Lab D", detail: "Volume 2.2σ above peers", fields: { maxHoursDay: 0, level5Pct: 0, peerZ: 2.2, deceasedPatients: 0, sameAddrProviders: 1 } },
        { id: "p5", title: "Dr. E (cardiology)", detail: "High-complexity visits 55%", fields: { maxHoursDay: 11, level5Pct: 55, peerZ: 1.1, deceasedPatients: 0, sameAddrProviders: 2 } },
      ]}
      rules={[
        { id: "hours", label: "Impossible day (>24 billed hours)", weight: 35, test: (f) => Number(f.maxHoursDay) > 24 },
        { id: "upcode", label: "Upcoding: >50% highest-level visits", weight: 20, test: (f) => Number(f.level5Pct) > 50 },
        { id: "peer", label: "Peer outlier (z > 3)", weight: 20, test: (f) => Number(f.peerZ) > 3 },
        { id: "dead", label: "Services after patient death", weight: 35, test: (f) => Number(f.deceasedPatients) > 0 },
        { id: "addr", label: "≥5 providers at one address", weight: 15, test: (f) => Number(f.sameAddrProviders) >= 5 },
      ]}
      impact={(fl) => [{ label: "Leads to investigate", value: String(fl.length) }, { label: "Note", value: "Leads ≠ fraud" }]}
      notice="Fictional providers. Flags are investigative leads only, not findings of wrongdoing." />
  ),
  "make-llms-easy-to-train": () => (
    <ModelCalculator title="Training run planner" inputs={[
      { id: "params", label: "Parameters (B)", min: 0.1, max: 400, step: 0.1, value: 8 },
      { id: "tokens", label: "Training tokens (B)", min: 1, max: 20000, step: 1, value: 1000 },
      { id: "gpus", label: "GPUs", min: 1, max: 16384, step: 1, value: 256 },
      { id: "tflops", label: "Peak BF16 dense TFLOPs / GPU (≈989 H100)", min: 100, max: 2500, step: 1, value: 989 },
      { id: "mfu", label: "MFU (%)", min: 10, max: 70, value: 40 },
      { id: "rate", label: "$ / GPU-hour", min: 0.5, max: 10, step: 0.1, value: 2.5, format: (v) => `$${v.toFixed(1)}` },
    ]}
      compute={(v) => { const flops = 6 * v.params * 1e9 * v.tokens * 1e9; const perGpu = v.tflops * 1e12 * (v.mfu / 100); const gpuHours = flops / perGpu / 3600; const days = gpuHours / v.gpus / 24; return { stats: [{ label: "Total FLOPs", value: flops.toExponential(2) }, { label: "GPU-hours", value: fmt.num(Math.round(gpuHours)) }, { label: "Wall-clock", value: `${days.toFixed(1)} days` }, { label: "Compute cost", value: usd(gpuHours * v.rate) }], series: [64, 128, 256, 512, 1024, 2048].map((g) => ({ gpus: g, Days: +(gpuHours / g / 24).toFixed(1) })), insight: `Chinchilla-optimal tokens for ${v.params}B params ≈ ${fmt.num(Math.round(v.params * 20))}B.` }; }}
      chart={{ x: "gpus", title: "Days to train vs GPU count", lines: [{ key: "Days", color: "#22d3ee" }] }}
      notice="Uses the ~6·N·D approximation; ignores restarts, evals and data-pipeline overhead." />
  ),
};
export default C;
