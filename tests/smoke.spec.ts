import { expect, test, type Page } from "@playwright/test";
import { CATALOG } from "../lib/catalog";

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  return errors;
}

test("home: stats, search and filters", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "YC Startup Demo Lab" })).toBeVisible();
  await expect(page.getByTestId("stats")).toContainText(String(CATALOG.length));
  const cards = page.getByTestId("idea-card");
  await expect(cards.first()).toBeVisible();
  await page.getByPlaceholder(/search/i).fill("transformer");
  await expect(page.getByTestId("result-count")).not.toContainText(`${CATALOG.length} `);
  expect(errors).toEqual([]);
});

test("status page lists every request", async ({ page }) => {
  await page.goto("/status");
  await expect(page.locator("tbody tr")).toHaveCount(CATALOG.length);
});

for (const e of CATALOG) {
  test(`demo route renders: ${e.request.slug}`, async ({ page }) => {
    const errors = watchErrors(page);
    const res = await page.goto(`/demos/${e.request.slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByTestId("demo-root")).toBeVisible();
    await expect(page.getByText("hit a runtime error")).toHaveCount(0);
    await page.waitForTimeout(300);
    expect(errors.filter((x) => !x.includes("Download the React DevTools"))).toEqual([]);
  });
}
