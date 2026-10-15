"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPasswordAction } from "../../actions";
import { CTAButton } from "@/components/site/cta-button";

const inputCls =
  "h-12 w-full rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm";

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
    <div className="w-full max-w-md rounded-[40px] border-2 border-kf-borde bg-white p-6 sm:p-10">
      <h1 className="font-brand text-5xl leading-[1.04] font-extrabold text-kf-azul uppercase">Contraseña nueva</h1>

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
              <p role="alert" className="rounded-2xl bg-kf-carmesi/10 px-4 py-2 text-sm font-semibold text-kf-carmesi-hondo">{error}</p>
            )}
            <CTAButton type="submit" disabled={pending} className="mt-2 w-full">
              {pending ? "Guardando..." : "Guardar contraseña"}
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
