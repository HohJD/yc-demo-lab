"use client";
import type { ComponentType } from "react";
import { AgentPipeline, ExplainableScorer, ModelCalculator, QueueTriage, fmt } from "../kit/engines";

const usd = fmt.usdShort;

function finance(v: Record<string, number>) {
  let debt = v.debt * 1000, nw = v.save * 1000 - debt, cash = v.save * 1000, interest = 0, freeMonth = -1;
  const series: Record<string, number | string>[] = [];
  const surplus = (v.income - v.spend) * 1000 / 12;
  for (let m = 1; m <= 240; m++) {
    const i = debt * (v.apr / 100 / 12); interest += i; debt += i;
    let pay = Math.min(debt, Math.max(surplus * (v.toDebt / 100), debt > 0 ? debt * 0.02 : 0));
    pay = Math.min(pay, Math.max(surplus, 0)); debt -= pay;
    if (debt <= 0.5 && freeMonth < 0) { debt = 0; freeMonth = m; }
    cash = cash * (1 + v.ret / 100 / 12) + Math.max(surplus - pay, 0);
    nw = cash - debt;
    if (m % 12 === 0) series.push({ year: `Y${m / 12}`, "Net worth": Math.round(nw) });
  }
  return { freeMonth, interest, nw, series, surplus };
}

