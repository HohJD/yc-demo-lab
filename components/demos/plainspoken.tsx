"use client";
import { useMemo, useState } from "react";
import { Feather, Sparkles, RotateCcw } from "lucide-react";
import { Badge, Button, Card, CardHeader, Stat, Tabs, Textarea, cn } from "@/components/ui";

const SAMPLES = {
  launch: `In today's fast-paced world, businesses are constantly looking for ways to stay ahead. That's why we're thrilled to announce Nimbus, a cutting-edge platform that seamlessly empowers teams to unlock their full potential. It's important to note that Nimbus is not just a tool — it's a game-changer. Furthermore, our robust analytics allow you to leverage data, foster collaboration, and elevate productivity. Moreover, Nimbus offers a plethora of integrations. In conclusion, Nimbus is a testament to our commitment to innovation, and we can't wait for you to embark on this journey with us!`,
  cover: `I am writing to express my keen interest in the Product Manager role. Throughout my career, I have navigated the complexities of cross-functional teams and delved into the intricate tapestry of user needs. My meticulous approach, coupled with my passion for innovation, makes me a pivotal asset. Additionally, I have consistently demonstrated the ability to harness emerging technologies to drive transformative outcomes. Ultimately, I believe my holistic skill set aligns seamlessly with your vision.`,
  human: `We shipped the new search on Tuesday. It broke on Wednesday. A customer in Lisbon had a product name with an apostrophe, and our tokenizer choked on it, so every query returned nothing. We rolled back in nine minutes. The fix was one line. The postmortem took a week, mostly because we kept finding other places where we'd made the same assumption.`,
};

interface Rule { re: RegExp; kind: "cliche" | "hedge" | "filler" | "transition"; fix?: string }

