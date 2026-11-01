"use client";
import type { ComponentType } from "react";
import { AgentPipeline, ExplainableScorer, ModelCalculator, QueueTriage, WeightedRanker, fmt } from "../kit/engines";

const usd = fmt.usdShort;
const WORDS: [string, number][] = [["love", 3], ["great", 2], ["excellent", 3], ["fast", 1], ["easy", 1], ["recommend", 2], ["broke", -3], ["broken", -3], ["slow", -2], ["refund", -2], ["terrible", -3], ["disappointed", -2], ["cheap", -1], ["not", -1]];

const C: Record<string, ComponentType> = {
  "using-machine-learning-to-simulate-the-physical-world": () => (
    <ModelCalculator title="Design-space exploration" inputs={[
      { id: "sim", label: "Solver time per design (hours)", min: 0.1, max: 48, step: 0.1, value: 6 },
      { id: "budget", label: "Compute budget (node-hours/week)", min: 10, max: 10000, step: 10, value: 500 },
      { id: "speed", label: "Surrogate speed-up (x)", min: 10, max: 100000, step: 10, value: 10000 },
      { id: "val", label: "Designs re-validated with solver (%)", min: 0, max: 50, step: 0.5, value: 2 },
    ]}
      compute={(v) => { const solverOnly = v.budget / v.sim; const per = v.sim / v.speed + (v.val / 100) * v.sim; const sur = v.budget / per; return { stats: [{ label: "Designs/week (solver)", value: fmt.num(Math.round(solverOnly)) }, { label: "Designs/week (surrogate)", value: fmt.num(Math.round(sur)), tone: "good" }, { label: "Exploration gain", value: `${(sur / solverOnly).toFixed(0)}x`, tone: "good" }, { label: "Solver-validated", value: fmt.num(Math.round(sur * (v.val / 100))) }], series: [0, 0.5, 1, 2, 5, 10, 25].map((p) => ({ validated: `${p}%`, Designs: Math.round(v.budget / (v.sim / v.speed + (p / 100) * v.sim)) })), insight: "Re-validation, not inference, quickly becomes the bottleneck." }; }}
      chart={{ x: "validated", type: "bar", title: "Designs/week vs validation share", lines: [{ key: "Designs", color: "#a78bfa" }] }}
      notice="Throughput arithmetic; surrogate accuracy is assumed adequate." />
  ),
  "new-defense-technology": () => (
    <ModelCalculator title="Exquisite vs attritable" inputs={[
      { id: "budget", label: "Budget ($M)", min: 10, max: 5000, step: 10, value: 500 },
      { id: "ex", label: "Exquisite unit cost ($M)", min: 5, max: 200, value: 80 },
      { id: "exs", label: "Exquisite survival per sortie (%)", min: 50, max: 99.9, step: 0.1, value: 98 },
      { id: "at", label: "Attritable unit cost ($k)", min: 10, max: 5000, step: 10, value: 400 },
      { id: "ats", label: "Attritable survival per sortie (%)", min: 10, max: 99, value: 75 },
      { id: "days", label: "Campaign sorties per unit (max)", min: 1, max: 60, value: 20 },
    ]}
      compute={(v) => { const sorties = (n: number, s: number) => n * (1 - Math.pow(s, v.days)) / (1 - s); const nEx = Math.floor(v.budget / v.ex), nAt = Math.floor((v.budget * 1000) / v.at); const a = sorties(nEx, v.exs / 100), b = sorties(nAt, v.ats / 100); return { stats: [{ label: "Exquisite units", value: fmt.num(nEx) }, { label: "Attritable units", value: fmt.num(nAt) }, { label: "Expected sorties", value: `${fmt.num(Math.round(a))} vs ${fmt.num(Math.round(b))}`, tone: b > a ? "good" : undefined }, { label: "Mass advantage", value: `${(b / Math.max(a, 1)).toFixed(1)}x` }], series: [{ fleet: "Exquisite", Sorties: Math.round(a) }, { fleet: "Attritable", Sorties: Math.round(b) }] }; }}
      chart={{ x: "fleet", type: "bar", title: "Expected sorties for the same budget", lines: [{ key: "Sorties", color: "#f87171" }] }}
      notice="Ignores capability differences per sortie; illustrative inputs." />
  ),
  "commercial-open-source-companies": () => (
    <WeightedRanker title="Monetization models" subtitle="Opinionated scores" pickLabel="Best fit"
      criteria={[{ id: "rev", label: "Revenue potential", weight: 8 }, { id: "comm", label: "Community goodwill", weight: 6 }, { id: "cloud", label: "Hyperscaler risk", weight: 6, invert: true }, { id: "effort", label: "Operational effort", weight: 4, invert: true }]}
      options={[{ name: "Open core", scores: { rev: 8, comm: 5, cloud: 6, effort: 5 } }, { name: "Managed cloud", scores: { rev: 9, comm: 8, cloud: 7, effort: 8 } }, { name: "Support & services", scores: { rev: 4, comm: 9, cloud: 3, effort: 7 } }, { name: "Dual licence (AGPL/commercial)", scores: { rev: 7, comm: 4, cloud: 2, effort: 3 } }]}
      notice="Scores are opinions to illustrate the trade-offs." />
  ),
  "spatial-computing": () => (
    <AgentPipeline title="Room scan" subtitle="Will it fit?"
      cases={[{ id: "sofa", label: "3-seat sofa, living room", input: "Room 4.2 × 3.6 m · door on south wall (0.9 m swing) · sofa 2.3 × 0.95 m" }, { id: "desk", label: "Desk, small bedroom", input: "Room 3.0 × 2.7 m · bed 2.0 × 1.5 m along north wall · desk 1.6 × 0.8 m" }]}
      steps={[
        { name: "Reconstruct", actor: "Scene model (stub)", log: () => "Walls, floor plane and existing furniture detected" },
        { name: "Place product", actor: "Placement", log: (c) => (c.id === "sofa" ? "Sofa against west wall" : "Desk against east wall") },
        { name: "Clearances", actor: "Geometry", log: (c) => (c.id === "sofa" ? `Walkway: ${(3.6 - 0.95 - 0.9).toFixed(2)} m (≥ 0.9 m ✓)` : `Gap to bed: ${(3.0 - 1.5 - 0.8).toFixed(2)} m (< 0.9 m ✗)`) },
      ]}
      output={(c) => ({ title: "Fit report", body: c.id === "sofa" ? "Fits. Walkway 1.75 m; door swing clear." : "Tight: 0.70 m between bed and desk (recommend ≥ 0.9 m). Try a 1.2 × 0.6 m desk → 0.90 m.", stats: [{ label: "Fits?", value: c.id === "sofa" ? "Yes" : "Tight", tone: c.id === "sofa" ? "good" : "warn" }] })}
      notice="Room geometry is hand-specified; no scan or headset is used." />
  ),
  "new-enterprise-resource-planning-software": () => (
    <QueueTriage title="AP three-way match" subtitle="Fictional invoices" itemNoun="invoice" actionHigh="Exception" actionLow="Auto-post" threshold={30}
      items={[
        { id: "i1", title: "INV-2201 · Acme Steel", detail: "PO $12,000 · received 100% · invoiced $12,000", fields: { priceVar: 0, qtyVar: 0, noPO: false, dup: false } },
        { id: "i2", title: "INV-2202 · Globex Parts", detail: "PO $4,800 · invoiced $5,400", fields: { priceVar: 12.5, qtyVar: 0, noPO: false, dup: false } },
        { id: "i3", title: "INV-2203 · Initech", detail: "Received 80 of 100 units, invoiced 100", fields: { priceVar: 0, qtyVar: 20, noPO: false, dup: false } },
        { id: "i4", title: "INV-2204 · Umbrella Co", detail: "No matching PO", fields: { priceVar: 0, qtyVar: 0, noPO: true, dup: false } },
        { id: "i5", title: "INV-2201 · Acme Steel", detail: "Same number and amount as earlier invoice", fields: { priceVar: 0, qtyVar: 0, noPO: false, dup: true } },
      ]}
      rules={[
        { id: "price", label: "Price variance > 2%", weight: 35, test: (f) => Number(f.priceVar) > 2 },
        { id: "qty", label: "Quantity invoiced > received", weight: 35, test: (f) => Number(f.qtyVar) > 0 },
        { id: "po", label: "No PO", weight: 40, test: (f) => f.noPO === true },
        { id: "dup", label: "Possible duplicate", weight: 50, test: (f) => f.dup === true },
      ]}
      impact={(fl, all) => [{ label: "Auto-posted", value: `${all.length - fl.length}/${all.length}`, tone: "good" }]}
      notice="Fictional documents." />
  ),
  "developer-tools-inspired-by-existing-internal-tools": () => (
    <QueueTriage title="Deploy queue" subtitle="Fictional changes" itemNoun="deploy" actionHigh="Block: needs approval" actionMid="Canary first" actionLow="Ship" threshold={40}
      items={[
        { id: "d1", title: "web: copy tweak", detail: "12 lines", fields: { migration: false, lines: 12, offHours: false, canary: true, payments: false } },
        { id: "d2", title: "api: add column + backfill", detail: "DB migration, 640 lines", fields: { migration: true, lines: 640, offHours: false, canary: true, payments: false } },
        { id: "d3", title: "billing: retry logic", detail: "Friday 23:40, no canary", fields: { migration: false, lines: 180, offHours: true, canary: false, payments: true } },
        { id: "d4", title: "worker: bump dependency", detail: "lockfile only", fields: { migration: false, lines: 3, offHours: false, canary: false, payments: false } },
      ]}
      rules={[
        { id: "mig", label: "Schema migration", weight: 30, test: (f) => f.migration === true },
        { id: "big", label: "Diff > 500 lines", weight: 15, test: (f) => Number(f.lines) > 500 },
        { id: "off", label: "Off-hours deploy", weight: 20, test: (f) => f.offHours === true },
        { id: "can", label: "No canary", weight: 15, test: (f) => f.canary === false },
        { id: "pay", label: "Touches payments", weight: 25, test: (f) => f.payments === true },
      ]}
      impact={(fl) => [{ label: "Gated", value: String(fl.length) }]}
      notice="Fictional deploys; rules mirror common deploy-safety practice." />
  ),
  "llms-for-manual-back-office-processes-in-legacy-enterprises": () => (
    <AgentPipeline title="Inbound document" subtitle="Legacy insurer back office"
      cases={[{ id: "inv", label: "Emailed vendor invoice (PDF)", input: "From: billing@roofpros.example · 'Invoice 7781 for claim CLM-5531, $14,320, net 30'" }, { id: "fnol", label: "Faxed claim form", input: "Handwritten FNOL: policy HO-88213, water damage, 2026-10-02, est. $6,000" }]}
      steps={[
        { name: "Extract", actor: "Document LLM", log: (c) => (c.id === "inv" ? "vendor=Roof Pros · invoice=7781 · claim=CLM-5531 · amount=14320 · terms=net30" : "policy=HO-88213 · peril=water · date=2026-10-02 · estimate=6000") },
        { name: "Validate", actor: "Rules", log: (c) => (c.id === "inv" ? "Vendor approved ✓ · claim open ✓ · amount ≤ reserve ($15k) ✓" : "Policy active ✓ · peril covered ✓ · deductible $1,000") },
        { name: "Approve", actor: "Adjuster", gate: true, log: () => "Post to the claims system?" },
        { name: "Key into legacy system", actor: "RPA / API", log: () => "Green-screen fields filled · confirmation captured" },
      ]}
      output={(c) => ({ title: "Posted record", body: c.id === "inv" ? "Payable PAY-30912 created for CLM-5531, $14,320 due in 30 days." : "Claim CLM-5602 opened · reserve $5,000 (net of deductible).", stats: [{ label: "Handle time", value: "45 s", tone: "good", sub: "vs ~12 min manual" }] })}
      notice="Extraction is scripted for the samples." />
  ),
  "ai-to-build-enterprise-software": () => (
    <AgentPipeline title="Requirement" subtitle="Generate an internal app"
      cases={[{ id: "vendor", label: "Vendor onboarding", input: "Procurement needs vendors to submit W-9 and insurance, legal reviews, finance approves before the first PO." }]}
      steps={[
        { name: "Entities", actor: "Modeler", log: () => "Vendor, Document(W9|COI), Review, Approval" },
        { name: "Workflow", actor: "Modeler", log: () => "draft → submitted → legal_review → finance_approval → active" },
        { name: "Roles", actor: "Modeler", log: () => "vendor (submit), legal (review), finance (approve), procurement (admin)" },
        { name: "Generate", actor: "Codegen (scripted)", log: () => "CRUD + forms + audit log + email notifications" },
      ]}
      output={() => ({ title: "App spec", body: JSON.stringify({ entities: ["Vendor", "Document", "Review", "Approval"], states: ["draft", "submitted", "legal_review", "finance_approval", "active"], guards: { "finance_approval→active": "Document.COI.expires > today" }, roles: ["vendor", "legal", "finance", "procurement"] }, null, 2) })}
      notice="Generated spec is scripted for the sample." />
  ),
  "stablecoin-finance": () => (
    <ModelCalculator title="Reserve stress test" inputs={[
      { id: "supply", label: "Supply ($B)", min: 0.1, max: 200, step: 0.1, value: 10 },
      { id: "cash", label: "Cash & overnight repo (%)", min: 0, max: 100, value: 20 },
      { id: "tbill", label: "T-bills < 3 months (%)", min: 0, max: 100, value: 70 },
      { id: "haircut", label: "Haircut on other assets (%)", min: 0, max: 80, value: 30 },
      { id: "run", label: "Redemptions in 48h (%)", min: 0, max: 80, value: 25 },
    ]}
      compute={(v) => { const other = Math.max(0, 100 - v.cash - v.tbill); const liquid = v.cash + v.tbill * 0.995; const total = liquid + other * (1 - v.haircut / 100); const holds = liquid >= v.run && total >= 100 - 0.5; return { stats: [{ label: "Liquid in 48h", value: `${liquid.toFixed(1)}%`, tone: liquid >= v.run ? "good" : "bad" }, { label: "Redemptions", value: usd((v.supply * 1e9 * v.run) / 100) }, { label: "Total recoverable", value: `${total.toFixed(1)}%` }, { label: "Peg", value: holds ? "Holds" : "At risk", tone: holds ? "good" : "bad" }], series: [5, 10, 20, 30, 50, 80].map((r) => ({ run: `${r}%`, Coverage: +(liquid / r).toFixed(2) })) }; }}
      chart={{ x: "run", type: "bar", title: "Liquidity coverage ratio vs run size", lines: [{ key: "Coverage", color: "#c084fc" }] }}
      notice="Simplified stress model; ignores operational redemption limits." />
  ),
  "a-way-to-end-cancer": () => (
    <ModelCalculator title="Screening 100,000 people" inputs={[
      { id: "prev", label: "Prevalence (%)", min: 0.05, max: 5, step: 0.05, value: 0.5 },
      { id: "sens", label: "Sensitivity (%)", min: 10, max: 99.9, step: 0.1, value: 60 },
      { id: "spec", label: "Specificity (%)", min: 80, max: 99.9, step: 0.1, value: 99.5 },
      { id: "cost", label: "Test cost ($)", min: 10, max: 2000, step: 10, value: 900 },
      { id: "work", label: "Follow-up cost per positive ($)", min: 100, max: 20000, step: 100, value: 3000 },
    ]}
      compute={(v) => { const N = 100000, c = (N * v.prev) / 100; const tp = c * (v.sens / 100), fn = c - tp, fp = (N - c) * (1 - v.spec / 100); const ppv = tp / (tp + fp); const total = N * v.cost + (tp + fp) * v.work; return { stats: [{ label: "Cancers found", value: fmt.num(Math.round(tp)), tone: "good", sub: `${Math.round(fn)} missed` }, { label: "False positives", value: fmt.num(Math.round(fp)), tone: fp > tp ? "warn" : undefined }, { label: "PPV", value: fmt.pct(ppv) }, { label: "Cost per cancer found", value: usd(total / Math.max(tp, 1)) }], series: [98, 99, 99.5, 99.8, 99.9].map((s) => { const f = (N - c) * (1 - s / 100); return { specificity: `${s}%`, PPV: Math.round((tp / (tp + f)) * 100) }; }) }; }}
      chart={{ x: "specificity", type: "bar", title: "PPV % vs specificity", lines: [{ key: "PPV", color: "#f472b6" }] }}
      notice="Exact Bayes math on illustrative inputs; not data for any specific test. Not medical advice." />
  ),
  "foundation-models-for-biological-systems": () => (
    <ModelCalculator title="Cost per approved drug" inputs={[
      { id: "pre", label: "Preclinical → Phase 1 (%)", min: 5, max: 90, value: 40 },
      { id: "p1", label: "Phase 1 success (%)", min: 10, max: 95, value: 52 },
      { id: "p2", label: "Phase 2 success (%)", min: 5, max: 90, value: 29 },
      { id: "p3", label: "Phase 3 → approval (%)", min: 20, max: 95, value: 58 },
      { id: "lift", label: "Model lift on Phase 2 success (pp)", min: 0, max: 30, value: 10 },
    ]}
      compute={(v) => { const costs = [5, 25, 60, 250]; const run = (p2: number) => { const ps = [v.pre, v.p1, p2, v.p3].map((x) => x / 100); let reach = 1, cost = 0; ps.forEach((p, i) => { cost += reach * costs[i]; reach *= p; }); return { cost: cost / reach, prob: reach }; }; const a = run(v.p2), b = run(Math.min(95, v.p2 + v.lift)); return { stats: [{ label: "P(approval) per program", value: fmt.pct(a.prob) }, { label: "Cost / approval (baseline)", value: usd(a.cost * 1e6) }, { label: "Cost / approval (with model)", value: usd(b.cost * 1e6), tone: "good" }, { label: "Saving", value: fmt.pct(1 - b.cost / a.cost), tone: "good" }], series: [0, 5, 10, 15, 20, 30].map((l) => ({ lift: `+${l}pp`, Cost: Math.round(run(Math.min(95, v.p2 + l)).cost) })) }; }}
      chart={{ x: "lift", type: "bar", title: "Cost per approval ($M) vs Phase 2 lift", lines: [{ key: "Cost", color: "#f472b6" }] }}
      notice="Stage costs ($5M/$25M/$60M/$250M) and rates are rough illustrative figures; excludes capital cost." />
  ),
  "the-managed-service-organization-model-for-healthcare": () => (
    <ModelCalculator title="Independent clinic with/without MSO" inputs={[
      { id: "prov", label: "Providers", min: 1, max: 50, value: 6 },
      { id: "visits", label: "Visits per provider per day", min: 5, max: 40, value: 20 },
      { id: "rate", label: "Avg reimbursement ($)", min: 50, max: 400, value: 140 },
      { id: "coll", label: "Collection rate (%)", min: 70, max: 99, value: 88 },
      { id: "admin", label: "Admin cost (% of revenue)", min: 10, max: 50, value: 32 },
      { id: "fee", label: "MSO fee (% of collections)", min: 3, max: 20, value: 8 },
    ]}
      compute={(v) => { const gross = v.prov * v.visits * 230 * v.rate; const base = gross * (v.coll / 100); const marginA = base * (1 - v.admin / 100 - 0.45); const coll2 = Math.min(98, v.coll + 6), rate2 = v.rate * 1.08; const rev2 = v.prov * v.visits * 230 * rate2 * (coll2 / 100); const marginB = rev2 * (1 - v.admin / 100 * 0.6 - 0.45 - v.fee / 100); return { stats: [{ label: "Collections (today)", value: usd(base) }, { label: "Margin (today)", value: usd(marginA) }, { label: "Margin (with MSO)", value: usd(marginB), tone: marginB > marginA ? "good" : "bad" }, { label: "Change", value: fmt.pct((marginB - marginA) / Math.abs(marginA)) }], series: [{ scenario: "Today", Margin: Math.round(marginA) }, { scenario: "With MSO", Margin: Math.round(marginB) }] }; }}
      chart={{ x: "scenario", type: "bar", title: "Annual margin", lines: [{ key: "Margin", color: "#f472b6" }], yFormat: usd }}
      notice="Assumes 230 clinic days, 45% provider comp; MSO adds +8% payer rates, +6pp collections and cuts admin 40%. Illustrative." />
  ),
  "eliminating-middlemen-in-healthcare": () => (
    <ModelCalculator title="Where a prescription's dollars go" inputs={[
      { id: "acq", label: "Pharmacy acquisition cost ($)", min: 1, max: 500, value: 12 },
      { id: "spread", label: "PBM spread ($)", min: 0, max: 200, value: 38 },
      { id: "rebate", label: "Rebate retained by PBM ($)", min: 0, max: 200, value: 10 },
      { id: "fee", label: "Pharmacy dispensing fee ($)", min: 0, max: 20, value: 2 },
      { id: "markup", label: "Cost-plus markup (%)", min: 0, max: 50, value: 15 },
      { id: "fills", label: "Fills per year (k, employer)", min: 1, max: 1000, value: 50 },
    ]}
      compute={(v) => { const pbm = v.acq + v.spread + v.rebate + v.fee; const direct = v.acq * (1 + v.markup / 100) + 5 + 3; return { stats: [{ label: "PBM price per fill", value: `$${pbm.toFixed(2)}` }, { label: "Direct cost-plus", value: `$${direct.toFixed(2)}`, tone: "good" }, { label: "Saving per fill", value: `$${(pbm - direct).toFixed(2)}`, tone: pbm > direct ? "good" : "bad" }, { label: "Employer saving / yr", value: usd((pbm - direct) * v.fills * 1000), tone: "good" }], series: [{ part: "Drug", PBM: v.acq, Direct: +(v.acq * (1 + v.markup / 100)).toFixed(2) }, { part: "Middlemen", PBM: v.spread + v.rebate, Direct: 0 }, { part: "Fees", PBM: v.fee, Direct: 8 }] }; }}
      chart={{ x: "part", type: "bar", title: "Price build-up per fill ($)", lines: [{ key: "PBM", color: "#f87171" }, { key: "Direct", color: "#34d399" }] }}
      notice="Illustrative price flow ($5 pharmacy + $3 shipping in direct model); real contracts vary widely." />
  ),
  "small-fine-tuned-models-as-an-alternative-to-giant-generic-ones": () => (
    <ModelCalculator title="Big generic vs small fine-tuned" inputs={[
      { id: "req", label: "Requests per day (k)", min: 1, max: 10000, value: 200 },
      { id: "tok", label: "Tokens per request (in+out)", min: 100, max: 20000, step: 100, value: 1500 },
      { id: "big", label: "Large model $/1M tokens", min: 0.5, max: 60, step: 0.5, value: 10 },
      { id: "small", label: "Small model $/1M tokens", min: 0.01, max: 5, step: 0.01, value: 0.3 },
      { id: "ft", label: "Fine-tune + eval one-off ($k)", min: 0, max: 500, value: 25 },
    ]}
      compute={(v) => { const mt = (v.req * 1000 * v.tok * 30) / 1e6; const a = mt * v.big, b = mt * v.small; const be = (v.ft * 1000) / Math.max(a - b, 1); return { stats: [{ label: "Large model / month", value: usd(a) }, { label: "Small model / month", value: usd(b), tone: "good" }, { label: "Saving / month", value: usd(a - b), tone: "good" }, { label: "Breakeven", value: `${be.toFixed(1)} months` }], series: [1, 10, 50, 200, 1000, 5000].map((r) => { const m = (r * 1000 * v.tok * 30) / 1e6; return { req: `${r}k`, Large: Math.round(m * v.big), Small: Math.round(m * v.small + (v.ft * 1000) / 12) }; }) }; }}
      chart={{ x: "req", type: "bar", title: "Monthly cost by daily volume (small incl. FT amortized over 12 mo)", lines: [{ key: "Large", color: "#f87171" }, { key: "Small", color: "#a78bfa" }], yFormat: usd }}
      notice="Assumes quality parity on your task — validate with evals." />
  ),
  "explainable-ai": () => (
    <ExplainableScorer title="Review sentiment, explained" subtitle="Transparent linear model" scoreLabel="Positivity" base={50}
      samples={[{ label: "Positive", text: "I love this blender. It is fast, easy to clean and I would recommend it. Great value." }, { label: "Negative", text: "Terrible. It broke after a week, support was slow and I want a refund. Very disappointed." }]}
      features={WORDS.map(([w, s]) => ({ label: `"${w}"`, pattern: new RegExp(`\\b${w}\\b`, "i"), weight: s * 6 }))}
      verdicts={[{ min: 0, label: "Negative", tone: "bad" }, { min: 45, label: "Neutral", tone: "warn" }, { min: 65, label: "Positive", tone: "good" }]}
      notice="A tiny hand-weighted linear model — each word's contribution is exact. Real models need SHAP-style attribution." />
  ),
  "applying-machine-learning-to-robotics": () => (
    <ModelCalculator title="Picking robot ROI" inputs={[
      { id: "pph", label: "Robot picks per hour", min: 100, max: 1500, step: 10, value: 600 },
      { id: "succ", label: "Pick success rate (%)", min: 80, max: 99.9, step: 0.1, value: 97 },
      { id: "cost", label: "Robot cost ($k)", min: 50, max: 1000, step: 10, value: 250 },
      { id: "wage", label: "Human loaded cost ($/hr)", min: 10, max: 60, value: 28 },
      { id: "hpph", label: "Human picks per hour", min: 50, max: 400, step: 10, value: 150 },
      { id: "shifts", label: "Shifts per day (8h)", min: 1, max: 3, value: 2 },
    ]}
      compute={(v) => { const hours = v.shifts * 8 * 300; const good = v.pph * (v.succ / 100); const robotCpp = (v.cost * 1000 / 5 / hours + 15) / good + ((1 - v.succ / 100) * v.pph * (v.wage / v.hpph)) / good; const humanCpp = v.wage / v.hpph; const save = (humanCpp - robotCpp) * good * hours; return { stats: [{ label: "Cost per pick (robot)", value: `$${robotCpp.toFixed(3)}`, tone: robotCpp < humanCpp ? "good" : "bad" }, { label: "Cost per pick (human)", value: `$${humanCpp.toFixed(3)}` }, { label: "Annual saving", value: usd(save), tone: save > 0 ? "good" : "bad" }, { label: "Payback", value: save > 0 ? `${((v.cost * 1000) / save).toFixed(1)} yrs` : "—" }], series: [90, 93, 95, 97, 99, 99.5].map((s) => ({ success: `${s}%`, Saving: Math.round((humanCpp - ((v.cost * 1000 / 5 / hours + 15) / (v.pph * s / 100) + ((1 - s / 100) * v.pph * (v.wage / v.hpph)) / (v.pph * s / 100))) * v.pph * (s / 100) * hours) })) }; }}
      chart={{ x: "success", type: "bar", title: "Annual saving vs pick success", lines: [{ key: "Saving", color: "#f59e0b" }], yFormat: usd }}
      notice="5-year straight-line depreciation, $15/hr robot opex, failed picks handled by humans. Illustrative." />
  ),
};
export default C;