const C: Record<string, ComponentType> = {
  "full-stack-ai-companies": () => (
    <AgentPipeline title="New client case" subtitle="AI-native immigration firm"
      cases={[{ id: "o1", label: "O-1A founder visa", input: "Founder, 2 patents, press in TechCrunch, $4M raised, judged a hackathon." }, { id: "h1b", label: "H-1B transfer", input: "Software engineer changing employers, current H-1B valid to 2027." }]}
      steps={[
        { name: "Intake", actor: "Intake agent", log: (c) => (c.id === "o1" ? "Collected CV, press links, patents, funding docs" : "Collected I-797, pay stubs, new offer letter") },
        { name: "Eligibility", actor: "Analyst agent", log: (c) => (c.id === "o1" ? "Criteria met: awards?, press ✓, judging ✓, original contributions ✓, high salary ✓ → 4 of 8 (need 3)" : "Valid status ✓ · employer LCA needed") },
        { name: "Evidence gaps", actor: "Analyst agent", log: (c) => (c.id === "o1" ? "Need 2 expert recommendation letters" : "Need LCA certification (~7 days)") },
        { name: "Draft petition", actor: "Drafting agent", log: (c) => (c.id === "o1" ? "42-page petition letter with exhibit index" : "I-129 + support letter drafted") },
        { name: "Attorney sign-off", actor: "Attorney", gate: true, log: () => "Attorney reviews and signs the filing packet?" },
        { name: "File", actor: "Filing agent", log: () => "Packet assembled and ready for submission" },
      ]}
      output={(c) => ({ title: "Case status", body: c.id === "o1" ? "O-1A petition ready (pending 2 letters).\nAttorney time: 1.5h (vs ~12h traditional)." : "H-1B transfer ready after LCA.\nAttorney time: 0.5h.", stats: [{ label: "Attorney hours", value: c.id === "o1" ? "1.5" : "0.5", tone: "good" }, { label: "Flat fee", value: c.id === "o1" ? "$4,500" : "$1,800" }] })}
      notice="Scripted example — not legal advice. Criteria summaries are simplified." />
  ),
  "more-design-founders": () => (
    <ExplainableScorer title="Landing-page clarity" subtitle="Paste your hero section" scoreLabel="Clarity" base={50}
      samples={[{ label: "Vague", text: "Revolutionizing the future of synergistic AI-powered solutions. Leverage our cutting-edge platform to unlock seamless innovation at scale. Learn more." }, { label: "Clear", text: "Close your books in 2 days, not 10. Ledgerly reconciles Stripe, Brex and your bank automatically. Used by 1,200 startups including Acme and Globex. Start free — no card required." }]}
      features={[
        { label: "Concrete number/outcome", pattern: /\b\d+(\.\d+)?\s?(days?|hours?|%|x|minutes?)\b/i, weight: 15 },
        { label: "Social proof", pattern: /used by|trusted by|customers|including/i, weight: 10 },
        { label: "Clear CTA", pattern: /start free|get started|try|book a demo|sign up/i, weight: 10 },
        { label: "Names real integrations/things", pattern: /stripe|slack|salesforce|bank|shopify|brex/i, weight: 5 },
        { label: "Buzzwords", pattern: /revolutioni[sz]|synerg|cutting-edge|leverage|seamless|unlock|next-gen/i, weight: -12, explain: "per match group" },
        { label: "Vague CTA ('Learn more')", pattern: /learn more/i, weight: -8 },
        { label: "Risk reversal", pattern: /no card|free trial|cancel anytime/i, weight: 5 },
      ]}
      verdicts={[{ min: 0, label: "Unclear", tone: "bad", advice: "Say what it does, for whom, with a number." }, { min: 55, label: "Okay", tone: "warn" }, { min: 80, label: "Clear", tone: "good" }]}
      notice="Opinionated heuristics on text only; not a substitute for user testing." />
  ),
  "voice-ai": () => (
    <AgentPipeline title="Inbound call" subtitle="Bright Smile Dental (fictional)"
      cases={[{ id: "book", label: "New patient booking", input: "Caller: 'Hi, I chipped a tooth and need to come in this week. I have Delta Dental.'" }, { id: "bill", label: "Billing dispute", input: "Caller: 'I was charged twice for my cleaning last month and I'm really frustrated.'" }]}
      steps={[
        { name: "Transcribe", actor: "ASR (scripted)", log: (c) => (c.id === "book" ? "'chipped a tooth… this week… Delta Dental'" : "'charged twice… cleaning… frustrated'") },
        { name: "Intent & urgency", actor: "NLU", log: (c) => (c.id === "book" ? "intent=new_patient_urgent · urgency=high" : "intent=billing_dispute · sentiment=negative") },
        { name: "Check systems", actor: "Tools", log: (c) => (c.id === "book" ? "Insurance: Delta PPO in-network ✓\nCalendar: Thu 10:30, Fri 14:00 open" : "Ledger: 2 charges of $145 on 10/03 (duplicate)") },
        { name: "Act", actor: "Voice agent", log: (c) => (c.id === "book" ? "Offered Thu 10:30 → accepted; SMS confirmation sent" : "Policy: refunds >$100 need staff → warm transfer with summary") },
      ]}
      output={(c) => ({ title: "Call outcome", body: c.id === "book" ? "Booked: Thu 10:30 emergency exam (new patient).\nCall time: 1m 48s · no hold." : "Escalated to billing staff with summary: duplicate $145 charge on 10/03, caller frustrated, wants refund.", stats: [{ label: "Resolved by AI", value: c.id === "book" ? "Yes" : "Handoff", tone: c.id === "book" ? "good" : "warn" }] })}
      notice="Transcripts and system responses are scripted; no audio is processed." />
  ),
  "ai-for-scientific-advancement": () => (
    <ModelCalculator title="Virtual screening funnel" inputs={[
      { id: "lib", label: "Candidate library (k)", min: 1, max: 10000, step: 1, value: 1000 },
      { id: "hit", label: "Base hit rate (%)", min: 0.01, max: 5, step: 0.01, value: 0.1 },
      { id: "enr", label: "Model enrichment (x)", min: 1, max: 50, step: 0.5, value: 10 },
      { id: "tests", label: "Wet-lab tests you can afford", min: 10, max: 10000, step: 10, value: 500 },
      { id: "cost", label: "Cost per test ($)", min: 10, max: 5000, step: 10, value: 400 },
    ]}
      compute={(v) => { const base = v.hit / 100; const pModel = Math.min(base * v.enr, 1); const hitsRand = v.tests * base, hitsModel = v.tests * pModel; const spend = v.tests * v.cost; return { stats: [{ label: "Hits (random)", value: hitsRand.toFixed(1) }, { label: "Hits (model-ranked)", value: hitsModel.toFixed(1), tone: "good" }, { label: "Cost per hit", value: `${usd(spend / Math.max(hitsModel, 0.01))} vs ${usd(spend / Math.max(hitsRand, 0.01))}` }, { label: "Library screened in silico", value: `${fmt.num(v.lib)}k` }], series: [1, 2, 5, 10, 20, 50].map((e) => ({ enrichment: `${e}x`, Hits: +(v.tests * Math.min(base * e, 1)).toFixed(1) })) }; }}
      chart={{ x: "enrichment", type: "bar", title: "Expected hits vs model enrichment", lines: [{ key: "Hits", color: "#a78bfa" }] }}
      notice="Expected-value math; enrichment factor is your assumption about model quality." />
  ),
  "ai-personal-assistant": () => (
    <QueueTriage title="Inbox triage" subtitle="Fictional emails · this morning" itemNoun="email" actionHigh="Needs you" actionMid="Draft reply" actionLow="Archive" threshold={40}
      items={[
        { id: "e1", title: "Board deck due Friday", detail: "From: lead investor", fields: { vip: true, deadline: true, question: true, newsletter: false, receipt: false } },
        { id: "e2", title: "Your weekly digest", detail: "From: Substack", fields: { vip: false, deadline: false, question: false, newsletter: true, receipt: false } },
        { id: "e3", title: "Can we move our 1:1?", detail: "From: direct report", fields: { vip: false, deadline: false, question: true, newsletter: false, receipt: false } },
        { id: "e4", title: "Receipt for AWS", detail: "From: AWS billing", fields: { vip: false, deadline: false, question: false, newsletter: false, receipt: true } },
        { id: "e5", title: "Contract redlines — sign by EOD", detail: "From: customer legal", fields: { vip: true, deadline: true, question: false, newsletter: false, receipt: false } },
      ]}
      rules={[
        { id: "vip", label: "VIP sender", weight: 30, test: (f) => f.vip === true },
        { id: "dl", label: "Deadline mentioned", weight: 25, test: (f) => f.deadline === true },
        { id: "q", label: "Direct question to you", weight: 20, test: (f) => f.question === true },
        { id: "news", label: "Newsletter", weight: -30, test: (f) => f.newsletter === true },
        { id: "rcpt", label: "Receipt (auto-file)", weight: -20, test: (f) => f.receipt === true },
      ]}
      impact={(fl, all) => [{ label: "Needs you", value: `${fl.length}/${all.length}` }, { label: "Handled by assistant", value: String(all.length - fl.length), tone: "good" }]}
      notice="Fictional emails; real assistant would classify with a model and learn your preferences." />
  ),
  "healthcare-ai": () => (
    <QueueTriage title="Prior-auth pre-check" subtitle="Fictional requests · simplified criteria" itemNoun="request" actionHigh="Fix before submit" actionLow="Submit" threshold={30}
      items={[
        { id: "r1", title: "Lumbar MRI — pt 1042", detail: "Low back pain 3 weeks", fields: { conservativeWeeks: 3, redFlags: false, dxMatch: true, notesAttached: true } },
        { id: "r2", title: "Knee arthroscopy — pt 2211", detail: "Meniscal tear on MRI", fields: { conservativeWeeks: 8, redFlags: false, dxMatch: true, notesAttached: true } },
        { id: "r3", title: "Brain MRI — pt 3307", detail: "Headache + neuro deficit", fields: { conservativeWeeks: 0, redFlags: true, dxMatch: true, notesAttached: true } },
        { id: "r4", title: "Humira — pt 4410", detail: "Rheumatoid arthritis", fields: { conservativeWeeks: 12, redFlags: false, dxMatch: false, notesAttached: false } },
      ]}
      rules={[
        { id: "cons", label: "< 6 weeks conservative therapy (no red flags)", weight: 40, test: (f) => Number(f.conservativeWeeks) < 6 && f.redFlags !== true },
        { id: "dx", label: "Diagnosis code doesn't match policy", weight: 35, test: (f) => f.dxMatch === false },
        { id: "notes", label: "Clinical notes missing", weight: 25, test: (f) => f.notesAttached === false },
      ]}
      impact={(fl, all) => [{ label: "Likely denials caught", value: `${fl.length}/${all.length}`, tone: "warn" }, { label: "Ready to submit", value: String(all.length - fl.length), tone: "good" }]}
      notice="Simplified illustrative criteria; real payer policies vary. Not clinical guidance." />
  ),
  "ai-personal-tutor-for-everyone": () => (
    <ExplainableScorer title="Explain photosynthesis" subtitle="Student answer · rubric grading" scoreLabel="Understanding" base={10}
      samples={[{ label: "Partial", text: "Plants eat sunlight to make food. They breathe in oxygen and breathe out carbon dioxide." }, { label: "Strong", text: "Plants use light energy, captured by chlorophyll in chloroplasts, to convert carbon dioxide and water into glucose. Oxygen is released as a by-product. The glucose stores chemical energy." }]}
      features={[
        { label: "Light energy", pattern: /light|sun/i, weight: 15 }, { label: "Carbon dioxide input", pattern: /carbon dioxide|co2/i, weight: 15 },
        { label: "Water input", pattern: /water|h2o/i, weight: 15 }, { label: "Glucose/sugar output", pattern: /glucose|sugar/i, weight: 15 },
        { label: "Oxygen released", pattern: /oxygen (is )?released|release[sd]? oxygen|by-?product/i, weight: 15 },
        { label: "Chlorophyll/chloroplast", pattern: /chlorophyll|chloroplast/i, weight: 10 },
        { label: "Misconception: plants 'eat' sunlight", pattern: /eat sunlight/i, weight: -10, explain: "energy is captured, not eaten" },
        { label: "Misconception: breathe in oxygen/out CO₂", pattern: /breathe in oxygen/i, weight: -15, explain: "reversed for photosynthesis" },
      ]}
      verdicts={[{ min: 0, label: "Needs help", tone: "bad", advice: "Tutor asks: 'What goes in, and what comes out?'" }, { min: 50, label: "Getting there", tone: "warn", advice: "Tutor asks about the role of chlorophyll." }, { min: 85, label: "Mastered", tone: "good", advice: "Move on to cellular respiration." }]}
      notice="Keyword rubric for illustration; a real tutor would use a model guided by this rubric." />
  ),
  "software-tools-to-make-robots": () => (
    <ModelCalculator title="Sim vs real data planner" inputs={[
      { id: "sim", label: "Sim training hours (k)", min: 0, max: 500, step: 1, value: 50 },
      { id: "dr", label: "Domain randomization (0–10)", min: 0, max: 10, value: 6 },
      { id: "demos", label: "Real teleop demos", min: 0, max: 5000, step: 50, value: 300 },
      { id: "diff", label: "Task difficulty (1–10)", min: 1, max: 10, value: 6 },
      { id: "demoCost", label: "Cost per real demo ($)", min: 1, max: 200, value: 25 },
    ]}
      compute={(v) => { const succ = (sim: number, demos: number) => { const transfer = 0.3 + 0.06 * v.dr; const s = 1 - Math.exp(-(sim * transfer) / (8 * v.diff)); const r = 1 - Math.exp(-demos / (120 * v.diff)); return Math.min(0.99, 1 - (1 - s * 0.85) * (1 - r)); }; const now = succ(v.sim, v.demos); return { stats: [{ label: "Est. real-world success", value: fmt.pct(now), tone: now > 0.9 ? "good" : now > 0.7 ? "warn" : "bad" }, { label: "Real data cost", value: usd(v.demos * v.demoCost) }, { label: "Sim-to-real transfer", value: fmt.pct(0.3 + 0.06 * v.dr) }], series: [0, 100, 300, 600, 1000, 2000, 5000].map((d) => ({ demos: d, "With sim": Math.round(succ(v.sim, d) * 100), "Real only": Math.round(succ(0, d) * 100) })) }; }}
      chart={{ x: "demos", title: "Success % vs real demos", lines: [{ key: "With sim", color: "#f59e0b" }, { key: "Real only", color: "#8b91a3" }] }}
      notice="Toy saturating curves to explore trade-offs — not a prediction for any real robot." />
  ),
  "the-future-of-education": () => (
    <QueueTriage title="Grade 9 · Period 3" subtitle="Fictional students" itemNoun="student" actionHigh="Counselor check-in" actionMid="Teacher nudge" actionLow="On track" threshold={40}
      items={[
        { id: "s1", title: "Jordan", detail: "Attendance 78%, math grade −18 pts", fields: { attendance: 78, gradeDrop: 18, missing: 4, engagement: 2 } },
        { id: "s2", title: "Priya", detail: "Strong across subjects", fields: { attendance: 98, gradeDrop: 0, missing: 0, engagement: 9 } },
        { id: "s3", title: "Marcus", detail: "Missing 6 assignments", fields: { attendance: 92, gradeDrop: 8, missing: 6, engagement: 4 } },
        { id: "s4", title: "Ana", detail: "Quiet, engagement falling", fields: { attendance: 95, gradeDrop: 4, missing: 1, engagement: 3 } },
      ]}
      rules={[
        { id: "att", label: "Attendance < 90%", weight: 30, test: (f) => Number(f.attendance) < 90 },
        { id: "drop", label: "Grade drop > 10 pts", weight: 25, test: (f) => Number(f.gradeDrop) > 10 },
        { id: "miss", label: "≥ 3 missing assignments", weight: 25, test: (f) => Number(f.missing) >= 3 },
        { id: "eng", label: "Low engagement (≤ 3/10)", weight: 20, test: (f) => Number(f.engagement) <= 3 },
      ]}
      impact={(fl) => [{ label: "Flagged early", value: String(fl.length), tone: "warn" }]}
      notice="Fictional students; rules are illustrative. Real tools need FERPA compliance and educator judgment." />
  ),
  "ai-residential-security": () => (
    <QueueTriage title="Camera events · last night" subtitle="Pre-labelled fictional events" itemNoun="event" actionHigh="Alert + monitor" actionMid="Notify" actionLow="Ignore" threshold={45}
      items={[
        { id: "v1", title: "Front porch 02:14", detail: "Unknown person, 4 min loitering", fields: { person: true, known: false, night: true, loiterMin: 4, package: false, animal: false } },
        { id: "v2", title: "Driveway 18:30", detail: "Known face (you)", fields: { person: true, known: true, night: false, loiterMin: 0, package: false, animal: false } },
        { id: "v3", title: "Porch 13:05", detail: "Package removed by unknown person", fields: { person: true, known: false, night: false, loiterMin: 1, package: true, animal: false } },
        { id: "v4", title: "Backyard 23:50", detail: "Raccoon", fields: { person: false, known: false, night: true, loiterMin: 0, package: false, animal: true } },
        { id: "v5", title: "Sidewalk 08:10", detail: "Passer-by", fields: { person: true, known: false, night: false, loiterMin: 0, package: false, animal: false } },
      ]}
      rules={[
        { id: "unk", label: "Unknown person", weight: 15, test: (f) => f.person === true && f.known === false },
        { id: "night", label: "At night", weight: 20, test: (f) => f.night === true && f.person === true },
        { id: "loiter", label: "Loitering ≥ 2 min", weight: 25, test: (f) => Number(f.loiterMin) >= 2 },
        { id: "pkg", label: "Package removed by non-resident", weight: 40, test: (f) => f.package === true && f.known === false },
        { id: "animal", label: "Animal", weight: -20, test: (f) => f.animal === true },
      ]}
      impact={(fl, all) => [{ label: "Alerts", value: `${fl.length}/${all.length}` }, { label: "Noise suppressed", value: fmt.pct((all.length - fl.length) / all.length), tone: "good" }]}
      notice="Events are pre-labelled text; no video or face recognition runs." />
  ),
  "internal-agent-builder": () => (
    <AgentPipeline title="Describe your automation" subtitle="Governed agent builder"
      cases={[{ id: "sales", label: "Sales follow-ups", input: "When a demo call ends in Gong, draft a follow-up email in my voice and log next steps in Salesforce." }, { id: "fin", label: "Expense checks", input: "Every Monday, flag expenses over $500 without receipts and message the owner in Slack." }]}
      steps={[
        { name: "Parse intent", actor: "Builder", log: (c) => (c.id === "sales" ? "trigger=gong.call_ended · actions=[draft_email, update_sf]" : "trigger=cron(Mon 9am) · actions=[query_expenses, slack_dm]") },
        { name: "Resolve connectors", actor: "Builder", log: (c) => (c.id === "sales" ? "Gong (read), Gmail (draft only), Salesforce (write: Opportunity.NextStep)" : "Ramp (read), Slack (DM)") },
        { name: "Policy check", actor: "Policy engine", log: (c) => (c.id === "sales" ? "Email send blocked → drafts only ✓\nPII scope OK" : "Read-only finance scope ✓") },
        { name: "IT approval", actor: "IT admin", gate: true, log: () => "Approve scopes and deploy?" },
        { name: "Deploy", actor: "Runtime", log: () => "Agent live with audit logging" },
      ]}
      output={(c) => ({ title: "Deployed agent", body: JSON.stringify(c.id === "sales" ? { name: "demo-followups", trigger: "gong.call_ended", steps: ["summarize_call", "draft_email(gmail, draft_only)", "update(salesforce.Opportunity.NextStep)"], scopes: ["gong:read", "gmail:draft", "sf:opportunity:write"], owner: "you" } : { name: "receipt-chaser", trigger: "cron 0 9 * * MON", steps: ["query(ramp.expenses, amount>500 && !receipt)", "slack.dm(owner)"], scopes: ["ramp:read", "slack:chat:write"], owner: "you" }, null, 2) })}
      notice="Compiled specs are scripted for the samples; no connectors run." />
  ),
  "ai-research-labs": () => (
    <ModelCalculator title="Lab runway" inputs={[
      { id: "fund", label: "Funding ($M)", min: 1, max: 1000, step: 1, value: 30 },
      { id: "people", label: "Researchers/engineers", min: 1, max: 200, value: 12 },
      { id: "sal", label: "Loaded cost per person ($k/yr)", min: 100, max: 2000, step: 10, value: 450 },
      { id: "gpus", label: "GPUs reserved", min: 0, max: 20000, step: 8, value: 512 },
      { id: "rate", label: "$ / GPU-hour", min: 0.5, max: 10, step: 0.1, value: 2.2, format: (v) => `$${v.toFixed(1)}` },
      { id: "util", label: "Reservation used (%)", min: 10, max: 100, value: 100 },
    ]}
      compute={(v) => { const comp = (v.gpus * v.rate * 730 * (v.util / 100)); const ppl = (v.people * v.sal * 1000) / 12; const burn = comp + ppl + 50000; const runway = (v.fund * 1e6) / burn; return { stats: [{ label: "Monthly burn", value: usd(burn) }, { label: "Compute share", value: fmt.pct(comp / burn) }, { label: "Runway", value: `${runway.toFixed(1)} mo`, tone: runway > 24 ? "good" : runway > 12 ? "warn" : "bad" }, { label: "GPU-hours / month", value: fmt.num(Math.round(v.gpus * 730 * (v.util / 100))) }], series: [0, 128, 256, 512, 1024, 2048, 4096].map((g) => ({ gpus: g, Runway: +((v.fund * 1e6) / (g * v.rate * 730 * (v.util / 100) + ppl + 50000)).toFixed(1) })) }; }}
      chart={{ x: "gpus", title: "Runway (months) vs GPUs", lines: [{ key: "Runway", color: "#a78bfa" }] }}
      notice="Includes $50k/mo other overhead; compute priced as reserved capacity." />
  ),
  "ai-voice-assistants-for-email": () => (
    <AgentPipeline title="Voice inbox session" subtitle="Scripted, hands-free"
      cases={[{ id: "walk", label: "Morning walk", input: "You: 'What's in my inbox?'" }]}
      steps={[
        { name: "Summarize", actor: "Assistant", log: () => "'12 new. 3 need you: investor update request, contract redlines, 1:1 reschedule. 9 are newsletters/receipts.'" },
        { name: "Reply by voice", actor: "You → Assistant", log: () => "You: 'Tell Sam Thursday at 3 works.'\nDraft: 'Hi Sam — Thursday at 3pm works. See you then.'" },
        { name: "Confirm send", actor: "You", gate: true, log: () => "Assistant: 'Send it?'" },
        { name: "Bulk actions", actor: "Assistant", log: () => "'Archive the 9 newsletters and receipts?' → done\n'Snooze contract redlines to 2pm' → done" },
      ]}
      output={() => ({ title: "Session result", body: "1 reply sent · 9 archived · 1 snoozed · 1 flagged for desk\nTime: 3m 10s, no screen", stats: [{ label: "Inbox", value: "12 → 2", tone: "good" }] })}
      notice="Voice turns are scripted text; no audio is processed." />
  ),
  "ai-for-personal-finance": () => (
    <ModelCalculator title="Debt payoff + net worth" inputs={[
      { id: "income", label: "Take-home income ($k/yr)", min: 20, max: 400, value: 72 },
      { id: "spend", label: "Spending ($k/yr)", min: 10, max: 400, value: 58 },
      { id: "debt", label: "Credit-card debt ($k)", min: 0, max: 100, step: 0.5, value: 12 },
      { id: "apr", label: "APR (%)", min: 0, max: 35, step: 0.5, value: 24 },
      { id: "save", label: "Current savings ($k)", min: 0, max: 500, value: 5 },
      { id: "toDebt", label: "Surplus to debt (%)", min: 0, max: 100, value: 80 },
      { id: "ret", label: "Investment return (%/yr)", min: 0, max: 10, step: 0.5, value: 5 },
    ]}
      compute={(v) => { const f = finance(v); return { stats: [{ label: "Monthly surplus", value: usd(f.surplus), tone: f.surplus > 0 ? "good" : "bad" }, { label: "Debt-free in", value: f.freeMonth > 0 ? `${f.freeMonth} mo` : v.debt === 0 ? "No debt" : "Never (20y)", tone: f.freeMonth > 0 && f.freeMonth < 36 ? "good" : "warn" }, { label: "Interest paid", value: usd(f.interest), tone: f.interest > 5000 ? "bad" : undefined }, { label: "Net worth in 20y", value: usd(f.nw) }], series: f.series }; }}
      chart={{ x: "year", title: "Net worth over 20 years", lines: [{ key: "Net worth", color: "#4ade80" }], yFormat: usd }}
      notice="Simplified monthly simulation (no taxes/inflation). Not financial advice." />
  ),
};
export default C;
