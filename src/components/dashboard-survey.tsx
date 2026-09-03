"use client";

import { useState } from "react";
import { dismissSurveyAction, submitSurveyAnswerAction } from "@/app/dashboard/actions";
import { XCircleIcon } from "@/components/icons";

export function DashboardSurvey() {
  const [visible, setVisible] = useState(true);
  const [pending, setPending] = useState(false);
  const [answered, setAnswered] = useState(false);

  if (!visible) return null;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = new FormData(e.currentTarget).get("answer");
    if (typeof text !== "string" || !text.trim()) return;
    setPending(true);
    const fd = new FormData();
    fd.set("answer", text.trim().slice(0, 500));
    await submitSurveyAnswerAction(fd);
    setAnswered(true);
    setTimeout(() => setVisible(false), 1600);
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
        <form onSubmit={submit}>
          <label htmlFor="survey-answer" className="block pr-6 font-medium text-ink">
            ¿Qué otra tarea de tu equipo te gustaría automatizar?
          </label>
          <textarea
            id="survey-answer"
            name="answer"
            rows={2}
            maxLength={500}
            placeholder="Ej. dar seguimiento a prospectos, armar cotizaciones, cobrar…"
            className="mt-2 w-full resize-none rounded-2xl border border-border-soft bg-gray/40 px-3 py-2 text-base sm:text-sm outline-none transition focus:border-blue"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-ink-soft">
              Con esto decidimos qué herramienta gratuita construir después.
            </p>
            <button
              type="submit"
              disabled={pending}
              className="shrink-0 cursor-pointer rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "..." : "Enviar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
