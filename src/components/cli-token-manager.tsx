"use client";

import { useState, useEffect } from "react";
import { CopyButton } from "@/components/copy-button";

interface CliToken {
  id: string;
  name: string;
  expiresAt: string;
  createdAt: string;
}

export function CliTokenManager() {
  const [tokens, setTokens] = useState<CliToken[]>([]);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTokens();
  }, []);

  async function fetchTokens() {
    try {
      const res = await fetch("/api/auth/cli-tokens");
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens);
      }
    } catch {
      // ignore
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!tokenName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/cli-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tokenName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al generar token");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setNewToken(data.token);
      setTokenName("");
      await fetchTokens();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(id: string) {
    try {
      const res = await fetch(`/api/auth/cli-tokens/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchTokens();
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-4">
      {newToken && (
        <div className="mb-4 rounded-[22px] bg-kf-lima p-5 text-kf-bosque-hondo">
          <p className="mb-2 text-sm font-extrabold">Token generado</p>
          <p className="mb-3 text-xs font-semibold">
            Copiá este token ahora — no lo vas a poder ver otra vez.
          </p>
          <div className="flex items-center gap-2 rounded-full bg-white pr-2">
            <code className="flex-1 truncate px-4 py-3 font-mono text-xs text-kf-tinta">{newToken}</code>
            <CopyButton value={newToken} label="Copiar" />
          </div>
          <button
            type="button"
            onClick={() => setNewToken(null)}
            className="mt-3 cursor-pointer text-xs text-ink-soft underline decoration-border-soft underline-offset-4 transition hover:text-ink"
          >
            Cerrar
          </button>
        </div>
      )}

      <form onSubmit={handleGenerate} className="flex flex-wrap gap-2.5">
        <input
          type="text"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          placeholder="Nombre (ej. Mi Mac)"
          className="h-12 min-w-0 flex-[1_1_200px] rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !tokenName.trim()}
          className="min-h-12 cursor-pointer rounded-full bg-kf-azul px-6 text-xs font-extrabold tracking-[0.12em] text-white uppercase transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generando..." : "Generar"}
        </button>
      </form>

      {error && (
        <p className="mt-2 rounded-2xl bg-kf-carmesi/10 px-4 py-2 text-sm font-semibold text-kf-carmesi-hondo">{error}</p>
      )}

      {tokens.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-extrabold tracking-[0.18em] text-kf-tinta-suave uppercase">Tokens activos</p>
          <ul className="flex flex-col gap-2">
            {tokens.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[22px] bg-kf-niebla px-5 py-3.5">
                <div>
                  <p className="text-sm font-extrabold text-kf-tinta">{t.name}</p>
                  <p className="text-xs text-ink-soft">
                    Creado: {new Date(t.createdAt).toLocaleDateString()} · Expira:{" "}
                    {new Date(t.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevoke(t.id)}
                  className="cursor-pointer text-xs text-danger underline decoration-danger/30 underline-offset-4 transition hover:decoration-danger"
                >
                  Revocar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
