"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPasswordAction } from "../../actions";
import { CTAButton } from "@/components/site/cta-button";
import { FieldMsg, useInlineValidation } from "@/components/use-inline-validation";

const inputCls =
  "h-12 w-full rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm";

export function ResetForm({ token, email }: { token: string; email: string }) {
  const v = useInlineValidation({ confirm: (value, form) => (value !== (form.elements.namedItem("password") as HTMLInputElement).value ? "Las contraseñas no coinciden" : null) });
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!v.validateAll(e.currentTarget)) return;
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
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3" {...v.formProps}>
            <label htmlFor="password" className="mb-1.5 block text-xs font-extrabold tracking-[0.14em] text-kf-tinta-suave uppercase">Contraseña nueva</label>
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
            <FieldMsg v={v} name="password" />
            <label htmlFor="confirm" className="mb-1.5 block text-xs font-extrabold tracking-[0.14em] text-kf-tinta-suave uppercase">Repetir contraseña</label>
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
            <FieldMsg v={v} name="confirm" />
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
