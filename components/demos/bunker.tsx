"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import MiniSearch from "minisearch";
import { HardDrive, Search, ShieldOff, WifiOff, Server } from "lucide-react";
import { Badge, Button, Card, CardHeader, Input, Select, Slider, Stat, fmt, SimNotice } from "@/components/ui";

const DOCS = [
  { title: "SOP-114 Reactor coolant pump restart", text: "Before restarting a reactor coolant pump, verify seal injection flow is above 8 gpm and the No. 1 seal leak-off is within limits. Obtain shift supervisor permission. If vibration exceeds 15 mils, trip the pump immediately and log the event. A restart is not permitted within 30 minutes of a trip without engineering review." },
  { title: "SOP-207 Emergency diesel generator test", text: "The emergency diesel generator must be tested monthly. Start the generator from the control room and confirm it reaches rated voltage and frequency within 10 seconds. Load the generator to at least 90 percent of rated load for a minimum of 60 minutes. Record fuel oil day tank level before and after the test." },
  { title: "SEC-03 Removable media policy", text: "No removable media may be connected to plant control systems. USB devices must be scanned at the media kiosk and approved by cyber security before use on business systems. Any unauthorised device found connected must be reported to security within one hour." },
  { title: "HR-12 Overtime and fatigue rules", text: "Workers performing safety-related duties may not exceed 16 work hours in any 24-hour period or 72 hours in any 7-day period. A minimum 10-hour break is required between successive work periods. Fatigue assessments are required when limits are exceeded." },
  { title: "ENV-08 Spill response", text: "For oil spills under 5 gallons, contain the spill with absorbent pads and notify the environmental coordinator. Spills over 25 gallons or any spill reaching a storm drain require notification of the state environmental agency within 2 hours." },
  { title: "OPS-31 Cooling tower winter operations", text: "When ambient temperature drops below 35°F, place cooling tower bypass valves in service to prevent icing. Inspect fill and drift eliminators daily for ice build-up. Fans may be reversed for up to 20 minutes to de-ice." },
  { title: "MNT-44 Lockout/tagout", text: "Every worker must apply a personal lock to the lockout device. Verify zero energy by attempting to start the equipment after isolation. Locks may only be removed by the worker who applied them, except under the supervisor-removal procedure with documented attempts to contact the worker." },
];

interface Passage { id: number; title: string; text: string }
const PASSAGES: Passage[] = DOCS.flatMap((d, di) => d.text.split(/(?<=\.)\s+/).reduce<string[][]>((acc, s, i) => { if (i % 2 === 0) acc.push([s]); else acc[acc.length - 1].push(s); return acc; }, []).map((ss, pi) => ({ id: di * 100 + pi, title: d.title, text: ss.join(" ") })));

const EXAMPLES = ["How long must the diesel generator run under load?", "Can I plug a USB drive into the control system?", "What is the max work hours in a week?", "Who can remove a lockout lock?"];

const MODELS: Record<string, { params: number; layers: number; kvHeads: number; headDim: number }> = {
  "8B": { params: 8, layers: 32, kvHeads: 8, headDim: 128 },
  "32B": { params: 32, layers: 64, kvHeads: 8, headDim: 128 },
  "70B": { params: 70, layers: 80, kvHeads: 8, headDim: 128 },
  "405B": { params: 405, layers: 126, kvHeads: 8, headDim: 128 },
};

function bestSentence(text: string, q: string) {
  const terms = new Set(q.toLowerCase().match(/[a-z0-9]+/g)?.filter((w) => w.length > 2) ?? []);
  const sents = text.split(/(?<=\.)\s+/);
  let best = sents[0], score = -1;
  for (const s of sents) {
    const w = s.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    const sc = w.filter((x) => terms.has(x)).length + (/\d/.test(s) ? 0.5 : 0);
    if (sc > score) { score = sc; best = s; }
  }
  return best;
}

