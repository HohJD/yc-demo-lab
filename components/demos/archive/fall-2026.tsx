"use client";
import type { ComponentType } from "react";
import { AgentPipeline, ExplainableScorer, ModelCalculator, QueueTriage, WeightedRanker, fmt } from "../kit/engines";

const usd = fmt.usdShort;

const PRIMER: Record<string, { band: string; story: string; qs: string[]; check: string }> = {
  sky: { band: "Ages 6–8 · concrete", story: "Nell's kite floats into the sky-library, where the Librarian of Light explains that sunlight is a box of crayons — and the air scatters the blue crayon the most.", qs: ["What colours do you think are hiding inside white sunlight?", "Why might the sky look orange at sunset when light travels further?"], check: "Ask the child to explain sunset colours using the crayon story." },
  frac: { band: "Ages 9–10 · pictorial", story: "Princess Nell must share 3 loaves between 4 knights fairly. The castle baker shows how cutting each loaf into quarters makes it fair.", qs: ["How many quarter-pieces are there in 3 loaves?", "How many pieces does each knight get, and what fraction is that of one loaf?"], check: "Give a new problem: share 2 pies among 3 friends." },
  plant: { band: "Ages 7–9 · experiential", story: "Nell's garden robot runs out of batteries, so she wonders how plants eat. A talking leaf explains it makes food from light, air and water.", qs: ["What would happen to a plant kept in a dark cupboard?", "Where does a plant 'breathe in' air?"], check: "Design a 2-pot experiment: one in light, one in the dark." },
};

const VOICE = (c: { input: string }) => {
  const t = c.input.toLowerCase();
  const hours = Number(t.match(/(\d+(?:\.\d+)?)\s*hours?/)?.[1] ?? 1);
  const parts: [string, number][] = [];
  const catalog: [RegExp, string, number][] = [[/capacitor/, "Run capacitor 45/5 µF", 28], [/contactor/, "Contactor 2-pole 40A", 42], [/filter/, "Air filter 16x25", 14], [/refrigerant|r-?410a|freon/, "R-410A refrigerant (per lb)", 65], [/breaker/, "Breaker 20A", 18], [/gfci/, "GFCI outlet", 24], [/flapper/, "Toilet flapper", 9], [/wax ring/, "Wax ring", 7]];
  for (const [re, n, p] of catalog) if (re.test(t)) { const q = Number(t.match(new RegExp(`(\\d+)\\s*(?:lbs?|pounds?)\\s*(?:of\\s*)?${re.source}`))?.[1] ?? 1); parts.push([n, p * q]); }
  const safety = ["lockout", "breaker off", "gas leak", "ladder", "live wire", "carbon monoxide"].filter((k) => t.includes(k));
  const asset = t.match(/(carrier|trane|lennox|rheem|goodman|square d|kohler)[^.,]*/)?.[0] ?? "unspecified asset";
  const followUp = /quote|replace (?:the )?(?:unit|compressor)|come back|return visit/.test(t);
  return { hours, parts, safety, asset, followUp };
};

