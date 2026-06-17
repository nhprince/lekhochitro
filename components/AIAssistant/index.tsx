"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Sparkles, Send, X, Loader2 } from "lucide-react";
import { COLORS } from "@/lib/graph-utils";

interface FunctionItem {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

interface AIAssistantProps {
  onAddFunction: (expression: string) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Template-based AI: maps natural language patterns to math expressions
const TEMPLATES: { patterns: RegExp[]; expr: string; description: string }[] = [
  // Basic shapes
  {
    patterns: [/parabola.*open.*down|downward.*parabola|concave.*down/i],
    expr: "-x^2",
    description: "Parabola opening downward",
  },
  {
    patterns: [/parabola.*open.*up|upward.*parabola|concave.*up/i],
    expr: "x^2",
    description: "Parabola opening upward",
  },
  { patterns: [/parabola|quadratic/i], expr: "x^2", description: "Parabola" },
  {
    patterns: [/line|linear|straight/i],
    expr: "x",
    description: "Linear function",
  },
  {
    patterns: [/horizontal.*line/i],
    expr: "0",
    description: "Horizontal line",
  },
  {
    patterns: [/vertical.*line/i],
    expr: "1/0",
    description: "Vertical line (undefined)",
  },

  // Trigonometric
  { patterns: [/sine|sin\b/i], expr: "sin(x)", description: "Sine wave" },
  { patterns: [/cosine|cos\b/i], expr: "cos(x)", description: "Cosine wave" },
  {
    patterns: [/tangent|tan\b/i],
    expr: "tan(x)",
    description: "Tangent function",
  },
  {
    patterns: [/sin.*shifted|phase.*sin/i],
    expr: "sin(x + pi/4)",
    description: "Phase-shifted sine",
  },
  {
    patterns: [/sin.*compressed|sin.*frequency/i],
    expr: "sin(2*x)",
    description: "Compressed sine wave",
  },
  {
    patterns: [/sin.*stretched|sin.*period/i],
    expr: "sin(x/2)",
    description: "Stretched sine wave",
  },
  {
    patterns: [/amplitude.*sin|sin.*amplitude/i],
    expr: "3*sin(x)",
    description: "Sine with amplitude 3",
  },

  // Polynomials
  {
    patterns: [/cubic|cube|x.*x.*x|x\^3/i],
    expr: "x^3",
    description: "Cubic function",
  },
  {
    patterns: [/quartic|x\^4|fourth.*power/i],
    expr: "x^4",
    description: "Quartic function",
  },
  {
    patterns: [/quadratic.*shifted|shifted.*parabola/i],
    expr: "(x-2)^2",
    description: "Shifted parabola",
  },

  // Exponential & Logarithmic
  {
    patterns: [/exponential|exp\b|growth/i],
    expr: "exp(x)",
    description: "Exponential growth",
  },
  {
    patterns: [/decay|exponential.*decay/i],
    expr: "exp(-x)",
    description: "Exponential decay",
  },
  {
    patterns: [/logarithm|log\b|ln\b/i],
    expr: "log(x)",
    description: "Natural logarithm",
  },
  {
    patterns: [/log.*base.*10|log10/i],
    expr: "log10(x)",
    description: "Log base 10",
  },

  // Rational
  {
    patterns: [/reciprocal|1.*\/.*x|hyperbola/i],
    expr: "1/x",
    description: "Reciprocal function",
  },
  {
    patterns: [/inverse.*square|1.*x.*2|1.*\/.*x.*x/i],
    expr: "1/x^2",
    description: "Inverse square",
  },

  // Absolute value
  {
    patterns: [/absolute|abs|v.*shape|v.*graph/i],
    expr: "abs(x)",
    description: "Absolute value",
  },
  {
    patterns: [/shifted.*abs|abs.*shifted/i],
    expr: "abs(x-2)",
    description: "Shifted absolute value",
  },

  // Square root
  {
    patterns: [/square.*root|sqrt|√/i],
    expr: "sqrt(x)",
    description: "Square root",
  },

  // Gaussian / Bell curve
  {
    patterns: [/gaussian|bell.*curve|normal.*distribution/i],
    expr: "exp(-x^2)",
    description: "Gaussian function",
  },

  // Sigmoid
  {
    patterns: [/sigmoid|s.*curve|logistic/i],
    expr: "1/(1+exp(-x))",
    description: "Sigmoid function",
  },

  // Wave combinations
  {
    patterns: [/beat.*pattern|interference/i],
    expr: "sin(x)*cos(0.1*x)",
    description: "Beat pattern",
  },
  {
    patterns: [/modulated|am.*modulation/i],
    expr: "sin(x)*(1+0.5*cos(0.5*x))",
    description: "Amplitude modulated wave",
  },

  // Polar-like (for cartesian)
  {
    patterns: [/circle/i],
    expr: "sqrt(16-x^2)",
    description: "Upper semicircle (r=4)",
  },
  {
    patterns: [/ellipse/i],
    expr: "3*sqrt(1-x^2/16)",
    description: "Upper semi-ellipse",
  },

  // Step function
  {
    patterns: [/step.*function|heaviside/i],
    expr: "sign(x)",
    description: "Sign/step function",
  },

  // Polynomial with parameters
  {
    patterns: [/slope.*intercept|y.*=.*mx.*\+.*b|slope/i],
    expr: "2*x + 1",
    description: "Line with slope 2",
  },
  {
    patterns: [/tangent.*curve|tan.*curve/i],
    expr: "x*tan(x)",
    description: "Tangent curve variant",
  },

  // Cool patterns
  {
    patterns: [/spiral/i],
    expr: "x*sin(x)",
    description: "Spiral-like pattern",
  },
  {
    patterns: [/ripple|water.*wave/i],
    expr: "sin(x)/x",
    description: "Sinc/ripple function",
  },
  { patterns: [/sinc/i], expr: "sin(x)/x", description: "Sinc function" },
  {
    patterns: [/bessel|oscillating.*decay/i],
    expr: "sin(x)/sqrt(abs(x))",
    description: "Oscillating decay",
  },
  {
    patterns: [/lissajous|lissajous.*like/i],
    expr: "sin(x)*sin(2*x)",
    description: "Lissajous-like pattern",
  },
  {
    patterns: [/chaos|chaotic/i],
    expr: "sin(x)*cos(sin(x))",
    description: "Chaotic oscillation",
  },
  {
    patterns: [/fractal.*like|fractal/i],
    expr: "sin(x) + sin(3*x)/3 + sin(5*x)/5",
    description: "Fractal-like wave (Fourier)",
  },
  {
    patterns: [/sawtooth|saw.*wave/i],
    expr: "x - floor(x)",
    description: "Sawtooth wave",
  },
  {
    patterns: [/square.*wave/i],
    expr: "sign(sin(x))",
    description: "Square wave",
  },
  {
    patterns: [/triangle.*wave/i],
    expr: "abs(x - 2*floor(x/2 + 0.5)) - 1",
    description: "Triangle wave",
  },

  // Famous curves
  {
    patterns: [/witch.*agnes|witch/i],
    expr: "1/(1+x^2)",
    description: "Witch of Agnesi",
  },
  {
    patterns: [/catenary|cable.*curve|chain/i],
    expr: "cosh(x)",
    description: "Catenary curve",
  },
  { patterns: [/cycloid/i], expr: "1 - cos(x)", description: "Cycloid-like" },
  {
    patterns: [/cardioid|heart.*curve/i],
    expr: "1 + cos(x)",
    description: "Cardioid-like",
  },
  {
    patterns: [/deltoid/i],
    expr: "2*cos(x) + cos(2*x)",
    description: "Deltoid-like",
  },

  // Default fallback
  { patterns: [/.*/], expr: "sin(x)", description: "Default: sine wave" },
];

function parseNaturalLanguage(
  input: string,
): { expression: string; description: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try to match against templates
  for (const template of TEMPLATES) {
    for (const pattern of template.patterns) {
      if (pattern.test(trimmed)) {
        return { expression: template.expr, description: template.description };
      }
    }
  }

  return null;
}

// Try to extract a direct math expression from the input
function tryDirectExpression(input: string): string | null {
  const trimmed = input.trim();
  // If it looks like a math expression (contains x, numbers, operators, or math functions)
  if (/[x0-9+\-*/^().]/.test(trimmed) && /x/i.test(trimmed)) {
    // Clean it up
    const cleaned = trimmed
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/\^/g, "^")
      .replace(/π/g, "pi")
      .replace(/√/g, "sqrt");
    return cleaned;
  }
  return null;
}

export default function AIAssistant({ onAddFunction }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        '👋 Hi! Describe a function in natural language and I\'ll graph it for you.\n\nTry things like:\n• "parabola opening down"\n• "sine wave with amplitude 3"\n• "bell curve"\n• "square wave"\n• Or type a math expression like "x^2 + 2*x + 1"',
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isProcessing) return;

      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setIsProcessing(true);