export default function Bunker() {
  const index = useMemo(() => {
    const ms = new MiniSearch<Passage>({ fields: ["title", "text"], storeFields: ["title", "text"], searchOptions: { boost: { title: 0.5 }, fuzzy: 0.2, prefix: true } });
    ms.addAll(PASSAGES);
    return ms;
  }, []);
  const [q, setQ] = useState(EXAMPLES[0]);
  const [hits, setHits] = useState<{ id: number; title: string; text: string; score: number }[] | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [net, setNet] = useState<{ before: number; after: number; ms: number } | null>(null);
  const fetchCount = useRef(0);

  useEffect(() => {
    const orig = window.fetch;
    window.fetch = (...args: Parameters<typeof fetch>) => { fetchCount.current++; return orig(...args); };
    return () => { window.fetch = orig; };
  }, []);

  const ask = (query = q) => {
    const resBefore = performance.getEntriesByType("resource").length;
    const fBefore = fetchCount.current;
    const t0 = performance.now();
    const r = index.search(query).slice(0, 3) as unknown as { id: number; title: string; text: string; score: number }[];
    setHits(r);
    setAnswer(r.length ? bestSentence(r[0].text, query) : null);
    const ms = performance.now() - t0;
    setTimeout(() => setNet({ before: 0, after: performance.getEntriesByType("resource").length - resBefore + (fetchCount.current - fBefore), ms }), 300);
  };

  const [model, setModel] = useState("70B");
  const [bits, setBits] = useState("4");
  const [ctx, setCtx] = useState(8192);
  const [users, setUsers] = useState(20);
  const mm = MODELS[model];
  const bytesPer = Number(bits) / 8;
  const weightsGB = mm.params * bytesPer;
  const kvPerTokenBytes = 2 * mm.layers * mm.kvHeads * mm.headDim * 2;
  const kvGB = (kvPerTokenBytes * ctx * users) / 1e9;
  const totalGB = (weightsGB + kvGB) * 1.1;
  const gpus80 = Math.ceil(totalGB / 80);
  const gpus48 = Math.ceil(totalGB / 48);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2 text-xs">
        <WifiOff className="h-4 w-4 text-emerald-400" />
        <span>Air-gap mode: the corpus and index live in this page. Queries never leave your device.</span>
        <Badge tone="green" className="ml-auto" >{PASSAGES.length} passages indexed locally</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader title="Ask the plant manual" subtitle="Harlan Ridge Generating Station (fictional) · 7 controlled documents" icon={<Search className="h-4 w-4" />} />
          <div className="space-y-3 p-4">
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(); }}>
              <Input aria-label="Question" value={q} onChange={(e) => setQ(e.target.value)} />
              <Button type="submit">Ask</Button>
            </form>
            <div className="flex flex-wrap gap-1">{EXAMPLES.map((e) => <button key={e} onClick={() => { setQ(e); ask(e); }} className="rounded-full border border-line px-2 py-0.5 text-xs text-muted hover:text-foreground">{e}</button>)}</div>
            {hits && (
              <div data-testid="bunker-answer" className="space-y-3">
                <div className="rounded-lg border border-accent/40 bg-accent/5 p-3 text-sm">
                  <div className="text-[11px] uppercase tracking-wide text-muted">Extractive answer</div>
                  <div className="mt-1">{answer ?? "No matching passage found in the local corpus."}</div>
                  {hits[0] && <div className="mt-1 text-xs text-muted">Source: {hits[0].title}</div>}
                </div>
                {hits.map((h) => (
                  <div key={h.id} className="rounded-lg border border-line bg-panel-2 p-3 text-xs">
                    <div className="flex justify-between font-medium"><span>{h.title}</span><span className="font-mono text-muted">BM25 {h.score.toFixed(2)}</span></div>
                    <div className="mt-1 text-foreground/80">{h.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title="Egress monitor" subtitle="Network requests during your query" icon={<ShieldOff className="h-4 w-4" />} />
          <div className="space-y-2 p-4">
            <Stat label="Requests sent" value={net ? net.after : "—"} tone={net ? (net.after === 0 ? "good" : "bad") : undefined} sub={net ? (net.after === 0 ? "Zero bytes left the building" : "Unexpected traffic") : "Ask a question"} />
            <Stat label="Query latency" value={net ? `${net.ms.toFixed(1)} ms` : "—"} sub="Local BM25 over in-memory index" />
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader title="On-prem sizing" subtitle="GPUs needed to serve an open-weight model inside the wall" icon={<Server className="h-4 w-4" />} />
        <div className="grid gap-4 p-4 md:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Select aria-label="Model size" value={model} onChange={(e) => setModel(e.target.value)} options={Object.keys(MODELS).map((m) => ({ value: m, label: `${m} params` }))} />
              <Select aria-label="Precision" value={bits} onChange={(e) => setBits(e.target.value)} options={[{ value: "16", label: "FP16" }, { value: "8", label: "INT8" }, { value: "4", label: "INT4" }]} />
            </div>
            <Slider label="Context length" value={ctx} min={2048} max={131072} step={2048} onChange={setCtx} format={(v) => fmt.num(v)} />
            <Slider label="Concurrent users" value={users} min={1} max={200} onChange={setUsers} />
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4" data-testid="sizing">
            <Stat label="Weights" value={`${weightsGB.toFixed(0)} GB`} />
            <Stat label="KV cache" value={`${kvGB.toFixed(0)} GB`} sub={`${(kvPerTokenBytes / 1024).toFixed(0)} KB/token`} />
            <Stat label="80 GB GPUs" value={gpus80} sub="H100/A100-class" />
            <Stat label="48 GB GPUs" value={gpus48} sub="L40S-class" />
            <div className="col-span-full flex items-center gap-2 text-xs text-muted"><HardDrive className="h-3 w-3" />Total {totalGB.toFixed(0)} GB incl. 10% overhead. Rule-of-thumb estimate (GQA, FP16 KV cache).</div>
          </div>
        </div>
      </Card>
      <SimNotice>Retrieval and the egress counter are real and run in your browser. No generative LLM runs here; answers are extracted sentences. Documents are fictional.</SimNotice>
    </div>
  );
}
