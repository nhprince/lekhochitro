"use client";

import { useState, useCallback } from "react";
import { evaluateExpression } from "@/lib/math";

interface FunctionItem {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

interface TableOfValuesProps {
  functions: FunctionItem[];
  params: Record<string, number>;
}

export default function TableOfValues({
  functions,
  params,
}: TableOfValuesProps) {
  const [xStart, setXStart] = useState<string>("-5");
  const [xEnd, setXEnd] = useState<string>("5");
  const [step, setStep] = useState<string>("1");
  const [data, setData] = useState<{ x: number; values: (number | null)[] }[]>(
    [],
  );

  const visibleFns = functions.filter((f) => f.visible && f.expression.trim());

  const generate = useCallback(() => {
    const start = parseFloat(xStart);
    const end = parseFloat(xEnd);
    const s = parseFloat(step);
    if (isNaN(start) || isNaN(end) || isNaN(s) || s <= 0) return;

    const rows: { x: number; values: (number | null)[] }[] = [];
    for (let x = start; x <= end + s * 0.001; x += s) {
      const values = visibleFns.map((f) =>
        evaluateExpression(f.expression, x, params),
      );
      rows.push({ x: Math.round(x * 1e8) / 1e8, values });
    }
    setData(rows);
  }, [xStart, xEnd, step, visibleFns, params]);

  return (
    <div className="flex flex-col gap-2 px-3 py-2 border-t border-axis bg-bg-secondary/50">
      <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
        Table of Values
      </span>

      <div className="flex gap-1.5 items-center">
        <div className="flex-1">
          <label className="text-[10px] font-mono text-text-muted">From</label>
          <input
            type="number"
            value={xStart}
            onChange={(e) => setXStart(e.target.value)}
            className="w-full px-2 py-1 text-xs font-mono bg-bg-tertiary border border-axis rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-mono text-text-muted">To</label>
          <input
            type="number"
            value={xEnd}
            onChange={(e) => setXEnd(e.target.value)}
            className="w-full px-2 py-1 text-xs font-mono bg-bg-tertiary border border-axis rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-mono text-text-muted">Step</label>
          <input
            type="number"
            value={step}
            onChange={(e) => setStep(e.target.value)}
            className="w-full px-2 py-1 text-xs font-mono bg-bg-tertiary border border-axis rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
      </div>

      <button
        onClick={generate}
        className="px-3 py-1.5 rounded-md bg-accent/10 border border-accent/30 text-accent text-xs font-mono hover:bg-accent/20 transition-colors"
      >
        Generate
      </button>

      {data.length > 0 && (
        <div className="max-h-40 overflow-y-auto rounded border border-axis">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-bg-tertiary">
                <th className="px-2 py-1 text-left text-text-muted">x</th>
                {visibleFns.map((f) => (
                  <th
                    key={f.id}
                    className="px-2 py-1 text-left"
                    style={{ color: f.color }}
                  >
                    y{f.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t border-axis/50">
                  <td className="px-2 py-0.5 text-text-secondary">{row.x}</td>
                  {row.values.map((v, j) => (
                    <td key={j} className="px-2 py-0.5 text-text-primary">
                      {v !== null ? v.toFixed(4) : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
