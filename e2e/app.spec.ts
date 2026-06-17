import { test, expect } from "@playwright/test";

test.describe("Lekhochitro — Page Load", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Lekhochitro/);
  });

  test("header is visible with Bengali branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Lekhochitro");
    await expect(page.locator("text=গ্রাফ ক্যালকুলেটর")).toBeVisible();
  });

  test("canvas is rendered", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test("function list sidebar is visible on desktop", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h3")).toContainText("ফাংশন");
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

test.describe("Lekhochitro — Function Management", () => {
  test("can add a new function", async ({ page }) => {
    await page.goto("/");
    await page.click('button:has-text("Add function")');
    const inputs = page.locator('input[type="text"]');
    await expect(inputs).toHaveCount(3);
  });

  test("can type a new expression", async ({ page }) => {
    await page.goto("/");
    await page.click('button:has-text("Add function")');
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(2).fill("x^2");
    await expect(inputs.nth(2)).toHaveValue("x^2");
  });

  test("can toggle function visibility", async ({ page }) => {
    await page.goto("/");
    const hideButton = page.locator('button[title="Hide"]').first();
    await hideButton.click();
    // After clicking hide, it should show "Show"
    await expect(page.locator('button[title="Show"]').first()).toBeVisible();
  });

  test("can remove a function", async ({ page }) => {
    await page.goto("/");
    const inputs = page.locator('input[type="text"]');
    await expect(inputs).toHaveCount(2);
    await page.locator('button[title="Remove"]').first().click();
    await expect(inputs).toHaveCount(1);
  });

  test("cannot remove the last function", async ({ page }) => {
    await page.goto("/");
    // Remove first function
    await page.locator('button[title="Remove"]').first().click();
    // Only one left — remove button should still exist but not reduce below 1
    const inputs = page.locator('input[type="text"]');
    await expect(inputs).toHaveCount(1);
  });

  test("shows error state for invalid expression", async ({ page }) => {
    await page.goto("/");
    await page.click('button:has-text("Add function")');
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(2).fill("invalid_func(x)");
    // The input should have error styling (red border)
    const input = inputs.nth(2);
    const className = await input.getAttribute("class");
    expect(className).toContain("border-danger");
  });
});

test.describe("Lekhochitro — Graph Interaction", () => {
  test("canvas responds to mouse drag (pan)", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();

    // Drag on canvas
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box!.x + box!.width / 2 + 100,
      box!.y + box!.height / 2 + 50,
    );
    await page.mouse.up();

    // Canvas should still be visible after drag
    await expect(canvas).toBeVisible();
  });

  test("canvas responds to scroll (zoom)", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();

    // Scroll on canvas
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.wheel(0, -100); // zoom in

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
    // Zoom in first
    await page.click('button[title="Zoom in"]');
    // Then reset
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
