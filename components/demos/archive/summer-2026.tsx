"use client";
import type { ComponentType } from "react";
import { AgentPipeline, ExplainableScorer, ModelCalculator, WeightedRanker, fmt } from "../kit/engines";

const usd = fmt.usdShort;

const DATA = {
  deals: [
    { rep: "Ana", region: "EMEA", amount: 42000, stage: "won", q: "Q2" }, { rep: "Ben", region: "NA", amount: 18000, stage: "won", q: "Q2" },
    { rep: "Ana", region: "EMEA", amount: 65000, stage: "open", q: "Q3" }, { rep: "Cho", region: "APAC", amount: 30000, stage: "won", q: "Q3" },
    { rep: "Ben", region: "NA", amount: 91000, stage: "won", q: "Q3" }, { rep: "Cho", region: "APAC", amount: 12000, stage: "lost", q: "Q3" },
    { rep: "Dev", region: "NA", amount: 54000, stage: "won", q: "Q3" }, { rep: "Dev", region: "NA", amount: 23000, stage: "open", q: "Q3" },
  ],
  tickets: [{ product: "Billing", days: 1.2 }, { product: "Billing", days: 3.5 }, { product: "API", days: 0.4 }, { product: "API", days: 0.9 }, { product: "Mobile", days: 5.1 }, { product: "Mobile", days: 2.2 }],
};
const QUERIES: Record<string, { sql: string; run: () => string }> = {
  q3: { sql: "SELECT SUM(amount) FROM deals WHERE stage='won' AND quarter='Q3'", run: () => usd(DATA.deals.filter((d) => d.stage === "won" && d.q === "Q3").reduce((s, d) => s + d.amount, 0)) },
  rep: { sql: "SELECT rep, SUM(amount) FROM deals WHERE stage='won' GROUP BY rep ORDER BY 2 DESC LIMIT 1", run: () => { const m = new Map<string, number>(); DATA.deals.filter((d) => d.stage === "won").forEach((d) => m.set(d.rep, (m.get(d.rep) ?? 0) + d.amount)); const [r, v] = [...m].sort((a, b) => b[1] - a[1])[0]; return `${r} (${usd(v)})`; } },
  tix: { sql: "SELECT product, AVG(days_to_close) FROM tickets GROUP BY product ORDER BY 2 DESC", run: () => { const m = new Map<string, number[]>(); DATA.tickets.forEach((t) => m.set(t.product, [...(m.get(t.product) ?? []), t.days])); return [...m].map(([p, d]) => [p, d.reduce((a, b) => a + b, 0) / d.length] as const).sort((a, b) => b[1] - a[1]).map(([p, a]) => `${p}: ${a.toFixed(2)} days`).join("\n"); } },
};

