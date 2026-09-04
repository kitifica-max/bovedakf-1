"use client";

import { useState } from "react";
import { requestPasswordResetAction } from "../actions";
import { CTAButton } from "@/components/site/cta-button";

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
      <h1 className="t-display text-ink">Restablecer contraseña</h1>

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
            <CTAButton type="submit" disabled={pending} className="mt-2 w-full">
              {pending ? "Enviando..." : "Enviar enlace"}
            </CTAButton>
          </form>
        </>
      )}

      <CTAButton href="/login" variant="secondary" className="mt-5 w-full">
        Volver a entrar
      </CTAButton>
    </div>
  );
}
