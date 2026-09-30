import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("complete local profile, exploration, compatibility and revocable cross-device share journey", async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page).toHaveTitle("PRIME NUMERA · A path of your own");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Your numbers",
  );
  await expect(page.locator(".hero-art img")).toBeVisible();
  expect(
    await page
      .locator(".hero-art img")
      .evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/desktop-landing.png" });
  const form = page.locator("#begin form");
  await form.getByLabel("Birth name", { exact: true }).fill("Ada Lovelace");
  await form.getByLabel("Birth date", { exact: true }).fill("1815-12-10");
  await form.getByRole("button", { name: "Reveal my numbers" }).click();
  await expect(page.locator("#results")).toContainText(
    "Your numerical portrait",
  );
  await page
    .getByRole("button", { name: "Save on this device", exact: true })
    .click();
  await expect(page.locator("#saved")).toContainText("Ada Lovelace");
  await page
    .locator("#dna")
    .getByRole("button", { name: "Life Path ·" })
    .click();
  await expect(page.locator("#dna")).toContainText("Life Path:");
  await page.locator("#atlas summary").first().click();
  const other = page.locator("#compatibility form");
  await other.getByLabel("Birth name", { exact: true }).fill("Grace Hopper");
  await other.getByLabel("Birth date", { exact: true }).fill("1906-12-09");
  await other.getByRole("button", { name: "Compare profiles" }).click();
  await expect(page.locator(".comparison")).toContainText(
    "Your shared and contrasting patterns",
  );
  await page
    .locator(".comparison")
    .getByRole("button", { name: "Shared patterns", exact: true })
    .click();
  await expect(
    page
      .locator(".comparison")
      .getByRole("button", { name: "Shared patterns", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .locator(".comparison")
    .getByRole("button", { name: "Contrasting patterns", exact: true })
    .click();
  await expect(page.locator(".comparison tbody")).not.toContainText("Shared");
  await page.locator(".comparison details summary").first().click();
  await expect(page.locator(".comparison details[open]")).toContainText(
    "Original discussion prompts",
  );
  await page
    .locator(".comparison")
    .getByRole("button", { name: "All patterns", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Create safe share", exact: true })
    .click();
  const link = page.getByRole("link", { name: "Open new share" });
  await expect(link).toBeVisible();
  const url = await link.getAttribute("href");
  const visitor = await browser.newContext();
  const otherPage = await visitor.newPage();
  await otherPage.goto(url!);
  await expect(otherPage.getByRole("heading", { level: 1 })).toHaveText(
    "Selected numbers",
  );
  await expect(otherPage.locator(".values")).toBeVisible();
  await expect(otherPage.locator("body")).not.toContainText("Ada Lovelace");
  await expect(otherPage.locator("body")).not.toContainText("1815-12-10");
  await page
    .getByRole("button", { name: "Revoke share 1", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Share revoked" }),
  ).toBeVisible();
  const revoked = await otherPage.goto(url!);
  expect(revoked?.status()).toBe(404);
  await expect(
    otherPage.getByRole("heading", { name: "This share is unavailable" }),
  ).toBeVisible();
  await visitor.close();
  await page.reload();
  await expect(page.locator("#saved")).toContainText("Ada Lovelace");
  await page
    .locator("#saved")
    .getByRole("button", { name: "Open profile" })
    .click();
  await expect(page.locator("#results")).toContainText(
    "Your numerical portrait",
  );
  await page
    .locator("#saved")
    .getByRole("button", { name: "Delete profile" })
    .click();
  await expect(page.locator("#saved")).toContainText("No saved profiles yet");
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  expect(errors).toEqual([]);
  for (const width of [320, 360, 390, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#dna").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/mobile-dna.png" });
});
test("responsive layouts, keyboard access, Chaldean separation and reduced motion", async ({
  page,
}) => {
  for (const width of [320, 360, 390, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  const form = page.locator("#begin form");
  await form
    .getByLabel("Birth name", { exact: true })
    .fill("Alexandria Example Long Name");
  await form.getByLabel("Birth date", { exact: true }).fill("1993-11-21");
  await form.getByLabel("Methodology").selectOption("chaldean");
  await form.getByRole("button", { name: "Reveal my numbers" }).click();
  await expect(page.locator("#results")).toContainText(
    "Your Chaldean name number",
  );
  await expect(page.locator("#dna")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/mobile-chaldean.png",
    fullPage: true,
  });
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("interactive number lenses, timeline boundaries, name lab, card progress and Atlas search", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  const form = page.locator("#begin form");
  await form.getByLabel("Birth name", { exact: true }).fill("Ada Lovelace");
  await form.getByLabel("Birth date", { exact: true }).fill("1815-12-10");
  await form.getByRole("button", { name: "Reveal my numbers" }).click();
  const explorer = page.getByRole("region", {
    name: "Explore your core numbers",
  });
  await explorer.getByRole("button", { name: /^Expression/ }).click();
  await expect(
    explorer.getByRole("button", { name: /^Expression/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await explorer.getByRole("button", { name: "Growth edge" }).click();
  await expect(
    explorer.getByRole("button", { name: "Growth edge" }),
  ).toHaveAttribute("aria-pressed", "true");
  await explorer.getByRole("button", { name: "Reflection question" }).click();
  await expect(explorer.locator(".reflection-prompt")).not.toBeEmpty();
  const timeline = page.locator("#timeline");
  await timeline.getByRole("button", { name: /^Pinnacle 2/ }).click();
  await expect(
    timeline.getByRole("button", { name: /^Pinnacle 2/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await timeline.getByRole("button", { name: "Previous age" }).click();
  await expect(
    timeline.getByRole("button", { name: /^Pinnacle 1/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await timeline.getByRole("slider").focus();
  const before = Number(await timeline.getByRole("slider").inputValue());
  await page.keyboard.press("ArrowRight");
  await expect(timeline.getByRole("slider")).toHaveValue(String(before + 1));
  const lab = page.locator("#name-lab");
  await lab.getByLabel("Alternative name").fill("Ada");
  await lab.getByRole("button", { name: "Compare name variants" }).click();
  await expect(lab.locator(".name-lab-result")).toContainText("Sum difference");
  await lab.getByLabel("Name lab methodology").selectOption("chaldean");
  await expect(lab.locator(".name-lab-result")).toHaveCount(0);
  await lab.getByRole("button", { name: "Compare name variants" }).click();
  await expect(lab.locator(".name-lab-result")).toContainText("Chaldean");
  await expect(
    page.getByText("Private result for Ada Lovelace", { exact: true }),
  ).toContainText("Ada Lovelace");
  await lab.getByLabel("Alternative name").fill("Ada😀");
  await lab.getByRole("button", { name: "Compare name variants" }).click();
  await expect(lab.getByRole("alert")).toContainText("unsupported");
  const arcana = page.locator("#arcana");
  await arcana.getByLabel("What brings you here?").selectOption("create");
  await arcana.getByRole("button", { name: "A steady habit" }).click();
  await expect(
    arcana.getByRole("button", { name: "A steady habit" }),
  ).toHaveAttribute("aria-pressed", "true");
  await arcana.getByLabel("Mark this reflection explored").check();
  await expect(arcana).toContainText("1 of 18 reflection prompts explored");
  await arcana.getByRole("button", { name: "More like this" }).click();
  await arcana.getByRole("button", { name: "Keep this archetype" }).click();
  await page
    .locator("#dna")
    .getByRole("button", { name: "Expression ·", exact: false })
    .first()
    .click();
  await expect(page.locator("#dna .node-selected")).toHaveCount(1);
  await expect(page.locator("#dna .edge-active").first()).toBeVisible();
  const atlas = page.locator("#atlas");
  await atlas.getByRole("searchbox").fill("not-a-real-tradition");
  await expect(atlas.getByRole("status")).toHaveText("0 traditions found");
  await atlas.getByRole("button", { name: "Clear Atlas search" }).click();
  await expect(atlas.locator("details").first()).toBeVisible();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await explorer.evaluate((el) =>
    el.scrollIntoView({ block: "start", behavior: "instant" }),
  );
  await page.screenshot({ path: "test-results/interactive-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await explorer.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/interactive-mobile.png" });
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page
    .getByRole("button", { name: "Save on this device", exact: true })
    .click();
  await page.reload();
  await page
    .locator("#saved")
    .getByRole("button", { name: "Open profile" })
    .click();
  await expect(page.locator("#arcana")).toContainText(
    "1 of 18 reflection prompts explored",
  );
  await expect(
    page.getByRole("heading", { name: "Kept archetypes" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
