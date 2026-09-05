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
        <div className="mb-4 rounded-xl border border-blue bg-blue/10 p-4">
          <p className="mb-2 text-sm font-medium text-ink">Token generado</p>
          <p className="mb-3 text-xs text-ink-soft">
            Copiá este token ahora — no lo vas a poder ver otra vez.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-border-soft bg-paper pr-2">
            <code className="flex-1 truncate px-3 py-2 font-mono text-xs text-ink">{newToken}</code>
            <CopyButton value={newToken} label="Copiar" />
          </div>
          <div className="mt-3 rounded-lg bg-gray/40 p-3">
            <p className="mb-1 text-xs text-ink-soft">Instalá la skill:</p>
            <code className="block break-all font-mono text-[10px] text-ink">
              mkdir -p ~/.claude/skills/kf1 && cp .claude/skills/kf1/* ~/.claude/skills/kf1/
            </code>
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

      <form onSubmit={handleGenerate} className="flex gap-2">
        <input
          type="text"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          placeholder="Nombre del token (ej. Mi Mac)"
          className="flex-1 rounded-xl border border-border-soft bg-gray/40 px-3 py-2 text-sm outline-none transition focus:border-ink"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !tokenName.trim()}
          className="cursor-pointer rounded-full bg-ink px-4 py-2 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generando..." : "Generar"}
        </button>
      </form>

      {error && (
        <p className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {tokens.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-ink-soft">Tokens activos</p>
          <ul className="flex flex-col gap-2">
            {tokens.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-xl bg-gray/40 px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink">{t.name}</p>
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
