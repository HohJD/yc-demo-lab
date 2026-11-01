"use client";
import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, FileWarning, Gavel, Timer, XCircle } from "lucide-react";
import { Badge, Button, Card, CardHeader, Input, Label, Select, Stat, cn, SimNotice } from "@/components/ui";

type Zone = "R-1" | "R-2" | "MU";
interface Code { minLot: number; front: number; side: number; rear: number; height: number; coverage: number; parkingPerUnit: number; maxUnits: number; aduMax: number }
const CODE: Record<Zone, Code> = {
  "R-1": { minLot: 6000, front: 20, side: 5, rear: 20, height: 30, coverage: 0.4, parkingPerUnit: 2, maxUnits: 1, aduMax: 800 },
  "R-2": { minLot: 5000, front: 15, side: 5, rear: 15, height: 35, coverage: 0.5, parkingPerUnit: 1.5, maxUnits: 4, aduMax: 800 },
  MU: { minLot: 0, front: 0, side: 0, rear: 10, height: 55, coverage: 0.85, parkingPerUnit: 1, maxUnits: 999, aduMax: 0 },
};
const SECTION: Record<string, string> = {
  lot: "§17.20.040 Minimum lot area", front: "§17.20.050(A) Front setback", side: "§17.20.050(B) Side setback", rear: "§17.20.050(C) Rear setback",
  height: "§17.20.060 Maximum height", coverage: "§17.20.070 Lot coverage", units: "§17.20.030 Permitted density", parking: "§17.48.020 Off-street parking",
  adu: "§17.22.010 Accessory dwelling units", sprinkler: "§15.08.110 Fire sprinklers (buildings > 40 ft)",
};

interface App { id: string; applicant: string; address: string; zone: Zone; lotArea: number; footprint: number; height: number; front: number; side: number; rear: number; units: number; parking: number; adu: number; nearTransit: boolean; sprinklers: boolean }
const APPS: App[] = [
  { id: "BP-2026-0418", applicant: "Nguyen residence", address: "512 Alder Ln", zone: "R-1", lotArea: 7200, footprint: 3100, height: 28, front: 18, side: 6, rear: 22, units: 1, parking: 2, adu: 950, nearTransit: false, sprinklers: false },
  { id: "BP-2026-0422", applicant: "Ridgeview Fourplex LLC", address: "88 Cedar Ave", zone: "R-2", lotArea: 6400, footprint: 3000, height: 34, front: 15, side: 5, rear: 15, units: 4, parking: 5, adu: 0, nearTransit: false, sprinklers: true },
  { id: "BP-2026-0430", applicant: "Main St Mixed-Use", address: "200 Main St", zone: "MU", lotArea: 12000, footprint: 9800, height: 52, front: 0, side: 0, rear: 8, units: 36, parking: 18, adu: 0, nearTransit: true, sprinklers: false },
];

interface Finding { key: string; ok: boolean; required: string; provided: string; fix?: string }

function review(a: App): Finding[] {
  const c = CODE[a.zone];
  const f: Finding[] = [];
  const add = (key: string, ok: boolean, required: string, provided: string, fix?: string) => f.push({ key, ok, required, provided, fix: ok ? undefined : fix });
  add("lot", a.lotArea >= c.minLot, `≥ ${c.minLot.toLocaleString()} sq ft`, `${a.lotArea.toLocaleString()} sq ft`, "Request a variance or lot merger.");
  add("front", a.front >= c.front, `≥ ${c.front} ft`, `${a.front} ft`, `Move the front wall back ${c.front - a.front} ft.`);
  add("side", a.side >= c.side, `≥ ${c.side} ft`, `${a.side} ft`, `Increase side setback by ${c.side - a.side} ft.`);
  add("rear", a.rear >= c.rear, `≥ ${c.rear} ft`, `${a.rear} ft`, `Increase rear setback by ${c.rear - a.rear} ft.`);
  add("height", a.height <= c.height, `≤ ${c.height} ft`, `${a.height} ft`, `Reduce height by ${a.height - c.height} ft.`);
  const cov = a.footprint / a.lotArea;
  add("coverage", cov <= c.coverage, `≤ ${Math.round(c.coverage * 100)}%`, `${(cov * 100).toFixed(1)}%`, `Reduce footprint by ${Math.ceil(a.footprint - c.coverage * a.lotArea).toLocaleString()} sq ft.`);
  add("units", a.units <= c.maxUnits, c.maxUnits > 100 ? "No cap" : `≤ ${c.maxUnits} units`, `${a.units} units`, "Reduce unit count.");
  const ratio = a.zone === "MU" && a.nearTransit ? 0.5 : c.parkingPerUnit;
  const need = Math.ceil(a.units * ratio + (a.adu > 0 ? 0 : 0));
  add("parking", a.parking >= need, `≥ ${need} spaces (${ratio}/unit${a.zone === "MU" && a.nearTransit ? ", transit reduction" : ""})`, `${a.parking} spaces`, `Add ${need - a.parking} spaces.`);
  if (a.adu > 0) add("adu", c.aduMax > 0 && a.adu <= c.aduMax, c.aduMax ? `≤ ${c.aduMax} sq ft` : "Not permitted in zone", `${a.adu} sq ft`, c.aduMax ? `Reduce ADU by ${a.adu - c.aduMax} sq ft.` : "Remove ADU.");
  if (a.height > 40) add("sprinkler", a.sprinklers, "Automatic sprinklers required", a.sprinklers ? "Provided" : "Not shown", "Add NFPA 13 sprinkler plans to sheet FP-1.");
  return f;
}

