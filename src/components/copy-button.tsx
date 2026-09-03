"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

export function CopyButton({ value, label = "Copiar", className = "" }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={copied ? "Copiado" : label}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-1.5 text-ink-soft transition hover:bg-gray/60 hover:text-ink ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard permission denied or unavailable — nothing to recover, fail silently.
        }
      }}
    >
      {copied ? (
        <CheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-blue" />
      ) : (
        <CopyIcon aria-hidden="true" className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
