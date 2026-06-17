"use client";

import { useState, useCallback } from "react";
import { Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import { COLORS } from "@/lib/graph-utils";
import { isValidExpression } from "@/lib/math";

interface FunctionItem {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

interface FunctionListProps {
  functions: FunctionItem[];
  onChange: (functions: FunctionItem[]) => void;
}

export default function FunctionList({ functions, onChange }: FunctionListProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const addFunction = useCallback(() => {
    const newFn: FunctionItem = {
      id: crypto.randomUUID(),
      expression: "",
      color: COLORS[functions.length % COLORS.length],
      visible: true,
    };
    onChange([...functions, newFn]);
  }, [functions, onChange]);

  const updateExpression = useCallback(
    (id: string, expression: string) => {
      setInputValues((prev) => ({ ...prev, [id]: expression }));
      onChange(functions.map((f) => (f.id === id ? { ...f, expression } : f)));
    },
    [functions, onChange]
  );

  const toggleVisibility = useCallback(
    (id: string) => {
      onChange(functions.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)));
    },
    [functions, onChange]
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
    [functions, onChange]
  );

  return (
    <div className="flex flex-col gap-2 p-3 bg-bg-secondary border-l border-axis overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-text-secondary font-mono tracking-wide">
          ফাংশন / Functions
        </h3>
        <span className="text-xs text-text-muted font-mono">{functions.length}</span>
      </div>

      {functions.map((fn) => {
        const inputValue = inputValues[fn.id] ?? fn.expression;
        const hasError = fn.expression.length > 0 && !isValidExpression(fn.expression);

        return (
          <div
            key={fn.id}
            className="flex items-center gap-2 group"
          >
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
                placeholder="sin(x)"
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
        );
      })}

      <button
        onClick={addFunction}
        className="flex items-center justify-center gap-1.5 py-2 mt-1 rounded-md border border-dashed border-axis hover:border-accent/50 text-text-muted hover:text-accent text-sm font-mono transition-colors"
      >
        <Plus size={14} />
        Add function
      </button>
    </div>
  );
}
