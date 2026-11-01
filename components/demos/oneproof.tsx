"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, CheckCircle2, Home, Landmark, Loader2, Lock, ShieldCheck, Wallet, XCircle } from "lucide-react";
import { Badge, Button, Card, CardHeader, Stat, fmt, cn, SimNotice } from "@/components/ui";

// 2025 HHS poverty guidelines, 48 contiguous states + DC.
const FPL_BASE = 15650;
const FPL_PER = 5500;
const fpl = (n: number) => FPL_BASE + FPL_PER * Math.max(0, n - 1);

interface Member { name: string; age: number; pregnant?: boolean }
interface Household { id: string; label: string; state: string; members: Member[]; monthlyWages: number; selfReported: number; ssi: number; address: string }

const HOUSEHOLDS: Household[] = [
  { id: "a", label: "Rivera family (4)", state: "OH", address: "118 Elm St, Dayton OH", members: [{ name: "Carla", age: 34 }, { name: "Luis", age: 36 }, { name: "Mia", age: 7 }, { name: "Leo", age: 3 }], monthlyWages: 3410, selfReported: 2900, ssi: 0 },
  { id: "b", label: "Dana, single (1)", state: "PA", address: "22 Market St Apt 4, Erie PA", members: [{ name: "Dana", age: 27, pregnant: true }], monthlyWages: 1980, selfReported: 1700, ssi: 0 },
  { id: "c", label: "Okafor household (3)", state: "MI", address: "940 Grand Ave, Lansing MI", members: [{ name: "Grace", age: 68 }, { name: "Ike", age: 41 }, { name: "Tobi", age: 15 }], monthlyWages: 4120, selfReported: 4120, ssi: 943 },
];

type SourceId = "payroll" | "irs" | "dmv" | "ssa";
const SOURCES: { id: SourceId; name: string; proves: string; icon: React.ReactNode; ms: number }[] = [
  { id: "payroll", name: "Payroll provider", proves: "Current monthly wages", icon: <Wallet className="h-4 w-4" />, ms: 900 },
  { id: "irs", name: "IRS tax transcript", proves: "Household size (dependents)", icon: <Landmark className="h-4 w-4" />, ms: 1400 },
  { id: "dmv", name: "State ID / DMV", proves: "Residency", icon: <Home className="h-4 w-4" />, ms: 700 },
  { id: "ssa", name: "Social Security", proves: "SSI / SSDI income", icon: <Building2 className="h-4 w-4" />, ms: 1100 },
];

interface Program { id: string; name: string; pctFpl: number; applies: (h: Household) => boolean; who: string; docs: number }
const PROGRAMS: Program[] = [
  { id: "snap", name: "SNAP (food)", pctFpl: 1.3, applies: () => true, who: "Household", docs: 3 },
  { id: "medicaid", name: "Medicaid (adults, expansion)", pctFpl: 1.38, applies: (h) => h.members.some((m) => m.age >= 19 && m.age < 65), who: "Adults 19–64", docs: 3 },
  { id: "chip", name: "CHIP (children)", pctFpl: 2.0, applies: (h) => h.members.some((m) => m.age < 19), who: "Children", docs: 3 },
  { id: "wic", name: "WIC", pctFpl: 1.85, applies: (h) => h.members.some((m) => m.age < 5 || m.pregnant), who: "Pregnant / under 5", docs: 3 },
  { id: "liheap", name: "LIHEAP (energy)", pctFpl: 1.5, applies: () => true, who: "Household", docs: 3 },
  { id: "lifeline", name: "Lifeline (phone/internet)", pctFpl: 1.35, applies: () => true, who: "Household", docs: 2 },
];

type Status = "idle" | "loading" | "done";

