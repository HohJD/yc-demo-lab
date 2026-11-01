"use client";
import type { ComponentType } from "react";
import { AgentPipeline, ModelCalculator, QueueTriage, WeightedRanker, fmt } from "../kit/engines";

const usd = fmt.usdShort;

const C: Record<string, ComponentType> = {
  "retraining-workers-for-the-ai-economy": () => (
    <WeightedRanker title="Career options for Maria (call-center, 9 yrs)" subtitle="Illustrative data" pickLabel="Top path"
      criteria={[{ id: "pay", label: "Pay vs current", weight: 8 }, { id: "demand", label: "Local job demand", weight: 7 }, { id: "time", label: "Training time", weight: 6, invert: true }, { id: "ai", label: "AI exposure risk", weight: 6, invert: true }, { id: "fit", label: "Skills transfer", weight: 5 }]}
      options={[{ name: "Medical billing specialist", scores: { pay: 6, demand: 7, time: 4, ai: 7, fit: 8 }, note: "12 wks" }, { name: "HVAC technician", scores: { pay: 8, demand: 9, time: 7, ai: 1, fit: 3 }, note: "9 months" }, { name: "Customer success (SaaS)", scores: { pay: 7, demand: 5, time: 3, ai: 6, fit: 9 }, note: "8 wks" }, { name: "Licensed practical nurse", scores: { pay: 8, demand: 9, time: 9, ai: 2, fit: 5 }, note: "12–18 months" }, { name: "AI ops / data labeler lead", scores: { pay: 6, demand: 6, time: 3, ai: 5, fit: 7 }, note: "6 wks" }]}
      notice="Illustrative scores, not labor-market data." />
  ),
  "video-generation-as-a-primitive": () => (
    <ModelCalculator title="Personalized video ROI" inputs={[
      { id: "users", label: "Users / month (k)", min: 1, max: 5000, step: 1, value: 200 },
      { id: "vids", label: "Videos per user", min: 1, max: 10, value: 2 },
      { id: "secs", label: "Seconds per video", min: 5, max: 120, step: 5, value: 20 },
      { id: "cost", label: "Generation cost ($/sec)", min: 0.001, max: 1, step: 0.001, value: 0.05, format: (v) => `$${v.toFixed(3)}` },
      { id: "cache", label: "Cache/template reuse (%)", min: 0, max: 95, value: 60 },
      { id: "lift", label: "Conversion lift (pp)", min: 0, max: 10, step: 0.1, value: 1.2 },
      { id: "ltv", label: "Value per conversion ($)", min: 1, max: 500, value: 60 },
    ]}
      compute={(v) => { const n = v.users * 1000; const cost = n * v.vids * v.secs * v.cost * (1 - v.cache / 100); const rev = n * (v.lift / 100) * v.ltv; return { stats: [{ label: "Generation cost / mo", value: usd(cost) }, { label: "Incremental revenue / mo", value: usd(rev), tone: "good" }, { label: "ROI", value: `${(rev / Math.max(cost, 1)).toFixed(1)}x`, tone: rev > cost ? "good" : "bad" }, { label: "Cost per user", value: `$${(cost / n).toFixed(3)}` }], series: [0.005, 0.01, 0.05, 0.1, 0.3, 1].map((c) => ({ cost: `$${c}`, Cost: Math.round(n * v.vids * v.secs * c * (1 - v.cache / 100)), Revenue: Math.round(rev) })) }; }}
      chart={{ x: "cost", type: "bar", title: "Monthly cost vs revenue by $/sec", lines: [{ key: "Cost", color: "#f87171" }, { key: "Revenue", color: "#34d399" }], yFormat: usd }}
      notice="Illustrative assumptions; no videos are generated." />
  ),
  "the-first-10-person-100b-company": () => (
    <ModelCalculator title="Tiny-team operating model" inputs={[
      { id: "people", label: "Humans", min: 1, max: 100, value: 10 },
      { id: "agents", label: "Agents per human", min: 1, max: 1000, step: 1, value: 200 },
      { id: "rev", label: "Revenue per agent / yr ($k)", min: 1, max: 1000, step: 1, value: 250 },
      { id: "acost", label: "Agent cost / yr ($k)", min: 0.1, max: 200, step: 0.1, value: 30 },
      { id: "pay", label: "Cost per human / yr ($k)", min: 100, max: 2000, step: 10, value: 400 },
      { id: "mult", label: "Valuation multiple (x revenue)", min: 1, max: 40, value: 10 },
    ]}
      compute={(v) => { const n = v.people * v.agents; const rev = n * v.rev * 1000; const cost = n * v.acost * 1000 + v.people * v.pay * 1000; const val = rev * v.mult; return { stats: [{ label: "Agents", value: fmt.num(n) }, { label: "Revenue", value: usd(rev) }, { label: "Margin", value: fmt.pct((rev - cost) / rev), tone: rev > cost ? "good" : "bad" }, { label: "Implied valuation", value: usd(val), tone: val >= 1e11 ? "good" : undefined, sub: val >= 1e11 ? "$100B reached" : `${((val / 1e11) * 100).toFixed(0)}% of $100B` }], series: [10, 50, 100, 200, 500, 1000].map((a) => ({ agents: a, Valuation: Math.round(v.people * a * v.rev * 1000 * v.mult) })) }; }}
      chart={{ x: "agents", title: "Valuation vs agents per human", lines: [{ key: "Valuation", color: "#34d399" }], yFormat: usd }}
      notice="A 'what would you have to believe' model — inputs are your assumptions." />
  ),
  "infrastructure-for-multi-agent-systems": () => (
    <ModelCalculator title="Fan-out reliability" inputs={[
      { id: "n", label: "Sub-agents per run", min: 1, max: 200, value: 30 },
      { id: "p", label: "Sub-agent failure rate (%)", min: 0, max: 30, step: 0.5, value: 5 },
      { id: "r", label: "Retries per sub-agent", min: 0, max: 5, value: 2 },
      { id: "lat", label: "Sub-agent latency (s)", min: 1, max: 300, value: 40 },
      { id: "cost", label: "Cost per sub-agent call ($)", min: 0.001, max: 2, step: 0.001, value: 0.08, format: (v) => `$${v.toFixed(3)}` },
    ]}
      compute={(v) => { const p = v.p / 100; const okNo = Math.pow(1 - p, v.n); const okRetry = Math.pow(1 - Math.pow(p, v.r + 1), v.n); const calls = v.n * (1 - Math.pow(p, v.r + 1)) / (1 - p || 1); const restartCost = (v.n * v.cost) / Math.max(okNo, 1e-6); return { stats: [{ label: "Success (no retries)", value: fmt.pct(okNo), tone: okNo > 0.9 ? "good" : "bad" }, { label: "Success (with retries)", value: fmt.pct(okRetry), tone: okRetry > 0.99 ? "good" : "warn" }, { label: "Cost w/ checkpoint+retry", value: `$${(calls * v.cost).toFixed(2)}`, tone: "good" }, { label: "Cost w/ full restart", value: `$${restartCost.toFixed(2)}`, tone: "bad" }], series: [1, 5, 10, 25, 50, 100, 200].map((n) => ({ n, "No retries": Math.round(Math.pow(1 - p, n) * 100), Retries: Math.round(Math.pow(1 - Math.pow(p, v.r + 1), n) * 100) })), insight: `Latency stays ≈${v.lat}s (parallel) plus up to ${v.r}×${v.lat}s on the slowest retried branch.` }; }}
      chart={{ x: "n", title: "Run success % vs fan-out width", lines: [{ key: "No retries", color: "#f87171" }, { key: "Retries", color: "#34d399" }] }}
      notice="Assumes independent failures; real failures are often correlated (rate limits, outages)." />
  ),
  "ai-native-enterprise-software": () => (
    <QueueTriage title="IT service desk" subtitle="Fictional tickets" itemNoun="ticket" actionHigh="Human" actionLow="Agent resolves" threshold={40}
      items={[
        { id: "t1", title: "Password reset", detail: "User locked out of Okta", fields: { kind: "access", privileged: false, hardware: false, vip: false, confidence: 0.97 } },
        { id: "t2", title: "Grant prod DB access", detail: "Engineer requests write access", fields: { kind: "access", privileged: true, hardware: false, vip: false, confidence: 0.9 } },
        { id: "t3", title: "Laptop won't boot", detail: "MacBook, kernel panic", fields: { kind: "hardware", privileged: false, hardware: true, vip: false, confidence: 0.4 } },
        { id: "t4", title: "Add to #sales Slack", detail: "New hire", fields: { kind: "access", privileged: false, hardware: false, vip: false, confidence: 0.95 } },
        { id: "t5", title: "CEO VPN failing", detail: "Travelling, urgent", fields: { kind: "network", privileged: false, hardware: false, vip: true, confidence: 0.7 } },
        { id: "t6", title: "Install Figma", detail: "Designer", fields: { kind: "software", privileged: false, hardware: false, vip: false, confidence: 0.93 } },
      ]}
      rules={[
        { id: "priv", label: "Privileged access", weight: 45, test: (f) => f.privileged === true },
        { id: "hw", label: "Physical hardware", weight: 40, test: (f) => f.hardware === true },
        { id: "vip", label: "VIP user", weight: 25, test: (f) => f.vip === true },
        { id: "conf", label: "Agent confidence < 80%", weight: 30, test: (f) => Number(f.confidence) < 0.8 },
      ]}
      impact={(fl, all) => [{ label: "Auto-resolved", value: fmt.pct((all.length - fl.length) / all.length), tone: "good" }, { label: "Hours saved / 1k tickets", value: fmt.num(Math.round(((all.length - fl.length) / all.length) * 1000 * 0.4)) }]}
      notice="Fictional tickets; assumes 24 minutes of human time per auto-resolved ticket." />
  ),
  "using-llms-instead-of-government-consulting": () => (
    <AgentPipeline title="Policy question" subtitle="Agency analysis desk"
      cases={[{ id: "ev", label: "EV chargers on highways", input: "Where should the state place 40 federally funded fast chargers to maximize coverage?" }, { id: "ss", label: "Benefits backlog", input: "Why did unemployment-claim processing time double, and what fixes are fastest?" }]}
      steps={[
        { name: "Gather sources", actor: "Research agent", log: (c) => (c.id === "ev" ? "AFDC station data, traffic counts (AADT), NEVI guidance" : "Claims system logs, staffing, DOL timeliness reports") },
        { name: "Analyze", actor: "Analyst agent", log: (c) => (c.id === "ev" ? "Coverage gaps > 50 mi on 6 corridors; 40 sites scored" : "Identity-verification step adds 9 days median; 30% staff vacancy") },
        { name: "Options", actor: "Analyst agent", log: (c) => (c.id === "ev" ? "A: corridor-first · B: equity-weighted · C: hybrid" : "A: hire · B: automate ID checks · C: triage simple claims") },
        { name: "Analyst review", actor: "Agency staff", gate: true, log: () => "Review citations and options before memo?" },
        { name: "Write memo", actor: "Writer agent", log: () => "4-page memo with citations" },
      ]}
      output={(c) => ({ title: "Decision memo (excerpt)", body: c.id === "ev" ? "Recommendation: Option C (hybrid). Covers 94% of corridor miles within 50 mi and 31% of sites in disadvantaged communities.\nSources: AFDC (2026), state AADT, FHWA NEVI guidance." : "Recommendation: Option B + C. Automated ID checks cut median processing from 21 to 12 days; simple-claim triage handles 40% of volume.\nSources: DOL ETA 9050 reports, agency logs.", stats: [{ label: "Turnaround", value: "1 day", tone: "good", sub: "vs ~3 months" }, { label: "Cost", value: "~$5k", tone: "good", sub: "vs ~$1–2M (illustrative)" }] })}
      notice="Scripted memo and illustrative cost comparison; no live analysis runs." />
  ),
};
export default C;
