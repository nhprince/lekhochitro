export interface ViewPort {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export const DEFAULT_VIEW: ViewPort = {
  xMin: -10,
  xMax: 10,
  yMin: -7,
  yMax: 7,
};

export const COLORS = [
  "#22d3ee", // cyan
  "#a78bfa", // violet
  "#f472b6", // pink
  "#34d399", // emerald
  "#fbbf24", // amber
  "#f87171", // red
  "#60a5fa", // blue
  "#c084fc", // purple
  "#fb923c", // orange
  "#4ade80", // green
];

export const ZOOM_FACTOR = 0.2;
export const MIN_RANGE = 0.1;
export const MAX_RANGE = 10000;
export const GRID_DIVISIONS = 10;

export interface Point {
  x: number;
  y: number;
}

export interface PixelPoint {
  px: number;
  py: number;
}

// Slider parameter definition
export interface SliderParam {
  name: string; // e.g. "m", "b", "a"
  min: number;
  max: number;
  step: number;
  value: number;
}

// Graph mode type
export type GraphMode = "cartesian" | "polar" | "parametric";

// Convert math coordinates to canvas pixel coordinates
export function mathToPixel(
  x: number,
  y: number,
  view: ViewPort,
  width: number,
  height: number,
): PixelPoint {
  const px = ((x - view.xMin) / (view.xMax - view.xMin)) * width;
  const py = height - ((y - view.yMin) / (view.yMax - view.yMin)) * height;
  return { px, py };
}

// Convert canvas pixel coordinates to math coordinates
export function pixelToMath(
  px: number,
  py: number,
  view: ViewPort,
  width: number,
  height: number,
): Point {
  const x = view.xMin + (px / width) * (view.xMax - view.xMin);
  const y = view.yMin + ((height - py) / height) * (view.yMax - view.yMin);
  return { x, y };
}

// Generate points for a function within the visible range
export function generatePoints(
  expr: string,
  view: ViewPort,
  width: number,
  evaluateFn: (
    expr: string,
    x: number,
    params?: Record<string, number>,
  ) => number | null,
  params?: Record<string, number>,
): Point[] {
  const points: Point[] = [];
  const step = (view.xMax - view.xMin) / width;
  for (let x = view.xMin; x <= view.xMax; x += step) {
    const y = evaluateFn(expr, x, params);
    if (
      y !== null &&
      !isNaN(y) &&
      isFinite(y) &&
      y >= view.yMin - 100 &&
      y <= view.yMax + 100
    ) {
      points.push({ x, y });
    }
  }
  return points;
}

// Generate points for polar functions (r = f(θ))
export function generatePolarPoints(
  expr: string,
  view: ViewPort,
  width: number,
  evaluateFn: (
    expr: string,
    theta: number,
    params?: Record<string, number>,
  ) => number | null,
  params?: Record<string, number>,
): Point[] {
  const points: Point[] = [];
  const steps = Math.max(width, 500);
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const r = evaluateFn(expr, theta, params);
    if (r !== null && !isNaN(r) && isFinite(r)) {
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      if (
        x >= view.xMin - 100 &&
        x <= view.xMax + 100 &&
        y >= view.yMin - 100 &&
        y <= view.yMax + 100
      ) {
        points.push({ x, y });
      }
    }
  }
  return points;
}

// Generate points for parametric functions (x(t), y(t))
export function generateParametricPoints(
  xExpr: string,
  yExpr: string,
  tMin: number,
  tMax: number,
  view: ViewPort,
  width: number,
  evaluateFn: (
    expr: string,
    t: number,
    params?: Record<string, number>,
  ) => number | null,
  params?: Record<string, number>,
): Point[] {
  const points: Point[] = [];
  const steps = Math.max(width, 500);
  for (let i = 0; i <= steps; i++) {
    const t = tMin + (i / steps) * (tMax - tMin);
    const x = evaluateFn(xExpr, t, params);
    const y = evaluateFn(yExpr, t, params);
    if (x !== null && y !== null && isFinite(x) && isFinite(y)) {
      points.push({ x, y });
    }
  }
  return points;
}

// Calculate nice tick spacing
export function niceTickSpacing(
  range: number,
  targetDivisions: number,
): number {
  const roughStep = range / targetDivisions;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;
  let niceStep: number;
  if (residual <= 1.5) niceStep = 1;
  else if (residual <= 3) niceStep = 2;
  else if (residual <= 7) niceStep = 5;
  else niceStep = 10;
  return niceStep * magnitude;
}

// Format number for axis label
export function formatLabel(n: number): string {
  if (Math.abs(n) < 0.001) return "0";
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(2).replace(/\.?0+$/, "");
}

// Serialize state to URL hash
export function serializeState(data: {
  fns: {
    e: string;
    c: string;
    v: boolean;
    s?: { n: string; v: number; min: number; max: number; st: number }[];
  }[];
  v: ViewPort;
  m: GraphMode;
}): string {
  try {
    return "#" + encodeURIComponent(JSON.stringify(data));
  } catch {
    return "";
  }
}

// Deserialize state from URL hash
export function deserializeState(hash: string): {
  fns: {
    e: string;
    c: string;
    v: boolean;
    s?: { n: string; v: number; min: number; max: number; st: number }[];
  }[];
  v: ViewPort;
  m: GraphMode;
} | null {
  try {
    const raw = hash.startsWith("#") ? hash.slice(1) : hash;
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}
