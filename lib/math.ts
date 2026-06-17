import { create, all, MathJsInstance } from "mathjs";

const math: MathJsInstance = create(all, {});

export function evaluateExpression(expr: string, x: number): number | null {
  try {
    const result = math.evaluate(expr, { x });
    if (typeof result === "number" && isFinite(result)) {
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

export function isValidExpression(expr: string): boolean {
  try {
    math.evaluate(expr, { x: 1 });
    return true;
  } catch {
    return false;
  }
}