export default function PermitPilot() {
  const [apps, setApps] = useState(APPS);
  const [sel, setSel] = useState(APPS[0].id);
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const a = apps.find((x) => x.id === sel)!;
  const findings = useMemo(() => review(a), [a]);
  const fails = findings.filter((f) => !f.ok);
  const done = reviewed[a.id];
  const up = (p: Partial<App>) => { setApps((as) => as.map((x) => (x.id === sel ? { ...x, ...p } : x))); };
  const num = (k: keyof App) => ({ type: "number", value: a[k] as number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => up({ [k]: Number(e.target.value) } as Partial<App>) });

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <Card>
        <CardHeader title="Intake queue" subtitle="City of Brookhaven (fictional)" icon={<ClipboardCheck className="h-4 w-4" />} />
        <div className="divide-y divide-line">
          {apps.map((x) => {
            const nf = review(x).filter((f) => !f.ok).length;
            return (
              <button key={x.id} onClick={() => setSel(x.id)} className={cn("block w-full px-4 py-3 text-left text-sm hover:bg-panel-2", sel === x.id && "bg-accent/10")}>
                <div className="flex justify-between"><span className="font-mono text-xs">{x.id}</span><Badge>{x.zone}</Badge></div>
                <div className="mt-1">{x.applicant}</div>
                <div className="text-xs text-muted">{x.address} · {reviewed[x.id] ? (nf ? `${nf} corrections` : "Approved") : "Awaiting review"}</div>
              </button>
            );
          })}
        </div>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader title={`${a.applicant} · ${a.address}`} subtitle="Application data (edit to see the review change)" right={<Button onClick={() => setReviewed((r) => ({ ...r, [a.id]: true }))}><Gavel className="h-4 w-4" />Run plan review</Button>} />
          <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
            <div><Label>Zone</Label><Select value={a.zone} onChange={(e) => up({ zone: e.target.value as Zone })} options={(Object.keys(CODE) as Zone[]).map((z) => ({ value: z, label: z }))} /></div>
            <div><Label>Lot area (sq ft)</Label><Input {...num("lotArea")} /></div>
            <div><Label>Footprint (sq ft)</Label><Input {...num("footprint")} /></div>
            <div><Label>Height (ft)</Label><Input aria-label="Height" {...num("height")} /></div>
            <div><Label>Front setback (ft)</Label><Input aria-label="Front setback" {...num("front")} /></div>
            <div><Label>Side setback (ft)</Label><Input {...num("side")} /></div>
            <div><Label>Rear setback (ft)</Label><Input {...num("rear")} /></div>
            <div><Label>Dwelling units</Label><Input {...num("units")} /></div>
            <div><Label>Parking spaces</Label><Input {...num("parking")} /></div>
            <div><Label>ADU (sq ft, 0 = none)</Label><Input aria-label="ADU size" {...num("adu")} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={a.nearTransit} onChange={(e) => up({ nearTransit: e.target.checked })} />Within ½ mi of transit</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={a.sprinklers} onChange={(e) => up({ sprinklers: e.target.checked })} />Sprinkler plans included</label>
          </div>
        </Card>
        {done ? (
          <>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4" data-testid="review-summary">
              <Stat label="Checks run" value={findings.length} />
              <Stat label="Corrections" value={fails.length} tone={fails.length ? "bad" : "good"} />
              <Stat label="Review time" value="< 1 sec" sub="vs ~3–6 wks manual cycle (est.)" tone="good" />
              <Stat label="Decision" value={fails.length ? "Corrections" : "Approve"} tone={fails.length ? "warn" : "good"} />
            </div>
            <Card>
              <CardHeader title="Findings" subtitle="Every finding cites the code section" icon={<FileWarning className="h-4 w-4" />} />
              <div className="divide-y divide-line">
                {findings.map((f) => (
                  <div key={f.key} className="flex flex-wrap items-start justify-between gap-2 px-4 py-2.5 text-sm">
                    <div className="flex items-start gap-2">
                      {f.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> : <XCircle className="mt-0.5 h-4 w-4 text-rose-400" />}
                      <div><div className="font-medium">{SECTION[f.key]}</div><div className="text-xs text-muted">Required {f.required} · provided {f.provided}</div>{f.fix && <div className="text-xs text-amber-200">Fix: {f.fix}</div>}</div>
                    </div>
                    <Badge tone={f.ok ? "green" : "red"}>{f.ok ? "Pass" : "Fail"}</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader title={fails.length ? "Correction notice (draft)" : "Approval notice (draft)"} icon={<Timer className="h-4 w-4" />} />
              <pre className="whitespace-pre-wrap p-4 font-mono text-xs leading-5" data-testid="notice">{fails.length
                ? `CITY OF BROOKHAVEN — PLAN REVIEW CORRECTIONS\nPermit ${a.id} · ${a.address} · Zone ${a.zone}\n\nThe following items must be addressed before approval:\n\n${fails.map((f, i) => `${i + 1}. ${SECTION[f.key]} — required ${f.required}; plans show ${f.provided}. ${f.fix}`).join("\n")}\n\nResubmit revised sheets through the portal. Items not listed above comply.`
                : `CITY OF BROOKHAVEN — PLAN REVIEW APPROVAL\nPermit ${a.id} · ${a.address} · Zone ${a.zone}\n\nAll ${findings.length} zoning checks pass. Application forwarded for building-code review and fee payment.`}</pre>
            </Card>
          </>
        ) : (
          <div className="grid h-40 place-items-center rounded-xl border border-dashed border-line text-sm text-muted">Run plan review to check this application against the zoning code.</div>
        )}
        <SimNotice>Fictional city, code sections and applications. A real deployment would extract dimensions from drawings and encode each city&apos;s actual code.</SimNotice>
      </div>
    </div>
  );
}
