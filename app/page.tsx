"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Graph, { type GraphHandle } from "@/components/Graph";
import FunctionList from "@/components/FunctionList";
import Controls from "@/components/Controls";
import Solver from "@/components/Solver";
import TableOfValues from "@/components/TableOfValues";
import ShareLink from "@/components/ShareLink";
import {
  ViewPort,
  DEFAULT_VIEW,
  COLORS,
  serializeState,
  deserializeState,
  type SliderParam,
  type GraphMode,
} from "@/lib/graph-utils";

interface FunctionItem {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  sliders?: SliderParam[];
}

function getInitialState(): { fns: FunctionItem[]; view: ViewPort; mode: GraphMode } | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash) return null;
  const state = deserializeState(hash);
  if (!state) return null;
  return {
    fns: state.fns.map((f) => ({
      id: crypto.randomUUID(),
      expression: f.e,
      color: f.c,
      visible: f.v,
      sliders: f.s?.map((sl) => ({ name: sl.n, value: sl.v, min: sl.min, max: sl.max, step: sl.st })),
    })),
    view: state.v,
    mode: state.m || "cartesian",
  };
}

export default function Home() {
  const initial = getInitialState();
  const [functions, setFunctions] = useState<FunctionItem[]>(
    initial?.fns ?? [
      { id: "1", expression: "sin(x)", color: COLORS[0], visible: true },
      { id: "2", expression: "cos(x)", color: COLORS[1], visible: true },
    ]
  );
  const [view, setView] = useState<ViewPort>(initial?.view ?? DEFAULT_VIEW);
  const [mode, setMode] = useState<GraphMode>(initial?.mode ?? "cartesian");
  const [showSolver, setShowSolver] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const graphRef = useRef<GraphHandle>(null);

  // Update URL hash when state changes
  useEffect(() => {
    const hash = serializeState({
      fns: functions.map((f) => ({
        e: f.expression,
        c: f.color,
        v: f.visible,
        s: f.sliders?.map((s) => ({
          n: s.name,
          v: s.value,
          min: s.min,
          max: s.max,
          st: s.step,
        })),
      })),
      v: view,
      m: mode,
    });
    if (hash) {
      window.history.replaceState(null, "", hash);
    }
  }, [functions, view, mode]);

  // Collect all slider values into a single params object
  const params = useMemo(() => {
    const p: Record<string, number> = {};
    for (const f of functions) {
      if (f.sliders) {
        for (const s of f.sliders) {
          p[s.name] = s.value;
        }
      }
    }
    return p;
  }, [functions]);

  const handleViewChange = useCallback((newView: ViewPort) => {
    setView(newView);
  }, []);

  const handleExportPNG = useCallback(() => {
    const canvas = graphRef.current?.getCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "lekhochitro-graph.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const handleExportSVG = useCallback(() => {
    const canvas = graphRef.current?.getCanvas();
    if (!canvas) return;
    const { width, height } = canvas;
    const dataUrl = canvas.toDataURL("image/png");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image href="${dataUrl}" width="${width}" height="${height}"/>
</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = "lekhochitro-graph.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  // Compute serialized URL for share button
  const serializedUrl = useMemo(() => {
    return serializeState({
      fns: functions.map((f) => ({
        e: f.expression,
        c: f.color,
        v: f.visible,
        s: f.sliders?.map((s) => ({
          n: s.name,
          v: s.value,
          min: s.min,
          max: s.max,
          st: s.step,
        })),
      })),
      v: view,
      m: mode,
    });
  }, [functions, view, mode]);

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-axis shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-accent"
            >
              <path
                d="M3 3h18v18H3V3z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M3 12h18M12 3v18"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
              />
              <path
                d="M6 16c2-4 4-8 6-8s4 4 6 8"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <h1 className="text-lg font-bold text-text-primary font-mono tracking-tight">
              Lekhochitro
            </h1>
          </div>
          <span className="text-xs text-text-muted font-mono hidden sm:inline">
            গ্রাফ ক্যালকুলেটর
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShareLink serializedUrl={serializedUrl} />
          <button
            onClick={() => {
              setShowSolver(!showSolver);
              setShowTable(false);
            }}
            className={`px-2.5 py-1.5 rounded-md border text-xs font-mono transition-colors ${
              showSolver
                ? "bg-accent/20 border-accent/30 text-accent"
                : "bg-bg-secondary/80 border-axis text-text-secondary hover:text-accent hover:border-accent/50"
            }`}
          >
            Solver
          </button>
          <button
            onClick={() => {
              setShowTable(!showTable);
              setShowSolver(false);
            }}
            className={`px-2.5 py-1.5 rounded-md border text-xs font-mono transition-colors ${
              showTable
                ? "bg-accent/20 border-accent/30 text-accent"
                : "bg-bg-secondary/80 border-axis text-text-secondary hover:text-accent hover:border-accent/50"
            }`}
          >
            Table
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Graph area */}
        <div className="flex-1 relative">
          <Graph
            ref={graphRef}
            functions={functions}
            onViewChange={handleViewChange}
            params={params}
            mode={mode}
          />
          <Controls
            view={view}
            onViewChange={setView}
            onExportPNG={handleExportPNG}
            onExportSVG={handleExportSVG}
          />
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0 hidden md:flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <FunctionList
              functions={functions}
              onChange={setFunctions}
              mode={mode}
              onModeChange={setMode}
            />
          </div>
          {showSolver && (
            <Solver functions={functions} view={view} params={params} />
          )}
          {showTable && (
            <TableOfValues functions={functions} params={params} />
          )}
        </div>
      </div>

      {/* Mobile function list */}
      <div className="md:hidden shrink-0 border-t border-axis bg-bg-secondary max-h-48 overflow-y-auto">
        <FunctionList
          functions={functions}
          onChange={setFunctions}
          mode={mode}
          onModeChange={setMode}
        />
      </div>
    </div>
  );
}
