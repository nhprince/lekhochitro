"use client";

import { useState, useCallback } from "react";
import { findZeros, findIntersections, findExtrema } from "@/lib/math";
import type { ViewPort } from "@/lib/graph-utils";

interface FunctionItem {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

interface SolverProps {
  functions: FunctionItem[];
  view: ViewPort;
  params: Record<string, number>;
}

type SolverTab = "zeros" | "intersections" | "extrema";

export default function Solver({ functions, view, params }: SolverProps) {
  const [activeTab, setActiveTab] = useState<SolverTab>("zeros");
  const [results, setResults] = useState<string[]>([]);
  const [selectedFn, setSelectedFn] = useState<string>("");
  const [selectedFn2, setSelectedFn2] = useState<string>("");

  const visibleFns = functions.filter((f) => f.visible && f.expression.trim());

  const solve = useCallback(() => {
    const expr = visibleFns.find((f) => f.id === selectedFn)?.expression;
    if (!expr) {
      setResults(["Select a function first"]);
      return;
    }

    const { xMin, xMax } = view;

    if (activeTab === "zeros") {
      const zeros = findZeros(expr, xMin, xMax, params);
      if (zeros.length === 0) {
        setResults(["No zeros found in visible range"]);
      } else {
        setResults(zeros.map((x) => `x = ${x}`));
      }
    } else if (activeTab === "extrema") {
      const extrema = findExtrema(expr, xMin, xMax, params);
      if (extrema.length === 0) {
        setResults(["No local extrema found in visible range"]);
      } else {
        setResults(
          extrema.map(
            (e) =>
              `${e.type === "min" ? "Min" : "Max"} at x = ${e.x}, y = ${e.y}`,
          ),
        );
      }
    } else if (activeTab === "intersections") {
      const expr2 = visibleFns.find((f) => f.id === selectedFn2)?.expression;
      if (!expr2) {
        setResults(["Select a second function"]);
        return;
      }
      const intersections = findIntersections(expr, expr2, xMin, xMax, params);
      if (intersections.length === 0) {
        setResults(["No intersections found in visible range"]);
      } else {
        setResults(intersections.map((p) => `(${p.x}, ${p.y})`));
      }
    }
  }, [activeTab, selectedFn, selectedFn2, visibleFns, view, params]);

  return (
    <div className="flex flex-col gap-2 px-3 py-2 border-t border-axis bg-bg-secondary/50">
      <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
        Solver
      </span>

      <div className="flex gap-1">
        {(["zeros", "intersections", "extrema"] as SolverTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
              activeTab === tab
                ? "bg-accent/20 text-accent border border-accent/30"
                : "bg-bg-tertiary text-text-muted border border-transparent hover:text-text-secondary"
            }`}
          >
            {tab === "zeros"
              ? "Zeros"
              : tab === "intersections"
                ? "Intersect"
                : "Min/Max"}
          </button>
        ))}
      </div>

      <select
        value={selectedFn}
        onChange={(e) => setSelectedFn(e.target.value)}
        className="w-full px-2 py-1.5 text-xs font-mono bg-bg-tertiary border border-axis rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
      >
        <option value="">Select function...</option>
        {visibleFns.map((f) => (
          <option key={f.id} value={f.id}>
            y = {f.expression}
          </option>
        ))}
      </select>

      {activeTab === "intersections" && (
        <select
          value={selectedFn2}
          onChange={(e) => setSelectedFn2(e.target.value)}
          className="w-full px-2 py-1.5 text-xs font-mono bg-bg-tertiary border border-axis rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
        >
          <option value="">Select 2nd function...</option>
          {visibleFns
            .filter((f) => f.id !== selectedFn)
            .map((f) => (
              <option key={f.id} value={f.id}>
                y = {f.expression}
              </option>
            ))}
        </select>
      )}

      <button
        onClick={solve}
        className="px-3 py-1.5 rounded-md bg-accent/10 border border-accent/30 text-accent text-xs font-mono hover:bg-accent/20 transition-colors"
      >
        Solve
      </button>

      {results.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          {results.map((r, i) => (
            <div
              key={i}
              className="px-2 py-1 rounded bg-bg-tertiary text-xs font-mono text-text-secondary"
            >
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
