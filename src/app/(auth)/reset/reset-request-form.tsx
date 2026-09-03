"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "../actions";

const inputCls =
  "w-full rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-base sm:text-sm outline-none transition focus:border-ink";

export function ResetRequestForm() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    await requestPasswordResetAction(null, new FormData(e.currentTarget));
    setPending(false);
    setSent(true);
  }

  return (
    <div className="glass w-full max-w-sm rounded-2xl p-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Restablecer contraseña</h1>

      {sent ? (
        <p className="mt-4 rounded-2xl bg-blue/10 px-4 py-3 text-sm text-ink-soft">
          Si hay una cuenta con ese correo, te enviamos un enlace para elegir una contraseña nueva.
          Revisá tu bandeja (y el spam). El enlace vence en 1 hora.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-soft">
            Ingresá tu correo y te mandamos un enlace para elegir una nueva.
          </p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3" noValidate>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="email@empresa.com"
              required
              className={inputCls}
            />
            <button
              disabled={pending}
              className="mt-2 cursor-pointer rounded-full bg-ink px-4 py-3 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Enviando..." : "Enviar enlace"}
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
