"use client";

import { useState, useCallback } from "react";
import Graph from "@/components/Graph";
import FunctionList from "@/components/FunctionList";
import Controls from "@/components/Controls";
import { ViewPort, DEFAULT_VIEW, COLORS } from "@/lib/graph-utils";

interface FunctionItem {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

export default function Home() {
  const [functions, setFunctions] = useState<FunctionItem[]>([
    {
      id: "1",
      expression: "sin(x)",
      color: COLORS[0],
      visible: true,
    },
    {
      id: "2",
      expression: "cos(x)",
      color: COLORS[1],
      visible: true,
    },
  ]);

  const [view, setView] = useState<ViewPort>(DEFAULT_VIEW);

  const handleViewChange = useCallback((newView: ViewPort) => {
    setView(newView);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-axis shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
              <path d="M3 3h18v18H3V3z" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              <path d="M6 16c2-4 4-8 6-8s4 4 6 8" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <h1 className="text-lg font-bold text-text-primary font-mono tracking-tight">
              Lekhochitro
            </h1>
          </div>
          <span className="text-xs text-text-muted font-mono hidden sm:inline">
            গ্রাফ ক্যালকুলেটর
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
          <span className="hidden md:inline">Scroll to zoom • Drag to pan</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Graph area */}
        <div className="flex-1 relative">
          <Graph functions={functions} onViewChange={handleViewChange} />
          <Controls view={view} onViewChange={setView} />
        </div>

        {/* Function list sidebar */}
        <div className="w-72 shrink-0 hidden md:block">
          <FunctionList functions={functions} onChange={setFunctions} />
        </div>
      </div>

      {/* Mobile function list toggle */}
      <div className="md:hidden shrink-0 border-t border-axis bg-bg-secondary max-h-48 overflow-y-auto">
        <FunctionList functions={functions} onChange={setFunctions} />
      </div>
    </div>
  );
}
