import { expect, test } from "@playwright/test";
import { ARCHIVE_DEMOS } from "../lib/demos-archive";

for (const d of ARCHIVE_DEMOS) {
  test(`archive demo interaction: ${d.slug}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/demos/${d.slug}`);
    const root = page.getByTestId("demo-root");
    await expect(root).toBeVisible();
    const run = root.getByRole("button", { name: /^(Run triage|Run workflow|Analyse)/ });
    await expect(run.or(root.getByTestId("engine-output")).first()).toBeVisible({ timeout: 15000 });
    if (await run.count()) {
      await run.first().click();
      const approve = root.getByRole("button", { name: "Approve" });
      for (let i = 0; i < 40; i++) {
        if (await root.getByTestId("engine-output").count()) break;
        if (await approve.count()) await approve.click();
        await page.waitForTimeout(250);
      }
    }
    await expect(root.getByTestId("engine-output")).toBeVisible({ timeout: 15000 });
    await expect(root.getByTestId("engine-output")).not.toBeEmpty();
    expect(errors).toEqual([]);
  });
}