      // Simulate a brief processing delay for UX
      await new Promise((r) => setTimeout(r, 300));

      // Try direct expression first
      const directExpr = tryDirectExpression(trimmed);
      if (directExpr) {
        onAddFunction(directExpr);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `✅ Added function: **y = ${directExpr}**`,
          },
        ]);
        setIsProcessing(false);
        return;
      }

      // Try natural language parsing
      const result = parseNaturalLanguage(trimmed);
      if (result) {
        onAddFunction(result.expression);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `✅ ${result.description}\n\nAdded: **y = ${result.expression}**`,
          },
        ]);
      } else {
        setMessages((prev) => [
          {
            role: "assistant",
            content:
              '🤔 I couldn\'t understand that. Try describing the function shape (e.g., "parabola", "sine wave", "bell curve") or type a math expression directly.',
          },
        ]);
      }

      setIsProcessing(false);
    },
    [input, isProcessing, onAddFunction],
  );

  const handleQuickAdd = useCallback(
    (expr: string, label: string) => {
      onAddFunction(expr);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: label },
        { role: "assistant", content: `✅ Added: **y = ${expr}**` },
      ]);
    },
    [onAddFunction],
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-accent/10 border border-accent/30 text-accent text-xs font-mono hover:bg-accent/20 transition-colors"
        title="AI Assistant"
      >
        <Sparkles size={14} />
        <span className="hidden sm:inline">AI</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 sm:w-96 h-[28rem] bg-bg-secondary border border-axis rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-axis bg-bg-tertiary shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span className="text-xs font-mono font-semibold text-text-primary">
            AI Assistant
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-xs font-mono leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-accent/20 text-accent border border-accent/20"
                  : "bg-bg-tertiary text-text-secondary border border-axis"
              }`}
            >
              {msg.content.split("\n").map((line, j) => (
                <span key={j}>
                  {line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong
                        key={k}
                        className="text-text-primary font-semibold"
                      >
                        {part.slice(2, -2)}
                      </strong>
                    ) : (
                      <span key={k}>{part}</span>
                    ),
                  )}
                  {j < msg.content.split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-lg bg-bg-tertiary border border-axis">
              <Loader2 size={14} className="animate-spin text-accent" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-3 py-1.5 border-t border-axis bg-bg-tertiary/50 flex gap-1 overflow-x-auto shrink-0">
        {[
          { label: "📈 Parabola", expr: "x^2" },
          { label: "🌊 Sine", expr: "sin(x)" },
          { label: "🔔 Bell", expr: "exp(-x^2)" },
          { label: "📉 Decay", expr: "exp(-x)" },
          { label: "〰️ Sinc", expr: "sin(x)/x" },
        ].map((item) => (
          <button
            key={item.expr}
            onClick={() => handleQuickAdd(item.expr, item.label)}
            className="px-2 py-1 rounded bg-bg-secondary border border-axis text-[10px] font-mono text-text-muted hover:text-accent hover:border-accent/30 transition-colors whitespace-nowrap shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-2 border-t border-axis shrink-0"
      >
        <div className="flex gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a function..."
            className="flex-1 px-3 py-1.5 text-xs font-mono bg-bg-tertiary border border-axis rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="p-1.5 rounded-lg bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
