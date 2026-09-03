"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPasswordAction } from "../../actions";

const inputCls =
  "w-full rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-base sm:text-sm outline-none transition focus:border-ink";

export function ResetForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirm")) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    fd.set("email", email);
    fd.set("token", token);

    setPending(true);
    const result = await resetPasswordAction(null, fd);
    setPending(false);
    if (result) {
      setError(result);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1800);
  }

  return (
    <div className="glass w-full max-w-sm rounded-2xl p-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Contraseña nueva</h1>

      {done ? (
        <p className="mt-4 rounded-2xl bg-blue/10 px-4 py-3 text-sm text-ink-soft">
          Listo. Ya podés entrar con tu contraseña nueva. Te llevamos al login…
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-soft">Mínimo 10 caracteres.</p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3" noValidate>
            <label htmlFor="password" className="sr-only">Contraseña nueva</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Contraseña nueva (mín. 10)"
              required
              minLength={10}
              className={inputCls}
            />
            <label htmlFor="confirm" className="sr-only">Repetir contraseña</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repetir contraseña"
              required
              minLength={10}
              className={inputCls}
            />
            {error && (
              <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
            )}
            <button
              disabled={pending}
              className="mt-2 cursor-pointer rounded-full bg-ink px-4 py-3 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        </>
      )}

      <Link href="/login" className="mt-5 block text-center text-sm text-ink-soft underline">
        Volver a entrar
      </Link>
    </div>
  );
}
