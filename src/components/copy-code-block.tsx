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
      <code className="block min-h-14 break-all rounded-lg bg-gray px-3 py-3 pr-24 font-mono text-[11px] text-ink">
        {code}
      </code>
      <button
        onClick={handleCopy}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex min-h-11 items-center rounded-full bg-white px-4 text-xs font-extrabold text-kf-tinta border-2 border-kf-borde transition hover:text-ink hover:border-blue/40 cursor-pointer"
        aria-label={copied ? "Copiado" : "Copiar"}
      >
        {copied ? "✓" : "Copiar"}
      </button>
    </div>
  );
}