const C: Record<string, ComponentType> = {
  "ai-for-low-pesticide-agriculture": () => (
    <ModelCalculator title="Spot-spray vs broadcast" inputs={[
      { id: "acres", label: "Acres", min: 100, max: 20000, step: 100, value: 2500 },
      { id: "cover", label: "Weed coverage (% of field)", min: 1, max: 60, value: 12 },
      { id: "recall", label: "Detection recall (%)", min: 70, max: 99.5, step: 0.5, value: 95 },
      { id: "chem", label: "Herbicide cost ($/acre broadcast)", min: 5, max: 60, value: 28 },
      { id: "passes", label: "Passes per season", min: 1, max: 5, value: 2 },
      { id: "loss", label: "Yield loss per missed-weed acre ($)", min: 0, max: 400, step: 10, value: 120 },
    ]}
      compute={(v) => {
        const broadcast = v.acres * v.chem * v.passes;
        const spot = v.acres * (v.cover / 100) * 1.3 * v.chem * v.passes;
        const missed = v.acres * (v.cover / 100) * (1 - v.recall / 100) * v.loss;
        return { stats: [{ label: "Broadcast cost", value: usd(broadcast) }, { label: "Spot-spray cost", value: usd(spot), tone: "good" }, { label: "Missed-weed loss", value: usd(missed), tone: "warn" }, { label: "Chemical reduction", value: fmt.pct(1 - spot / broadcast), tone: "good" }], series: [70, 80, 90, 95, 98, 99.5].map((r) => ({ recall: `${r}%`, "Net saving": Math.round(broadcast - spot - v.acres * (v.cover / 100) * (1 - r / 100) * v.loss) })) };
      }}
      chart={{ x: "recall", type: "bar", title: "Net saving vs detection recall", lines: [{ key: "Net saving", color: "#34d399" }], yFormat: usd }}
      notice="Assumes spot-spray treats detected area with a 30% buffer. Defaults are illustrative, not agronomic advice." />
  ),
  "ai-native-discovery-engines": () => (
    <AgentPipeline title="Research goal" subtitle="Closed-loop discovery"
      cases={[{ id: "electrolyte", label: "Solid-state electrolyte", input: "Goal: maximize Li-ion conductivity of a sulfide electrolyte at room temp." }, { id: "enzyme", label: "Enzyme stability", input: "Goal: increase thermal stability of a PET-degrading enzyme by ≥10°C." }]}
      steps={[
        { name: "Read literature", actor: "Literature agent", log: (c) => (c.id === "electrolyte" ? "312 papers → 14 candidate dopants" : "88 papers → 9 stabilizing mutation motifs") },
        { name: "Propose hypotheses", actor: "Hypothesis agent", log: (c) => (c.id === "electrolyte" ? "H1: Cl doping (p=0.35)\nH2: Br doping (p=0.25)\nH3: Ge substitution (p=0.15)" : "H1: disulfide bridge (p=0.4)\nH2: proline in loop (p=0.3)") },
        { name: "Choose experiment", actor: "Planner", log: () => "Max expected information gain → test top-2 in a 12-sample batch" },
        { name: "Approve batch", actor: "Scientist", gate: true, log: () => "Robot queue: 12 samples · 6h · $480 reagents. Approve?" },
        { name: "Run & interpret", actor: "Lab robot + analyst", log: (c) => (c.id === "electrolyte" ? "Cl-doped: 9.1 mS/cm (↑)\nBr-doped: 4.3 mS/cm" : "Disulfide: Tm +7.5°C\nProline: Tm +2.1°C") },
        { name: "Update beliefs", actor: "Planner", log: (c) => (c.id === "electrolyte" ? "H1 → p=0.72; next: Cl concentration sweep" : "H1 → p=0.68; next: combine with 2nd disulfide") },
      ]}
      output={(c) => ({ title: "Iteration report", body: c.id === "electrolyte" ? "Best so far: Cl-doped Li6PS5Cl variant, 9.1 mS/cm.\nNext batch: Cl 0.8–1.4 sweep (8 samples).\nIteration time: 6h (vs ~2 weeks manual)." : "Best so far: disulfide variant, Tm +7.5°C.\nNext: combine with second disulfide to reach +10°C.\nIteration time: 1 day.", stats: [{ label: "Hypotheses tested", value: "2" }, { label: "Iteration time", value: c.id === "electrolyte" ? "6h" : "1 day", tone: "good" }] })}
      notice="All hypotheses, results and probabilities are scripted examples, not real experimental data." />
  ),
  "ai-native-service-companies": () => (
    <ModelCalculator title="Bookkeeping firm P&L" inputs={[
      { id: "clients", label: "Clients", min: 10, max: 5000, step: 10, value: 400 },
      { id: "price", label: "Price / client / month ($)", min: 100, max: 3000, step: 50, value: 600 },
      { id: "hours", label: "Manual hours / client / month", min: 1, max: 40, value: 8 },
      { id: "auto", label: "AI automation (%)", min: 0, max: 95, value: 80 },
      { id: "wage", label: "Loaded staff cost ($/hr)", min: 20, max: 150, value: 55 },
      { id: "ai", label: "AI compute / client / month ($)", min: 0, max: 100, value: 15 },
    ]}
      compute={(v) => {
        const rev = v.clients * v.price;
        const trad = v.clients * v.hours * v.wage;
        const ai = v.clients * (v.hours * (1 - v.auto / 100) * v.wage + v.ai);
        const fte = (h: number) => (v.clients * h) / 140;
        return { stats: [{ label: "Revenue / month", value: usd(rev) }, { label: "Traditional gross margin", value: fmt.pct((rev - trad) / rev), tone: rev - trad > 0 ? undefined : "bad" }, { label: "AI-native gross margin", value: fmt.pct((rev - ai) / rev), tone: "good" }, { label: "Clients per staff", value: `${(v.clients / Math.max(fte(v.hours * (1 - v.auto / 100)), 0.1)).toFixed(0)} vs ${(v.clients / fte(v.hours)).toFixed(0)}` }], series: [0, 20, 40, 60, 80, 90, 95].map((a) => ({ automation: `${a}%`, Margin: Math.round(((rev - v.clients * (v.hours * (1 - a / 100) * v.wage + v.ai)) / rev) * 100) })) };
      }}
      chart={{ x: "automation", title: "Gross margin % vs automation", lines: [{ key: "Margin", color: "#34d399" }] }}
      notice="Real P&L arithmetic on your assumptions; excludes sales, overhead and liability insurance." />
  ),
  "ai-personalized-medicine": () => (
    <WeightedRanker title="Migraine prevention options" subtitle="Fictional options · illustrative scores" pickLabel="Best fit"
      criteria={[{ id: "eff", label: "Efficacy", weight: 8 }, { id: "side", label: "Side-effect burden", weight: 6, invert: true }, { id: "cost", label: "Out-of-pocket cost", weight: 5, invert: true }, { id: "conv", label: "Convenience", weight: 4 }, { id: "evid", label: "Evidence strength", weight: 7 }]}
      options={[{ name: "Option A (daily pill)", scores: { eff: 6, side: 6, cost: 2, conv: 6, evid: 8 }, note: "Generic, older class" }, { name: "Option B (monthly injection)", scores: { eff: 8, side: 3, cost: 8, conv: 8, evid: 8 }, note: "Newer biologic" }, { name: "Option C (device)", scores: { eff: 5, side: 1, cost: 6, conv: 4, evid: 5 }, note: "Neuromodulation" }, { name: "Option D (lifestyle program)", scores: { eff: 4, side: 0, cost: 1, conv: 3, evid: 6 }, note: "Sleep, triggers, exercise" }]}
      notice="Fictional options with illustrative scores — not medical advice. Real use requires clinical evidence and clinician review." />
  ),
  "company-brain": () => (
    <AgentPipeline title="Ask the company" subtitle="Permissions-aware, cited answers"
      cases={[{ id: "refund", label: "Enterprise refund policy?", input: "What's our refund policy for enterprise annual contracts?" }, { id: "oncall", label: "Who owns billing on-call?", input: "Who is on-call for the billing service this week?" }]}
      steps={[
        { name: "Check permissions", actor: "ACL", log: () => "User: support-lead · can read #support, Policies, CRM" },
        { name: "Retrieve", actor: "Search", log: (c) => (c.id === "refund" ? "Policies/Refunds.md (2024-11)\n#sales thread (2026-08): 'new: pro-rata refunds for enterprise'\nCRM note: Acme exception" : "PagerDuty schedule (today)\n#billing-eng pinned (2026-05, stale)") },
        { name: "Resolve conflicts", actor: "Freshness ranker", log: (c) => (c.id === "refund" ? "Doc (2024) contradicts Slack (2026-08) → prefer newer, flag doc as stale" : "PagerDuty newer than pinned message → use PagerDuty") },
        { name: "Compose answer", actor: "LLM (scripted)", log: () => "Answer with inline citations" },
      ]}
      output={(c) => ({ title: "Answer", body: c.id === "refund" ? "Enterprise annual contracts get pro-rata refunds for unused months [1]. Acme has a negotiated full-refund exception until 2027 [2].\n\n[1] #sales, 2026-08-14 (supersedes Policies/Refunds.md — flagged stale)\n[2] CRM › Acme › Notes" : "Priya Shah is billing on-call until Sunday 09:00 [1].\n\n[1] PagerDuty › billing-primary (the pinned #billing-eng message is outdated)", stats: [{ label: "Sources", value: c.id === "refund" ? "3" : "2" }, { label: "Stale docs flagged", value: "1", tone: "warn" }] })}
      notice="Sources and answers are scripted to illustrate permission-aware retrieval and freshness handling; no connectors run." />
  ),
  "counter-swarm-defense": () => (
    <ModelCalculator title="Layered defense vs swarm" inputs={[
      { id: "n", label: "Incoming drones", min: 10, max: 500, step: 10, value: 100 },
      { id: "dcost", label: "Attacker cost per drone ($k)", min: 1, max: 100, value: 20 },
      { id: "ew", label: "Layer 1 EW: Pk (%)", min: 0, max: 80, value: 40 },
      { id: "int", label: "Layer 2 interceptor drones: Pk (%)", min: 0, max: 95, value: 75 },
      { id: "icost", label: "Interceptor cost ($k)", min: 1, max: 200, value: 15 },
      { id: "laser", label: "Layer 3 laser: Pk (%)", min: 0, max: 90, value: 60 },
      { id: "missile", label: "Missile-only Pk (%) @ $1M", min: 50, max: 99, value: 90 },
    ]}
      compute={(v) => {
        const a1 = v.n * (1 - v.ew / 100), a2 = a1 * (1 - v.int / 100), a3 = a2 * (1 - v.laser / 100);
        const cost = 200 * 1000 + a1 * v.icost * 1000 + a2 * 10;
        const attacker = v.n * v.dcost * 1000;
        const missileCost = v.n * 1e6;
        return { stats: [{ label: "Expected leakers", value: a3.toFixed(1), tone: a3 < 1 ? "good" : "bad" }, { label: "Defense cost", value: usd(cost) }, { label: "Cost-exchange ratio", value: `${(attacker / cost).toFixed(2)}x`, sub: "attacker $ / defender $", tone: attacker > cost ? "good" : "bad" }, { label: "Missile-only cost", value: usd(missileCost), sub: `${(v.n * (1 - v.missile / 100)).toFixed(1)} leakers`, tone: "bad" }], series: [{ layer: "Launched", Drones: v.n }, { layer: "After EW", Drones: +a1.toFixed(1) }, { layer: "After interceptors", Drones: +a2.toFixed(1) }, { layer: "After laser", Drones: +a3.toFixed(1) }] };
      }}
      chart={{ x: "layer", type: "bar", title: "Drones surviving each layer", lines: [{ key: "Drones", color: "#f87171" }] }}
      notice="Independent-layer expected-value model; assumes one interceptor per surviving drone and $10 per laser shot plus $200k fixed EW cost. Illustrative only." />
  ),
  "dynamic-software-interfaces": () => (
    <AgentPipeline title="Compose a UI for this user" subtitle="Same CRM, different interface"
      cases={[{ id: "rep", label: "New sales rep", input: "role=sales_rep tenure=2w last_actions=[viewed_lead, viewed_lead, opened_help]" }, { id: "vp", label: "VP Sales", input: "role=vp_sales tenure=3y last_actions=[forecast_export, pipeline_review]" }, { id: "ops", label: "RevOps admin", input: "role=revops tenure=1y last_actions=[edit_field, bulk_update, dedupe]" }]}
      steps={[
        { name: "Infer intent", actor: "Intent model", log: (c) => ({ rep: "Learn the product; work today's leads", vp: "Forecast accuracy; team performance", ops: "Data hygiene; bulk operations" }[c.id]!) },
        { name: "Select components", actor: "Composer", log: (c) => ({ rep: "TodayLeads, GuidedNextStep, InlineTips", vp: "ForecastChart, TeamLeaderboard, RiskDeals", ops: "BulkEditor, DuplicateFinder, FieldSchema" }[c.id]!) },
        { name: "Hide noise", actor: "Composer", log: (c) => ({ rep: "Hidden: admin settings, forecast exports", vp: "Hidden: per-lead activity log", ops: "Hidden: leaderboards" }[c.id]!) },
        { name: "Check design system", actor: "Validator", log: () => "All components from library · a11y contrast OK" },
      ]}
      output={(c) => ({ title: "Generated layout spec", body: JSON.stringify({ rep: { header: "Good morning — 6 leads to call", main: ["TodayLeads", "GuidedNextStep"], side: ["InlineTips"] }, vp: { header: "Q3 forecast: 92% of target", main: ["ForecastChart", "RiskDeals"], side: ["TeamLeaderboard"] }, ops: { header: "142 duplicates found", main: ["DuplicateFinder", "BulkEditor"], side: ["FieldSchema"] } }[c.id], null, 2) })}
      notice="Persona-to-layout rules are hand-written to illustrate the concept; no generative UI model runs here." />
  ),
  "electronics-in-space": () => (
    <ModelCalculator title="Radiation budget" inputs={[
      { id: "alt", label: "Altitude (km)", min: 300, max: 2000, step: 50, value: 550 },
      { id: "years", label: "Mission years", min: 1, max: 15, value: 5 },
      { id: "shield", label: "Aluminum shielding (mm)", min: 0.5, max: 10, step: 0.5, value: 2 },
      { id: "tol", label: "COTS part TID tolerance (krad)", min: 5, max: 100, value: 20 },
    ]}
      compute={(v) => {
        const doseAt = (alt: number, mm: number) => 0.3 * Math.exp((alt - 500) / 380) * Math.pow(2 / mm, 1.6);
        const annual = doseAt(v.alt, v.shield);
        const total = annual * v.years;
        const margin = v.tol / total;
        const grade = margin >= 2 ? "COTS OK (2x margin)" : margin >= 1 ? "Rad-tolerant / more shielding" : "Rad-hard needed";
        return { stats: [{ label: "Annual dose (approx.)", value: `${annual.toFixed(2)} krad` }, { label: "Mission TID", value: `${total.toFixed(1)} krad` }, { label: "Margin", value: `${margin.toFixed(1)}x`, tone: margin >= 2 ? "good" : margin >= 1 ? "warn" : "bad" }, { label: "Recommendation", value: grade, tone: margin >= 2 ? "good" : margin >= 1 ? "warn" : "bad" }], series: [0.5, 1, 2, 3, 5, 7, 10].map((mm) => ({ mm: `${mm}mm`, TID: +(doseAt(v.alt, mm) * v.years).toFixed(1), Tolerance: v.tol })) };
      }}
      chart={{ x: "mm", title: "Mission dose vs shielding (krad)", lines: [{ key: "TID", color: "#f87171" }, { key: "Tolerance", color: "#34d399" }] }}
      notice="Illustrative approximation only — not a validated radiation model (real missions use AP9/AE9 via SPENVIS/OMERE)." />
  ),
  "hardware-supply-chain": () => (
    <WeightedRanker title="Motor-controller PCB assembly" subtitle="Fictional suppliers · 1,000 units"
      criteria={[{ id: "price", label: "Unit price", weight: 7, invert: true }, { id: "lead", label: "Lead time", weight: 8, invert: true }, { id: "moq", label: "MOQ burden", weight: 4, invert: true }, { id: "quality", label: "Quality history", weight: 8 }, { id: "geo", label: "Geopolitical/tariff risk", weight: 5, invert: true }]}
      options={[{ name: "Shenzhen FastPCB", scores: { price: 2, lead: 3, moq: 2, quality: 6, geo: 8 }, note: "$18.40 · 3 wks · tariff exposure" }, { name: "Ohio Assembly Co", scores: { price: 8, lead: 5, moq: 5, quality: 9, geo: 1 }, note: "$41.00 · 5 wks · domestic" }, { name: "Monterrey EMS", scores: { price: 5, lead: 4, moq: 4, quality: 7, geo: 3 }, note: "$27.50 · 4 wks · USMCA" }, { name: "Penang Precision", scores: { price: 4, lead: 6, moq: 7, quality: 8, geo: 4 }, note: "$24.10 · 6 wks · MOQ 5k" }]}
      notice="Suppliers and scores are fictional placeholders." />
  ),
  "industrial-capabilities-in-space": () => (
    <ModelCalculator title="Lunar regolith electrolysis plant" inputs={[
      { id: "kw", label: "Plant power (kW)", min: 10, max: 2000, step: 10, value: 200 },
      { id: "kwhkg", label: "Energy per kg O₂ (kWh)", min: 10, max: 80, value: 30 },
      { id: "uptime", label: "Uptime (%)", min: 10, max: 95, value: 45 },
      { id: "metal", label: "Metal kg per kg O₂", min: 0.5, max: 1.5, step: 0.05, value: 1 },
      { id: "launch", label: "Delivered cost to lunar surface ($/kg)", min: 10000, max: 1500000, step: 10000, value: 1000000 },
    ]}
      compute={(v) => {
        const o2 = (v.kw * 8760 * (v.uptime / 100)) / v.kwhkg;
        const metal = o2 * v.metal;
        return { stats: [{ label: "Oxygen / year", value: `${fmt.num(Math.round(o2 / 1000))} t` }, { label: "Metals / year", value: `${fmt.num(Math.round(metal / 1000))} t` }, { label: "Avoided delivery value", value: usd((o2 + metal) * v.launch) }, { label: "Value per kW", value: usd(((o2 + metal) * v.launch) / v.kw) }], series: [100000, 250000, 500000, 1000000, 1500000].map((l) => ({ cost: `$${l / 1000}k/kg`, Value: Math.round((o2 + metal) * l) })) };
      }}
      chart={{ x: "cost", type: "bar", title: "Annual value vs delivered cost", lines: [{ key: "Value", color: "#60a5fa" }], yFormat: usd }}
      notice="Energy-limited production model; energy intensity and metal ratios are rough illustrative figures." />
  ),
  "inference-chips-for-agent-workflows": () => (
    <ModelCalculator title="Agent loop latency" inputs={[
      { id: "steps", label: "Agent steps (tool calls)", min: 1, max: 100, value: 25 },
      { id: "ctx", label: "Context tokens", min: 2000, max: 200000, step: 2000, value: 60000 },
      { id: "out", label: "Output tokens / step", min: 20, max: 2000, step: 20, value: 200 },
      { id: "reuse", label: "KV-cache reuse on agent chip (%)", min: 0, max: 99, value: 90 },
      { id: "tool", label: "Tool latency / step (ms)", min: 0, max: 3000, step: 50, value: 400 },
    ]}
      compute={(v) => {
        const chat = { prefill: 20000, decode: 80, overhead: 150 }, agent = { prefill: 40000, decode: 300, overhead: 20 };
        const t = (s: typeof chat, reuse: number) => v.steps * (((v.ctx * (1 - reuse)) / s.prefill) * 1000 + (v.out / s.decode) * 1000 + s.overhead + v.tool) / 1000;
        const a = t(chat, 0.3), b = t(agent, v.reuse / 100);
        return { stats: [{ label: "Chat-optimized", value: `${a.toFixed(1)} s` }, { label: "Agent-optimized", value: `${b.toFixed(1)} s`, tone: "good" }, { label: "Speed-up", value: `${(a / b).toFixed(1)}x`, tone: "good" }, { label: "Share in tool waits", value: fmt.pct((v.steps * v.tool) / 1000 / b) }], series: [1, 5, 10, 25, 50, 100].map((s) => ({ steps: s, Chat: +((t(chat, 0.3) / v.steps) * s).toFixed(1), Agent: +((t(agent, v.reuse / 100) / v.steps) * s).toFixed(1) })) };
      }}
      chart={{ x: "steps", title: "End-to-end seconds vs agent steps", lines: [{ key: "Chat", color: "#f87171" }, { key: "Agent", color: "#fb923c" }] }}
      notice="Toy roofline-style model with illustrative throughput figures; not a benchmark of any real hardware." />
  ),
  "saas-challengers": () => (
    <ModelCalculator title="Challenger pricing" inputs={[
      { id: "seat", label: "Incumbent $/seat/month", min: 10, max: 500, step: 5, value: 150 },
      { id: "seats", label: "Seats per customer", min: 5, max: 5000, step: 5, value: 200 },
      { id: "disc", label: "Your discount (%)", min: 0, max: 90, value: 50 },
      { id: "mig", label: "One-off migration cost to you ($k)", min: 0, max: 200, value: 25 },
      { id: "cogs", label: "Your COGS per seat ($/mo)", min: 0, max: 50, value: 6 },
    ]}
      compute={(v) => {
        const yours = v.seat * (1 - v.disc / 100);
        const arr = yours * v.seats * 12;
        const gm = (yours - v.cogs) / yours;
        const payback = (v.mig * 1000) / ((yours - v.cogs) * v.seats);
        return { stats: [{ label: "Customer saves / yr", value: usd((v.seat - yours) * v.seats * 12), tone: "good" }, { label: "Your ARR / customer", value: usd(arr) }, { label: "Gross margin", value: fmt.pct(gm), tone: gm > 0.7 ? "good" : "warn" }, { label: "Migration payback", value: `${payback.toFixed(1)} mo` }], series: [0, 20, 40, 60, 80].map((d) => ({ discount: `${d}%`, ARR: Math.round(v.seat * (1 - d / 100) * v.seats * 12), Savings: Math.round(v.seat * (d / 100) * v.seats * 12) })) };
      }}
      chart={{ x: "discount", type: "bar", title: "Your ARR vs customer savings by discount", lines: [{ key: "ARR", color: "#818cf8" }, { key: "Savings", color: "#34d399" }], yFormat: usd }}
      notice="Simple pricing arithmetic; ignores sales cost and churn." />
  ),
  "software-for-agents": () => (
    <ExplainableScorer title="Agent-readiness audit" subtitle="Paste developer docs or a homepage" scoreLabel="Agent readiness" base={30}
      samples={[{ label: "API-first SaaS", text: "Full REST API with an OpenAPI spec. Authenticate with API keys or OAuth. We publish llms.txt and an MCP server. Webhooks for all events. Rate limits documented. Sandbox environment available." }, { label: "Legacy portal", text: "Log in to the customer portal to download reports. Complete the CAPTCHA to continue. Contact sales for API access. Export available as PDF only." }]}
      features={[
        { label: "OpenAPI / machine-readable spec", pattern: /openapi|swagger|graphql schema/i, weight: 15 },
        { label: "MCP server", pattern: /\bmcp\b|model context protocol/i, weight: 15 },
        { label: "llms.txt", pattern: /llms\.txt/i, weight: 8 },
        { label: "Programmatic auth (API key/OAuth)", pattern: /api keys?|oauth|service account/i, weight: 10 },
        { label: "Webhooks/events", pattern: /webhooks?/i, weight: 6 },
        { label: "Sandbox", pattern: /sandbox|test mode/i, weight: 6 },
        { label: "CAPTCHA wall", pattern: /captcha/i, weight: -20, explain: "blocks agents" },
        { label: "'Contact sales for API'", pattern: /contact sales for api/i, weight: -12 },
        { label: "PDF-only exports", pattern: /pdf only/i, weight: -8 },
      ]}
      verdicts={[{ min: 0, label: "Agent-hostile", tone: "bad", advice: "Agents will fail or fall back to brittle browser automation." }, { min: 45, label: "Partly ready", tone: "warn", advice: "Add an MCP server and machine-readable docs." }, { min: 75, label: "Agent-ready", tone: "good", advice: "Agents can discover, authenticate and act." }]}
      notice="Scores pasted text with transparent regex signals; it does not crawl or test live endpoints." />
  ),
  "startups-that-want-to-sell-to-huge-companies": () => (
    <ExplainableScorer title="Enterprise readiness" subtitle="Describe your security & procurement posture" scoreLabel="Readiness" base={20}
      samples={[{ label: "Seed startup", text: "We use Google login. Data in AWS us-east-1. No SOC 2 yet. Standard click-through terms. Founders handle security questions." }, { label: "Upmarket-ready", text: "SOC 2 Type II report available. SAML SSO and SCIM provisioning. DPA and MSA templates ready. 99.9% uptime SLA. Annual pen test. Data residency in EU and US. Cyber insurance $5M." }]}
      features={[
        { label: "SOC 2 Type II", pattern: /soc ?2 type ii/i, weight: 18 }, { label: "No SOC 2", pattern: /no soc ?2/i, weight: -10 },
        { label: "SAML SSO", pattern: /saml|sso/i, weight: 10 }, { label: "SCIM provisioning", pattern: /scim/i, weight: 6 },
        { label: "DPA/MSA ready", pattern: /\bdpa\b|\bmsa\b/i, weight: 8 }, { label: "Uptime SLA", pattern: /sla/i, weight: 6 },
        { label: "Pen test", pattern: /pen ?test/i, weight: 6 }, { label: "Data residency", pattern: /residency/i, weight: 5 },
        { label: "Cyber insurance", pattern: /insurance/i, weight: 5 }, { label: "Click-through terms only", pattern: /click-?through/i, weight: -5 },
      ]}
      verdicts={[{ min: 0, label: "Not ready", tone: "bad", advice: "Expect security review to stall. Start SOC 2 and SSO first." }, { min: 50, label: "Getting there", tone: "warn" }, { min: 80, label: "Enterprise-ready", tone: "good" }]}
      notice="Weights reflect common enterprise asks (opinion), not any formal standard." />
  ),
  "supply-chain-2-0-for-semiconductors": () => (
    <ModelCalculator title="Compounding risk across the chain" inputs={[
      { id: "steps", label: "Process steps", min: 100, max: 2000, step: 50, value: 1400 },
      { id: "yield", label: "Per-step yield (%)", min: 99.9, max: 99.999, step: 0.001, value: 99.99, format: (v) => `${v.toFixed(3)}%` },
      { id: "hops", label: "Border/facility hops", min: 1, max: 20, value: 12 },
      { id: "pd", label: "Disruption probability per hop (%)", min: 0, max: 10, step: 0.1, value: 1.5 },
      { id: "delay", label: "Delay per disruption (weeks)", min: 1, max: 20, value: 6 },
    ]}
      compute={(v) => {
        const y = Math.pow(v.yield / 100, v.steps);
        const onTime = Math.pow(1 - v.pd / 100, v.hops);
        const expDelay = v.hops * (v.pd / 100) * v.delay;
        return { stats: [{ label: "Compounded yield", value: fmt.pct(y), tone: y > 0.8 ? "good" : "warn" }, { label: "P(no disruption)", value: fmt.pct(onTime), tone: onTime > 0.9 ? "good" : "warn" }, { label: "Expected delay", value: `${expDelay.toFixed(1)} wks` }, { label: "Lead time (5 mo base)", value: `${(21.7 + expDelay).toFixed(1)} wks` }], series: [1, 4, 8, 12, 16, 20].map((h) => ({ hops: h, "On-time %": Math.round(Math.pow(1 - v.pd / 100, h) * 100) })) };
      }}
      chart={{ x: "hops", title: "Probability of no disruption vs hops", lines: [{ key: "On-time %", color: "#fdba74" }] }}
      notice="Assumes independent steps and disruptions (real risks are correlated). Inputs are illustrative." />
  ),
  "the-ai-operating-system-for-companies": () => (
    <AgentPipeline title="Ask the company data" subtitle="8 deals · 6 tickets (in-browser)"
      cases={[{ id: "q3", label: "Revenue won in Q3?", input: "How much revenue did we close-win in Q3?" }, { id: "rep", label: "Top rep?", input: "Who is our top rep by won revenue?" }, { id: "tix", label: "Slowest support area?", input: "Which product area has the slowest ticket resolution?" }]}
      steps={[
        { name: "Parse question", actor: "NL mapper", log: (c) => `intent → ${c.id}` },
        { name: "Generate query", actor: "Query planner", log: (c) => QUERIES[c.id].sql },
        { name: "Execute", actor: "Engine", log: (c) => `result: ${QUERIES[c.id].run().split("\n")[0]}…` },
        { name: "Explain", actor: "Narrator", log: () => "Attach query + row count for audit" },
      ]}
      output={(c) => ({ title: "Answer (computed live)", body: `${QUERIES[c.id].run()}\n\nQuery:\n${QUERIES[c.id].sql}` })}
      notice="Questions map to hand-written query templates; the answers are genuinely computed from the small fictional dataset in your browser." />
  ),
};
export default C;
