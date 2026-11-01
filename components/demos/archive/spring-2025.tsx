"use client";
import type { ComponentType } from "react";
import { AgentPipeline, ModelCalculator, QueueTriage, WeightedRanker, fmt } from "../kit/engines";

const usd = fmt.usdShort;

function choose(n: number, k: number) { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; }
function majority(p: number, n: number) { let s = 0; for (let k = Math.floor(n / 2) + 1; k <= n; k++) s += choose(n, k) * p ** k * (1 - p) ** (n - k); if (n % 2 === 0) s += 0.5 * choose(n, n / 2) * p ** (n / 2) * (1 - p) ** (n / 2); return s; }

const C: Record<string, ComponentType> = {
  "a-secure-ai-app-store": () => (
    <QueueTriage title="Permission requests" subtitle="Fictional AI apps" itemNoun="request" actionHigh="Deny" actionMid="Ask user" actionLow="Allow" threshold={50}
      items={[
        { id: "q1", title: "NoteSummarizer → read ~/Documents/notes", detail: "Scoped folder, read-only", fields: { scope: "folder", write: false, egress: false, shell: false, signed: true, secrets: false } },
        { id: "q2", title: "InboxAgent → send email", detail: "Write to Gmail, any recipient", fields: { scope: "account", write: true, egress: true, shell: false, signed: true, secrets: false } },
        { id: "q3", title: "DevHelper → run shell commands", detail: "Unsigned build", fields: { scope: "system", write: true, egress: true, shell: true, signed: false, secrets: false } },
        { id: "q4", title: "PhotoTagger → read ~/Pictures", detail: "Uploads thumbnails to vendor", fields: { scope: "folder", write: false, egress: true, shell: false, signed: true, secrets: false } },
        { id: "q5", title: "CryptoBot → read ~/.ssh", detail: "Requests private keys", fields: { scope: "system", write: false, egress: true, shell: false, signed: true, secrets: true } },
      ]}
      rules={[
        { id: "shell", label: "Shell execution", weight: 40, test: (f) => f.shell === true },
        { id: "secrets", label: "Reads secrets/keys", weight: 50, test: (f) => f.secrets === true },
        { id: "unsigned", label: "Unsigned app", weight: 25, test: (f) => f.signed === false },
        { id: "egress", label: "Network egress of user data", weight: 15, test: (f) => f.egress === true },
        { id: "write", label: "Write/send actions", weight: 15, test: (f) => f.write === true },
        { id: "sys", label: "System-wide scope", weight: 15, test: (f) => f.scope === "system" },
      ]}
      impact={(fl, all) => [{ label: "Denied/prompted", value: `${fl.length}/${all.length}` }]}
      notice="Policy evaluation only — the browser enforces nothing. Apps are fictional." />
  ),
  datacenters: () => (
    <WeightedRanker title="100 MW AI campus sites" subtitle="Fictional sites" pickLabel="Best site"
      criteria={[{ id: "power", label: "Time to energize", weight: 9, invert: true }, { id: "price", label: "Power price", weight: 7, invert: true }, { id: "fiber", label: "Fiber/latency", weight: 4 }, { id: "water", label: "Water stress", weight: 5, invert: true }, { id: "permit", label: "Permitting risk", weight: 6, invert: true }]}
      options={[{ name: "West Texas (ERCOT)", scores: { power: 3, price: 2, fiber: 5, water: 7, permit: 2 }, note: "18 mo · $38/MWh" }, { name: "Northern Virginia", scores: { power: 9, price: 6, fiber: 10, water: 4, permit: 6 }, note: "48+ mo queue" }, { name: "Central Ohio", scores: { power: 5, price: 5, fiber: 7, water: 2, permit: 3 }, note: "30 mo" }, { name: "Quebec hydro", scores: { power: 6, price: 1, fiber: 6, water: 1, permit: 5 }, note: "36 mo · cold climate" }, { name: "Behind-the-meter gas, ND", scores: { power: 2, price: 3, fiber: 3, water: 3, permit: 4 }, note: "12 mo · emissions" }]}
      notice="Sites and scores are fictional." />
  ),
  "compliance-and-audit": () => (
    <QueueTriage title="SOC 2 control tests" subtitle="Fictional evidence · Q3" itemNoun="control" actionHigh="Exception" actionMid="Review" actionLow="Passed" threshold={35}
      items={[
        { id: "c1", title: "CC6.1 Access reviews", detail: "Quarterly review evidence", fields: { evidence: true, ageDays: 20, exceptions: 0, automated: true } },
        { id: "c2", title: "CC6.2 Offboarding", detail: "3 terminated users still active in GitHub", fields: { evidence: true, ageDays: 5, exceptions: 3, automated: true } },
        { id: "c3", title: "CC7.2 Vulnerability scans", detail: "Last scan 140 days ago", fields: { evidence: true, ageDays: 140, exceptions: 0, automated: false } },
        { id: "c4", title: "CC8.1 Change management", detail: "PR approvals", fields: { evidence: true, ageDays: 1, exceptions: 0, automated: true } },
        { id: "c5", title: "A1.2 Backups tested", detail: "No restore test on file", fields: { evidence: false, ageDays: 999, exceptions: 0, automated: false } },
      ]}
      rules={[
        { id: "ev", label: "Evidence missing", weight: 45, test: (f) => f.evidence === false },
        { id: "stale", label: "Evidence older than 90 days", weight: 25, test: (f) => Number(f.ageDays) > 90 },
        { id: "exc", label: "Exceptions found", weight: 40, test: (f) => Number(f.exceptions) > 0 },
        { id: "man", label: "Manual control", weight: 10, test: (f) => f.automated === false },
      ]}
      impact={(fl, all) => [{ label: "Auditor attention", value: `${fl.length}/${all.length}` }, { label: "Auto-passed", value: String(all.length - fl.length), tone: "good" }]}
      notice="Fictional evidence; control IDs reference SOC 2 Trust Services Criteria for flavour." />
  ),
  "browser-computer-automation": () => (
    <AgentPipeline title="Portal task" subtitle="Fictional carrier portal"
      cases={[{ id: "claim", label: "File freight damage claim", input: "Shipment PRO 4471-22, 3 pallets damaged, photos attached, value $8,240." }, { id: "invoice", label: "Download 30 invoices", input: "Download all September invoices from the supplier portal and upload to the AP system." }]}
      steps={[
        { name: "Log in", actor: "Browser agent", log: () => "Credentials from vault · MFA via TOTP ✓" },
        { name: "Navigate", actor: "Browser agent", log: (c) => (c.id === "claim" ? "Claims › New claim › Cargo damage" : "Billing › Invoices › filter: Sep 2026") },
        { name: "Fill / collect", actor: "Browser agent", log: (c) => (c.id === "claim" ? "PRO ✓ · pieces 3 ✓ · value $8,240 ✓ · 6 photos uploaded" : "30 PDFs found · 2 paginated pages handled") },
        { name: "Human approval", actor: "Ops", gate: true, log: (c) => (c.id === "claim" ? "Review the filled claim before submit?" : "Upload 30 invoices to AP?") },
        { name: "Submit & verify", actor: "Browser agent", log: (c) => (c.id === "claim" ? "Submitted · confirmation CLM-99812 captured" : "30/30 uploaded · totals reconcile $112,430") },
      ]}
      output={(c) => ({ title: "Result", body: c.id === "claim" ? "Claim CLM-99812 filed. Screenshot + DOM replay saved for audit." : "30 invoices moved to AP. 0 duplicates.", stats: [{ label: "Time", value: c.id === "claim" ? "2m 40s" : "4m 05s", tone: "good" }] })}
      notice="Scripted steps; no browser is automated." />
  ),
  "ai-personal-staff-for-everyone": () => (
    <ModelCalculator title="Human staff vs AI staff" inputs={[
      { id: "ea", label: "Assistant hours / month", min: 0, max: 80, value: 20 },
      { id: "acct", label: "Accountant hours / year", min: 0, max: 40, value: 6 },
      { id: "law", label: "Lawyer hours / year", min: 0, max: 40, value: 4 },
      { id: "doc", label: "Doctor consults / year", min: 0, max: 24, value: 4 },
      { id: "ai", label: "AI staff subscription ($/mo)", min: 0, max: 500, value: 60 },
    ]}
      compute={(v) => { const human = { Assistant: v.ea * 12 * 35, Accountant: v.acct * 200, Lawyer: v.law * 400, Doctor: v.doc * 180 }; const tot = Object.values(human).reduce((a, b) => a + b, 0); const ai = v.ai * 12 + (v.law * 400 + v.doc * 180) * 0.2; return { stats: [{ label: "Human staff / yr", value: usd(tot) }, { label: "AI staff / yr", value: usd(ai), tone: "good", sub: "incl. 20% human escalation for legal/medical" }, { label: "Savings", value: usd(tot - ai), tone: tot > ai ? "good" : "bad" }], series: Object.entries(human).map(([k, val]) => ({ role: k, Human: val })) }; }}
      chart={{ x: "role", type: "bar", title: "Annual human cost by role", lines: [{ key: "Human", color: "#facc15" }], yFormat: usd }}
      notice="Illustrative hourly rates ($35/$200/$400/$180)." />
  ),
  "devtools-for-ai-agents": () => (
    <AgentPipeline title="Failing agent run #8812" subtitle="Travel-booking agent"
      cases={[{ id: "r", label: "Run #8812 (failed)", input: "Task: 'Book the cheapest refundable flight SFO→JFK next Tue'. Result: booked non-refundable fare." }]}
      steps={[
        { name: "Load trace", actor: "AgentTrace", log: () => "14 spans · 3 tool calls · 41k tokens" },
        { name: "Diff vs spec", actor: "AgentTrace", log: () => "Constraint 'refundable' present in plan (span 2) but missing in search_flights args (span 5)" },
        { name: "Root cause", actor: "AgentTrace", log: () => "Tool schema lacks `refundable` param → model dropped constraint" },
        { name: "Suggest fix", actor: "AgentTrace", log: () => "Add `fare_rules.refundable: bool` to tool schema + post-condition check" },
        { name: "Replay with fix", actor: "Replayer", log: () => "Deterministic replay: refundable fare $412 booked ✓" },
      ]}
      output={() => ({ title: "Root cause report", body: "Failure: constraint lost between planning and tool call.\nFix: extend tool schema; add assertion `booking.refundable === true`.\nRegression eval added: 25 refundable-booking cases (25/25 pass).", stats: [{ label: "Spans", value: "14" }, { label: "Replay", value: "Pass", tone: "good" }] })}
      notice="Trace and analysis are scripted examples." />
  ),
  "the-future-of-software-engineering": () => (
    <ModelCalculator title="Where's the bottleneck?" inputs={[
      { id: "eng", label: "Engineers", min: 1, max: 200, value: 10 },
      { id: "prs", label: "Agent PRs per engineer per day", min: 0, max: 30, value: 6 },
      { id: "review", label: "Review minutes per PR", min: 1, max: 120, value: 20 },
      { id: "hours", label: "Engineer hours for review per day", min: 0.5, max: 8, step: 0.5, value: 3 },
      { id: "auto", label: "Auto-verified by tests/review agents (%)", min: 0, max: 90, value: 30 },
    ]}
      compute={(v) => { const produced = v.eng * v.prs; const capacity = (v.eng * v.hours * 60) / v.review / (1 - v.auto / 100); const merged = Math.min(produced, capacity); const backlog = produced - merged; return { stats: [{ label: "PRs produced / day", value: fmt.num(produced) }, { label: "Review capacity / day", value: fmt.num(Math.round(capacity)) }, { label: "Merged / day", value: fmt.num(Math.round(merged)), tone: "good" }, { label: "Bottleneck", value: backlog > 0 ? "Review" : "Generation", tone: backlog > 0 ? "warn" : "good", sub: backlog > 0 ? `+${Math.round(backlog)} PRs/day backlog` : undefined }], series: [0, 15, 30, 50, 70, 90].map((a) => ({ auto: `${a}%`, Merged: Math.round(Math.min(produced, (v.eng * v.hours * 60) / v.review / (1 - a / 100))) })) }; }}
      chart={{ x: "auto", type: "bar", title: "Merged PRs/day vs auto-verification", lines: [{ key: "Merged", color: "#22d3ee" }] }}
      notice="Simple capacity model; ignores PR size and rework." />
  ),
  "ai-commercial-open-source-software-aicoss": () => (
    <ModelCalculator title="Stars → ARR" inputs={[
      { id: "stars", label: "GitHub stars (k)", min: 1, max: 200, value: 25 },
      { id: "u", label: "Active users per star", min: 0.1, max: 5, step: 0.1, value: 1.5 },
      { id: "t", label: "Users at companies (%)", min: 1, max: 80, value: 30 },
      { id: "c", label: "Company → paid conversion (%)", min: 0.1, max: 10, step: 0.1, value: 1.5 },
      { id: "acv", label: "ACV ($k)", min: 1, max: 200, value: 24 },
      { id: "per", label: "Users per company", min: 1, max: 50, value: 5 },
    ]}
      compute={(v) => { const users = v.stars * 1000 * v.u; const cos = (users * (v.t / 100)) / v.per; const paid = cos * (v.c / 100); const arr = paid * v.acv * 1000; return { stats: [{ label: "Active users", value: fmt.num(Math.round(users)) }, { label: "Companies using it", value: fmt.num(Math.round(cos)) }, { label: "Paying customers", value: fmt.num(Math.round(paid)) }, { label: "ARR", value: usd(arr), tone: "good" }], series: [{ stage: "Users", Count: Math.round(users) }, { stage: "Companies", Count: Math.round(cos) }, { stage: "Paid", Count: Math.round(paid) }] }; }}
      chart={{ x: "stage", type: "bar", title: "Funnel", lines: [{ key: "Count", color: "#a78bfa" }] }}
      notice="Conversion defaults are illustrative, not benchmarks." />
  ),
  "ai-coding-agents-for-hardware-optimized-code": () => (
    <ModelCalculator title="Tiled GEMM roofline" inputs={[
      { id: "n", label: "Matrix size N (N×N×N)", min: 256, max: 16384, step: 256, value: 4096 },
      { id: "tile", label: "Tile size", min: 16, max: 512, step: 16, value: 128 },
      { id: "bytes", label: "Bytes per element (2=BF16)", min: 1, max: 4, value: 2 },
      { id: "peak", label: "Peak TFLOPs", min: 10, max: 2500, step: 10, value: 989 },
      { id: "bw", label: "Memory bandwidth (TB/s)", min: 0.5, max: 8, step: 0.1, value: 3.35 },
    ]}
      compute={(v) => { const flops = 2 * v.n ** 3; const bytes = v.bytes * (2 * v.n ** 3 / v.tile + v.n * v.n); const ai = flops / bytes; const attain = Math.min(v.peak, (ai * v.bw * 1e12) / 1e12); const ridge = v.peak / v.bw; return { stats: [{ label: "Arithmetic intensity", value: `${ai.toFixed(0)} FLOP/B` }, { label: "Ridge point", value: `${ridge.toFixed(0)} FLOP/B` }, { label: "Attainable", value: `${attain.toFixed(0)} TFLOPs`, tone: attain >= v.peak * 0.99 ? "good" : "warn" }, { label: "Bound", value: ai >= ridge ? "Compute" : "Memory", tone: ai >= ridge ? "good" : "warn" }], series: [16, 32, 64, 128, 256, 512].map((t) => { const a = (2 * v.n ** 3) / (v.bytes * (2 * v.n ** 3 / t + v.n * v.n)); return { tile: t, TFLOPs: Math.round(Math.min(v.peak, a * v.bw)) }; }), insight: "An agent would search tile sizes/layouts and verify against measured benchmarks." }; }}
      chart={{ x: "tile", title: "Attainable TFLOPs vs tile size", lines: [{ key: "TFLOPs", color: "#22d3ee" }] }}
      notice="Simplified reuse model (each tile loads 2·N³/T elements); real kernels also hit cache/occupancy limits." />
  ),
  "b2a-software-where-the-customers-will-all-be-agents": () => (
    <AgentPipeline title="Agent purchase" subtitle="Machine-to-machine commerce"
      cases={[{ id: "data", label: "Buy a dataset", input: "Procurement agent needs 10k geocoded US business addresses for a CRM cleanup. Budget policy: ≤ $300 per task." }, { id: "gpu", label: "Rent GPU hours", input: "Training agent needs 64 H100-hours tonight. Budget policy: ≤ $250." }]}
      steps={[
        { name: "Discover", actor: "Buyer agent", log: () => "GET /.well-known/agent-catalog → 3 matching offers" },
        { name: "Quote", actor: "Seller API", log: (c) => (c.id === "data" ? "POST /quote → $240 · SLA 10 min · licence: internal use" : "POST /quote → $198 · start 22:00 UTC") },
        { name: "Policy check", actor: "Buyer wallet", gate: true, log: (c) => (c.id === "data" ? "$240 ≤ $300 ✓ · vendor allow-listed ✓ — approve spend?" : "$198 ≤ $250 ✓ — approve spend?") },
        { name: "Pay", actor: "Payment rail", log: () => "Payment token issued · settled" },
        { name: "Deliver", actor: "Seller API", log: (c) => (c.id === "data" ? "Signed URL to dataset (10,000 rows)" : "SSH endpoint + credentials (expires 06:00)") },
      ]}
      output={(c) => ({ title: "Machine-readable receipt", body: JSON.stringify({ buyer: "agent://acme/procurement-7", seller: c.id === "data" ? "api.geodata.example" : "api.gpucloud.example", amount_usd: c.id === "data" ? 240 : 198, policy: "auto-approved under budget", delivered: true }, null, 2) })}
      notice="Scripted flow; no payments or APIs are called." />
  ),
  "vertical-ai-agents": () => (
    <ModelCalculator title="Agent TAM vs SaaS TAM" inputs={[
      { id: "cos", label: "Companies in vertical (k)", min: 1, max: 1000, value: 120 },
      { id: "workers", label: "Workers doing the job per company", min: 1, max: 100, value: 6 },
      { id: "wage", label: "Loaded wage ($k/yr)", min: 20, max: 300, value: 65 },
      { id: "auto", label: "Automatable share (%)", min: 5, max: 90, value: 40 },
      { id: "capture", label: "Price capture of labor saved (%)", min: 5, max: 60, value: 25 },
      { id: "saas", label: "SaaS spend per company ($k/yr)", min: 0.5, max: 100, step: 0.5, value: 8 },
    ]}
      compute={(v) => { const labor = v.cos * 1000 * v.workers * v.wage * 1000; const agentTam = labor * (v.auto / 100) * (v.capture / 100); const saasTam = v.cos * 1000 * v.saas * 1000; return { stats: [{ label: "Labor spend", value: usd(labor) }, { label: "Agent TAM", value: usd(agentTam), tone: "good" }, { label: "SaaS TAM", value: usd(saasTam) }, { label: "Ratio", value: `${(agentTam / saasTam).toFixed(1)}x` }], series: [{ market: "SaaS", Size: Math.round(saasTam) }, { market: "Agents", Size: Math.round(agentTam) }] }; }}
      chart={{ x: "market", type: "bar", title: "Market size", lines: [{ key: "Size", color: "#818cf8" }], yFormat: usd }}
      notice="Top-down sizing on your assumptions." />
  ),
  "inference-ai-infrastructure-in-the-world-of-test-time-compute": () => (
    <ModelCalculator title="Majority voting budget" inputs={[
      { id: "p", label: "Single-sample accuracy (%)", min: 30, max: 99, value: 65 },
      { id: "n", label: "Samples (N)", min: 1, max: 64, value: 9 },
      { id: "tok", label: "Tokens per sample (k)", min: 0.5, max: 50, step: 0.5, value: 4 },
      { id: "price", label: "$ per 1M output tokens", min: 0.1, max: 60, step: 0.1, value: 8 },
    ]}
      compute={(v) => { const p = v.p / 100; const acc = majority(p, v.n); const cost = (v.n * v.tok * 1000 * v.price) / 1e6; return { stats: [{ label: "Single-sample accuracy", value: fmt.pct(p) }, { label: `Majority of ${v.n}`, value: fmt.pct(acc), tone: acc > p ? "good" : "bad" }, { label: "Cost per query", value: `$${cost.toFixed(3)}` }, { label: "Cost per correct", value: `$${(cost / acc).toFixed(3)}` }], series: [1, 3, 5, 9, 15, 25, 41, 64].map((n) => ({ N: n, Accuracy: +(majority(p, n) * 100).toFixed(1) })), insight: p < 0.5 ? "Below 50% accuracy, voting makes things worse." : "Diminishing returns — adaptive compute spends samples only on hard queries." }; }}
      chart={{ x: "N", title: "Majority-vote accuracy % vs N", lines: [{ key: "Accuracy", color: "#fb923c" }] }}
      notice="Exact binomial math assuming independent samples on a binary-answer task; real samples are correlated." />
  ),
};
export default C;
