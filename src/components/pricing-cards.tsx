import Link from "next/link";

type Props = {
  starterPlanId: string;
  teamPlanId: string;
  clientId: string;
};

export function PricingCards({ starterPlanId: _s, teamPlanId: _t, clientId: _c }: Props) {
  const check = (
    <svg className="h-4 w-4 shrink-0 text-blue" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {/* Gratis */}
      <div className="relative rounded-2xl border border-border-soft bg-paper p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-ink-soft">Gratis</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-ink">$0</span>
          <span className="text-ink-soft">/mes</span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">1 usuario</p>
        <ul className="mt-6 flex flex-col gap-2">
          {["1 bóveda", "Hasta 10 credenciales", "Share links básicos", "Audit log"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-ink">{check}{f}</li>
          ))}
        </ul>
        <Link
          href="/register"
          className="mt-6 block w-full rounded-full border border-border-soft py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-ink/5"
        >
          Crear cuenta gratis
        </Link>
      </div>

      {/* Starter */}
      <div className="relative rounded-2xl border border-border-soft bg-paper p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue">Starter</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-ink">$9</span>
          <span className="text-ink-soft">/mes</span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">Hasta 5 usuarios</p>
        <ul className="mt-6 flex flex-col gap-2">
          {["Bóvedas ilimitadas", "Credenciales ilimitadas", "Share links con expiración", "Audit log completo"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-ink">{check}{f}</li>
          ))}
        </ul>
        <Link href="/checkout?plan=starter" className="mt-6 block w-full rounded-full bg-blue py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90">
          Suscribirse →
        </Link>
      </div>

      {/* Equipo */}
      <div className="relative rounded-2xl border border-blue bg-paper p-8 shadow-lg">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue px-4 py-0.5 text-xs font-semibold text-white">
          Más popular
        </span>
        <p className="text-sm font-semibold uppercase tracking-widest text-blue">Equipo</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-ink">$29</span>
          <span className="text-ink-soft">/mes</span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">Hasta 25 usuarios</p>
        <ul className="mt-6 flex flex-col gap-2">
          {["Todo lo de Starter", "25 asientos de equipo", "SSO corporativo", "Soporte prioritario"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-ink">{check}{f}</li>
          ))}
        </ul>
        <Link href="/checkout?plan=team" className="mt-6 block w-full rounded-full bg-blue py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90">
          Suscribirse →
        </Link>
      </div>
    </div>
  );
}
