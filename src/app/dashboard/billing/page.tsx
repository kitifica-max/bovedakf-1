import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usd } from "@/lib/packs";
import { AppShell } from "../app-shell";
import { PageHero, StarDot } from "@/components/brand/shapes";
import { appCard, appH2, kicker, pillFill } from "@/components/brand/styles";

export const metadata: Metadata = {
  title: "Facturación",
};

const fmtDate = (d: Date) => d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const purchases = await db.linkPurchase.findMany({
    where: { userId: session.user.id, status: "PAID" },
    orderBy: { paidAt: "desc" },
    take: 50,
  });
  const spent = purchases.reduce((sum, p) => sum + p.amountCents, 0);

  return (
    <AppShell active="facturacion">
      <PageHero
        pair="rosa"
        icon="doc"
        kicker="Facturación"
        title="Sin cobros sorpresa"
        lead="Tu cuenta es gratis. Solo pagás las recargas de links que comprás, una por una, sin suscripción ni cobros automáticos."
      />

      <section className={`${appCard} flex flex-col gap-5`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <p className={kicker}>Historial</p>
            <h2 className={appH2}>Tus recargas</h2>
          </div>
          {purchases.length > 0 && (
            <p className="m-0 rounded-full bg-kf-amarillo px-4 py-2 text-sm font-extrabold text-kf-lavanda">
              Total: USD {usd(spent)}
            </p>
          )}
        </div>
        {purchases.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-kf-niebla p-5">
            <p className="m-0 text-sm font-semibold text-kf-tinta-suave">Todavía no compraste recargas. Tus links de regalo vienen incluidos.</p>
            <Link href="/dashboard/plans" className={pillFill}>
              VER RECARGAS
            </Link>
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {purchases.map((p, i) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[22px] bg-kf-niebla px-5 py-3.5 text-sm font-semibold">
                <StarDot i={i} />
                <span className="min-w-0 flex-[1_1_120px] font-extrabold">+{p.links} links</span>
                <span className="text-kf-tinta-suave">USD {usd(p.amountCents)}</span>
                <span className="text-kf-tinta-suave">{p.paidAt ? fmtDate(p.paidAt) : "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
