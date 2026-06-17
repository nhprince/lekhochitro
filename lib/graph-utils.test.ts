import { describe, it, expect } from "vitest";
import {
  DEFAULT_VIEW,
  COLORS,
  mathToPixel,
  pixelToMath,
  generatePoints,
  niceTickSpacing,
  formatLabel,
  type ViewPort,
} from "./graph-utils";

describe("graph-utils.mathToPixel", () => {
  const view: ViewPort = { xMin: -10, xMax: 10, yMin: -7, yMax: 7 };
  const width = 800;
  const height = 600;

  it("converts origin to center of canvas", () => {
    const { px, py } = mathToPixel(0, 0, view, width, height);
    expect(px).toBe(400);
    expect(py).toBe(300);
  });

  it("converts min coords to top-left", () => {
    const { px, py } = mathToPixel(-10, 7, view, width, height);
    expect(px).toBe(0);
    expect(py).toBe(0);
  });

  it("converts max coords to bottom-right", () => {
    const { px, py } = mathToPixel(10, -7, view, width, height);
    expect(px).toBe(800);
    expect(py).toBe(600);
  });

  it("handles asymmetric view", () => {
    const asymView: ViewPort = { xMin: 0, xMax: 20, yMin: 0, yMax: 10 };
    const { px, py } = mathToPixel(10, 5, asymView, 400, 300);
    expect(px).toBe(200);
    expect(py).toBe(150);
  });
});

describe("graph-utils.pixelToMath", () => {
  const view: ViewPort = { xMin: -10, xMax: 10, yMin: -7, yMax: 7 };
  const width = 800;
  const height = 600;

  it("converts center pixel to origin", () => {
    const { x, y } = pixelToMath(400, 300, view, width, height);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(0);
  });

  it("converts top-left to min coords", () => {
    const { x, y } = pixelToMath(0, 0, view, width, height);
    expect(x).toBeCloseTo(-10);
    expect(y).toBeCloseTo(7);
  });

  it("converts bottom-right to max coords", () => {
    const { x, y } = pixelToMath(800, 600, view, width, height);
    expect(x).toBeCloseTo(10);
    expect(y).toBeCloseTo(-7);
  });

  it("is inverse of mathToPixel", () => {
    const original = { x: 3.5, y: -2.1 };
    const { px, py } = mathToPixel(original.x, original.y, view, width, height);
    const { x, y } = pixelToMath(px, py, view, width, height);
    expect(x).toBeCloseTo(original.x);
    expect(y).toBeCloseTo(original.y);
  });
});

describe("graph-utils.generatePoints", () => {
  const view: ViewPort = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };

  it("generates points for a simple function", () => {
    const points = generatePoints("x", view, 800, (expr, x) => {
      if (expr === "x") return x;
      return null;
    });
    expect(points.length).toBeGreaterThan(0);
    // First point should be near x=-10
    expect(points[0].x).toBeCloseTo(-10, 0);
    // Last point should be near x=10
    expect(points[points.length - 1].x).toBeCloseTo(10, 0);
  });

  it("generates points for x^2", () => {
    const points = generatePoints("x^2", view, 800, (expr, x) => {
      if (expr === "x^2") return x * x;
      return null;
    });
    expect(points.length).toBeGreaterThan(0);
    // At x=0, y should be 0
    const originPoint = points.find((p) => Math.abs(p.x) < 0.2);
    expect(originPoint).toBeDefined();
    expect(originPoint!.y).toBeCloseTo(0, 0);
  });

  it("skips points with null evaluation", () => {
    const points = generatePoints("1/x", view, 800, (expr, x) => {
      if (Math.abs(x) < 0.01) return null; // undefined at x=0
      return 1 / x;
    });
    // Should not include x=0
    const zeroPoint = points.find((p) => Math.abs(p.x) < 0.01);
    expect(zeroPoint).toBeUndefined();
  });
});

describe("graph-utils.niceTickSpacing", () => {
  it("returns reasonable spacing for range 10", () => {
    const spacing = niceTickSpacing(10, 10);
    expect(spacing).toBeGreaterThan(0);
    expect(spacing).toBeLessThanOrEqual(10);
  });

  it("returns 1 for range 10 with 10 divisions", () => {
    expect(niceTickSpacing(10, 10)).toBe(1);
  });

  it("returns 5 for range 50 with 10 divisions", () => {
    expect(niceTickSpacing(50, 10)).toBe(5);
  });

  it("handles large ranges", () => {
    const spacing = niceTickSpacing(1000, 10);
    expect(spacing).toBe(100);
  });

  it("handles small ranges", () => {
    const spacing = niceTickSpacing(0.1, 10);
    expect(spacing).toBeCloseTo(0.01);
  });
});

describe("graph-utils.formatLabel", () => {
  it("formats integers", () => {
    expect(formatLabel(5)).toBe("5");
    expect(formatLabel(-3)).toBe("-3");
    expect(formatLabel(0)).toBe("0");
  });

  it("formats decimals", () => {
    expect(formatLabel(3.14)).toBe("3.14");
    expect(formatLabel(-0.5)).toBe("-0.5");
  });

  it("handles very small numbers", () => {
    expect(formatLabel(0.0001)).toBe("0");
  });

  it("strips trailing zeros", () => {
    expect(formatLabel(2.5)).toBe("2.5");
    expect(formatLabel(1.0)).toBe("1");
  });
});

describe("graph-utils constants", () => {
  it("DEFAULT_VIEW has correct values", () => {
    expect(DEFAULT_VIEW.xMin).toBe(-10);
    expect(DEFAULT_VIEW.xMax).toBe(10);
    expect(DEFAULT_VIEW.yMin).toBe(-7);
    expect(DEFAULT_VIEW.yMax).toBe(7);
  });

  it("COLORS has 10 distinct colors", () => {
    expect(COLORS.length).toBe(10);
    const unique = new Set(COLORS);
    expect(unique.size).toBe(10);
  });
});
