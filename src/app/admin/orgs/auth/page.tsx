"use client";

import { useState, useTransition } from "react";
import { sudoOrgsAction } from "./actions";

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
    <div className="flex min-h-screen items-center justify-center bg-ground px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border-soft bg-paper p-8 shadow-sm">
        <h1 className="font-display text-xl font-semibold text-ink">Confirmar identidad</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Ingresá la contraseña de tu cuenta kitifica para continuar.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-ink">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              required
              className="rounded-xl border border-border-soft bg-ground px-3.5 py-2.5 text-sm text-ink outline-none ring-blue/40 placeholder:text-ink-soft/50 focus:border-blue focus:ring-2"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-full bg-blue px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Verificando…" : "Continuar →"}
          </button>
        </form>
      </div>
    </div>
  );
}
