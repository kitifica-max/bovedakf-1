"use client";

import { useState } from "react";
import { dismissSurveyAction, submitSurveyAnswerAction } from "@/app/dashboard/actions";
import { XCircleIcon } from "@/components/icons";

const OPTIONS = [
  "Roles y permisos por equipo",
  "Integración con Slack",
  "Rotación automática de contraseñas",
  "Autenticación de dos factores (2FA)",
];

export function DashboardSurvey() {
  const [visible, setVisible] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  if (!visible) return null;

  async function choose(option: string) {
    setPending(option);
    const formData = new FormData();
    formData.set("answer", option);
    await submitSurveyAnswerAction(formData);
    setAnswered(true);
    setTimeout(() => setVisible(false), 1400);
  }

  return (
    <div className="relative rounded-2xl border border-blue/30 bg-blue/5 p-5 text-sm">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute top-3 right-3 cursor-pointer text-ink-soft transition hover:text-ink"
        onClick={async () => {
          setVisible(false);
          await dismissSurveyAction();
        }}
      >
        <XCircleIcon aria-hidden="true" className="h-4 w-4" />
      </button>

      {answered ? (
        <p className="pr-6 text-ink">Gracias — lo tenemos anotado.</p>
      ) : (
        <>
          <p className="pr-6 font-medium text-ink">¿Qué te gustaría que resolviéramos después?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                disabled={pending !== null}
                onClick={() => choose(option)}
                className="cursor-pointer rounded-full border border-border-soft bg-paper px-3 py-1.5 text-xs text-ink-soft transition hover:border-blue hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {option}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Mantenemos esta herramienta gratuita construyendo web apps eficientes para nuestros clientes —
            contanos qué proceso de tu empresa necesita simplificarse.
          </p>
        </>
      )}
    </div>
  );
}
