"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KitificaCredit } from "@/components/kitifica-credit";

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
      <main className="flex min-h-screen items-center justify-center p-4">
        <p className="text-sm text-danger">Token de autorización no encontrado.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-on-dark.svg" alt="Bóveda KF-1" className="mb-5 h-6 w-auto" />
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Autorizar acceso
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          <strong>{clientId}</strong> está solicitando acceso a las credenciales
          de tu bóveda que tengas habilitadas para AI.
        </p>

        <div className="mt-5 rounded-2xl bg-gray/60 p-4 text-sm">
          <p className="text-ink-soft">
            El agente podrá leer credenciales marcadas como &quot;Acceso AI&quot;.
            La sesión expira en 2 horas.
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={handleDeny}
            className="flex-1 cursor-pointer rounded-full border border-border-soft px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-gray/60 disabled:opacity-50"
          >
            Denegar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={handleApprove}
            className="flex-1 cursor-pointer rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:opacity-50"
          >
            {pending ? "Procesando…" : "Autorizar"}
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 border-t border-border-soft pt-5 text-center">
          <p className="text-xs text-ink-soft">
            Solo se autoriza acceso a credenciales que hayas habilitado para agentes de IA.
          </p>
          <KitificaCredit />
        </div>
      </div>
    </main>
  );
}
