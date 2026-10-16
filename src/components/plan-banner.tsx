import Link from "next/link";
import { db } from "@/lib/db";
import { PLAN_DISPLAY } from "@/lib/plans";

// Only legacy subscriptions can fail a charge; prepaid link packs never do.
export async function PlanBanner({ userId }: { userId: string }) {
  const sub = await db.subscription.findUnique({ where: { userId }, select: { status: true, plan: true } });
  if (sub?.status !== "SUSPENDED") return null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4">
      <div role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 p-5">
        <p className="font-semibold text-ink">No pudimos cobrar tu plan {PLAN_DISPLAY[sub.plan] ?? sub.plan}</p>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Tu cuenta sigue funcionando como cuenta gratis y no perdés nada de lo que guardaste. Para compartir, usás tu saldo de
          links. Actualizá tu tarjeta en Wompi si querés recuperar los links ilimitados de tu plan.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href="https://panel.wompi.sv/Recurrentes"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Actualizar método de pago →
          <span className="sr-only"> (se abre en otra pestaña)</span></a>
          <Link href="/dashboard/plans" className="rounded-full border border-border-soft px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5">
            Ver mis links
          </Link>
        </div>
      </div>
    </div>
  );
}
