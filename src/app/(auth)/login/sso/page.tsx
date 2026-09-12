"use client";

import { useState } from "react";
import Link from "next/link";

export default function SsoLoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/sso/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al iniciar SSO.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass w-full max-w-sm rounded-2xl p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue">
        Login corporativo
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold text-ink">
        Entrar con SSO
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Ingresá tu email corporativo y te redirigimos a tu proveedor de identidad.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
            Email corporativo
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vos@tuempresa.com"
            required
            disabled={loading}
            className="w-full rounded-xl border border-border-soft bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:border-blue focus:outline-none disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="mt-1 w-full cursor-pointer rounded-full bg-blue px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Redirigiendo..." : "Continuar con SSO →"}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-ink-soft">
        <Link href="/login" className="underline">← Volver al login normal</Link>
      </div>
    </div>
  );
}
