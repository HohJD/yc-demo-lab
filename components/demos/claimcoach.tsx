"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, FileText, GraduationCap, Copy } from "lucide-react";
import { Badge, Button, Card, CardHeader, Input, Label, Select, Stat, fmt, cn, SimNotice } from "@/components/ui";

interface Claim {
  id: string; patient: string; payer: string; provider: string; dos: string; denialDate: string; cpt: string; modifier: string; icd: string;
  billed: number; carc: string; priorAuth: boolean; notesAttached: boolean; filedDaysAfterDos: number; isNewPatient: boolean;
}

const CARC: Record<string, { title: string; plain: string }> = {
  "CO-16": { title: "Claim lacks information", plain: "The payer says something required is missing or wrong on the claim." },
  "CO-50": { title: "Not medically necessary", plain: "The payer doesn't think the diagnosis justifies the service." },
  "CO-97": { title: "Bundled into another service", plain: "The payer thinks this service is already paid as part of another one on the same day." },
  "CO-29": { title: "Timely filing limit expired", plain: "The claim reached the payer after its filing deadline." },
  "CO-197": { title: "Prior authorization absent", plain: "The service needed approval before it was performed." },
  "CO-11": { title: "Diagnosis inconsistent with procedure", plain: "The diagnosis code doesn't match the procedure billed." },
};

const SAMPLES: Claim[] = [
  { id: "CLM-10482", patient: "Maria T. (fictional)", payer: "Northwind Health Plan", provider: "Lakeside Family Medicine", dos: "2026-08-04", denialDate: "2026-09-02", cpt: "99214", modifier: "", icd: "E11.9", billed: 186, carc: "CO-97", priorAuth: false, notesAttached: true, filedDaysAfterDos: 6, isNewPatient: false },
  { id: "CLM-10511", patient: "James O. (fictional)", payer: "Contoso Mutual", provider: "Riverbend Imaging", dos: "2026-07-21", denialDate: "2026-08-15", cpt: "72148", modifier: "", icd: "M54.50", billed: 1240, carc: "CO-197", priorAuth: true, notesAttached: false, filedDaysAfterDos: 3, isNewPatient: false },
  { id: "CLM-10533", patient: "Ana P. (fictional)", payer: "Fabrikam Care", provider: "Lakeside Family Medicine", dos: "2026-06-02", denialDate: "2026-09-20", cpt: "99203", modifier: "", icd: "J06.9", billed: 162, carc: "CO-29", priorAuth: false, notesAttached: true, filedDaysAfterDos: 112, isNewPatient: true },
  { id: "CLM-10560", patient: "Dev R. (fictional)", payer: "Northwind Health Plan", provider: "Summit Orthopedics", dos: "2026-08-28", denialDate: "2026-09-25", cpt: "20610", modifier: "", icd: "Z00.00", billed: 310, carc: "CO-11", priorAuth: false, notesAttached: true, filedDaysAfterDos: 4, isNewPatient: false },
];

interface Step { id: string; text: string; why: string }
interface Diagnosis { rootCause: string; steps: Step[]; overturn: number; fix: string; severity: "fixable" | "appeal" | "unlikely" }

const TIMELY_LIMIT = 90;