const C: Record<string, ComponentType> = {
  "the-primer": () => (
    <AgentPipeline title="Ask the Primer" subtitle="A child's question becomes a tailored lesson"
      cases={[{ id: "sky", label: "Why is the sky blue? (age 7)", input: "Child (7): why is the sky blue?" }, { id: "frac", label: "What's 3/4? (age 9)", input: "Child (9): I don't get what 3/4 means" }, { id: "plant", label: "How do plants eat? (age 8)", input: "Child (8): how do plants eat if they don't have mouths?" }]}
      steps={[
        { name: "Assess level", actor: "Learner model", log: (c) => `Age + prior answers → ${PRIMER[c.id].band}` },
        { name: "Choose story frame", actor: "Narrative engine", log: () => "Protagonist: Nell (persists across sessions)" },
        { name: "Draft Socratic questions", actor: "Tutor", log: (c) => PRIMER[c.id].qs.map((q, i) => `${i + 1}. ${q}`).join("\n") },
        { name: "Safety & age check", actor: "Guardrail", log: () => "No unsafe content · reading level OK" },
        { name: "Plan mastery check", actor: "Tutor", log: (c) => PRIMER[c.id].check },
      ]}
      output={(c) => ({ title: "Lesson page", body: `${PRIMER[c.id].story}\n\nQuestions Nell asks you:\n${PRIMER[c.id].qs.map((q) => `• ${q}`).join("\n")}\n\nTomorrow: ${PRIMER[c.id].check}`, stats: [{ label: "Level", value: PRIMER[c.id].band.split(" ·")[0] }, { label: "Questions", value: String(PRIMER[c.id].qs.length) }] })}
      notice="Lesson content is pre-written for the three sample questions; a production Primer would generate it with a child-safe LLM." />
  ),
  "the-future-of-american-defense": () => (
    <WeightedRanker title="Counter-UAS shortlist" subtitle="Fictional vendors · scores 0–10"
      criteria={[{ id: "cost", label: "Cost per engagement", weight: 8, invert: true }, { id: "lead", label: "Weeks to field", weight: 7, invert: true }, { id: "range", label: "Effective range", weight: 5 }, { id: "ndaa", label: "NDAA/supply-chain compliance", weight: 9 }, { id: "soldier", label: "Soldier feedback", weight: 6 }]}
      options={[
        { name: "Kestrel Interceptor", scores: { cost: 3, lead: 4, range: 6, ndaa: 9, soldier: 8 }, note: "Attritable interceptor drone, $15k/unit" },
        { name: "Bastion Laser", scores: { cost: 1, lead: 9, range: 7, ndaa: 10, soldier: 6 }, note: "Directed energy; cheap shots, long lead" },
        { name: "Sentry Jammer Kit", scores: { cost: 1, lead: 2, range: 4, ndaa: 7, soldier: 7 }, note: "Man-portable EW; fast to field" },
        { name: "Legacy SAM upgrade", scores: { cost: 10, lead: 8, range: 10, ndaa: 10, soldier: 5 }, note: "Proven but $1M+ per shot" },
        { name: "Swarmnet Net-Gun", scores: { cost: 2, lead: 3, range: 2, ndaa: 6, soldier: 8 }, note: "Close-in, very low cost" },
      ]}
      notice="Vendors and scores are fictional and illustrative; they do not describe real products." />
  ),
  "a-cloud-for-small-software": () => (
    <ModelCalculator title="Your personal app portfolio" inputs={[
      { id: "apps", label: "Number of small apps", min: 1, max: 100, value: 25 },
      { id: "req", label: "Requests / app / day", min: 1, max: 5000, step: 10, value: 200 },
      { id: "gb", label: "Storage per app (GB)", min: 0, max: 10, step: 0.5, value: 1 },
      { id: "ops", label: "Ops minutes / app / month (self-managed)", min: 0, max: 120, value: 20 },
      { id: "rate", label: "Your time ($/hour)", min: 0, max: 200, step: 5, value: 60 },
    ]}
      compute={(v) => {
        const vps = Math.ceil(v.apps / 8) * 6 + v.gb * v.apps * 0.1;
        const serverless = v.apps * 5 + Math.max(0, v.apps * v.req * 30 - 1e6) * 0.0000004 + v.gb * v.apps * 0.25;
        const small = 10 + Math.max(0, v.apps - 20) * 0.25 + Math.max(0, v.gb * v.apps - 20) * 0.05;
        const opsCost = (v.apps * v.ops) / 60 * v.rate;
        return {
          stats: [{ label: "VPS (DIY)", value: usd(vps + opsCost), sub: `${usd(vps)} infra + ${usd(opsCost)} your time` }, { label: "Per-app serverless", value: usd(serverless + opsCost * 0.3) }, { label: "Small-software cloud", value: usd(small), sub: "scale-to-zero, shared auth/db", tone: "good" }, { label: "Monthly saving", value: usd(Math.min(vps + opsCost, serverless + opsCost * 0.3) - small), tone: "good" }],
          series: [1, 5, 10, 25, 50, 75, 100].map((n) => ({ apps: n, VPS: Math.ceil(n / 8) * 6 + (n * v.ops) / 60 * v.rate, Serverless: n * 5 + (n * v.ops * 0.3) / 60 * v.rate, "Small cloud": 10 + Math.max(0, n - 20) * 0.25 })),
          insight: "Idle personal apps are mostly asleep; pricing them per-app wastes money. A shared runtime amortises auth, DB and ops across all of them.",
        };
      }}
      chart={{ x: "apps", title: "Monthly cost vs number of apps", lines: [{ key: "VPS", color: "#f87171" }, { key: "Serverless", color: "#fbbf24" }, { key: "Small cloud", color: "#34d399" }], yFormat: usd }}
      notice="Prices are illustrative assumptions, not quotes from any provider." />
  ),
  "multiplayer-ai": () => (
    <AgentPipeline title="Team launch plan" subtitle="Three teammates, one AI"
      cases={[{ id: "launch", label: "Q3 launch plan", input: "Maya (PM): launch Sep 15, focus on SMB.\nLeo (Eng): API won't be stable until Sep 29.\nPriya (Mktg): webinar booked Sep 18, need demo env." }, { id: "hire", label: "Hiring plan", input: "Sam (CEO): hire 2 AEs in Q3.\nJo (Finance): budget allows 1 AE until Series A.\nAri (Sales): pipeline needs 2 to hit target." }]}
      steps={[
        { name: "Gather inputs", actor: "Roomful", log: (c) => c.input.split("\n").map((l) => `← ${l}`).join("\n") },
        { name: "Build shared context", actor: "Roomful", log: () => "Merged 3 viewpoints into one workspace memory (visible to all)" },
        { name: "Detect conflicts", actor: "Roomful", log: (c) => c.id === "launch" ? "CONFLICT: launch Sep 15 vs API stable Sep 29; webinar Sep 18 depends on demo env" : "CONFLICT: 2 AEs requested vs budget for 1" },
        { name: "Propose resolution", actor: "Roomful", gate: true, log: (c) => c.id === "launch" ? "Proposal: soft-launch Sep 15 (waitlist), GA Oct 1; webinar uses staging demo. Approve?" : "Proposal: hire 1 AE now + 1 contingent on $X pipeline by Oct. Approve?" },
        { name: "Write shared doc", actor: "Roomful", log: () => "Doc updated · every line attributed · owners notified" },
      ]}
      output={(c) => ({ title: "Shared doc (attributed)", body: c.id === "launch" ? "Q3 Launch Plan\n- Soft launch Sep 15 to waitlist [Maya, resolved w/ Leo]\n- GA Oct 1 after API freeze Sep 29 [Leo]\n- Webinar Sep 18 on staging demo env [Priya]\n- Owner for demo env: Leo (due Sep 12)" : "Q3 Hiring Plan\n- Hire AE #1 now [Sam, Jo]\n- AE #2 triggered when pipeline ≥ target by Oct 15 [Ari]\n- Revisit at Series A [Jo]", stats: [{ label: "Contributors", value: "3" }, { label: "Conflicts resolved", value: "1", tone: "good" }] })}
      notice="Agent outputs are scripted for the two scenarios; this shows the multiplayer workflow, not a live model." />
  ),
  "compute-at-sea": () => (
    <ModelCalculator title="Floating GPU cluster" inputs={[
      { id: "mw", label: "IT load (MW)", min: 5, max: 200, step: 5, value: 40 },
      { id: "price", label: "Power price ($/MWh)", min: 20, max: 150, value: 55 },
      { id: "pueSea", label: "PUE at sea (seawater cooling)", min: 1.02, max: 1.4, step: 0.01, value: 1.08 },
      { id: "pueLand", label: "PUE on land", min: 1.1, max: 1.6, step: 0.01, value: 1.3 },
      { id: "monthsSea", label: "Months to deploy at sea", min: 6, max: 36, value: 12 },
      { id: "monthsLand", label: "Months to deploy on land", min: 12, max: 72, value: 36 },
      { id: "rev", label: "Revenue per GPU-hour ($)", min: 0.5, max: 5, step: 0.1, value: 2, format: (v) => `$${v.toFixed(1)}` },
    ]}
      compute={(v) => {
        const gpus = (v.mw * 1000) / 1.2;
        const energy = (pue: number) => (1.2 * pue * v.price) / 1000;
        const sea = energy(v.pueSea), land = energy(v.pueLand);
        const head = (v.monthsLand - v.monthsSea) * 730 * gpus * v.rev;
        return {
          stats: [{ label: "GPUs (≈1.2 kW each)", value: fmt.num(Math.round(gpus)) }, { label: "Energy $/GPU-hr (sea)", value: `$${sea.toFixed(3)}`, tone: "good" }, { label: "Energy $/GPU-hr (land)", value: `$${land.toFixed(3)}` }, { label: "Revenue from head start", value: usd(head), tone: head > 0 ? "good" : "bad" }],
          series: Array.from({ length: 7 }, (_, i) => i * 12).map((m) => ({ month: m, Sea: Math.max(0, m - v.monthsSea) * 730 * gpus * (v.rev - sea), Land: Math.max(0, m - v.monthsLand) * 730 * gpus * (v.rev - land) })),
        };
      }}
      chart={{ x: "month", title: "Cumulative gross margin (energy only)", lines: [{ key: "Sea", color: "#22d3ee" }, { key: "Land", color: "#f87171" }], yFormat: usd }}
      notice="Simplified model counting energy and time-to-revenue only; ignores marine capex, insurance and maintenance. Defaults are assumptions." />
  ),
  "ai-powered-consumer-products-for-1-billion-people": () => (
    <ModelCalculator title="Growth to 1B users" inputs={[
      { id: "k", label: "Viral coefficient (K)", min: 0, max: 1.5, step: 0.05, value: 0.6 },
      { id: "ret", label: "Monthly retention (%)", min: 40, max: 99, value: 85 },
      { id: "paid", label: "Paid budget / month ($M)", min: 0, max: 50, step: 0.5, value: 2 },
      { id: "cac", label: "CAC ($)", min: 0.2, max: 20, step: 0.1, value: 2, format: (v) => `$${v.toFixed(1)}` },
      { id: "seed", label: "Launch users (k)", min: 1, max: 1000, value: 50 },
    ]}
      compute={(v) => {
        let active = v.seed * 1000, newU = active, hit: number | null = null;
        const series: Record<string, number>[] = [];
        for (let m = 0; m <= 36; m++) {
          series.push({ month: m, MAU: Math.round(active / 1e6) });
          const paidU = (v.paid * 1e6) / v.cac;
          const viral = newU * v.k;
          newU = paidU + viral;
          active = active * (v.ret / 100) + newU;
          if (!hit && active >= 1e9) hit = m + 1;
        }
        return { stats: [{ label: "MAU at 36 mo", value: `${fmt.num(Math.round(active / 1e6))}M` }, { label: "Months to 1B", value: hit ? String(hit) : "Not in 3 yrs", tone: hit ? "good" : "bad" }, { label: "Paid adds / mo", value: `${fmt.num(Math.round((v.paid * 1e6) / v.cac / 1e3))}k` }, { label: "Steady-state (no virality)", value: `${fmt.num(Math.round((v.paid * 1e6) / v.cac / (1 - v.ret / 100) / 1e6))}M` }], series, insight: v.k >= 1 ? "K ≥ 1: growth is self-sustaining — retention decides how big it gets." : "K < 1: virality only amplifies paid acquisition; retention caps your ceiling." };
      }}
      chart={{ x: "month", title: "Monthly active users (millions)", lines: [{ key: "MAU", color: "#facc15" }] }}
      notice="Simple cohort model on your inputs; real growth varies by geography and saturation, which isn't modelled." />
  ),
  "ai-for-the-aging-population": () => (
    <QueueTriage title="Today's caseload" subtitle="12 residents · morning check-ins" itemNoun="resident" actionHigh="Call now" actionMid="Check today" actionLow="OK" threshold={45}
      items={[
        { id: "1", title: "Dorothy, 84", detail: "Missed AM meds · slept 4h", fields: { missedMeds: 2, sleepH: 4, steps: 900, mood: 2, fallDetected: false, livesAlone: true } },
        { id: "2", title: "Harold, 79", detail: "Normal check-in", fields: { missedMeds: 0, sleepH: 7, steps: 3500, mood: 4, fallDetected: false, livesAlone: false } },
        { id: "3", title: "Maria, 91", detail: "Fall sensor event 06:12", fields: { missedMeds: 0, sleepH: 6, steps: 120, mood: 3, fallDetected: true, livesAlone: true } },
        { id: "4", title: "Bill, 72", detail: "Low mood, said 'lonely'", fields: { missedMeds: 0, sleepH: 8, steps: 2100, mood: 1, fallDetected: false, livesAlone: true } },
        { id: "5", title: "Grace, 88", detail: "Steps down 70% vs baseline", fields: { missedMeds: 1, sleepH: 6, steps: 600, mood: 3, fallDetected: false, livesAlone: false } },
        { id: "6", title: "Ken, 81", detail: "Normal", fields: { missedMeds: 0, sleepH: 7, steps: 4200, mood: 4, fallDetected: false, livesAlone: true } },
      ]}
      rules={[
        { id: "fall", label: "Fall detected", weight: 50, test: (f) => f.fallDetected === true },
        { id: "meds", label: "Missed ≥ 1 medication dose", weight: 20, test: (f) => Number(f.missedMeds) >= 1, explain: "adherence" },
        { id: "sleep", label: "Slept < 5 hours", weight: 10, test: (f) => Number(f.sleepH) < 5 },
        { id: "steps", label: "Activity < 1,000 steps", weight: 15, test: (f) => Number(f.steps) < 1000 },
        { id: "mood", label: "Mood ≤ 2 / 5", weight: 15, test: (f) => Number(f.mood) <= 2 },
        { id: "alone", label: "Lives alone (multiplier)", weight: 10, test: (f) => f.livesAlone === true },
      ]}
      impact={(fl, all) => [{ label: "Need a human today", value: `${fl.length} of ${all.length}` }, { label: "Caregiver calls avoided", value: String(all.length - fl.length), tone: "good" }]}
      notice="Residents are fictional; weights are illustrative and not clinically validated." />
  ),
  "new-operating-systems-for-the-physical-world": () => (
    <AgentPipeline title="Technician voice note" subtitle="Transcript (editable) → work order" editable
      cases={[{ id: "hvac", label: "HVAC no-cool", input: "Carrier condenser at 42 Oak St not cooling. Breaker off and lockout done. Replaced the capacitor and the contactor, added 2 lbs of R-410A. Took 2.5 hours. Customer wants a quote to replace the unit next spring." }, { id: "elec", label: "Electrical GFCI", input: "Kitchen GFCI tripping at the Patel house. Live wire tested, replaced the GFCI and a 20 amp breaker. 1 hour. Square D panel looks fine." }, { id: "plumb", label: "Plumbing", input: "Kohler toilet running constantly in unit 3B. Replaced the flapper and the wax ring. 1.5 hours on ladder-free job." }]}
      steps={[
        { name: "Transcribe", actor: "Speech (stub)", log: (c) => `${c.input.split(" ").length} words` },
        { name: "Extract entities", actor: "Parser", log: (c) => { const r = VOICE(c); return `asset: ${r.asset}\nparts: ${r.parts.map((p) => p[0]).join(", ") || "none"}\nlabor: ${r.hours}h`; } },
        { name: "Safety log", actor: "Parser", log: (c) => VOICE(c).safety.join(", ") || "no safety keywords — flag for supervisor" },
        { name: "Price & invoice", actor: "Billing", log: (c) => { const r = VOICE(c); return `parts ${usd(r.parts.reduce((s, p) => s + p[1], 0))} + labor ${usd(r.hours * 110)}`; } },
        { name: "Follow-ups", actor: "CRM", log: (c) => (VOICE(c).followUp ? "Create sales opportunity: replacement quote" : "None") },
      ]}
      output={(c) => { const r = VOICE(c); const parts = r.parts.reduce((s, p) => s + p[1], 0); return { title: "Work order + invoice", body: `Asset: ${r.asset}\nSafety: ${r.safety.join(", ") || "⚠ not recorded"}\n\nParts\n${r.parts.map((p) => `  ${p[0].padEnd(30)} ${usd(p[1])}`).join("\n") || "  (none)"}\nLabor  ${r.hours}h × $110 = ${usd(r.hours * 110)}\nTOTAL  ${usd(parts + r.hours * 110)}${r.followUp ? "\n\nFollow-up: replacement quote opportunity created" : ""}`, stats: [{ label: "Total", value: usd(parts + r.hours * 110) }, { label: "Paperwork time", value: "0 min", tone: "good" }] }; }}
      notice="Parsing is real regex extraction on the transcript; there's no speech recognition and the parts price list is illustrative." />
  ),
  "the-best-time-to-build-in-crypto": () => (
    <ModelCalculator title="US → Mexico remittance" inputs={[
      { id: "amt", label: "Amount per transfer ($)", min: 50, max: 2000, step: 50, value: 300 },
      { id: "freq", label: "Transfers per year", min: 1, max: 52, value: 24 },
      { id: "wireFee", label: "Bank wire flat fee ($)", min: 0, max: 50, value: 35 },
      { id: "wireFx", label: "Bank FX spread (%)", min: 0, max: 6, step: 0.1, value: 3.5 },
      { id: "mtoFee", label: "MTO flat fee ($)", min: 0, max: 15, step: 0.5, value: 4 },
      { id: "mtoFx", label: "MTO FX spread (%)", min: 0, max: 5, step: 0.1, value: 2 },
      { id: "scFee", label: "Stablecoin rail all-in (%)", min: 0, max: 3, step: 0.1, value: 0.8 },
    ]}
      compute={(v) => {
        const wire = v.wireFee + (v.amt * v.wireFx) / 100, mto = v.mtoFee + (v.amt * v.mtoFx) / 100, sc = (v.amt * v.scFee) / 100 + 0.1;
        return { stats: [{ label: "Bank wire cost", value: usd(wire), sub: fmt.pct(wire / v.amt) }, { label: "MTO cost", value: usd(mto), sub: fmt.pct(mto / v.amt) }, { label: "Stablecoin cost", value: usd(sc), sub: fmt.pct(sc / v.amt), tone: "good" }, { label: "Saved / year vs MTO", value: usd((mto - sc) * v.freq), tone: mto > sc ? "good" : "bad" }], series: [100, 200, 300, 500, 1000, 2000].map((a) => ({ amount: `$${a}`, Wire: +(v.wireFee + (a * v.wireFx) / 100).toFixed(2), MTO: +(v.mtoFee + (a * v.mtoFx) / 100).toFixed(2), Stablecoin: +((a * v.scFee) / 100 + 0.1).toFixed(2) })) };
      }}
      chart={{ x: "amount", type: "bar", title: "Cost per transfer by amount", lines: [{ key: "Wire", color: "#f87171" }, { key: "MTO", color: "#fbbf24" }, { key: "Stablecoin", color: "#c084fc" }], yFormat: (v) => `$${v.toFixed(0)}` }}
      notice="Fees and spreads are editable illustrative assumptions; no transfers are made." />
  ),
  "data-for-the-real-world": () => (
    <ModelCalculator title="Manipulation dataset program" inputs={[
      { id: "hours", label: "Target usable hours", min: 100, max: 50000, step: 100, value: 5000 },
      { id: "collectors", label: "Collectors", min: 5, max: 1000, step: 5, value: 120 },
      { id: "hpd", label: "Recording hours / collector / day", min: 1, max: 8, step: 0.5, value: 4 },
      { id: "reject", label: "QA rejection rate (%)", min: 0, max: 60, value: 18 },
      { id: "pay", label: "Collector pay ($/hr)", min: 10, max: 60, value: 22 },
      { id: "kit", label: "Device kit per collector ($)", min: 100, max: 10000, step: 100, value: 1500 },
    ]}
      compute={(v) => {
        const usablePerDay = v.collectors * v.hpd * (1 - v.reject / 100);
        const days = Math.ceil(v.hours / usablePerDay);
        const labor = (v.hours / (1 - v.reject / 100)) * v.pay * 1.25;
        const total = labor + v.collectors * v.kit + v.hours * 6;
        return { stats: [{ label: "Calendar time", value: `${Math.ceil(days / 5)} weeks` }, { label: "Usable hrs / day", value: fmt.num(Math.round(usablePerDay)) }, { label: "Total cost", value: usd(total) }, { label: "Cost / usable hour", value: `$${(total / v.hours).toFixed(0)}` }], series: Array.from({ length: 11 }, (_, i) => ({ week: Math.round((days / 5) * i / 10), Hours: Math.round(Math.min(v.hours, usablePerDay * 5 * ((days / 5) * i / 10))) })) };
      }}
      chart={{ x: "week", title: "Cumulative usable hours", lines: [{ key: "Hours", color: "#a78bfa" }] }}
      notice="Planning math is real; rates include an assumed 25% overhead and $6/hr QA/labeling cost." />
  ),
  "proving-you-re-human": () => (
    <ExplainableScorer title="Payment request check" subtitle="Paste a call transcript, email or chat" scoreLabel="Social-engineering risk" base={10}
      samples={[{ label: "Deepfake CFO call", text: "Hi, it's Michael, the CFO. I need you to wire $2.4M to a new vendor account today — it's urgent and confidential, don't mention it to anyone until the acquisition is announced. I'm on a different number, just reply on WhatsApp." }, { label: "Normal AP request", text: "Hi team, invoice #4471 from Acme Logistics is approved in Coupa per PO 8812. Please pay on the normal Net 30 schedule to the account on file." }, { label: "Vendor bank change", text: "Please note our bank details have changed. Update the account for all future payments and process the overdue invoice immediately to avoid service interruption." }]}
      features={[
        { label: "Urgency pressure", pattern: /\b(urgent|immediately|today|asap|right now|before end of day)\b/i, weight: 12 },
        { label: "Secrecy request", pattern: /\b(confidential|don'?t (tell|mention)|keep this between|secret)\b/i, weight: 18, explain: "classic BEC tactic" },
        { label: "New / changed account", pattern: /\b(new (vendor )?account|bank details have changed|update the account|different account)\b/i, weight: 20 },
        { label: "Channel switch", pattern: /\b(whatsapp|telegram|signal|personal email|different number|text me)\b/i, weight: 15 },
        { label: "Large amount", pattern: /\$\s?\d+(\.\d+)?\s?(m|million)|\$\d{3},\d{3}/i, weight: 10 },
        { label: "Exec impersonation cue", pattern: /\b(it'?s (the )?(ceo|cfo)|this is (the )?(ceo|cfo)|i'?m the (ceo|cfo))\b/i, weight: 10 },
        { label: "References approved PO/system", pattern: /\b(po \d+|purchase order|approved in|per po|account on file)\b/i, weight: -15, explain: "normal control evidence" },
      ]}
      verdicts={[{ min: 0, label: "Low", tone: "good", advice: "Proceed under normal controls." }, { min: 35, label: "Elevated", tone: "warn", advice: "Call back the requester on a number from the HR directory before paying." }, { min: 60, label: "Block", tone: "bad", advice: "Hold the payment. Require in-person or passkey-signed approval from two executives." }]}
      notice="Detects textual social-engineering signals with transparent rules. It does not analyze audio or video for deepfake artifacts." />
  ),
  "ai-native-compliance-infrastructure": () => (
    <QueueTriage title="Transaction monitoring queue" subtitle="Fictional accounts · last 24h" itemNoun="transaction" actionHigh="Escalate" actionMid="Review" actionLow="Auto-clear" threshold={40}
      items={[
        { id: "t1", title: "ACME Imports → Shell Co. Ltd", detail: "$9,800 · 3rd similar today", fields: { amount: 9800, countToday: 3, country: "AE", newCounterparty: true, cash: false, pep: false } },
        { id: "t2", title: "Payroll → 120 employees", detail: "$312,000 · monthly", fields: { amount: 312000, countToday: 1, country: "US", newCounterparty: false, cash: false, pep: false } },
        { id: "t3", title: "Cash deposit · J. Doe", detail: "$9,500 cash", fields: { amount: 9500, countToday: 2, country: "US", newCounterparty: false, cash: true, pep: false } },
        { id: "t4", title: "Wire → Minister's family trust", detail: "$75,000", fields: { amount: 75000, countToday: 1, country: "PA", newCounterparty: true, cash: false, pep: true } },
        { id: "t5", title: "Card spend · Office supplies", detail: "$480", fields: { amount: 480, countToday: 4, country: "US", newCounterparty: false, cash: false, pep: false } },
        { id: "t6", title: "Crypto OTC desk → new wallet", detail: "$48,000", fields: { amount: 48000, countToday: 6, country: "SC", newCounterparty: true, cash: false, pep: false } },
      ]}
      rules={[
        { id: "struct", label: "Possible structuring ($8k–$10k, repeated)", weight: 30, test: (f) => Number(f.amount) >= 8000 && Number(f.amount) < 10000 && Number(f.countToday) >= 2 },
        { id: "geo", label: "High-risk jurisdiction", weight: 20, test: (f) => ["AE", "PA", "SC", "IR", "KP"].includes(String(f.country)), explain: "illustrative list" },
        { id: "new", label: "New counterparty", weight: 10, test: (f) => f.newCounterparty === true },
        { id: "vel", label: "Velocity ≥ 5 transfers / day", weight: 15, test: (f) => Number(f.countToday) >= 5 },
        { id: "pep", label: "Politically exposed person", weight: 25, test: (f) => f.pep === true },
        { id: "cash", label: "Cash near CTR threshold", weight: 15, test: (f) => f.cash === true && Number(f.amount) > 8000 },
      ]}
      impact={(fl, all) => [{ label: "Escalated", value: `${fl.length}/${all.length}` }, { label: "Analyst hours saved / day (est.)", value: `${((all.length - fl.length) * 0.4 * 1000 / all.length).toFixed(0)}h per 1k alerts`, tone: "good" }]}
      notice="Transactions are fictional; rules and thresholds are illustrative, not regulatory guidance." />
  ),
  "self-maintaining-apis": () => (
    <AgentPipeline title="API change detected" subtitle="openapi.yaml diff"
      cases={[{ id: "rename", label: "Rename field", input: "- customer.email_address: string (required)\n+ customer.email: string (required)" }, { id: "add", label: "Add optional param", input: "+ GET /invoices?status=paid|open (optional)" }, { id: "remove", label: "Remove endpoint", input: "- DELETE /v1/cards/{id}" }]}
      steps={[
        { name: "Diff spec", actor: "Watcher", log: (c) => c.input },
        { name: "Classify change", actor: "Rules", log: (c) => (/^-/m.test(c.input) && /required|DELETE|^- /m.test(c.input) ? "BREAKING: removed/renamed surface" : "ADDITIVE: backward-compatible") },
        { name: "Find impacted artifacts", actor: "Indexer", log: (c) => (c.id === "add" ? "docs/invoices.md, sdk-ts, sdk-py (new param)" : c.id === "rename" ? "docs/customers.md, sdk-ts, sdk-py, sdk-go, 7 code samples, 3 tests" : "docs/cards.md, sdk-ts, sdk-py, sdk-go, migration guide") },
        { name: "Draft patches", actor: "Coding agent", log: () => "Generated diffs for each artifact + tests" },
        { name: "Review", actor: "You", gate: true, log: () => "Open 4 PRs and publish changelog?" },
      ]}
      output={(c) => { const breaking = c.id !== "add"; return { title: "Changelog + PRs", body: `${breaking ? "⚠ BREAKING" : "✓ Additive"} change\n\n${c.id === "rename" ? "customer.email_address → customer.email. Old field returned until 2027-01-01 with Deprecation header." : c.id === "add" ? "New optional `status` filter on GET /invoices." : "DELETE /v1/cards/{id} removed; use POST /v1/cards/{id}/deactivate."}\n\nPRs: sdk-ts#, sdk-py#, sdk-go#, docs# (drafts)`, stats: [{ label: "Change type", value: breaking ? "Breaking" : "Additive", tone: breaking ? "bad" : "good" }, { label: "Artifacts updated", value: c.id === "add" ? "3" : "12" }] }; }}
      notice="Change classification is rule-based on the sample diffs; impacted files and PRs are templated (no repository access)." />
  ),
};
export default C;
