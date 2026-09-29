import Link from "next/link";

export function PricingCards() {
  const check = (
    <svg className="h-4 w-4 shrink-0 text-blue" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Gratis */}
      <div className="flex flex-col rounded-2xl border border-border-soft bg-paper p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-ink-soft">Gratis</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-ink">$0</span>
          <span className="text-ink-soft">/mes</span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">Para explorar</p>
        <ul className="mt-6 flex flex-col gap-2 flex-1">
          {["1 usuario", "10 credenciales", "5 share links/mes", "Audit log básico"].map((f) => (
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

      {/* Personal */}
      <div className="flex flex-col rounded-2xl border border-border-soft bg-paper p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue">Personal</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-ink">$3</span>
          <span className="text-ink-soft">/mes</span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">Para uso individual</p>
        <ul className="mt-6 flex flex-col gap-2 flex-1">
          {["1 usuario", "Credenciales ilimitadas", "Share links ilimitados", "Audit log completo"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-ink">{check}{f}</li>
          ))}
        </ul>
        <Link href="/checkout?plan=personal" className="mt-6 block w-full rounded-full bg-blue py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90">
          Suscribirse →
        </Link>
      </div>

      {/* Equipo */}
      <div className="relative flex flex-col rounded-2xl border border-blue bg-paper p-6 shadow-lg">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue px-4 py-0.5 text-xs font-semibold text-white">
          Más popular
        </span>
        <p className="text-sm font-semibold uppercase tracking-widest text-blue">Equipo</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-ink">$20</span>
          <span className="text-ink-soft">/mes</span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">Hasta 10 usuarios</p>
        <ul className="mt-6 flex flex-col gap-2 flex-1">
          {["10 usuarios", "Todo lo de Personal", "Email corporativo (SSO)", "Soporte prioritario"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-ink">{check}{f}</li>
          ))}
        </ul>
        <Link href="/checkout?plan=team" className="mt-6 block w-full rounded-full bg-blue py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90">
          Suscribirse →
        </Link>
      </div>

      {/* Empresa */}
      <div className="flex flex-col rounded-2xl border border-border-soft bg-paper p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-ink-soft">Empresa</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-ink">Custom</span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">Usuarios ilimitados</p>
        <ul className="mt-6 flex flex-col gap-2 flex-1">
          {["Usuarios ilimitados", "Todo lo de Equipo", "SSO/SAML (Okta, Azure AD)", "Soporte dedicado"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-ink">{check}{f}</li>
          ))}
        </ul>
        <a
          href="mailto:hola@kitifica.com?subject=B%C3%B3veda%20KF-1%20%E2%80%94%20Plan%20Empresa"
          className="mt-6 block w-full rounded-full border border-border-soft py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-ink/5"
        >
          Contactar ventas
        </a>
      </div>
    </div>
  );
}
