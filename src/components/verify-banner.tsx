"use client";

import { useState } from "react";
import { resendVerificationAction } from "@/app/(auth)/actions";
import { XCircleIcon } from "@/components/icons";

export function VerifyBanner() {
  const [hidden, setHidden] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  if (hidden) return null;

  async function resend() {
    setState("sending");
    const err = await resendVerificationAction();
    if (err) {
      setState("error");
      setMsg(err);
      return;
    }
    setState("sent");
  }

  return (
    <div className="relative rounded-2xl border border-blue/30 bg-blue/5 p-4 pr-9 text-sm">
      <button
        type="button"
        aria-label="Ocultar"
        onClick={() => setHidden(true)}
        className="absolute top-3 right-3 cursor-pointer text-ink-soft transition hover:text-ink"
      >
        <XCircleIcon aria-hidden="true" className="h-4 w-4" />
      </button>
      <p className="t-h3 text-ink">Confirmá tu correo</p>
      <p className="mt-1 text-ink-soft">
        Te enviamos un enlace al registrarte. Sirve para recuperar el acceso si perdés la contraseña.
        No bloquea nada mientras tanto.
      </p>
      <div className="mt-2 flex items-center gap-3">
        {state === "sent" ? (
          <span className="text-ink-soft">Reenviado. Revisá tu bandeja (y el spam).</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={state === "sending"}
            className="cursor-pointer font-medium text-blue underline underline-offset-4 disabled:opacity-50"
          >
            {state === "sending" ? "Enviando..." : "Reenviar enlace"}
          </button>
        )}
        {state === "error" && msg && <span className="text-danger">{msg}</span>}
      </div>
    </div>
  );
}
