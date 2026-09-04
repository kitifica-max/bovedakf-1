"use client";

import { useState, useEffect, useCallback } from "react";
import { toggleAiAccessAction, getAiAccessGrantsAction, revokeAiAccessGrantAction } from "@/app/dashboard/actions";

type Policy = {
  id: string;
  enabled: boolean;
  maxDurationMin: number;
};

type Grant = {
  id: string;
  agentName: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

type AiAccessPanelProps = {
  credentialId: string;
  credentialService: string;
  initialPolicy?: Policy | null;
};

export function AiAccessPanel({ credentialId, credentialService, initialPolicy }: AiAccessPanelProps) {
  const [enabled, setEnabled] = useState(initialPolicy?.enabled ?? false);
  const [maxDuration, setMaxDuration] = useState(initialPolicy?.maxDurationMin ?? 30);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGrants = useCallback(async () => {
    const data = await getAiAccessGrantsAction(credentialId);
    setGrants(data);
  }, [credentialId]);

  useEffect(() => {
    loadGrants();
  }, [loadGrants]);

  async function handleToggle() {
    setLoading(true);
    setError(null);
    const result = await toggleAiAccessAction(credentialId, !enabled);
    if (result) {
      setError(result);
      setLoading(false);
      return;
    }
    setEnabled(!enabled);
    setLoading(false);
  }

  async function handleRevoke(grantId: string) {
    const result = await revokeAiAccessGrantAction(grantId);
    if (result) {
      setError(result);
      return;
    }
    loadGrants();
  }

  return (
    <div className="mt-4 rounded-2xl border border-border-soft p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-ink">Acceso AI (MCP)</h3>
          <p className="mt-0.5 text-xs text-ink-soft">
            Permite que agentes de IA accedan temporalmente a esta credencial
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
            enabled ? "bg-ink" : "bg-gray"
          } disabled:opacity-50`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-3">
          <label className="text-xs text-ink-soft">
            Duración máxima (minutos)
          </label>
          <select
            value={maxDuration}
            onChange={(e) => setMaxDuration(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-border-soft bg-paper px-3 py-2 text-sm text-ink"
          >
            <option value={15}>15 minutos</option>
            <option value={30}>30 minutos</option>
            <option value={60}>1 hora</option>
            <option value={120}>2 horas</option>
            <option value={240}>4 horas</option>
          </select>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>
      )}

      {grants.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium text-ink-soft">Accesos recientes</h4>
          <div className="mt-2 space-y-2">
            {grants.map((grant) => (
              <div
                key={grant.id}
                className="flex items-center justify-between rounded-xl bg-gray/60 px-3 py-2 text-xs"
              >
                <div>
                  <span className="font-medium text-ink">{grant.agentName}</span>
                  <span className="ml-2 text-ink-soft">
                    {grant.createdAt.toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {grant.revokedAt && (
                    <span className="ml-2 text-danger">Revocado</span>
                  )}
                  {!grant.revokedAt && grant.expiresAt < new Date() && (
                    <span className="ml-2 text-ink-soft">Expirado</span>
                  )}
                </div>
                {!grant.revokedAt && grant.expiresAt > new Date() && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(grant.id)}
                    className="cursor-pointer text-xs text-danger hover:underline"
                  >
                    Revocar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {enabled && (
        <div className="mt-3 rounded-xl bg-gray/40 px-3 py-2">
          <p className="text-xs text-ink-soft">
            Los agentes de IA recibirán un enlace temporal cifrado. El secreto
            nunca se expone directamente al modelo.
          </p>
        </div>
      )}
    </div>
  );
}
