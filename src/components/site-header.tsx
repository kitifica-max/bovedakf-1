import Link from "next/link";

export function SiteHeader() {
  return (
    <nav aria-label="Principal" className="flex items-center justify-between bg-ink px-5 py-3 text-gray">
      <Link href="/" className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, not photographic content */}
        <img src="/logo-on-light.svg" alt="Bóveda KF-1" className="h-6 w-auto" />
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <Link href="/contacto" className="hidden text-gray/80 transition hover:text-gray sm:inline">
          Contacto
        </Link>
        <Link href="/login" className="text-gray/80 transition hover:text-gray">
          Entrar
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-blue-soft px-4 py-1.5 font-medium text-ink-reverse transition hover:brightness-95"
        >
          Crear bóveda
        </Link>
      </div>
    </nav>
  );
}
