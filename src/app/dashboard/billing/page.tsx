import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Facturación — Bóveda KF-1",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ activated?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const justActivated = params.activated === "1";

  const sub = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const planLabels = { starter: "Starter", team: "Equipo" };
  const planPrices = { starter: "$9/mes", team: "$29/mes" };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 rounded-full bg-ink px-5 py-3 text-gray">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-on-light.svg" alt="Bóveda KF-1" className="h-5 w-auto" />
          <span className="hidden text-sm text-gray/70 sm:inline">· Facturación</span>
        </div>
        <Link
          href="/dashboard"
          className="shrink-0 rounded-full border border-gray/25 px-3 py-1.5 text-sm transition hover:bg-gray/10"
        >
          ← Bóveda
        </Link>
      </header>

      {justActivated && (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4">
          <p className="font-semibold text-green-400">¡Suscripción activada!</p>
          <p className="mt-0.5 text-sm text-ink-soft">Tu plan ya está activo. Podés invitar miembros a tu bóveda.</p>
        </div>
      )}

      <div className="px-1">
        <h1 className="font-display text-2xl font-bold text-ink">Facturación</h1>
        <p className="mt-1 text-sm text-ink-soft">Gestión de tu plan y suscripción.</p>
      </div>

      {sub ? (
        <section className="rounded-2xl border border-border-soft bg-paper p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-ink">
                Plan {planLabels[sub.plan]} · {planPrices[sub.plan]}
              </p>
              <p className="mt-0.5 text-sm text-ink-soft">{sub.seats} asientos incluidos</p>
              <p className="mt-1 text-xs text-ink-soft">
                {sub.status === "ACTIVE"
                  ? `Próximo cobro: ${sub.currentPeriodEnd.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`
                  : `Estado: ${{ SUSPENDED: "Suspendido", CANCELLED: "Cancelado" }[sub.status] ?? sub.status}`}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold ${
                sub.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray/40 text-ink-soft"
              }`}
            >
              {sub.status === "ACTIVE" ? "Activo" : { SUSPENDED: "Suspendido", CANCELLED: "Cancelado" }[sub.status] ?? sub.status}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-border-soft pt-5">
            <Link
              href="/pricing"
              className="rounded-full border border-border-soft px-4 py-1.5 text-xs font-medium text-ink hover:bg-gray/20"
            >
              Cambiar plan
            </Link>
            <a
              href="https://panel.wompi.sv/Recurrentes"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border-soft px-4 py-1.5 text-xs font-medium text-ink-soft hover:bg-gray/20"
            >
              Gestionar en Wompi →
            </a>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-border-soft bg-paper p-8 text-center">
          <p className="font-semibold text-ink">Sin plan activo</p>
          <p className="mt-1.5 text-sm text-ink-soft">
            Suscribite para agregar miembros a tu equipo y acceder a funciones avanzadas.
          </p>
          <Link
            href="/pricing"
            className="mt-5 inline-block rounded-full bg-blue px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Ver planes →
          </Link>
        </section>
      )}
    </div>
  );
}
