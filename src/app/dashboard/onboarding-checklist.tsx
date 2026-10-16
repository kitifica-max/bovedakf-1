"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { OnboardingStep } from "./onboarding";
import { appCard, appH2, kicker } from "@/components/brand/styles";

const KEY = "kf1-checklist-hidden";
const EVENT = "kf1-checklist";

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
};
// Per-viewer convenience only (see browser-storage rule): if storage is blocked it simply isn't remembered.
const readHidden = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
  const stored = useSyncExternalStore(subscribe, readHidden, () => false);
  const [closed, setClosed] = useState(false);
  if (stored || closed) return null;

  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);

  return (
    <section data-reveal aria-labelledby="checklist-title" className={`${appCard} flex flex-col gap-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className={kicker}>Primeros pasos · {done} de {steps.length}</p>
          <h2 id="checklist-title" className={appH2}>Armá tu bóveda, paso a paso</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(KEY, "1");
            } catch {
              /* not remembered */
            }
            setClosed(true);
            window.dispatchEvent(new Event(EVENT));
          }}
          className="min-h-11 cursor-pointer px-3 text-sm font-bold text-kf-tinta-suave hover:text-kf-tinta"
        >
          Ocultar
        </button>
      </div>
      <div
        role="progressbar"
        aria-label="Progreso de primeros pasos"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={done}
        aria-valuetext={`${done} de ${steps.length} pasos completos`}
        className="h-3 overflow-hidden rounded-full bg-kf-niebla"
      >
        <div data-reveal="bar" style={{ width: `${(done / steps.length) * 100}%` }} className="h-full rounded-full bg-kf-bosque transition-[width]" />
      </div>
      <ul data-stagger className="m-0 flex list-none flex-col gap-2.5 p-0">
        {steps.map((s) => (
          <li key={s.id} className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[22px] px-5 py-3.5 ${s.done ? "bg-kf-niebla" : "border-2 border-kf-borde bg-white"}`}>
            <span
              aria-hidden="true"
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${s.done ? "bg-kf-bosque text-kf-lima" : "border-2 border-kf-tinta-suave"}`}
            >
              {s.done && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              )}
            </span>
            <div className="flex min-w-0 flex-[1_1_200px] flex-col">
              <span className={`text-sm font-extrabold ${s.done ? "text-kf-tinta-suave line-through decoration-2" : ""}`}>{s.label}</span>
              {!s.done && <span className="text-xs font-semibold text-kf-tinta-suave">{s.hint}</span>}
              <span className="sr-only">{s.done ? "Completado" : "Pendiente"}</span>
            </div>
            {!s.done && s === next && (
              <Link
                href={s.href}
                className="inline-flex min-h-11 items-center rounded-full bg-kf-azul px-5 text-xs font-extrabold tracking-[0.12em] text-white no-underline transition hover:opacity-90"
              >
                EMPEZAR
              </Link>
            )}
            {!s.done && s !== next && (
              <Link href={s.href} className="inline-flex min-h-11 items-center text-[13px] font-bold text-kf-azul underline decoration-2 underline-offset-4">
                Ir
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
