"use client";
import clsx from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const cn = clsx;

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border border-line bg-panel", className)}>{children}</div>;
}

export function CardHeader({ title, subtitle, right, icon }: { title: ReactNode; subtitle?: ReactNode; right?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
      <div className="flex items-start gap-2">
        {icon && <div className="mt-0.5 text-accent">{icon}</div>}
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline"; size?: "sm" | "md" };
export function Button({ className, variant = "primary", size = "md", ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        variant === "primary" && "bg-accent text-black hover:brightness-110",
        variant === "outline" && "border border-line bg-panel-2 hover:border-accent/60",
        variant === "ghost" && "text-muted hover:bg-panel-2 hover:text-foreground",
        className,
      )}
    />
  );
}

export function Badge({ children, className, tone = "default" }: { children: ReactNode; className?: string; tone?: "default" | "green" | "amber" | "red" | "blue" | "violet" | "accent" }) {
  const tones: Record<string, string> = {
    default: "border-line bg-panel-2 text-muted",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    red: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    blue: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    accent: "border-accent/40 bg-accent/10 text-accent",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", tones[tone], className)}>{children}</span>;
}

export function Label({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-1 flex items-baseline justify-between text-xs">
      <span className="font-medium text-foreground/90">{children}</span>
      {hint && <span className="font-mono text-muted">{hint}</span>}
    </div>
  );
}

export function Input(p: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn("h-9 w-full rounded-lg border border-line bg-panel-2 px-3 text-sm outline-none focus:border-accent", p.className)} />;
}

export function Textarea(p: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cn("w-full rounded-lg border border-line bg-panel-2 p-3 text-sm outline-none focus:border-accent", p.className)} />;
}

export function Select({ options, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select {...p} className={cn("h-9 w-full rounded-lg border border-line bg-panel-2 px-2 text-sm outline-none focus:border-accent", p.className)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, format, name }: { label: ReactNode; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string; name?: string }) {
  return (
    <label className="block">
      <Label hint={format ? format(value) : value}>{label}</Label>
      <input aria-label={typeof label === "string" ? label : name} name={name} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}

export function Stat({ label, value, sub, tone }: { label: ReactNode; value: ReactNode; sub?: ReactNode; tone?: "good" | "bad" | "warn" }) {
  return (
    <div className="rounded-lg border border-line bg-panel-2 p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className={cn("mt-1 font-mono text-lg font-semibold", tone === "good" && "text-emerald-300", tone === "bad" && "text-rose-300", tone === "warn" && "text-amber-300")}>{value}</div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="inline-flex flex-wrap gap-1 rounded-lg border border-line bg-panel-2 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition", value === t.id ? "bg-accent text-black" : "text-muted hover:text-foreground")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Meter({ value, max = 100, tone }: { value: number; max?: number; tone?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-panel-2">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: tone ?? "var(--accent)" }} />
    </div>
  );
}

export function SimNotice({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">{children}</div>;
}

export const fmt = {
  usd: (n: number, d = 0) => (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }),
  usdShort: (n: number) => {
    const a = Math.abs(n);
    const s = a >= 1e12 ? (a / 1e12).toFixed(1) + "T" : a >= 1e9 ? (a / 1e9).toFixed(1) + "B" : a >= 1e6 ? (a / 1e6).toFixed(1) + "M" : a >= 1e3 ? (a / 1e3).toFixed(1) + "k" : a.toFixed(0);
    return (n < 0 ? "-$" : "$") + s;
  },
  pct: (n: number, d = 0) => (n * 100).toFixed(d) + "%",
  num: (n: number, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }),
};
