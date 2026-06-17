import { describe, it, expect } from "vitest";
import { evaluateExpression, isValidExpression } from "./math";

describe("math.evaluateExpression", () => {
  it("evaluates simple arithmetic", () => {
    expect(evaluateExpression("x + 1", 2)).toBe(3);
    expect(evaluateExpression("x * 3", 4)).toBe(12);
    expect(evaluateExpression("x - 5", 10)).toBe(5);
    expect(evaluateExpression("x / 2", 10)).toBe(5);
  });

  it("evaluates exponentiation", () => {
    expect(evaluateExpression("x^2", 3)).toBe(9);
    expect(evaluateExpression("x^3", 2)).toBe(8);
    expect(evaluateExpression("x^0", 100)).toBe(1);
  });

  it("evaluates trigonometric functions", () => {
    expect(evaluateExpression("sin(x)", 0)).toBeCloseTo(0);
    expect(evaluateExpression("cos(x)", 0)).toBeCloseTo(1);
    expect(evaluateExpression("sin(x)", Math.PI / 2)).toBeCloseTo(1);
    expect(evaluateExpression("cos(x)", Math.PI)).toBeCloseTo(-1);
  });

  it("evaluates logarithmic functions", () => {
    expect(evaluateExpression("log(x)", Math.E)).toBeCloseTo(1);
    expect(evaluateExpression("log10(x)", 100)).toBeCloseTo(2);
  });

  it("evaluates square root", () => {
    expect(evaluateExpression("sqrt(x)", 16)).toBe(4);
    expect(evaluateExpression("sqrt(x)", 0)).toBe(0);
  });

  it("evaluates nested expressions", () => {
    expect(evaluateExpression("sin(x^2)", 0)).toBeCloseTo(0);
    expect(evaluateExpression("sqrt(x^2 + 1)", 0)).toBe(1);
    expect(evaluateExpression("2 * sin(x) + 1", Math.PI / 2)).toBeCloseTo(3);
  });

  it("handles constants pi and e", () => {
    const result = evaluateExpression("pi", 0);
    expect(result).toBeCloseTo(Math.PI);
    const resultE = evaluateExpression("e", 0);
    expect(resultE).toBeCloseTo(Math.E);
  });

  it("returns null for invalid expressions", () => {
    expect(evaluateExpression("invalid_func(x)", 1)).toBeNull();
    expect(evaluateExpression("x + ", 1)).toBeNull();
    expect(evaluateExpression("", 1)).toBeNull();
  });

  it("returns null for undefined results", () => {
    expect(evaluateExpression("sqrt(x)", -1)).toBeNull(); // NaN
    expect(evaluateExpression("1 / x", 0)).toBeNull(); // Infinity
  });

  it("handles absolute value", () => {
    expect(evaluateExpression("abs(x)", -5)).toBe(5);
    expect(evaluateExpression("abs(x)", 5)).toBe(5);
  });

  it("handles floor, ceil, round", () => {
    expect(evaluateExpression("floor(x)", 3.7)).toBe(3);
    expect(evaluateExpression("ceil(x)", 3.2)).toBe(4);
    expect(evaluateExpression("round(x)", 3.5)).toBe(4);
  });
});

describe("math.isValidExpression", () => {
  it("returns true for valid expressions", () => {
    expect(isValidExpression("x")).toBe(true);
    expect(isValidExpression("x^2")).toBe(true);
    expect(isValidExpression("sin(x)")).toBe(true);
    expect(isValidExpression("cos(x) + tan(x)")).toBe(true);
    expect(isValidExpression("sqrt(x^2 + 1)")).toBe(true);
    expect(isValidExpression("log(x) + pi")).toBe(true);
  });

  it("returns false for invalid expressions", () => {
    expect(isValidExpression("invalid")).toBe(false);
    expect(isValidExpression("x + ")).toBe(false);
    expect(isValidExpression("")).toBe(false);
    expect(isValidExpression("func(x)")).toBe(false);
  });
});
