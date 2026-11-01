# Morning Report — YC Startup Demo Lab

Unofficial project; not affiliated with Y Combinator.

## Numbers

| Metric | Count |
|---|---|
| YC RFS requests identified (9 editions, scraped from ycombinator.com/rfs) | **107** |
| Demo pages (`/demos/<slug>`) | **107** |
| Demos with a passing route + primary-interaction test | **107** (desktop and mobile) |
| Real prototypes (genuine logic on your input) | **61** |
| Simulations (interactive model, illustrative data) | **24** |
| Concept demonstrations (scripted interactive workflow) | **22** |
| Planned / not built | **0** |
| Broken or incomplete demos | **0 known** |

By edition:

| Edition | Requests | Demos | Real | Simulation | Concept |
|---|---|---|---|---|---|
| Winter 2027 | 11 | 11 | 10 | 1 | 0 |
| Fall 2026 | 13 | 13 | 5 | 5 | 3 |
| Summer 2026 | 16 | 16 | 7 | 6 | 3 |
| Spring 2026 | 10 | 10 | 4 | 2 | 4 |
| Fall 2025 | 6 | 6 | 3 | 2 | 1 |
| Summer 2025 | 14 | 14 | 9 | 1 | 4 |
| Spring 2025 | 12 | 12 | 6 | 3 | 3 |
| Winter 2025 | 9 | 9 | 7 | 1 | 1 |
| Summer 2024 | 16 | 16 | 10 | 3 | 3 |

## Verification (all run against a production build)

- `npm run lint` — clean
- `npx tsc --noEmit` — clean
- `npm run build` — success, 114 static pages
- `npx playwright test` — **432 passed** (216 tests × Desktop Chrome + Pixel 7): homepage stats/search, status table, every one of the 107 routes, and the primary interaction of every demo (Winter 2027 bespoke flows; archive demos run their engine and must render non-empty output with no page errors).

## How it is built

- **Winter 2027 (latest)**: 11 bespoke products, each with its own UI (e.g. orbital economics charts, claim-appeal builder, BOM domestic-content optimizer, critical-path graph with React Flow, air-gapped local search with MiniSearch, model eval + TCO).
- **Archive editions (96)**: built on five reusable, transparent engines — rules-based queue triage, numeric models with charts, agent workflows with human approval gates, weighted ranking and explainable scoring — each configured with domain-specific logic and sample data (e.g. exact binomial majority-vote accuracy, tiled-GEMM roofline, beam deflection, Bayes screening outcomes, 6ND training compute).

## Known limitations / blockers

- No live LLM or third-party API calls anywhere — outputs are deterministic code or scripted traces, labelled on every page.
- Archive demos share engine UIs, so they are less visually distinct than Winter 2027.
- Sample data is fictional; financial/medical/engineering numbers are illustrative only.
- Not deployed (by request); run locally per README.

## Most promising opportunities (judgement, not research)

1. **ClaimCoach** (The $15-an-Hour Expert) — clear ROI, real pain, the demo already shows a full workflow.
2. **PermitPilot** (government permits) — structured rules + document review is very automatable.
3. **ThinkBudget** (test-time compute) — infra spend is growing quickly and teams lack budgeting tools.
4. **AuditLoop / AI-native compliance** — continuous control testing has obvious buyers.
5. **Homegrown BOM** (Robots Made in America) — domestic-content rules make it a must-have for some buyers.

## Recommended next steps

1. Add an optional LLM backend (bring-your-own key) for the concept demos so they run on real input.
2. Upgrade the strongest archive demos to bespoke UIs like Winter 2027.
3. Add real public datasets where available (e.g. SAM.gov, EIA power prices, FDA/CMS data).
4. Add visual regression snapshots.
