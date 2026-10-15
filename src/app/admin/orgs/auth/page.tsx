"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { sudoOrgsAction } from "./actions";
import { LogoBadge } from "@/components/brand/logo-badge";

export default function OrgsSudoPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await sudoOrgsAction(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-[40px] border-2 border-kf-borde bg-white">
        {/* Seal on its own row so the condensed title gets the full width at any screen size. */}
        <div className="flex flex-col gap-3 bg-kf-lavanda px-6 py-7 text-kf-amarillo sm:px-8">
          <LogoBadge id="kf-ring-sudo" title="Bóveda KF-1" ink="var(--kf-amarillo)" center="#ffffff" className="h-16 w-16 shrink-0 self-end" />
          <h1 className="m-0 font-brand text-[clamp(34px,10vw,44px)] leading-[1.04] font-extrabold break-words uppercase">
            Confirmar identidad
          </h1>
        </div>
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <p className="m-0 text-sm font-semibold text-kf-tinta-suave">
            Ingresá la contraseña de tu cuenta para entrar a Organizaciones.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label htmlFor="password" className="mb-1.5 block text-xs font-extrabold tracking-[0.14em] text-kf-tinta-suave uppercase">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              required
              placeholder="Contraseña"
              className="h-12 w-full rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm"
            />
            {error && (
              <p role="alert" className="m-0 rounded-2xl bg-kf-carmesi/10 px-4 py-2 text-sm font-semibold text-kf-carmesi-hondo">{error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="min-h-12 cursor-pointer rounded-full bg-kf-azul px-6 text-xs font-extrabold tracking-[0.14em] text-white uppercase transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Verificando…" : "Continuar"}
            </button>
          </form>
          <Link href="/admin" className="text-center text-[13px] font-bold text-kf-azul underline decoration-2 underline-offset-4">
            ← Volver a Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