function diagnose(c: Claim): Diagnosis {
  switch (c.carc) {
    case "CO-97": {
      const em = c.cpt.startsWith("992");
      const hasMod25 = c.modifier === "25";
      if (em && !hasMod25)
        return {
          rootCause: `E/M visit ${c.cpt} was billed on the same day as another procedure without modifier 25, so the payer bundled it.`,
          severity: "fixable",
          overturn: c.notesAttached ? 0.82 : 0.55,
          fix: "Add modifier 25 to the E/M line and submit a corrected claim (frequency code 7).",
          steps: [
            { id: "a", text: "Open the visit note and confirm a significant, separately identifiable E/M service was documented", why: "Modifier 25 is only valid when the visit went beyond the procedure's usual pre/post work." },
            { id: "b", text: `Append modifier 25 to CPT ${c.cpt}`, why: "Tells the payer the visit is distinct from the procedure." },
            { id: "c", text: "Submit as a corrected claim, referencing the original claim number", why: "Corrected claims are faster than formal appeals for coding errors." },
          ],
        };
      return { rootCause: "Service was bundled although a modifier is present; payer may not recognise it.", severity: "appeal", overturn: 0.45, fix: "Appeal with the visit note highlighting the separate service.", steps: [{ id: "a", text: "Attach visit note", why: "Proves separate service." }, { id: "b", text: "Send written appeal", why: "Modifier already applied, so a corrected claim won't help." }] };
    }
    case "CO-197":
      if (c.priorAuth)
        return {
          rootCause: "Your records show prior authorization was obtained, but the auth number wasn't on the claim or the documentation wasn't sent.",
          severity: "fixable",
          overturn: c.notesAttached ? 0.9 : 0.78,
          fix: "Resubmit with the authorization number in the claim's prior-auth field and attach the approval letter.",
          steps: [
            { id: "a", text: "Find the authorization approval in the payer portal or the referral file", why: "You need the auth number and approved date range." },
            { id: "b", text: `Check the DOS ${c.dos} falls inside the approved window`, why: "Auths expire; outside the window means a new retro-auth request." },
            { id: "c", text: "Add the auth number to the claim and attach the approval letter", why: "Payer systems match on the auth number." },
            { id: "d", text: "Resubmit as a corrected claim", why: "No formal appeal needed when the auth existed." },
          ],
        };
      return { rootCause: "No prior authorization exists for this service.", severity: "appeal", overturn: 0.3, fix: "Request a retro-authorization citing urgency, then appeal.", steps: [{ id: "a", text: "Request retro-authorization from the payer", why: "Some payers allow retro-auth within a short window." }, { id: "b", text: "Appeal with clinical urgency documentation", why: "Only path if retro-auth is denied." }] };
    case "CO-29": {
      const late = c.filedDaysAfterDos > TIMELY_LIMIT;
      return {
        rootCause: late
          ? `The claim was filed ${c.filedDaysAfterDos} days after the date of service; this payer's limit is ${TIMELY_LIMIT} days.`
          : `The claim was filed in ${c.filedDaysAfterDos} days, inside the ${TIMELY_LIMIT}-day limit — the denial looks wrong.`,
        severity: late ? "unlikely" : "appeal",
        overturn: late ? 0.12 : 0.85,
        fix: late ? "Only appealable with proof of timely original submission (e.g. clearinghouse acceptance report)." : "Appeal with the clearinghouse acceptance report showing the original submission date.",
        steps: [
          { id: "a", text: "Pull the clearinghouse acceptance (999/277CA) report for the first submission", why: "This is the only proof payers accept for timely filing." },
          { id: "b", text: late ? "If no earlier submission exists, write off and log the root cause" : "Attach the report to a written appeal", why: late ? "Prevents repeat losses: track why it was filed late." : "Shows the claim was received in time." },
        ],
      };
    }
    case "CO-11":
    case "CO-50": {
      const preventive = c.icd.startsWith("Z00");
      return {
        rootCause: preventive
          ? `Diagnosis ${c.icd} is a routine exam code, which doesn't support procedure ${c.cpt}.`
          : `The payer doesn't see diagnosis ${c.icd} as supporting ${c.cpt}.`,
        severity: preventive ? "fixable" : "appeal",
        overturn: preventive ? 0.75 : 0.4,
        fix: preventive ? "Re-code with the diagnosis documented in the procedure note, then submit a corrected claim." : "Appeal with the clinical note and payer's medical policy reference.",
        steps: [
          { id: "a", text: "Read the procedure note's assessment section", why: "The billed diagnosis must match what the clinician documented." },
          { id: "b", text: "Ask the coder or clinician to confirm the correct ICD-10 code", why: "Reps should never change diagnoses on their own." },
          { id: "c", text: "Submit corrected claim with the documented diagnosis", why: "Most diagnosis-mismatch denials are coding errors." },
        ],
      };
    }
    default:
      return { rootCause: CARC[c.carc]?.plain ?? "Unknown denial reason.", severity: "appeal", overturn: 0.4, fix: "Review the remittance remark codes for detail.", steps: [{ id: "a", text: "Check RARC remark codes on the 835", why: "They say exactly what's missing." }] };
  }
}

function letter(c: Claim, d: Diagnosis) {
  return `${c.provider}
Billing Department

${new Date().toISOString().slice(0, 10)}

${c.payer} — Appeals / Corrected Claims

RE: Request for reconsideration
Claim #: ${c.id}    Patient: ${c.patient}
Date of service: ${c.dos}    Denial date: ${c.denialDate}
Denial reason: ${c.carc} (${CARC[c.carc]?.title})
CPT ${c.cpt}${c.modifier ? "-" + c.modifier : ""} · ICD-10 ${c.icd} · Billed ${fmt.usd(c.billed, 2)}

To whom it may concern,

We are requesting reconsideration of the above claim. ${d.rootCause}

Corrective action: ${d.fix}

Enclosed: ${[c.notesAttached ? "clinical visit note" : null, c.priorAuth ? "prior authorization approval" : null, c.carc === "CO-29" ? "clearinghouse acceptance report" : null].filter(Boolean).join(", ") || "supporting documentation"}.

Please reprocess the claim for payment. Contact us with any questions.

Sincerely,
Billing Specialist, ${c.provider}`;
}

