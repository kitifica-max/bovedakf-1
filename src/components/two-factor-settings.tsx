"use client";

import { useState } from "react";
import {
  confirmTotpEnrollmentAction,
  disableTotpAction,
  initTotpEnrollmentAction,
} from "@/app/dashboard/actions";
import { CopyButton } from "@/components/copy-button";
import { ShieldCheckIcon, ShieldOffIcon } from "@/components/icons";

const inputCls =
  "w-full rounded-2xl border border-border-soft bg-gray/40 px-3 py-2 text-sm outline-none transition focus:border-ink";

type Enrollment = { qrDataUrl: string; secret: string; backupCodes: string[] };

export function TwoFactorSettings({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [disabling, setDisabling] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startEnrollment() {
    setPending(true);
    setError(null);
    const result = await initTotpEnrollmentAction();
    setPending(false);
    if (result.error !== null) {
      setError(result.error);
      return;
    }
    setEnrollment(result);
  }

  async function confirmEnrollment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await confirmTotpEnrollmentAction(formData);
    setPending(false);
    if (result) {
      setError(result);
      return;
    }
    setEnabled(true);
    setEnrollment(null);
  }

  async function submitDisable(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await disableTotpAction(formData);
    setPending(false);
    if (result) {
      setError(result);
      return;
    }
    setEnabled(false);
    setDisabling(false);
  }

  if (enrollment) {
    return (
      <div className="rounded-2xl border border-border-soft bg-paper p-5">
        <p className="font-display text-lg font-semibold text-ink">Activar 2FA</p>
        <p className="mt-1 text-sm text-ink-soft">
          Escaneá el código con tu app de autenticación (Google Authenticator, Authy, etc.).
        </p>
        <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl bg-gray/60 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URI, not an optimizable image */}
          <img src={enrollment.qrDataUrl} alt="Código QR para configurar 2FA" width={180} height={180} />
          <div className="flex items-center gap-1.5 text-xs text-ink-soft">
            <code className="rounded bg-paper px-1.5 py-0.5 select-all">{enrollment.secret}</code>
            <CopyButton value={enrollment.secret} label="Copiar clave" />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-blue bg-blue/10 p-3">
          <p className="text-sm text-ink">
            Guardá estos códigos de respaldo — cada uno sirve una sola vez si perdés el
            dispositivo. No se muestran de nuevo.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-xs text-ink">
            {enrollment.backupCodes.map((code) => (
              <span key={code} className="rounded bg-paper px-2 py-1 select-all">{code}</span>
            ))}
          </div>
          <div className="mt-2">
            <CopyButton value={enrollment.backupCodes.join("\n")} label="Copiar todos los códigos" />
          </div>
        </div>

        <form onSubmit={confirmEnrollment} className="mt-4 flex flex-col gap-2" noValidate>
          <label htmlFor="confirm-code" className="sr-only">Código de verificación</label>
          <input
            id="confirm-code"
            name="code"
            type="text"
            inputMode="numeric"
            placeholder="Código de 6 dígitos"
            autoFocus
            required
            maxLength={6}
            className={`${inputCls} text-center tracking-[0.3em]`}
          />
          {error && (
            <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              disabled={pending}
              className="flex-1 cursor-pointer rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Verificando..." : "Confirmar y activar"}
            </button>
            <button
              type="button"
              onClick={() => { setEnrollment(null); setError(null); }}
              className="cursor-pointer rounded-full border border-border-soft px-4 py-2.5 text-sm text-ink-soft transition hover:bg-gray/60"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${enabled ? "bg-blue text-paper" : "bg-gray/60 text-ink-soft"}`}
          >
            {enabled ? <ShieldCheckIcon className="h-4 w-4" /> : <ShieldOffIcon className="h-4 w-4" />}
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-ink">Autenticación en dos pasos</p>
            <p className="text-sm text-ink-soft">
              {enabled ? "Activa — se pide un código al entrar." : "No está activa."}
            </p>
          </div>
        </div>
        {!enabled && (
          <button
            onClick={startEnrollment}
            disabled={pending}
            className="shrink-0 cursor-pointer rounded-full bg-ink px-4 py-2 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Generando..." : "Activar"}
          </button>
        )}
        {enabled && !disabling && (
          <button
            onClick={() => setDisabling(true)}
            className="shrink-0 cursor-pointer rounded-full border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/10"
          >
            Desactivar
          </button>
        )}
      </div>

      {error && !enrollment && (
        <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {disabling && (
        <form onSubmit={submitDisable} className="mt-4 flex flex-wrap items-center gap-2 border-t border-border-soft pt-4" noValidate>
          <label htmlFor="disable-code" className="sr-only">Código para confirmar</label>
          <input
            id="disable-code"
            name="code"
            type="text"
            inputMode="numeric"
            placeholder="Código o código de respaldo"
            autoFocus
            required
            maxLength={20}
            className={`${inputCls} w-auto flex-1`}
          />
          <button
            disabled={pending}
            className="cursor-pointer rounded-full bg-danger px-4 py-2 text-sm font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "..." : "Confirmar desactivación"}
          </button>
          <button
            type="button"
            onClick={() => { setDisabling(false); setError(null); }}
            className="cursor-pointer rounded-full border border-border-soft px-4 py-2 text-sm text-ink-soft transition hover:bg-gray/60"
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
}
