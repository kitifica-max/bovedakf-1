"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerAction } from "../actions";
import { ChevronDownIcon } from "@/components/icons";

const INDUSTRIES = [
  "Tecnología / Software",
  "Marketing y publicidad",
  "Finanzas y contabilidad",
  "Salud",
  "Educación",
  "Comercio / Retail",
  "Consultoría",
  "Construcción e inmobiliaria",
  "Otro",
];

export function RegisterForm() {
  const router = useRouter();
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const nextUrl = params?.get("next");
  const dest = nextUrl && nextUrl.startsWith("/") ? nextUrl : "/dashboard";
  const prefillEmail = params?.get("email") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(null, formData);
    if (result) {
      setError(result);
      setPending(false);
      return;
    }

    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    router.push(dest);
  }

  return (
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Crear bóveda
        </h1>
        <p className="mt-1 text-sm text-ink-soft">Un espacio encriptado para tu equipo.</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3" noValidate>
          <div>
            <label htmlFor="companyName" className="sr-only">Nombre de la empresa</label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              autoComplete="organization"
              placeholder="Nombre de la empresa"
              required
              maxLength={120}
              className="w-full rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-base sm:text-sm outline-none transition focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="email@empresa.com"
              defaultValue={prefillEmail}
              required
              className="w-full rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-base sm:text-sm outline-none transition focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Contraseña (mín. 10 caracteres)"
              required
              minLength={10}
              className="w-full rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-base sm:text-sm outline-none transition focus:border-ink"
            />
          </div>
          <div className="relative">
            <label htmlFor="industry" className="sr-only">Rubro de tu empresa</label>
            <select
              id="industry"
              name="industry"
              required
              defaultValue=""
              className="w-full cursor-pointer appearance-none rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 pr-10 text-base sm:text-sm outline-none transition focus:border-ink"
            >
              <option value="" disabled>¿En qué rubro opera tu empresa?</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="bottleneck" className="sr-only">Qué tarea digital te quita más tiempo (opcional)</label>
            <textarea
              id="bottleneck"
              name="bottleneck"
              placeholder="¿Qué tarea digital te quita más tiempo? (opcional)"
              maxLength={500}
              rows={2}
              className="w-full resize-none rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-base sm:text-sm outline-none transition focus:border-ink"
            />
            <label htmlFor="currentSolution" className="sr-only">Cómo lo resolvés hoy (opcional)</label>
            <textarea
              id="currentSolution"
              name="currentSolution"
              placeholder="¿Cómo lo resolvés hoy? (opcional)"
              maxLength={500}
              rows={2}
              className="w-full resize-none rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-base sm:text-sm outline-none transition focus:border-ink"
            />
            <p className="mt-0.5 px-1 text-xs text-ink-soft">
              Contanos qué te gustaría simplificar. Esto nos ayuda a crear nuevas herramientas gratuitas.
            </p>
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <button
            disabled={pending}
            className="mt-2 cursor-pointer rounded-full bg-ink px-4 py-3 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Creando..." : "Crear bóveda"}
          </button>
        </form>
        <a href="/login" className="mt-5 block text-center text-sm text-ink-soft underline">
          Ya tengo cuenta
        </a>
      </div>
  );
}
