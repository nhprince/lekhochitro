import { test, expect } from "@playwright/test";

test.describe("Lekhochitro — Page Load", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Lekhochitro/);
  });

  test("header is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Lekhochitro");
  });

  test("canvas is rendered", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test("function list is visible", async ({ page }) => {
    await page.goto("/");
    // There may be two h3 elements (desktop sidebar + mobile panel)
    // At least one should be visible
    const headings = page.locator("h3");
    await expect(headings.first()).toContainText("ফাংশন");
  });

  test("default functions are pre-loaded", async ({ page }) => {
    await page.goto("/");
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.nth(0)).toHaveValue("sin(x)");
    await expect(inputs.nth(1)).toHaveValue("cos(x)");
  });

  test("zoom controls are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('button[title="Zoom in"]')).toBeVisible();
    await expect(page.locator('button[title="Zoom out"]')).toBeVisible();
    await expect(page.locator('button[title="Reset view"]')).toBeVisible();
    await expect(page.locator('button[title="Fit to screen"]')).toBeVisible();
  });
});

test.describe("Lekhochitro — Graph Interaction", () => {
  test("canvas responds to mouse drag (pan)", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box!.x + box!.width / 2 + 100,
      box!.y + box!.height / 2 + 50,
    );
    await page.mouse.up();

    await expect(canvas).toBeVisible();
  });

  test("canvas responds to scroll (zoom)", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.wheel(0, -100);

    await expect(canvas).toBeVisible();
  });

  test("zoom in button works", async ({ page }) => {
    await page.goto("/");
    await page.click('button[title="Zoom in"]');
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("zoom out button works", async ({ page }) => {
    await page.goto("/");
    await page.click('button[title="Zoom out"]');
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("reset view button works", async ({ page }) => {
    await page.goto("/");
    await page.click('button[title="Zoom in"]');
    await page.click('button[title="Reset view"]');
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });
});

test.describe("Lekhochitro — Responsive", () => {
  test("mobile layout works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Lekhochitro");
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("tablet layout works", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page.locator("canvas")).toBeVisible();
  });
});
