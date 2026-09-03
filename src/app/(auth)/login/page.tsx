"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setPending(false);
    if (result?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push("/dashboard");
  }

  return (
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Entrar</h1>
        <p className="mt-1 text-sm text-ink-soft">Accede a tu bóveda de credenciales.</p>
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
              autoComplete="current-password"
              placeholder="Contraseña"
              required
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
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <a href="/register" className="mt-5 block text-center text-sm text-ink-soft underline">
          Crear una bóveda nueva
        </a>
      </div>
  );
}
