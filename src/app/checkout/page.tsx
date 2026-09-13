import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CheckoutButton } from "./checkout-button";

export const metadata: Metadata = {
  title: "Checkout — Bóveda KF-1",
  robots: { index: false },
};

const PLANS = {
  starter: {
    name: "Starter",
    price: 9,
    seats: 5,
    features: ["Bóvedas ilimitadas", "Credenciales ilimitadas", "Share links con expiración", "Audit log completo"],
  },
  team: {
    name: "Equipo",
    price: 29,
    seats: 25,
    features: ["Todo lo de Starter", "25 asientos de equipo", "SSO corporativo", "Soporte prioritario"],
  },
} as const;

type Plan = keyof typeof PLANS;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const planKey = params.plan as Plan;
  const plan = PLANS[planKey];
  if (!plan) redirect("/#precios");

  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=/checkout?plan=${planKey}`);

  const existing = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const check = (
    <svg className="h-4 w-4 shrink-0 text-blue" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <Link href="/#precios" className="mb-8 flex items-center gap-2 text-sm text-ink-soft transition hover:text-ink">
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver a planes
        </Link>

        <div className="overflow-hidden rounded-2xl border border-border-soft bg-paper">
          {/* Plan summary */}
          <div className="border-b border-border-soft p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue">Plan {plan.name}</p>
                <p className="mt-1 text-sm text-ink-soft">Hasta {plan.seats} usuarios · Facturación mensual</p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-bold text-ink">${plan.price}</p>
                <p className="text-xs text-ink-soft">/mes</p>
              </div>
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-sm text-ink-soft">
                  {check}{f}
                </li>
              ))}
            </ul>
          </div>

          {/* Account info */}
          <div className="border-b border-border-soft p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">Cuenta</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue/15 text-sm font-bold text-blue">
                {session.user.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{session.user.email}</p>
                <p className="text-xs text-ink-soft">Tu bóveda KF-1</p>
              </div>
            </div>
          </div>

          {/* Current subscription warning */}
          {(existing?.status === "ACTIVE" || existing?.status === "PENDING") && (
            <div className="border-b border-border-soft bg-yellow-500/5 px-6 py-4">
              <p className="text-sm text-yellow-400">
                {existing.status === "PENDING"
                  ? "Tenés una suscripción pendiente de pago. Al continuar se reemplazará."
                  : `Ya tenés un plan ${existing.plan} activo. Al suscribirte reemplazará el anterior.`}
              </p>
            </div>
          )}

          {/* Total + CTA */}
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-ink-soft">Total hoy</span>
              <span className="font-semibold text-ink">${plan.price} USD</span>
            </div>
            {/* Email notice — Wompi matches user by email to activate subscription */}
            <div className="mb-5 rounded-xl border border-blue/20 bg-blue/5 px-4 py-3">
              <p className="text-xs text-ink-soft">
                Al pagar, usá el email{" "}
                <span className="font-semibold text-ink">{session.user.email}</span>{" "}
                para que tu suscripción se active automáticamente.
              </p>
            </div>
            <CheckoutButton plan={planKey} />
            <p className="mt-4 text-center text-xs text-ink-soft">
              Pagá con Visa o Mastercard. Sin cuenta extra requerida.
              <br />
              Sin contratos · Cancela cuando quieras ·{" "}
              <Link href="/devoluciones" className="underline hover:text-ink">Política de devoluciones</Link>
            </p>
          </div>
        </div>

        {/* Security badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L2 4v4c0 3.3 2.5 6.4 6 7.2C11.5 14.4 14 11.3 14 8V4L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Pago seguro
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sin cargos ocultos
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Cancela en cualquier momento
          </span>
        </div>
      </div>
    </div>
  );
}
