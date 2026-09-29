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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border-soft bg-paper p-8">
        <h1 className="font-display text-xl font-semibold text-ink">Confirmar identidad</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Ingresá la contraseña de tu cuenta para acceder a Organizaciones.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-ink-soft">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              required
              className="w-full rounded-2xl border border-border-soft bg-gray/40 px-3.5 py-3 text-sm text-ink outline-none transition focus:border-ink placeholder:text-ink-soft/40"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-full bg-blue px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Verificando…" : "Continuar →"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-ink-soft">
          <a href="/admin" className="hover:text-ink transition-colors">← Volver a Admin</a>
        </p>
      </div>
    </div>
  );
}
