"use client";

import { useCallback, useId, useState } from "react";

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export type Rules = Record<string, (value: string, form: HTMLFormElement) => string | null>;

const isField = (el: EventTarget | null): el is Field =>
  el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;

// Spanish messages from the browser's own constraint validation (works even with noValidate).
function nativeMessage(el: Field): string | null {
  const v = el.validity;
  if (v.valid) return null;
  if (v.valueMissing) return el instanceof HTMLSelectElement ? "Elegí una opción" : "Este campo es obligatorio";
  if (v.typeMismatch && el.type === "email") return "Ingresá un email válido, por ejemplo nombre@empresa.com";
  if (v.typeMismatch && el.type === "url") return "La URL tiene que empezar con https://";
  if (v.tooShort && "minLength" in el) return `Mínimo ${el.minLength} caracteres (llevás ${el.value.length})`;
  if (v.tooLong && "maxLength" in el) return `Máximo ${el.maxLength} caracteres`;
  if (v.patternMismatch) return el.title || "El formato no es válido";
  return "Revisá este campo";
}

// Field-level validation as you go: a field is checked when you leave it, re-checked while you fix it,
// and every field is checked on submit (focus jumps to the first error). The message element is linked
// with aria-describedby + aria-invalid, set on the input directly so forms only add <FieldMsg>.
export function useInlineValidation(rules: Rules = {}) {
  const base = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const idFor = (name: string) => `${base}-${name}-error`;

  const check = useCallback(
    (el: Field) => {
      if (!el.name || el.disabled || el.type === "hidden") return true;
      const msg = nativeMessage(el) ?? (el.form && rules[el.name] ? rules[el.name](el.value, el.form) : null);
      if (msg) {
        el.setAttribute("aria-invalid", "true");
        el.setAttribute("aria-describedby", `${base}-${el.name}-error`);
      } else {
        el.removeAttribute("aria-invalid");
        el.removeAttribute("aria-describedby");
      }
      setErrors((prev) => (prev[el.name] === (msg ?? "") ? prev : { ...prev, [el.name]: msg ?? "" }));
      return !msg;
    },
    [base, rules],
  );

  const validateAll = (form: HTMLFormElement) => {
    let first: Field | null = null;
    for (const el of Array.from(form.elements)) {
      if (isField(el) && !check(el) && !first) first = el;
    }
    first?.focus();
    return !first;
  };

  const formProps = {
    noValidate: true,
    onBlur: (e: React.FocusEvent<HTMLFormElement>) => {
      if (isField(e.target) && e.target.value !== "") check(e.target);
    },
    onInput: (e: React.FormEvent<HTMLFormElement>) => {
      if (isField(e.target) && errors[e.target.name]) check(e.target);
    },
    onChange: (e: React.ChangeEvent<HTMLFormElement>) => {
      if (e.target instanceof HTMLSelectElement) check(e.target);
    },
  };

  return { errors, idFor, validateAll, formProps };
}

export function FieldMsg({ v, name }: { v: ReturnType<typeof useInlineValidation>; name: string }) {
  const msg = v.errors[name];
  if (!msg) return null;
  return (
    <span id={v.idFor(name)} className="mt-1.5 flex items-start gap-1.5 px-1 text-xs font-bold text-kf-carmesi-hondo normal-case tracking-normal">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.3v.2" />
      </svg>
      <span>{msg}</span>
    </span>
  );
}
