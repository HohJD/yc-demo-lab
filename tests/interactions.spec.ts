import { expect, test } from "@playwright/test";

const go = (slug: string) => `/demos/${slug}`;

test("OrbitWise: changing launch cost updates breakeven", async ({ page }) => {
  await page.goto(go("startups-in-a-world-of-abundant-space-access"));
  await expect(page.locator(".recharts-surface").first()).toBeVisible();
});

test("ClaimCoach: diagnose + appeal letter", async ({ page }) => {
  await page.goto(go("the-15-an-hour-expert"));
  await expect(page.getByTestId("root-cause")).toBeVisible();
  for (const cb of await page.getByRole("checkbox", { name: /^Step \d+/ }).all()) await cb.check();
  await page.getByRole("button", { name: /generate appeal packet/i }).click();
  await expect(page.getByTestId("appeal-letter")).toContainText(/appeal/i);
});

test("Homegrown BOM: optimiser produces swap plan", async ({ page }) => {
  await page.goto(go("robots-made-in-america"));
  await expect(page.getByTestId("domestic-pct")).toBeVisible();
  await page.getByRole("button", { name: /cheapest path/i }).first().click();
  await expect(page.getByTestId("swap-plan")).toBeVisible();
});

test("Plainspoken: analyse and rewrite", async ({ page }) => {
  await page.goto(go("llms-that-write-well"));
  await page.getByRole("button", { name: /rewrite/i }).first().click();
  await expect(page.getByText(/After ·/)).toBeVisible();
});

test("OneProof: verify once returns programs", async ({ page }) => {
  await page.goto(go("plaid-for-government-benefits"));
  await page.getByRole("button", { name: /verify once/i }).click();
  await expect(page.getByTestId("programs")).toBeVisible({ timeout: 15000 });
});

test("Steelyard: underwrite", async ({ page }) => {
  await page.goto(go("wall-street-for-the-physical-buildout"));
  await page.getByRole("button", { name: /underwrite|simulat|run/i }).first().click();
  await expect(page.getByTestId("underwriting-result")).toBeVisible();
});

test("Tessera: forecast and backtest", async ({ page }) => {
  await page.goto(go("vertical-foundation-models"));
  await expect(page.getByTestId("forecast-chart")).toBeVisible();
  await page.getByRole("button", { name: /forecast \(zero-shot\)/i }).click();
  await expect(page.getByTestId("backtest")).toContainText(/ensemble/i);
});

test("PermitPilot: review produces correction notice", async ({ page }) => {
  await page.goto(go("ai-for-city-hall"));
  await page.getByRole("button", { name: /run plan review/i }).click();
  await expect(page.getByTestId("notice")).toContainText("CORRECTIONS");
  await page.getByLabel("ADU size").fill("700");
  await page.getByLabel("Front setback").fill("20");
  await page.getByLabel("Height").fill("28");
  await expect(page.getByTestId("review-summary")).toBeVisible();
});

test("Critical Path: applying a mitigation pulls go-live forward", async ({ page }) => {
  await page.goto(go("data-center-supply-chain"));
  const before = await page.getByTestId("cpm-stats").innerText();
  await page.getByTestId("mitigations").getByRole("button", { name: "Apply" }).first().click();
  await expect(page.getByTestId("cpm-stats")).not.toHaveText(before);
});

test("Bunker: local answer with zero egress", async ({ page }) => {
  await page.goto(go("ai-for-the-air-gapped-economy"));
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.getByTestId("bunker-answer")).toContainText(/60 minutes/);
  await expect(page.getByText("Zero bytes left the building")).toBeVisible();
});

test("Keystone: evals and TCO", async ({ page }) => {
  await page.goto(go("own-your-intelligence"));
  await page.getByRole("button", { name: /run evals/i }).click();
  await expect(page.getByTestId("eval-results")).toContainText("%");
  await expect(page.getByTestId("tco")).toContainText("Break-even");
});