export default function OneProof() {
  const [hid, setHid] = useState("a");
  const [consent, setConsent] = useState<Record<SourceId, boolean>>({ payroll: true, irs: true, dmv: true, ssa: false });
  const [status, setStatus] = useState<Record<SourceId, Status>>({ payroll: "idle", irs: "idle", dmv: "idle", ssa: "idle" });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const h = HOUSEHOLDS.find((x) => x.id === hid)!;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const reset = (id: string) => {
    timers.current.forEach(clearTimeout);
    setHid(id);
    setStatus({ payroll: "idle", irs: "idle", dmv: "idle", ssa: "idle" });
  };

  const connect = () => {
    timers.current.forEach(clearTimeout);
    const next = { ...status };
    SOURCES.forEach((s) => (next[s.id] = consent[s.id] ? "loading" : "idle"));
    setStatus(next);
    SOURCES.forEach((s) => {
      if (!consent[s.id]) return;
      timers.current.push(setTimeout(() => setStatus((st) => ({ ...st, [s.id]: "done" })), s.ms));
    });
  };

  const v = (id: SourceId) => status[id] === "done";
  const anyLoading = Object.values(status).includes("loading");
  const finished = Object.values(status).some((s) => s === "done") && !anyLoading;

  const result = useMemo(() => {
    const size = v("irs") ? h.members.length : h.members.length;
    const wages = v("payroll") ? h.monthlyWages : h.selfReported;
    const ssi = v("ssa") ? h.ssi : 0;
    const monthly = wages + ssi;
    const limit = fpl(size) / 12;
    const verified = { income: v("payroll"), household: v("irs"), residency: v("dmv") };
    const progs = PROGRAMS.filter((p) => p.applies(h)).map((p) => {
      const cap = limit * p.pctFpl;
      const eligible = monthly <= cap;
      const fully = verified.income && verified.household && verified.residency;
      return { ...p, cap, eligible, fully };
    });
    return { size, monthly, limit, verified, progs, pctOfFpl: monthly / limit };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h, status]);

  const docsSaved = result.progs.reduce((s, p) => s + p.docs, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader title="1 · Applicant" subtitle="Pick a sample household" />
          <div className="space-y-1 p-3">
            {HOUSEHOLDS.map((x) => (
              <button key={x.id} onClick={() => reset(x.id)} className={cn("w-full rounded-lg border px-3 py-2 text-left text-sm", hid === x.id ? "border-accent bg-accent/10" : "border-transparent hover:bg-panel-2")}>
                <div className="font-medium">{x.label}</div>
                <div className="text-xs text-muted">{x.address} · self-reports {fmt.usd(x.selfReported)}/mo</div>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="2 · Consent" subtitle="Choose which sources OneProof may read" icon={<Lock className="h-4 w-4" />} />
          <div className="space-y-2 p-3">
            {SOURCES.map((s) => (
              <label key={s.id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm", consent[s.id] ? "border-accent/50" : "border-line opacity-70")}>
                <input type="checkbox" checked={consent[s.id]} onChange={(e) => setConsent((c) => ({ ...c, [s.id]: e.target.checked }))} aria-label={`Consent ${s.name}`} />
                <span className="text-accent">{s.icon}</span>
                <span className="flex-1"><span className="font-medium">{s.name}</span><span className="block text-xs text-muted">{s.proves}</span></span>
                {status[s.id] === "loading" && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                {status[s.id] === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              </label>
            ))}
            <Button className="w-full" onClick={connect} disabled={anyLoading || !Object.values(consent).some(Boolean)}>
              {anyLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Verifying…</> : <><ShieldCheck className="h-4 w-4" />Verify once</>}
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader title="3 · Verified household profile" subtitle="Records pulled from source, not uploaded documents" />
          <div className="grid grid-cols-2 gap-2 p-4 md:grid-cols-4">
            <Stat label="Household size" value={result.size} sub={result.verified.household ? "Verified · IRS" : "Self-reported"} tone={result.verified.household ? "good" : "warn"} />
            <Stat label="Monthly income" value={fmt.usd(result.monthly)} sub={result.verified.income ? "Verified · payroll" : "Self-reported"} tone={result.verified.income ? "good" : "warn"} />
            <Stat label="Residency" value={h.state} sub={result.verified.residency ? "Verified · DMV" : "Unverified"} tone={result.verified.residency ? "good" : "warn"} />
            <Stat label="% of poverty line" value={fmt.pct(result.pctOfFpl)} sub={`FPL ${fmt.usd(result.limit)}/mo`} />
          </div>
          {v("payroll") && h.monthlyWages !== h.selfReported && (
            <div className="mx-4 mb-4 rounded-lg border border-sky-500/30 bg-sky-500/5 p-3 text-xs text-sky-200">
              Payroll shows {fmt.usd(h.monthlyWages)}/mo vs {fmt.usd(h.selfReported)} self-reported. Using the verified figure prevents a later overpayment clawback.
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="4 · Apply everywhere" subtitle="Pre-screen across programs with one verification" right={finished ? <Badge tone="green">Passport ready</Badge> : <Badge>Waiting for verification</Badge>} />
          <div className="divide-y divide-line" data-testid="programs">
            {result.progs.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted">{p.who} · gross limit {fmt.usd(p.cap)}/mo ({Math.round(p.pctFpl * 100)}% FPL)</div>
                </div>
                {!finished ? (
                  <Badge>—</Badge>
                ) : p.eligible ? (
                  <Badge tone={p.fully ? "green" : "amber"}><CheckCircle2 className="h-3 w-3" />{p.fully ? "Likely eligible · verified" : "Likely eligible · needs proof"}</Badge>
                ) : (
                  <Badge tone="red"><XCircle className="h-3 w-3" />Over income limit</Badge>
                )}
              </div>
            ))}
          </div>
          {finished && (
            <div className="grid grid-cols-2 gap-2 border-t border-line p-4">
              <Stat label="Documents not re-uploaded" value={docsSaved} sub={`${result.progs.length} programs × proofs`} tone="good" />
              <Stat label="Likely eligible programs" value={result.progs.filter((p) => p.eligible).length} />
            </div>
          )}
        </Card>
        <SimNotice>Source connections and records are simulated. Screening uses 2025 HHS poverty guidelines with simplified gross-income tests only; real programs apply deductions, asset tests and state rules. Not an eligibility determination.</SimNotice>
      </div>
    </div>
  );
}
