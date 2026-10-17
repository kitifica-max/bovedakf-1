import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PACKS, perLink, usd } from "@/lib/packs";
import { BuyPackButton, PurchasePoller } from "./buy-pack-button";
import { AppShell } from "../app-shell";
import { PAIRS, PageHero, type PairName } from "@/components/brand/shapes";
import { appCard, appH2, pillLine } from "@/components/brand/styles";

const PACK_PAIRS: PairName[] = ["rosa", "amarillo", "bosque"];

export const metadata: Metadata = {
  title: "Links y recargas",
};

export default async function PlansPage({ searchParams }: { searchParams: Promise<{ compra?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { compra } = await searchParams;

  const [user, purchases, returned] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, select: { linkCredits: true } }),
    db.linkPurchase.findMany({
      where: { userId: session.user.id, status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 1,
    }),
    compra ? db.linkPurchase.findFirst({ where: { id: compra, userId: session.user.id } }) : null,
  ]);

  const credits = user?.linkCredits ?? 0;
  const best = PACKS[PACKS.length - 1].links;

  return (
    <AppShell active="links">
      <PageHero
        pair="durazno"
        icon="link"
        kicker="Links para compartir"
        title={credits === 1 ? "Te queda 1 link" : `Te quedan ${credits} links`}
        lead="Cada link comparte una cuenta con alguien de afuera y descuenta 1. Ver contraseñas y códigos 2FA dentro de tu equipo es gratis."
      />

      {returned?.status === "PAID" && (
        <div role="status" className="rounded-[28px] bg-kf-lima px-6 py-5 text-kf-bosque-hondo">
          <p className="m-0 font-brand text-[28px] leading-[1.04] font-extrabold uppercase">Recarga acreditada: +{returned.links} links</p>
        </div>
      )}
      {returned?.status === "PENDING" && (
        <div className={appCard}>
          <PurchasePoller />
        </div>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className={appH2}>Recargá links</h2>
          <p className="m-0 text-sm font-semibold text-kf-tinta-suave">Pago único con Visa o Mastercard. Sin suscripción ni cobros automáticos.</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {PACKS.map((p, i) => {
            const c = PAIRS[p.links === best ? "carmesi" : PACK_PAIRS[i % PACK_PAIRS.length]];
            return (
              <div key={p.links} style={{ background: c.bg, color: c.ink }} className="flex min-w-0 flex-col gap-4 rounded-[32px] p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="m-0 font-brand text-[44px] leading-[1.04] font-extrabold uppercase">{p.links} links</p>
                  {p.links === best && (
                    <span className="rounded-full bg-kf-manteca px-3 py-1 text-[11px] font-extrabold tracking-[0.12em] text-kf-carmesi-hondo">MEJOR PRECIO</span>
                  )}
                </div>
                <div>
                  <p className="m-0 text-xl font-extrabold">USD {usd(p.cents)}</p>
                  <p className="m-0 text-xs font-bold opacity-90">USD {perLink(p)} por link</p>
                </div>
                <BuyPackButton links={p.links} label={`Comprar ${p.links}`} />
              </div>
            );
          })}
        </div>
      </section>

      <div className={`${appCard} flex flex-wrap items-center justify-between gap-4`}>
        <p className="m-0 max-w-xl text-sm font-semibold text-kf-tinta-suave">
          Tu cuenta es gratis: hasta 5 personas, clientes y cuentas ilimitados. ¿Necesitás más personas? Escribinos a{" "}
          <span className="text-kf-tinta">hola@kitifica.com</span>.
        </p>
        {purchases.length > 0 && (
          <Link href="/dashboard/billing" className={pillLine}>
            VER TUS RECARGAS
          </Link>
        )}
      </div>
    </AppShell>
  );
}
