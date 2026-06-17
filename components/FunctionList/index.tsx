"use client";

import { useState, useCallback } from "react";
import { Plus, Eye, EyeOff, Trash2, Settings2 } from "lucide-react";
import { COLORS, type SliderParam, type GraphMode } from "@/lib/graph-utils";
import { isValidExpression, detectParameters } from "@/lib/math";

interface FunctionItem {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  sliders?: SliderParam[];
}

interface FunctionListProps {
  functions: FunctionItem[];
  onChange: (functions: FunctionItem[]) => void;
  mode: GraphMode;
  onModeChange: (mode: GraphMode) => void;
}

export default function FunctionList({
  functions,
  onChange,
  mode,
  onModeChange,
}: FunctionListProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [showSettings, setShowSettings] = useState(false);

  // Auto-detect parameters and create sliders when expressions change
  const updateExpression = useCallback(
    (id: string, expression: string) => {
      setInputValues((prev) => ({ ...prev, [id]: expression }));
      onChange(
        functions.map((f) => {
          if (f.id !== id) return f;
          const params = detectParameters(expression);
          const existingSliders = f.sliders || [];
          const sliders: SliderParam[] = params.map((name) => {
            const existing = existingSliders.find((s) => s.name === name);
            return existing || { name, min: -10, max: 10, step: 0.1, value: 1 };
          });
          return {
            ...f,
            expression,
            sliders: sliders.length > 0 ? sliders : undefined,
          };
        }),
      );
    },
    [functions, onChange],
  );

  const addFunction = useCallback(() => {
    const newFn: FunctionItem = {
      id: crypto.randomUUID(),
      expression: "",
      color: COLORS[functions.length % COLORS.length],
      visible: true,
    };
    onChange([...functions, newFn]);
  }, [functions, onChange]);

  const toggleVisibility = useCallback(
    (id: string) => {
      onChange(
        functions.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)),
      );
    },
    [functions, onChange],
  );

  const removeFunction = useCallback(
    (id: string) => {
      if (functions.length <= 1) return;
      onChange(functions.filter((f) => f.id !== id));
      setInputValues((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [functions, onChange],
  );

  const handleSliderChange = useCallback(
    (fnId: string, paramName: string, value: number) => {
      onChange(
        functions.map((f) => {
          if (f.id !== fnId) return f;
          const sliders = f.sliders?.map((s) =>
            s.name === paramName ? { ...s, value } : s,
          );
          return { ...f, sliders };
        }),
      );
    },
    [functions, onChange],
  );

  return (
    <div className="flex flex-col bg-bg-secondary border-l border-axis overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-axis shrink-0">
        <h3 className="text-sm font-semibold text-text-secondary font-mono tracking-wide">
          ফাংশন / Functions
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-mono">
            {functions.length}
          </span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-text-secondary transition-colors"
            title="Settings"
          >
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      {/* Graph mode selector */}
      {showSettings && (
        <div className="px-3 py-2 border-b border-axis shrink-0">
          <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
            Graph Mode
          </label>
          <div className="flex gap-1 mt-1">
            {(["cartesian", "polar"] as GraphMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className={`flex-1 px-2 py-1 rounded text-xs font-mono transition-colors ${
                  mode === m
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "bg-bg-tertiary text-text-muted border border-transparent hover:text-text-secondary"
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Function list */}
      <div className="flex flex-col gap-2 p-3 flex-1 overflow-y-auto">
        {functions.map((fn) => {
          const inputValue = inputValues[fn.id] ?? fn.expression;
          const hasError =
            fn.expression.length > 0 && !isValidExpression(fn.expression);

          return (
            <div key={fn.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/10"
                  style={{ backgroundColor: fn.color }}
                />
                <div className="flex-1 relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm select-none">
                    y =
                  </span>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => updateExpression(fn.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addFunction();
                    }}
                    placeholder={mode === "polar" ? "sin(θ)" : "sin(x)"}
                    spellCheck={false}
                    className={`w-full pl-8 pr-2 py-1.5 text-sm font-mono bg-bg-tertiary border rounded-md text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 transition-colors ${
                      hasError
                        ? "border-danger/50 focus:ring-danger/50"
                        : "border-axis focus:ring-accent/50 focus:border-accent/50"
                    }`}
                  />
                </div>
                <button
                  onClick={() => toggleVisibility(fn.id)}
                  className="p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-text-secondary transition-colors"
                  title={fn.visible ? "Hide" : "Show"}
                >
                  {fn.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => removeFunction(fn.id)}
                  className="p-1 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Inline sliders for this function */}
              {fn.visible && fn.sliders && fn.sliders.length > 0 && (
                <div className="ml-5 flex flex-col gap-1.5 pb-1">
                  {fn.sliders.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5">
                      <label className="text-[10px] font-mono text-text-muted w-4 shrink-0">
                        {s.name}
                      </label>
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={s.value}
                        onChange={(e) =>
                          handleSliderChange(
                            fn.id,
                            s.name,
                            parseFloat(e.target.value),
                          )
                        }
                        className="flex-1 h-1 bg-bg-tertiary rounded-full appearance-none cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-2.5
                          [&::-webkit-slider-thumb]:h-2.5
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-accent
                          [&::-webkit-slider-thumb]:cursor-pointer
                          [&::-moz-range-thumb]:w-2.5
                          [&::-moz-range-thumb]:h-2.5
                          [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:bg-accent
                          [&::-moz-range-thumb]:border-none
                          [&::-moz-range-thumb]:cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-text-muted w-10 text-right tabular-nums">
                        {s.value.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={addFunction}
          className="flex items-center justify-center gap-1.5 py-2 mt-1 rounded-md border border-dashed border-axis hover:border-accent/50 text-text-muted hover:text-accent text-sm font-mono transition-colors shrink-0"
        >
          <Plus size={14} />
          Add function
        </button>
      </div>
    </div>
  );
}
