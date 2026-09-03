"use client";

import { useEffect, useState } from "react";
import { ShieldCheckIcon, ShieldAlertIcon, XCircleIcon } from "@/components/icons";

// Reads ?verify=ok|invalid left by the /verify route handler and shows a
// one-off banner, then strips the param so a refresh doesn't repeat it.
export function VerifyResult() {
  const [status, setStatus] = useState<"ok" | "invalid" | null>(null);

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("verify");
    if (v !== "ok" && v !== "invalid") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(v);
    const url = new URL(window.location.href);
    url.searchParams.delete("verify");
    window.history.replaceState({}, "", url);
  }, []);

  if (!status) return null;

  const ok = status === "ok";
  const Icon = ok ? ShieldCheckIcon : ShieldAlertIcon;

  return (
    <div
      role="status"
      className={`relative flex items-start gap-2.5 rounded-2xl border px-4 py-3 pr-9 text-sm ${
        ok ? "border-blue/30 bg-blue/10 text-ink" : "border-danger/30 bg-danger/10 text-danger"
      }`}
    >
      <Icon aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${ok ? "text-blue" : ""}`} />
      <p>
        {ok
          ? "Tu correo fue confirmado."
          : "El enlace de confirmación venció o no es válido. Pedí uno nuevo desde el panel."}
      </p>
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => setStatus(null)}
        className="absolute top-3 right-3 cursor-pointer text-ink-soft transition hover:text-ink"
      >
        <XCircleIcon aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
