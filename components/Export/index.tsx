"use client";

import { useCallback } from "react";

interface ExportProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function Export({ canvasRef }: ExportProps) {
  const exportPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "lekhochitro-graph.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [canvasRef]);

  const exportSVG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas;
    // Create a simple SVG wrapper around the canvas image
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
  }, [canvasRef]);

  return (
    <div className="flex gap-1">
      <button
        onClick={exportPNG}
        className="px-2.5 py-1.5 rounded-md bg-bg-secondary/80 backdrop-blur-sm border border-axis hover:border-accent/50 text-text-secondary hover:text-accent text-xs font-mono transition-colors"
        title="Export as PNG"
      >
        PNG
      </button>
      <button
        onClick={exportSVG}
        className="px-2.5 py-1.5 rounded-md bg-bg-secondary/80 backdrop-blur-sm border border-axis hover:border-accent/50 text-text-secondary hover:text-accent text-xs font-mono transition-colors"
        title="Export as SVG"
      >
        SVG
      </button>
    </div>
  );
}
