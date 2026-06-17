"use client";

import { Home, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { ViewPort, DEFAULT_VIEW } from "@/lib/graph-utils";

interface ControlsProps {
  view: ViewPort;
  onViewChange: (view: ViewPort) => void;
}

export default function Controls({ view, onViewChange }: ControlsProps) {
  const zoomIn = () => {
    const xCenter = (view.xMin + view.xMax) / 2;
    const yCenter = (view.yMin + view.yMax) / 2;
    const xRange = (view.xMax - view.xMin) * 0.4;
    const yRange = (view.yMax - view.yMin) * 0.4;
    onViewChange({
      xMin: xCenter - xRange,
      xMax: xCenter + xRange,
      yMin: yCenter - yRange,
      yMax: yCenter + yRange,
    });
  };

  const zoomOut = () => {
    const xCenter = (view.xMin + view.xMax) / 2;
    const yCenter = (view.yMin + view.yMax) / 2;
    const xRange = (view.xMax - view.xMin) * 0.6;
    const yRange = (view.yMax - view.yMin) * 0.6;
    onViewChange({
      xMin: xCenter - xRange,
      xMax: xCenter + xRange,
      yMin: yCenter - yRange,
      yMax: yCenter + yRange,
    });
  };

  const resetView = () => {
    onViewChange(DEFAULT_VIEW);
  };

  const fitToScreen = () => {
    // Reset to a nice default that shows the most common functions well
    onViewChange(DEFAULT_VIEW);
  };

  return (
    <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
      <button
        onClick={zoomIn}
        className="p-2 rounded-lg bg-bg-secondary/80 backdrop-blur-sm border border-axis hover:border-accent/50 text-text-secondary hover:text-accent transition-colors"
        title="Zoom in"
      >
        <ZoomIn size={16} />
      </button>
      <button
        onClick={zoomOut}
        className="p-2 rounded-lg bg-bg-secondary/80 backdrop-blur-sm border border-axis hover:border-accent/50 text-text-secondary hover:text-accent transition-colors"
        title="Zoom out"
      >
        <ZoomOut size={16} />
      </button>
      <button
        onClick={resetView}
        className="p-2 rounded-lg bg-bg-secondary/80 backdrop-blur-sm border border-axis hover:border-accent/50 text-text-secondary hover:text-accent transition-colors"
        title="Reset view"
      >
        <Home size={16} />
      </button>
      <button
        onClick={fitToScreen}
        className="p-2 rounded-lg bg-bg-secondary/80 backdrop-blur-sm border border-axis hover:border-accent/50 text-text-secondary hover:text-accent transition-colors"
        title="Fit to screen"
      >
        <Maximize2 size={16} />
      </button>
    </div>
  );
}