const RULES: Rule[] = [
  { re: /\bin today's (fast-paced|ever-changing|digital) (world|landscape),?\s*/gi, kind: "filler", fix: "" },
  { re: /\bit'?s (important|worth) (to note|noting) that\s*/gi, kind: "filler", fix: "" },
  { re: /\bin conclusion,\s*/gi, kind: "transition", fix: "" },
  { re: /\bfurthermore,\s*/gi, kind: "transition", fix: "Also, " },
  { re: /\bmoreover,\s*/gi, kind: "transition", fix: "" },
  { re: /\badditionally,\s*/gi, kind: "transition", fix: "" },
  { re: /\bultimately,\s*/gi, kind: "transition", fix: "" },
  { re: /\bdelved? into\b/gi, kind: "cliche", fix: "dug into" },
  { re: /\bdelve\b/gi, kind: "cliche", fix: "dig" },
  { re: /\b(the )?intricate tapestry of\b/gi, kind: "cliche", fix: "the mix of" },
  { re: /\btapestry\b/gi, kind: "cliche", fix: "mix" },
  { re: /\ba testament to\b/gi, kind: "cliche", fix: "proof of" },
  { re: /\bnavigated the complexities of\b/gi, kind: "cliche", fix: "worked through" },
  { re: /\bembark on (this|a|the) journey\b/gi, kind: "cliche", fix: "get started" },
  { re: /\bgame-?changer\b/gi, kind: "cliche", fix: "big deal" },
  { re: /\bcutting-edge\b/gi, kind: "cliche", fix: "new" },
  { re: /\bseamlessly\b/gi, kind: "cliche", fix: "" },
  { re: /\bseamless\b/gi, kind: "cliche", fix: "smooth" },
  { re: /\brobust\b/gi, kind: "cliche", fix: "solid" },
  { re: /\bleverage\b/gi, kind: "cliche", fix: "use" },
  { re: /\butilize\b/gi, kind: "cliche", fix: "use" },
  { re: /\bharness\b/gi, kind: "cliche", fix: "use" },
  { re: /\bunlock their full potential\b/gi, kind: "cliche", fix: "do more" },
  { re: /\bunlock\b/gi, kind: "cliche", fix: "open up" },
  { re: /\belevate\b/gi, kind: "cliche", fix: "raise" },
  { re: /\bfoster\b/gi, kind: "cliche", fix: "build" },
  { re: /\bempowers?\b/gi, kind: "cliche", fix: "helps" },
  { re: /\ba plethora of\b/gi, kind: "cliche", fix: "many" },
  { re: /\bmyriad\b/gi, kind: "cliche", fix: "many" },
  { re: /\bpivotal\b/gi, kind: "cliche", fix: "key" },
  { re: /\bmeticulous\b/gi, kind: "cliche", fix: "careful" },
  { re: /\btransformative\b/gi, kind: "cliche", fix: "big" },
  { re: /\bholistic\b/gi, kind: "cliche", fix: "broad" },
  { re: /\bsynerg(y|ies)\b/gi, kind: "cliche" },
  { re: /\bvibrant\b/gi, kind: "cliche" },
  { re: /\bcoupled with\b/gi, kind: "cliche", fix: "plus" },
  { re: /\bthrilled to announce\b/gi, kind: "cliche", fix: "launching" },
  { re: /\bkeen interest\b/gi, kind: "cliche", fix: "interest" },
  { re: /\bcould potentially\b/gi, kind: "hedge", fix: "could" },
  { re: /\b(arguably|perhaps|somewhat|generally speaking)\b/gi, kind: "hedge" },
  { re: /\bit seems that\b/gi, kind: "hedge" },
];

const KIND_STYLE: Record<Rule["kind"], string> = {
  cliche: "bg-amber-400/25 text-amber-100 decoration-amber-400",
  hedge: "bg-sky-400/20 text-sky-100",
  filler: "bg-rose-400/25 text-rose-100 line-through decoration-rose-400",
  transition: "bg-violet-400/25 text-violet-100",
};

function sentences(t: string) {
  return t.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

function analyse(text: string) {
  const hits: { start: number; end: number; kind: Rule["kind"]; match: string }[] = [];
  for (const r of RULES) {
    r.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = r.re.exec(text))) {
      const s = m.index, e = s + m[0].length;
      if (!hits.some((h) => s < h.end && e > h.start)) hits.push({ start: s, end: e, kind: r.kind, match: m[0] });
    }
  }
  hits.sort((a, b) => a.start - b.start);
  const sents = sentences(text);
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  const lens = sents.map((s) => s.split(/\s+/).length);
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1));
  const burst = mean ? sd / mean : 0;
  const dashes = (text.match(/—| -- /g) ?? []).length;
  const triads = (text.match(/\b\w+(?: \w+)?, \w+(?: \w+)?,? and \w+/g) ?? []).length;
  const passive = (text.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/gi) ?? []).length;
  const exclaim = (text.match(/!/g) ?? []).length;
  const per100 = (n: number) => (n / words) * 100;
  const counts = { cliche: 0, hedge: 0, filler: 0, transition: 0 } as Record<Rule["kind"], number>;
  hits.forEach((h) => counts[h.kind]++);
  let score = 100;
  score -= per100(counts.cliche) * 6;
  score -= per100(counts.filler) * 10;
  score -= per100(counts.transition) * 7;
  score -= per100(counts.hedge) * 4;
  score -= per100(dashes) * 6;
  score -= triads * 3;
  score -= exclaim * 2;
  if (sents.length >= 3 && burst < 0.35) score -= (0.35 - burst) * 60;
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { hits, counts, sents: sents.length, words, mean, burst, dashes, triads, passive, score };
}

function rewrite(text: string) {
  let out = text;
  for (const r of RULES) if (r.fix !== undefined) out = out.replace(r.re, r.fix);
  out = out.replace(/\s+—\s+/g, ". ").replace(/!/g, ".");
  out = out.replace(/\s{2,}/g, " ").replace(/\s+([.,])/g, "$1").replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase());
  out = out.replace(/\. ([A-Z][a-z]+) is not just a (\w+)\. it's/gi, ". $1 is more than a $2: it's");
  return out.trim();
}

function Highlighted({ text, hits }: { text: string; hits: ReturnType<typeof analyse>["hits"] }) {
  const parts: React.ReactNode[] = [];
  let i = 0;
  hits.forEach((h, k) => {
    if (h.start > i) parts.push(text.slice(i, h.start));
    parts.push(<mark key={k} title={h.kind} className={cn("rounded px-0.5", KIND_STYLE[h.kind])}>{text.slice(h.start, h.end)}</mark>);
    i = h.end;
  });
  parts.push(text.slice(i));
  return <p className="whitespace-pre-wrap text-sm leading-7">{parts}</p>;
}

