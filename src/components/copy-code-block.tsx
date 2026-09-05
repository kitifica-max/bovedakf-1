"use client";

import { useState } from "react";

export function CopyCodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <code className="block break-all rounded-lg bg-gray px-3 py-2 pr-16 font-mono text-[10px] text-ink">
        {code}
      </code>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-paper px-2 py-1 text-[10px] font-medium text-ink-soft border border-border-soft transition hover:text-ink hover:border-blue/40 cursor-pointer"
        aria-label="Copiar"
      >
        {copied ? "✓" : "Copiar"}
      </button>
    </div>
  );
}
