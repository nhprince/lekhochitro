"use client";

import { useCallback, useState } from "react";
import { Check, Link2 } from "lucide-react";

interface ShareLinkProps {
  serializedUrl: string;
}

export default function ShareLink({ serializedUrl }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const fullUrl =
      window.location.origin + window.location.pathname + serializedUrl;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [serializedUrl]);

  if (!serializedUrl) return null;

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-bg-secondary/80 backdrop-blur-sm border border-axis hover:border-accent/50 text-text-secondary hover:text-accent text-xs font-mono transition-colors"
      title="Copy shareable link"
    >
      {copied ? (
        <>
          <Check size={14} className="text-emerald-400" />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Link2 size={14} />
          <span className="hidden sm:inline">Share</span>
        </>
      )}
    </button>
  );
}
