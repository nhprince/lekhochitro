"use client";

import { useCallback } from "react";
import type { SliderParam } from "@/lib/graph-utils";

interface SliderPanelProps {
  params: SliderParam[];
  onChange: (name: string, value: number) => void;
}

export default function SliderPanel({ params, onChange }: SliderPanelProps) {
  const handleChange = useCallback(
    (name: string, value: number) => {
      onChange(name, value);
    },
    [onChange],
  );

  if (params.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 px-3 py-2 border-t border-axis bg-bg-secondary/50">
      <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
        Parameters
      </span>
      {params.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <label className="text-xs font-mono text-text-secondary w-5 shrink-0">
            {p.name}
          </label>
          <input
            type="range"
            min={p.min}
            max={p.max}
            step={p.step}
            value={p.value}
            onChange={(e) => handleChange(p.name, parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-bg-tertiary rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3.5
              [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-accent
              [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(99,102,241,0.5)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-shadow
              [&::-webkit-slider-thumb]:hover:shadow-[0_0_10px_rgba(99,102,241,0.7)]
              [&::-moz-range-thumb]:w-3.5
              [&::-moz-range-thumb]:h-3.5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-accent
              [&::-moz-range-thumb]:border-none
              [&::-moz-range-thumb]:cursor-pointer"
          />
          <span className="text-xs font-mono text-text-muted w-12 text-right tabular-nums">
            {p.value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
