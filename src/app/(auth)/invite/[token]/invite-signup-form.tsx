"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { acceptInviteAsNewUserAction } from "@/app/dashboard/actions";
import { CTAButton } from "@/components/site/cta-button";

const inputCls =
  "w-full rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-base sm:text-sm outline-none transition focus:border-ink";

export function InviteSignupForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3" noValidate>
      <div>
        <label htmlFor="invite-email" className="sr-only">Correo</label>
        <input
          id="invite-email"
          value={email}
          readOnly
          aria-readonly="true"
          className={`${inputCls} cursor-not-allowed text-ink-soft`}
        />
      </div>
      <label htmlFor="password" className="sr-only">Contraseña</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Contraseña (mín. 10 caracteres)"
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
      <CTAButton type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Creando..." : "Crear cuenta y unirme"}
      </CTAButton>
    </form>
  );
}
