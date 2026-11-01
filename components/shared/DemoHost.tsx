"use client";
import { Component, type ReactNode } from "react";
import { DEMO_COMPONENTS } from "@/components/demos/registry";

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error)
      return (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/5 p-6 text-sm text-rose-200">
          This demo hit a runtime error and was isolated so the rest of the lab keeps working.
          <pre className="mt-2 whitespace-pre-wrap text-xs opacity-70">{this.state.error.message}</pre>
        </div>
      );
    return this.props.children;
  }
}

export default function DemoHost({ slug }: { slug: string }) {
  const C = DEMO_COMPONENTS[slug];
  if (!C) return <div className="rounded-xl border border-line bg-panel p-6 text-sm text-muted">This demo has not been built yet.</div>;
  return (
    <Boundary>
      <C />
    </Boundary>
  );
}
