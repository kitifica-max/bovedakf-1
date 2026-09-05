"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OAuthSuccessPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const callback = searchParams.get("callback");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!code || !callback) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          const url = new URL(callback);
          url.searchParams.set("code", code);
          if (state) url.searchParams.set("state", state);
          window.location.href = url.toString();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [code, callback, state]);

  if (!code || !callback) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
          <p className="text-sm text-danger">Parámetros de autorización inválidos.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-on-dark.svg" alt="Bóveda KF-1" className="mx-auto mb-6 h-7 w-auto" />

        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-blue/20">
          <svg
            className="h-7 w-7 text-blue"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Autorización exitosa
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Tu agente de IA ya tiene acceso a las credenciales autorizadas.
          Podés cerrar esta ventana.
        </p>

        <div className="mt-6 rounded-2xl bg-gray/60 p-4">
          <p className="text-xs text-ink-soft">
            Redirigiendo automáticamente en{" "}
            <span className="font-mono font-medium text-ink">{countdown}</span>s…
          </p>
        </div>

        <div className="mt-6 border-t border-border-soft pt-5">
          <p className="text-[11px] leading-relaxed text-ink-soft/60">
            Bóveda KF-1 · Credenciales seguras para agentes de IA
          </p>
        </div>
      </div>
    </main>
  );
}
