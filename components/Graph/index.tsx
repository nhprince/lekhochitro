"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { ViewPort, DEFAULT_VIEW, mathToPixel, pixelToMath, generatePoints, niceTickSpacing, formatLabel, COLORS } from "@/lib/graph-utils";
import { evaluateExpression } from "@/lib/math";

interface FunctionItem {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

interface GraphProps {
  functions: FunctionItem[];
  onViewChange?: (view: ViewPort) => void;
}

export default function Graph({ functions, onViewChange }: GraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ViewPort>(DEFAULT_VIEW);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);

  // Resize handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Draw the graph
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvasSize;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#111118";
    ctx.fillRect(0, 0, width, height);

    const { xMin, xMax, yMin, yMax } = view;

    // Grid
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const xTickSpacing = niceTickSpacing(xRange, 10);
    const yTickSpacing = niceTickSpacing(yRange, 7);

    ctx.strokeStyle = "#1e1e2e";
    ctx.lineWidth = 1;

    // Vertical grid lines
    const xStart = Math.ceil(xMin / xTickSpacing) * xTickSpacing;
    for (let x = xStart; x <= xMax; x += xTickSpacing) {
      const { px } = mathToPixel(x, 0, view, width, height);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    const yStart = Math.ceil(yMin / yTickSpacing) * yTickSpacing;
    for (let y = yStart; y <= yMax; y += yTickSpacing) {
      const { py } = mathToPixel(0, y, view, width, height);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }

    // Axes
    const origin = mathToPixel(0, 0, view, width, height);
    ctx.strokeStyle = "#3b3b4f";
    ctx.lineWidth = 1.5;

    // X axis
    if (yMin <= 0 && yMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(0, origin.py);
      ctx.lineTo(width, origin.py);
      ctx.stroke();
    }

    // Y axis
    if (xMin <= 0 && xMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(origin.px, 0);
      ctx.lineTo(origin.px, height);
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = "#71717a";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let x = xStart; x <= xMax; x += xTickSpacing) {
      if (Math.abs(x) < xTickSpacing * 0.01) continue;
      const { px, py } = mathToPixel(x, 0, view, width, height);
      const labelY = yMin <= 0 && yMax >= 0 ? Math.min(Math.max(py + 4, 2), height - 14) : height - 14;
      ctx.fillText(formatLabel(x), px, labelY);
    }

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let y = yStart; y <= yMax; y += yTickSpacing) {
      if (Math.abs(y) < yTickSpacing * 0.01) continue;
      const { px, py } = mathToPixel(0, y, view, width, height);
      const labelX = xMin <= 0 && xMax >= 0 ? Math.max(Math.min(px - 4, width - 2), 2) : 2;
      ctx.fillText(formatLabel(y), labelX, py);
    }

