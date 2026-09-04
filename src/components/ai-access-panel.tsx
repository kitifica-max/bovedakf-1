"use client";

import { useState } from "react";
import { toggleAiAccessibleAction } from "@/app/dashboard/actions";

type AiAccessPanelProps = {
  credentialId: string;
  credentialService: string;
  initialAiAccessible: boolean;
};

export function AiAccessPanel({ credentialId, credentialService, initialAiAccessible }: AiAccessPanelProps) {
  const [aiAccessible, setAiAccessible] = useState(initialAiAccessible);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setLoading(true);
    setError(null);
    const result = await toggleAiAccessibleAction(credentialId, !aiAccessible);
    if (result) {
      setError(result);
      setLoading(false);
      return;
    }
    setAiAccessible(!aiAccessible);
    setLoading(false);
  }

  return (
    <div className="mt-4 rounded-2xl border border-border-soft p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-ink">Acceso AI (MCP)</h3>
          <p className="mt-0.5 text-xs text-ink-soft">
            Permite que agentes de IA generen links temporales para esta credencial
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
            aiAccessible ? "bg-ink" : "bg-gray"
          } disabled:opacity-50`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              aiAccessible ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>
      )}

      {aiAccessible && (
        <div className="mt-3 rounded-xl bg-gray/40 px-3 py-2">
          <p className="text-xs text-ink-soft">
            El agente puede generar un link temporal de 15 min para que veas esta credencial.
            La contraseña nunca se expone al modelo.
          </p>
        </div>
      )}
    </div>
  );
}
