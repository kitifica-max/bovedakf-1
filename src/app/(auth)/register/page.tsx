"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerAction } from "../actions";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(null, formData);
    if (result) {
      setError(result);
      setPending(false);
      return;
    }

    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    router.push("/dashboard");
  }

  return (
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Crear bóveda
        </h1>
        <p className="mt-1 text-sm text-ink-soft">Un espacio encriptado para tu equipo.</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3" noValidate>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="email@empresa.com"
              required
              className="w-full rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-sm outline-none transition focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Contraseña (mín. 10 caracteres)"
              required
              minLength={10}
              className="w-full rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-sm outline-none transition focus:border-ink"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <button
            disabled={pending}
            className="mt-2 cursor-pointer rounded-full bg-ink px-4 py-3 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Creando..." : "Crear bóveda"}
          </button>
        </form>
        <a href="/login" className="mt-5 block text-center text-sm text-ink-soft underline">
          Ya tengo cuenta
        </a>
      </div>
  );
}
