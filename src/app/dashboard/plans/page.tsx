import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { planState } from "@/lib/plan-state";
import { PACKS, perLink, usd } from "@/lib/packs";
import { PLAN_DISPLAY } from "@/lib/plans";
import { BuyPackButton, PurchasePoller } from "./buy-pack-button";

export const metadata: Metadata = {
  title: "Links y recargas",
};

export default async function PlansPage({ searchParams }: { searchParams: Promise<{ compra?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { compra } = await searchParams;

  const [user, purchases, returned] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, select: { linkCredits: true, subscription: true } }),
    db.linkPurchase.findMany({
      where: { userId: session.user.id, status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 10,
    }),
    compra ? db.linkPurchase.findFirst({ where: { id: compra, userId: session.user.id } }) : null,
  ]);

  const plan = planState(user?.subscription);
  const unlimited = plan.kind === "paid";
  const credits = user?.linkCredits ?? 0;
  const best = PACKS[PACKS.length - 1].links;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 rounded-full bg-ink px-5 py-3 text-gray">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG */}
          <img src="/logo-on-light.svg" alt="Bóveda KF-1" className="h-5 w-auto" />
          <span className="hidden text-sm text-gray/70 sm:inline">· Links y recargas</span>
        </div>
        <Link href="/dashboard" className="shrink-0 rounded-full border border-gray/25 px-3 py-1.5 text-sm transition hover:bg-gray/10">
          ← Bóveda
        </Link>
      </header>

      {returned?.status === "PAID" && (
        <div role="status" className="rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4">
          <p className="font-semibold text-green-400">Recarga acreditada: +{returned.links} links</p>
        </div>
      )}
      {returned?.status === "PENDING" && (
        <div className="rounded-2xl border border-border-soft bg-paper px-5 py-4">
          <PurchasePoller />
        </div>
      )}

      <section className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border-soft bg-paper p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-ink-soft">Links para compartir</p>
          <p className="font-display text-5xl font-bold leading-none text-ink">{unlimited ? "Ilimitados" : credits}</p>
        </div>
        <p className="max-w-md text-sm text-ink-soft">
          {unlimited
            ? `Tu plan ${PLAN_DISPLAY[user!.subscription!.plan] ?? user!.subscription!.plan} incluye links ilimitados mientras siga activo.`
            : "Cada link comparte una credencial con alguien de afuera y descuenta 1. Ver contraseñas y códigos 2FA dentro de tu equipo no consume links."}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <div className="px-1">
          <h1 className="font-display text-2xl font-bold text-ink">Recargá links</h1>
          <p className="mt-1 text-sm text-ink-soft">Pago único con Visa o Mastercard. Sin suscripción ni cobros automáticos.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PACKS.map((p) => (
            <div key={p.links} className={`flex flex-col gap-4 rounded-2xl border bg-paper p-5 ${p.links === best ? "border-blue" : "border-border-soft"}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-3xl font-bold leading-none text-ink">{p.links} links</p>
                {p.links === best && (
                  <span className="rounded-full bg-blue-soft px-2.5 py-0.5 text-[11px] font-semibold text-ink-reverse">Mejor precio</span>
                )}
              </div>
              <div>
                <p className="text-xl font-semibold text-ink">USD {usd(p.cents)}</p>
                <p className="text-xs text-ink-soft">USD {perLink(p)} por link</p>
              </div>
              <BuyPackButton links={p.links} label={`Comprar ${p.links}`} />
            </div>
          ))}
        </div>
      </section>

      {purchases.length > 0 && (
        <section className="rounded-2xl border border-border-soft bg-paper p-6">
          <h2 className="text-sm font-semibold text-ink">Tus recargas</h2>
          <ul className="mt-3 flex flex-col divide-y divide-border-soft">
            {purchases.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <span className="text-ink">+{p.links} links</span>
                <span className="text-ink-soft">USD {usd(p.amountCents)}</span>
                <span className="text-ink-soft">{p.paidAt?.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="px-1 text-sm text-ink-soft">
        Tu cuenta es gratis: hasta 5 personas, clientes y credenciales ilimitados. ¿Necesitás más personas? Escribinos a{" "}
        <span className="font-semibold text-ink">hola@kitifica.com</span>.
      </p>
    </div>
  );
}
