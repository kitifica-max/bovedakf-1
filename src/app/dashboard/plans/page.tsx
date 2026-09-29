import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPersonalEmail } from "@/lib/email-domains";
import { DAY_MS } from "@/lib/plan-state";
import { FREE_PLAN, PAID_PLANS, type PaidPlan } from "@/lib/plans";
import { CheckoutButton } from "@/app/checkout/checkout-button";
import { SwitchToFreeButton } from "@/components/plan-banner-actions";

export const metadata: Metadata = {
  title: "Planes",
};

type CardKey = "free" | PaidPlan;

export default async function PlansPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sub = await db.subscription.findUnique({ where: { userId: session.user.id } });
  const subPlan: PaidPlan | null = sub ? (sub.plan === "team" ? "team" : "personal") : null;
  const status = sub?.status;
  const personalEmail = isPersonalEmail(session.user.email);

  function badge(key: CardKey): { text: string; tone: "blue" | "danger" } | null {
    if (key === "free") {
      return !sub || ["CANCELLED", "EXPIRED", "PENDING"].includes(status!) ? { text: "Plan actual", tone: "blue" } : null;
    }
    if (key !== subPlan) return null;
    if (status === "ACTIVE") return { text: "Plan actual", tone: "blue" };
    if (status === "SUSPENDED") return { text: "Pago pendiente", tone: "danger" };
    if (status === "TRIALING") {
      const days = Math.ceil((sub!.currentPeriodEnd.getTime() - Date.now()) / DAY_MS);
      return days > 0
        ? { text: days === 1 ? "En prueba · queda 1 día" : `En prueba · quedan ${days} días`, tone: "blue" }
        : { text: "Prueba terminada", tone: "danger" };
    }
    return null;
  }

  const check = (
    <svg className="h-4 w-4 shrink-0 text-blue" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  function Card({ k, children }: { k: CardKey; children: React.ReactNode }) {
    const b = badge(k);
    const plan = k === "free" ? null : PAID_PLANS[k];
    return (
      <section
        className={`flex flex-col rounded-2xl border bg-paper p-6 ${b?.tone === "blue" ? "border-blue" : "border-border-soft"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm font-semibold uppercase tracking-widest ${k === "free" ? "text-ink-soft" : "text-blue-soft"}`}>
            {plan?.name ?? FREE_PLAN.name}
          </p>
          {b && (
            <span
              className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold ${
                b.tone === "blue" ? "bg-blue-soft text-ink-reverse" : "bg-danger/15 text-danger"
              }`}
            >
              {b.text}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-ink">${plan?.price ?? 0}</span>
          <span className="text-ink-soft">/mes</span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">{plan?.tagline ?? FREE_PLAN.tagline}</p>
        <ul className="mt-5 flex flex-1 flex-col gap-2">
          {(plan?.features ?? FREE_PLAN.features).map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-ink">{check}{f}</li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-2">{children}</div>
      </section>
    );
  }

  function paidAction(k: PaidPlan) {
    if (status === "ACTIVE" && subPlan === k) {
      return (
        <a
          href="https://panel.wompi.sv/Recurrentes"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border-soft py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-ink/5"
        >
          Gestionar en Wompi →
        </a>
      );
    }
    if (k === "team" && personalEmail) {
      return (
        <p className="rounded-xl border border-border-soft px-4 py-3 text-xs text-ink-soft">
          Requiere un email corporativo: el acceso SSO funciona con el dominio de tu empresa.
        </p>
      );
    }
    return (
      <>
        <CheckoutButton plan={k} />
        {status === "ACTIVE" && subPlan !== k && (
          <p className="text-center text-xs text-ink-soft">Reemplaza tu plan actual.</p>
        )}
      </>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 rounded-full bg-ink px-5 py-3 text-gray">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG */}
          <img src="/logo-on-light.svg" alt="Bóveda KF-1" className="h-5 w-auto" />
          <span className="hidden text-sm text-gray/70 sm:inline">· Planes</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/billing" className="hidden shrink-0 rounded-full px-3 py-1.5 text-sm text-gray/80 transition hover:text-gray sm:inline">
            Facturación
          </Link>
          <Link href="/dashboard" className="shrink-0 rounded-full border border-gray/25 px-3 py-1.5 text-sm transition hover:bg-gray/10">
            ← Bóveda
          </Link>
        </div>
      </header>

      <div className="px-1">
        <h1 className="font-display text-2xl font-bold text-ink">Planes</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Sin contratos, cancelás cuando quieras. Al pagar, usá el email{" "}
          <span className="font-semibold text-ink">{session.user.email}</span> para que el plan se active solo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card k="free">
          {status === "TRIALING" && <SwitchToFreeButton />}
        </Card>
        <Card k="personal">{paidAction("personal")}</Card>
        <Card k="team">{paidAction("team")}</Card>
      </div>

      <p className="px-1 text-sm text-ink-soft">
        ¿Más de 10 usuarios o SSO con SAML? Escribinos a{" "}
        <span className="font-semibold text-ink">hola@kitifica.com</span> para el plan Empresa.
      </p>
    </div>
  );
}
