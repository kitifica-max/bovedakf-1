import type { Metadata } from "next";
import Link from "next/link";
import { PricingCards } from "./pricing-cards";

export const metadata: Metadata = {
  title: "Planes — Bóveda KF-1",
  description: "Elige el plan para tu equipo. Pagos seguros con PayPal.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 p-6 sm:p-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Bóveda KF-1" className="h-7 w-auto" />
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-border-soft px-4 py-1.5 text-sm text-ink-soft transition hover:text-ink"
        >
          Ir a la bóveda →
        </Link>
      </header>

      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-ink">Planes simples y claros</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Comparte credenciales de forma segura. Sin contratos, cancela cuando quieras.
        </p>
      </div>

      <PricingCards
        starterPlanId={process.env.PAYPAL_PLAN_STARTER_ID ?? ""}
        teamPlanId={process.env.PAYPAL_PLAN_TEAM_ID ?? ""}
        clientId={process.env.PAYPAL_CLIENT_ID ?? ""}
      />

      <p className="text-center text-xs text-ink-soft">
        Pagos procesados por PayPal · Cancela en cualquier momento · Soporte en{" "}
        <a href="mailto:hola@kitifica.com" className="hover:text-ink transition-colors">
          hola@kitifica.com
        </a>
      </p>
    </div>
  );
}
