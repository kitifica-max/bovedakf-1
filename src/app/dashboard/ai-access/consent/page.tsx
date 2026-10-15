"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KitificaCredit } from "@/components/kitifica-credit";
import { LogoBadge } from "@/components/brand/logo-badge";

export default function ConsentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const clientId = searchParams.get("client_id") ?? "agente de IA";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    if (!token) return;
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/oauth/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, approved: true }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setError(data.error ?? "Error al procesar la autorización.");
        setPending(false);
      }
    } catch {
      setError("Error de conexión.");
      setPending(false);
    }
  }

  async function handleDeny() {
    if (!token) return;
    setPending(true);

    try {
      const res = await fetch("/api/auth/oauth/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, approved: false }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch {
      router.push("/dashboard");
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-4">
        <p className="m-0 rounded-2xl bg-kf-carmesi/10 px-4 py-3 text-sm font-semibold text-kf-carmesi-hondo">Token de autorización no encontrado.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[40px] border-2 border-kf-borde bg-white">
        {/* Seal on its own row so the condensed title gets the full width at any screen size. */}
        <div className="flex flex-col gap-3 bg-kf-lavanda px-6 py-7 text-kf-amarillo sm:px-10">
          <LogoBadge id="kf-ring-consent" title="Bóveda KF-1" ink="var(--kf-amarillo)" center="#ffffff" className="h-20 w-20 shrink-0 self-end" />
          <h1 className="m-0 font-brand text-[clamp(36px,11vw,48px)] leading-[1.04] font-extrabold break-words uppercase">
            Autorizar acceso
          </h1>
        </div>
        <div className="flex flex-col gap-5 p-6 sm:p-10">
          <p className="m-0 text-sm font-semibold text-kf-tinta-suave">
            <strong className="break-all text-kf-tinta">{clientId}</strong> pide acceso a las cuentas que tengas habilitadas para IA.
          </p>
          <div className="rounded-[22px] bg-kf-amarillo px-5 py-4 text-sm font-semibold text-kf-lavanda">
            El agente solo podrá pedir links temporales de cuentas con «Acceso IA». La sesión expira en 2 horas.
          </div>

          {error && (
            <p role="alert" className="m-0 rounded-2xl bg-kf-carmesi/10 px-4 py-3 text-sm font-semibold text-kf-carmesi-hondo">{error}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={handleDeny}
              className="min-h-11 flex-1 cursor-pointer rounded-full border-2 border-kf-azul bg-white px-5 text-xs font-extrabold tracking-[0.12em] text-kf-azul uppercase transition hover:bg-kf-azul hover:text-white disabled:opacity-50"
            >
              Denegar
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleApprove}
              className="min-h-11 flex-1 cursor-pointer rounded-full bg-kf-azul px-5 text-xs font-extrabold tracking-[0.12em] text-white uppercase transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Procesando…" : "Autorizar"}
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 border-t-2 border-kf-borde pt-5 text-center">
            <p className="m-0 text-xs font-semibold text-kf-tinta-suave">
              Solo se autoriza el acceso a cuentas que hayas habilitado para agentes de IA.
            </p>
            <KitificaCredit />
          </div>
        </div>
      </div>
    </main>
  );
}