function ScoreRing({ score }: { score: number }) {
  const c = 2 * Math.PI * 34;
  const color = score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";
  return (
    <svg viewBox="0 0 80 80" className="h-24 w-24">
      <circle cx="40" cy="40" r="34" stroke="#222633" strokeWidth="8" fill="none" />
      <circle cx="40" cy="40" r="34" stroke={color} strokeWidth="8" fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} strokeLinecap="round" transform="rotate(-90 40 40)" />
      <text x="40" y="46" textAnchor="middle" className="fill-white font-mono text-[20px] font-semibold">{score}</text>
    </svg>
  );
}

export default function Plainspoken() {
  const [sample, setSample] = useState<keyof typeof SAMPLES>("launch");
  const [text, setText] = useState(SAMPLES.launch);
  const [rewritten, setRewritten] = useState<string | null>(null);
  const a = useMemo(() => analyse(text), [text]);
  const b = useMemo(() => (rewritten ? analyse(rewritten) : null), [rewritten]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs tabs={[{ id: "launch", label: "Launch blog (AI)" }, { id: "cover", label: "Cover letter (AI)" }, { id: "human", label: "Incident note (human)" }]} value={sample} onChange={(v) => { setSample(v); setText(SAMPLES[v]); setRewritten(null); }} />
        <span className="text-xs text-muted">or paste your own text below</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader title="Your draft" subtitle={`${a.words} words · ${a.sents} sentences`} icon={<Feather className="h-4 w-4" />} />
          <div className="space-y-3 p-4">
            <Textarea aria-label="Draft text" rows={6} value={text} onChange={(e) => { setText(e.target.value); setRewritten(null); }} />
            <div className="rounded-lg border border-line bg-panel-2 p-3" data-testid="highlighted"><Highlighted text={text} hits={a.hits} /></div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className={cn("rounded px-1.5", KIND_STYLE.cliche)}>cliché ({a.counts.cliche})</span>
              <span className={cn("rounded px-1.5", KIND_STYLE.filler)}>filler ({a.counts.filler})</span>
              <span className={cn("rounded px-1.5", KIND_STYLE.transition)}>stock transition ({a.counts.transition})</span>
              <span className={cn("rounded px-1.5", KIND_STYLE.hedge)}>hedge ({a.counts.hedge})</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Voice score" subtitle="100 = reads like a person" />
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-3" data-testid="voice-score"><ScoreRing score={a.score} /><div className="text-sm">{a.score >= 75 ? "Sounds human." : a.score >= 50 ? "Some robotic tics." : "Reads like a default LLM."}</div></div>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Rhythm variance" value={a.burst.toFixed(2)} sub={a.burst < 0.35 ? "Monotone sentences" : "Varied, good"} tone={a.burst < 0.35 ? "warn" : "good"} />
              <Stat label="Avg sentence" value={`${a.mean.toFixed(0)} w`} />
              <Stat label="Em-dashes" value={a.dashes} tone={a.dashes > 1 ? "warn" : undefined} />
              <Stat label="Rule-of-three lists" value={a.triads} tone={a.triads > 1 ? "warn" : undefined} />
            </div>
            <Button className="w-full" onClick={() => setRewritten(rewrite(text))}><Sparkles className="h-4 w-4" />De-slop rewrite</Button>
          </div>
        </Card>
      </div>
      {rewritten !== null && b && (
        <Card>
          <CardHeader title="Rewrite" subtitle="Deterministic edits: remove filler, plain-word swaps, drop stock transitions" right={<div className="flex items-center gap-2"><Badge tone="red">{a.score}</Badge>→<Badge tone="green">{b.score}</Badge><Button size="sm" variant="ghost" onClick={() => { setText(rewritten); setRewritten(null); }}><RotateCcw className="h-3 w-3" />Use as draft</Button></div>} />
          <div className="grid gap-4 p-4 md:grid-cols-2" data-testid="rewrite">
            <div><div className="mb-1 text-xs text-muted">Before · {a.words} words</div><p className="text-sm leading-7 text-foreground/60">{text}</p></div>
            <div><div className="mb-1 text-xs text-muted">After · {b.words} words</div><p className="text-sm leading-7">{rewritten}</p></div>
          </div>
        </Card>
      )}
    </div>
  );
}
