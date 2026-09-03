import Link from "next/link";

export function SiteHeader() {
  return (
    <nav aria-label="Principal" className="flex items-center justify-between gap-2 rounded-full bg-ink px-4 py-2.5 text-gray sm:px-5 sm:py-3">
      <Link href="/" className="flex shrink-0 items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, not photographic content */}
        <img src="/logo-on-light.svg" alt="Bóveda KF-1" className="h-5 w-auto sm:h-6" />
      </Link>
      <div className="flex shrink-0 items-center gap-1.5 text-xs sm:gap-3 sm:text-sm">
        <Link href="/contacto" className="hidden text-gray/80 transition hover:text-gray sm:inline">
          Contacto
        </Link>
        <Link href="/login" className="whitespace-nowrap text-gray/80 transition hover:text-gray">
          Entrar
        </Link>
        <Link
          href="/register"
          className="whitespace-nowrap rounded-full bg-blue-soft px-3 py-1.5 font-medium text-ink-reverse transition hover:brightness-95 sm:px-4"
        >
          Crear bóveda
        </Link>
      </div>
    </nav>
  );
}
