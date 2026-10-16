"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { acceptInviteAsNewUserAction } from "@/app/dashboard/actions";
import { CTAButton } from "@/components/site/cta-button";
import { FieldMsg, useInlineValidation } from "@/components/use-inline-validation";

const inputCls =
  "h-12 w-full rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm";

export function InviteSignupForm({ token, email }: { token: string; email: string }) {
  const v = useInlineValidation({ confirm: (value, form) => (value !== (form.elements.namedItem("password") as HTMLInputElement).value ? "Las contraseñas no coinciden" : null) });
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!v.validateAll(e.currentTarget)) return;
    setError(null);

    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    if (password !== fd.get("confirm")) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setPending(true);
    const result = await acceptInviteAsNewUserAction(token, fd);
    if (!result.ok) {
      setPending(false);
      setError(result.error);
      return;
    }
    await signIn("credentials", { email: result.email, password, redirect: false });
    router.push(`/dashboard/${result.vaultId}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3" {...v.formProps}>
      <div>
        <label htmlFor="invite-email" className="mb-1.5 block text-xs font-extrabold tracking-[0.14em] text-kf-tinta-suave uppercase">Correo</label>
        <input
          id="invite-email"
          value={email}
          readOnly
          aria-readonly="true"
          className={`${inputCls} cursor-not-allowed text-ink-soft`}
        />
      </div>
      <label htmlFor="password" className="mb-1.5 block text-xs font-extrabold tracking-[0.14em] text-kf-tinta-suave uppercase">Contraseña</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Contraseña (mín. 10)"
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
        {pending ? "Creando..." : "Crear cuenta y unirme"}
      </CTAButton>
    </form>
  );
}