export default function ClaimCoach() {
  const [claims, setClaims] = useState(SAMPLES);
  const [selId, setSelId] = useState(SAMPLES[0].id);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const c = claims.find((x) => x.id === selId)!;
  const d = useMemo(() => diagnose(c), [c]);
  const allDone = d.steps.every((s) => done[`${c.id}:${s.id}`]);
  const recovered = claims.reduce((sum, x) => sum + x.billed * diagnose(x).overturn, 0);
  const upd = (p: Partial<Claim>) => { setClaims((cs) => cs.map((x) => (x.id === selId ? { ...x, ...p } : x))); setGenerated(false); };

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardHeader title="Denial queue" subtitle={`${claims.length} denied claims · expected recovery ${fmt.usd(recovered)}`} icon={<ClipboardList className="h-4 w-4" />} />
        <div className="divide-y divide-line">
          {claims.map((x) => {
            const dx = diagnose(x);
            return (
              <button key={x.id} onClick={() => { setSelId(x.id); setGenerated(false); }} className={cn("block w-full px-4 py-3 text-left text-sm hover:bg-panel-2", selId === x.id && "bg-accent/10")}>
                <div className="flex items-center justify-between"><span className="font-mono text-xs">{x.id}</span><Badge tone={dx.severity === "fixable" ? "green" : dx.severity === "appeal" ? "amber" : "red"}>{x.carc}</Badge></div>
                <div className="mt-1">{x.provider}</div>
                <div className="text-xs text-muted">{x.payer} · {fmt.usd(x.billed)}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader title={`Claim ${c.id}`} subtitle={`${c.patient} · ${c.payer}`} icon={<FileText className="h-4 w-4" />} right={<Badge tone="red">{c.carc}: {CARC[c.carc].title}</Badge>} />
          <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
            <div><Label>CPT</Label><Input value={c.cpt} onChange={(e) => upd({ cpt: e.target.value })} /></div>
            <div><Label>Modifier</Label><Input value={c.modifier} placeholder="none" onChange={(e) => upd({ modifier: e.target.value })} aria-label="Modifier" /></div>
            <div><Label>ICD-10</Label><Input value={c.icd} onChange={(e) => upd({ icd: e.target.value })} /></div>
            <div><Label>Denial code</Label><Select value={c.carc} onChange={(e) => upd({ carc: e.target.value })} options={Object.keys(CARC).map((k) => ({ value: k, label: k }))} /></div>
            <div><Label>Days to file</Label><Input type="number" value={c.filedDaysAfterDos} onChange={(e) => upd({ filedDaysAfterDos: Number(e.target.value) })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={c.priorAuth} onChange={(e) => upd({ priorAuth: e.target.checked })} /> Prior auth on file</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={c.notesAttached} onChange={(e) => upd({ notesAttached: e.target.checked })} /> Visit note available</label>
            <div className="text-sm"><Label>Billed</Label>{fmt.usd(c.billed, 2)}</div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Coach diagnosis" subtitle="What happened, in plain English" icon={<GraduationCap className="h-4 w-4" />} />
          <div className="space-y-4 p-4">
            <div className="rounded-lg border border-line bg-panel-2 p-3 text-sm">
              <div className="text-xs text-muted">{CARC[c.carc].plain}</div>
              <div className="mt-1 font-medium" data-testid="root-cause">{d.rootCause}</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Path" value={d.severity === "fixable" ? "Corrected claim" : d.severity === "appeal" ? "Written appeal" : "Likely write-off"} tone={d.severity === "fixable" ? "good" : d.severity === "appeal" ? "warn" : "bad"} />
              <Stat label="Overturn odds" value={fmt.pct(d.overturn)} sub="illustrative heuristic" />
              <Stat label="Expected recovery" value={fmt.usd(c.billed * d.overturn)} />
            </div>
            <div>
              <div className="mb-2 text-xs font-medium">Guided checklist — complete each step</div>
              <ul className="space-y-2">
                {d.steps.map((s, i) => {
                  const k = `${c.id}:${s.id}`;
                  return (
                    <li key={k}>
                      <label className={cn("flex cursor-pointer gap-3 rounded-lg border p-3 text-sm", done[k] ? "border-emerald-500/40 bg-emerald-500/5" : "border-line")}>
                        <input type="checkbox" checked={!!done[k]} onChange={(e) => setDone((x) => ({ ...x, [k]: e.target.checked }))} aria-label={`Step ${i + 1}`} />
                        <span><span className="font-medium">{i + 1}. {s.text}</span><span className="block text-xs text-muted">Why: {s.why}</span></span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => setGenerated(true)} disabled={!allDone}>Generate appeal packet</Button>
              {!allDone && <span className="flex items-center gap-1 text-xs text-amber-300"><AlertTriangle className="h-3 w-3" /> Finish the checklist first: the coach won&apos;t let a rep skip verification.</span>}
              {allDone && <span className="flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 className="h-3 w-3" /> Verified — ready to send</span>}
            </div>
            {generated && (
              <div data-testid="appeal-letter">
                <div className="mb-1 flex items-center justify-between"><Label>Appeal letter</Label><Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(letter(c, d)); setCopied(true); setTimeout(() => setCopied(false), 1500); }}><Copy className="h-3 w-3" />{copied ? "Copied" : "Copy"}</Button></div>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-black/40 p-3 font-mono text-xs">{letter(c, d)}</pre>
              </div>
            )}
            <SimNotice>Fictional claims. Denial code meanings paraphrase the public CARC list; overturn odds are illustrative. Not billing or legal advice.</SimNotice>
          </div>
        </Card>
      </div>
    </div>
  );
}
