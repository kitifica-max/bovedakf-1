"use client";

import { useState } from "react";
import { FieldMsg, type Rules, type useInlineValidation } from "@/components/use-inline-validation";

const MIN = 16; // shortest base32 secret we accept (see parseTotpInput); real ones run 16–32

// Client-side mirror of the server check, so people see *why* a pasted key is wrong before submitting.
export const totpRules: Rules = {
  totp: (value) => {
    const raw = value.trim();
    if (!raw || /^otpauth:\/\//i.test(raw)) return null; // empty = optional; URIs are validated server-side
    const key = raw.replace(/[\s-]/g, "").replace(/=+$/, "");
    if (/[^A-Za-z2-7]/.test(key)) return "La clave solo lleva letras (A–Z) y números del 2 al 7. ¿Copiaste el código de 6 dígitos en vez de la clave?";
    if (key.length < MIN) return `Faltan caracteres: llevás ${key.length} y la clave tiene entre ${MIN} y 32.`;
    return null;
  },
};

const STEPS = [
  "En la red social: Seguridad → Autenticación en dos pasos → App de autenticación.",
  "No escanees el QR. Tocá «¿No podés escanear?» o «Ingresar clave manualmente».",
  "Copiá la clave: son entre 16 y 32 letras y números. Los espacios no importan.",
  "Pegala acá y guardá. La red social te pide un código de 6 dígitos para confirmar: lo ves en la bóveda.",
];

export function TotpField({
  id,
  v,
  label,
  required,
  autoFocus,
  labelClassName,
  inputClassName,
}: {
  id: string;
  v: ReturnType<typeof useInlineValidation>;
  label: string;
  required?: boolean;
  autoFocus?: boolean;
  labelClassName: string;
  inputClassName: string;
}) {
  const [len, setLen] = useState(0);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClassName}>{label}</label>
      <input
        id={id}
        name="totp"
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        placeholder="Ej. JBSW Y3DP EHPK 3PXP"
        aria-describedby={`${id}-hint`}
        onInput={(e) => setLen(e.currentTarget.value.replace(/[\s-]/g, "").length)}
        className={`${inputClassName} font-mono`}
      />
      <FieldMsg v={v} name="totp" />
      <p id={`${id}-hint`} className="m-0 px-1 text-xs font-semibold text-kf-tinta-suave">
        Es la <b>clave</b> que muestra la red social (16 a 32 letras y números), no la contraseña ni el código de 6 dígitos.
        {len > 0 && len <= 40 && <span className="ml-1 font-mono">· {len} {len === 1 ? "carácter" : "caracteres"}</span>}
      </p>
      <details open className="px-1 text-xs font-semibold text-kf-tinta-suave">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-bold text-kf-azul underline decoration-2 underline-offset-4">¿De dónde saco la clave?</summary>
        <ol className="m-0 flex list-decimal flex-col gap-1.5 pb-2 pl-5">
          {STEPS.map((s) => <li key={s}>{s}</li>)}
        </ol>
      </details>
    </div>
  );
}