    // Draw functions
    const visibleFunctions = functions.filter((f) => f.visible && f.expression.trim());
    visibleFunctions.forEach((fn, index) => {
      const color = fn.color || COLORS[index % COLORS.length];
      const points = generatePoints(fn.expression, view, width, evaluateExpression);
      if (points.length < 2) return;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();

      let started = false;
      for (const point of points) {
        const { px, py } = mathToPixel(point.x, point.y, view, width, height);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    });

    // Crosshair at mouse position
    if (mousePos) {
      const mathPos = pixelToMath(mousePos.x, mousePos.y, view, width, height);
      ctx.strokeStyle = "#3b3b4f80";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(width, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Coordinate label
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(mousePos.x + 10, mousePos.y - 24, 120, 20);
      ctx.strokeStyle = "#3b3b4f";
      ctx.lineWidth = 1;
      ctx.strokeRect(mousePos.x + 10, mousePos.y - 24, 120, 20);
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`(${mathPos.x.toFixed(2)}, ${mathPos.y.toFixed(2)})`, mousePos.x + 16, mousePos.y - 14);
    }
  }, [view, functions, mousePos, canvasSize]);

  useEffect(() => {
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }

      if (isDragging.current) {
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };

        setView((prev) => {
          const xRange = prev.xMax - prev.xMin;
          const yRange = prev.yMax - prev.yMin;
          const xShift = -(dx / (canvasSize.width || 1)) * xRange;
          const yShift = (dy / (canvasSize.height || 1)) * yRange;
          const newView = {
            xMin: prev.xMin + xShift,
            xMax: prev.xMax + xShift,
            yMin: prev.yMin + yShift,
            yMax: prev.yMax + yShift,
          };
          onViewChange?.(newView);
          return newView;
        });
      }
    },
    [canvasSize, onViewChange]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    setMousePos(null);
  }, []);

  // Zoom handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const zoomIn = e.deltaY < 0;
      const factor = zoomIn ? 0.85 : 1.18;

      setView((prev) => {
        const mathPos = pixelToMath(mouseX, mouseY, prev, canvasSize.width, canvasSize.height);
        const newXMin = mathPos.x - (mathPos.x - prev.xMin) * factor;
        const newXMax = mathPos.x + (prev.xMax - mathPos.x) * factor;
        const newYMin = mathPos.y - (mathPos.y - prev.yMin) * factor;
        const newYMax = mathPos.y + (prev.yMax - mathPos.y) * factor;

        const xRange = newXMax - newXMin;
        const yRange = newYMax - newYMin;
        if (xRange < 0.05 || yRange < 0.05 || xRange > 100000 || yRange > 100000) return prev;

        const newView = { xMin: newXMin, xMax: newXMax, yMin: newYMin, yMax: newYMax };
        onViewChange?.(newView);
        return newView;
      });
    },
    [canvasSize, onViewChange]
  );

  // Touch handlers for mobile
  const touchStart = useRef<{ x: number; y: number; dist?: number }[]>([]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touches = Array.from(e.touches).map((t) => ({ x: t.clientX, y: t.clientY }));
    touchStart.current = touches;
    if (touches.length === 1) {
      isDragging.current = true;
      lastMouse.current = { x: touches[0].x, y: touches[0].y };
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touches = Array.from(e.touches).map((t) => ({ x: t.clientX, y: t.clientY }));

      if (touches.length === 1 && isDragging.current) {
        const dx = touches[0].x - lastMouse.current.x;
        const dy = touches[0].y - lastMouse.current.y;
        lastMouse.current = { x: touches[0].x, y: touches[0].y };

        setView((prev) => {
          const xRange = prev.xMax - prev.xMin;
          const yRange = prev.yMax - prev.yMin;
          const xShift = -(dx / (canvasSize.width || 1)) * xRange;
          const yShift = (dy / (canvasSize.height || 1)) * yRange;
          const newView = {
            xMin: prev.xMin + xShift,
            xMax: prev.xMax + xShift,
            yMin: prev.yMin + yShift,
            yMax: prev.yMax + yShift,
          };
          onViewChange?.(newView);
          return newView;
        });
      } else if (touches.length === 2 && touchStart.current.length === 2) {
        const prevDist = Math.hypot(
          touchStart.current[1].x - touchStart.current[0].x,
          touchStart.current[1].y - touchStart.current[0].y
        );
        const currDist = Math.hypot(
          touches[1].x - touches[0].x,
          touches[1].y - touches[0].y
        );
        if (prevDist > 0) {
          const factor = currDist / prevDist;
          const centerX = (touches[0].x + touches[1].x) / 2;
          const centerY = (touches[0].y + touches[1].y) / 2;
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const relX = centerX - rect.left;
          const relY = centerY - rect.top;

          setView((prev) => {
            const mathPos = pixelToMath(relX, relY, prev, canvasSize.width, canvasSize.height);
            const newXMin = mathPos.x - (mathPos.x - prev.xMin) / factor;
            const newXMax = mathPos.x + (prev.xMax - mathPos.x) / factor;
            const newYMin = mathPos.y - (mathPos.y - prev.yMin) / factor;
            const newYMax = mathPos.y + (prev.yMax - mathPos.y) / factor;
            const newView = { xMin: newXMin, xMax: newXMax, yMin: newYMin, yMax: newYMax };
            onViewChange?.(newView);
            return newView;
          });
        }
        touchStart.current = touches;
      }
    },
    [canvasSize, onViewChange]
  );

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    touchStart.current = [];
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        style={{ width: canvasSize.width, height: canvasSize.height }}
        className="cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}
