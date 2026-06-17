import { create, all, MathJsInstance } from "mathjs";

const math: MathJsInstance = create(all, {});

export function evaluateExpression(
  expr: string,
  x: number,
  params?: Record<string, number>,
): number | null {
  try {
    const scope: Record<string, number> = { x, ...params };
    const result = math.evaluate(expr, scope);
    if (typeof result === "number" && isFinite(result)) {
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

export function isValidExpression(expr: string): boolean {
  if (!expr || expr.trim().length === 0) return false;
  try {
    const result = math.evaluate(expr, { x: 1 });
    if (typeof result === "number" && isFinite(result)) return true;
    return false;
  } catch {
    return false;
  }
}

// Detect variable names in an expression (excluding 'x' and common math functions)
const MATH_WORDS = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "atan2",
  "sqrt",
  "abs",
  "log",
  "log2",
  "log10",
  "exp",
  "pow",
  "ceil",
  "floor",
  "round",
  "sign",
  "pi",
  "e",
  "PI",
  "E",
  "min",
  "max",
  "mod",
  "sinh",
  "cosh",
  "tanh",
  "sec",
  "csc",
  "cot",
]);

export function detectParameters(expr: string): string[] {
  if (!expr) return [];
  const matches = expr.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
  const params: string[] = [];
  for (const m of matches) {
    if (m !== "x" && !MATH_WORDS.has(m) && !params.includes(m)) {
      params.push(m);
    }
  }
  return params;
}

// Find zeros of a function using bisection
export function findZeros(
  expr: string,
  xMin: number,
  xMax: number,
  params?: Record<string, number>,
  steps: number = 1000,
): number[] {
  const zeros: number[] = [];
  const step = (xMax - xMin) / steps;
  let prevX = xMin;
  let prevY = evaluateExpression(expr, prevX, params);

  for (let i = 1; i <= steps; i++) {
    const currX = xMin + i * step;
    const currY = evaluateExpression(expr, currX, params);

    if (prevY !== null && currY !== null) {
      // Sign change → zero crossing
      if (prevY * currY < 0) {
        // Bisection refinement
        let lo = prevX,
          hi = currX;
        for (let j = 0; j < 30; j++) {
          const mid = (lo + hi) / 2;
          const midY = evaluateExpression(expr, mid, params);
          if (midY === null) break;
          if (Math.abs(midY) < 1e-10) {
            lo = hi = mid;
            break;
          }
          if (prevY * midY < 0) {
            hi = mid;
          } else {
            lo = mid;
            prevY = midY;
          }
        }
        zeros.push(Math.round(((lo + hi) / 2) * 1e8) / 1e8);
      }
      // Near-zero
      if (
        Math.abs(currY) < 1e-10 &&
        (zeros.length === 0 ||
          Math.abs(currX - zeros[zeros.length - 1]) > step * 2)
      ) {
        zeros.push(Math.round(currX * 1e8) / 1e8);
      }
    }
    prevX = currX;
    prevY = currY;
  }
  return zeros;
}

// Find intersection of two functions
export function findIntersections(
  expr1: string,
  expr2: string,
  xMin: number,
  xMax: number,
  params?: Record<string, number>,
  steps: number = 1000,
): { x: number; y: number }[] {
  const intersections: { x: number; y: number }[] = [];
  const step = (xMax - xMin) / steps;
  let prevX = xMin;
  let prevD =
    (evaluateExpression(expr1, prevX, params) ?? 0) -
    (evaluateExpression(expr2, prevX, params) ?? 0);

  for (let i = 1; i <= steps; i++) {
    const currX = xMin + i * step;
    const y1 = evaluateExpression(expr1, currX, params);
    const y2 = evaluateExpression(expr2, currX, params);
    if (y1 === null || y2 === null) continue;
    const currD = y1 - y2;

    if (prevD * currD < 0) {
      let lo = prevX,
        hi = currX,
        dLo = prevD;
      for (let j = 0; j < 30; j++) {
        const mid = (lo + hi) / 2;
        const dMid =
          (evaluateExpression(expr1, mid, params) ?? 0) -
          (evaluateExpression(expr2, mid, params) ?? 0);
        if (Math.abs(dMid) < 1e-10) {
          lo = hi = mid;
          break;
        }
        if (dLo * dMid < 0) {
          hi = mid;
        } else {
          lo = mid;
          dLo = dMid;
        }
      }
      const x = Math.round(((lo + hi) / 2) * 1e8) / 1e8;
      const y = evaluateExpression(expr1, x, params);
      if (y !== null) intersections.push({ x, y: Math.round(y * 1e8) / 1e8 });
    }
    prevX = currX;
    prevD = currD;
  }
  return intersections;
}

// Find local min/max
export function findExtrema(
  expr: string,
  xMin: number,
  xMax: number,
  params?: Record<string, number>,
  steps: number = 1000,
): { x: number; y: number; type: "min" | "max" }[] {
  const extrema: { x: number; y: number; type: "min" | "max" }[] = [];
  const step = (xMax - xMin) / steps;
  let prevD = Number.NaN;

  for (let i = 1; i < steps; i++) {
    const x = xMin + i * step;
    const yPrev = evaluateExpression(expr, x - step, params);
    const yCurr = evaluateExpression(expr, x, params);
    const yNext = evaluateExpression(expr, x + step, params);
    if (yPrev === null || yCurr === null || yNext === null) continue;

    const d = (yNext - yPrev) / (2 * step);
    if (!isNaN(prevD) && prevD * d < 0) {
      const type = prevD > 0 ? "max" : "min";
      extrema.push({
        x: Math.round(x * 1e8) / 1e8,
        y: Math.round(yCurr * 1e8) / 1e8,
        type,
      });
    }
    prevD = d;
  }
  return extrema;
}
