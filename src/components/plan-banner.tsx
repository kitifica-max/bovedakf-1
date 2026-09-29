import Link from "next/link";
import { db } from "@/lib/db";
import { DAY_MS, planState } from "@/lib/plan-state";
import { PlanBannerActions } from "./plan-banner-actions";

const PLAN_NAME: Record<string, string> = { personal: "Personal", starter: "Personal", team: "Equipo" };

export async function PlanBanner({ userId }: { userId: string }) {
  const sub = await db.subscription.findUnique({ where: { userId } });

  if (sub?.status === "SUSPENDED") {
    const name = PLAN_NAME[sub.plan] ?? sub.plan;
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pt-4">
        <div role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 p-5">
          <p className="font-semibold text-ink">No pudimos cobrar tu plan {name}</p>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Mientras tanto tu cuenta funciona con los límites del plan gratis (10 credenciales, 1 miembro extra).
            No perdés nada de lo que ya guardaste. Actualizá tu tarjeta para recuperar el plan.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href="https://panel.wompi.sv/Recurrentes"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Actualizar método de pago →
            </a>
            <Link href="/dashboard/billing" className="rounded-full border border-border-soft px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5">
              Ver facturación
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const plan = planState(sub);
  if (plan.kind !== "trial" && plan.kind !== "grace") return null;

  const name = PLAN_NAME[plan.plan] ?? plan.plan;
  const checkoutHref = "/dashboard/plans";

  if (plan.kind === "trial") {
    const daysLeft = Math.max(1, Math.ceil((plan.endsAt.getTime() - Date.now()) / DAY_MS));
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue/30 bg-blue/10 px-4 py-3 text-sm">
          <p className="text-ink">
            Prueba del plan <strong>{name}</strong> · {daysLeft === 1 ? "queda 1 día" : `quedan ${daysLeft} días`}
          </p>
          <Link href={checkoutHref} className="rounded-full bg-blue px-4 py-1.5 font-semibold text-white transition hover:opacity-90">
            Suscribirme
          </Link>
        </div>
      </div>
    );
  }

  const daysToDelete = Math.max(0, Math.ceil((plan.deleteAt.getTime() - Date.now()) / DAY_MS));
  const deleteDate = plan.deleteAt.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4">
      <div role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 p-5">
        <p className="font-semibold text-ink">Tu prueba del plan {name} terminó</p>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Tu bóveda está en solo lectura: podés ver y exportar tus credenciales, pero no crear ni compartir.
          Si no elegís un plan, tus credenciales se eliminan el <strong className="text-ink">{deleteDate}</strong>{" "}
          ({daysToDelete === 1 ? "en 1 día" : `en ${daysToDelete} días`}).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href={checkoutHref} className="rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
            Elegir un plan
          </Link>
          <PlanBannerActions />
        </div>
      </div>
    </div>
  );
}
