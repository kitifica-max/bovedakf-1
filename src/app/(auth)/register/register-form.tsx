"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerAction } from "../actions";
import { ChevronDownIcon } from "@/components/icons";
import { CTAButton } from "@/components/site/cta-button";
import { GIFT_LINKS } from "@/lib/packs";

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

export function RegisterForm({ nextUrl, prefillEmail }: { nextUrl?: string; prefillEmail: string }) {
  const router = useRouter();
  // Only same-site paths: "//evil.com" would be protocol-relative.
  const dest = nextUrl && nextUrl.startsWith("/") && !nextUrl.startsWith("//") ? nextUrl : "/dashboard";
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
      <div className="w-full max-w-md rounded-[40px] border-2 border-kf-borde bg-white p-6 sm:p-10">
        <h1 className="font-brand text-5xl leading-[1.04] font-extrabold text-kf-azul uppercase">
          Crear cuenta
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Gratis para tu equipo, con {GIFT_LINKS} links de regalo para compartir.
        </p>
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
              className="h-12 w-full rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm"
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
              className="h-12 w-full rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Contraseña (mín. 10)"
              required
              minLength={10}
              className="h-12 w-full rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm"
            />
          </div>
          <div className="relative">
            <label htmlFor="industry" className="sr-only">Rubro de tu empresa</label>
            <select
              id="industry"
              name="industry"
              required
              defaultValue=""
              className="h-12 w-full cursor-pointer appearance-none pr-11 rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm"
            >
              <option value="" disabled>Tu rubro</option>
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
              className="w-full resize-none rounded-[20px] border-2 border-kf-borde bg-white px-5 py-3 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm"
            />
            <label htmlFor="currentSolution" className="sr-only">Cómo lo resolvés hoy (opcional)</label>
            <textarea
              id="currentSolution"
              name="currentSolution"
              placeholder="¿Cómo lo resolvés hoy? (opcional)"
              maxLength={500}
              rows={2}
              className="w-full resize-none rounded-[20px] border-2 border-kf-borde bg-white px-5 py-3 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm"
            />
            <p className="mt-0.5 px-1 text-xs text-ink-soft">
              Contanos qué te gustaría simplificar. Esto nos ayuda a crear nuevas herramientas gratuitas.
            </p>
          </div>
          {error && (
            <p role="alert" className="rounded-2xl bg-kf-carmesi/10 px-4 py-2 text-sm font-semibold text-kf-carmesi-hondo">{error}</p>
          )}
          <CTAButton type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? "Creando..." : "Crear cuenta"}
          </CTAButton>
        </form>
        <CTAButton href="/login" variant="secondary" className="mt-5 w-full">
          Ya tengo cuenta
        </CTAButton>
      </div>
  );
}
