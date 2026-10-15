"use client";

import { useState } from "react";
import { requestPasswordResetAction } from "../actions";
import { CTAButton } from "@/components/site/cta-button";

const inputCls =
  "h-12 w-full rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm";

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
    <div className="w-full max-w-md rounded-[40px] border-2 border-kf-borde bg-white p-6 sm:p-10">
      <h1 className="font-brand text-5xl leading-[1.04] font-extrabold text-kf-azul uppercase">Restablecer contraseña</h1>

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
            <label htmlFor="email" className="mb-1.5 block text-xs font-extrabold tracking-[0.14em] text-kf-tinta-suave uppercase">Email</label>
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
