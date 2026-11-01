# YC Startup Demo Lab

An **unofficial** gallery of interactive demos — one for every request in Y Combinator's Requests for Startups (https://www.ycombinator.com/rfs). Not affiliated with or endorsed by Y Combinator; product names are fictional.

- 107 requests across 9 editions (Winter 2027 → Summer 2024), each with a route at `/demos/<slug>`.
- Every demo is labelled **Real prototype**, **Simulation** or **Concept demo**, with explicit limitations and a production roadmap.
- See [`YC_RFS_INVENTORY.md`](YC_RFS_INVENTORY.md) and [`MORNING_REPORT.md`](MORNING_REPORT.md).

## Run locally

```bash
npm install
npm run dev            # http://localhost:3000
# or production
npm run build && npm start
```

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
npx playwright install chromium   # first time only
npm start &                       # tests hit http://localhost:3000 (override with BASE_URL)
npm test                          # desktop + mobile (Pixel 7) projects
npm run docs                      # regenerate YC_RFS_INVENTORY.md + data/stats.json
```

## Layout

- `lib/rfs.ts` — scraped RFS catalog (title, author, excerpt, source URL)
- `lib/demos-w27.ts`, `lib/archive/*.ts` — demo metadata (problem, solution, level, limitations, startup analysis)
- `components/demos/*.tsx` — bespoke Winter 2027 demos
- `components/demos/kit/engines.tsx` — reusable engines (QueueTriage, ModelCalculator, AgentPipeline, WeightedRanker, ExplainableScorer) used by archive demos in `components/demos/archive/*.tsx`
- `components/demos/registry.tsx` — slug → lazily loaded component
- `tests/` — Playwright: every route, every primary interaction, desktop + mobile
