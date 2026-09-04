import Link from "next/link";
import { KitificaCredit } from "./kitifica-credit";

const columns = [
  {
    heading: "Producto",
    links: [
      { href: "/register", label: "Crear bóveda" },
      { href: "/login", label: "Entrar" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/terminos", label: "Términos y condiciones" },
      { href: "/privacidad", label: "Privacidad" },
    ],
  },
  {
    heading: "Soporte",
    links: [{ href: "/contacto", label: "Contacto" }],
  },
];

export function SiteFooter() {
  return (
    <footer className="w-full max-w-5xl rounded-2xl border border-border-soft bg-paper p-8 sm:p-12">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-10">
        <div className="col-span-2 sm:col-span-1">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, not photographic content */}
            <img src="/logo-on-dark.svg" alt="Bóveda KF-1" className="h-5 w-auto" />
          </Link>
          <p className="mt-3 text-sm text-ink-soft">
            Gestor de credenciales compartidas seguro para equipos.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <p className="t-kicker">{col.heading}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-soft transition hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mt-8 flex flex-col-reverse items-start gap-3 border-t border-border-soft pt-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Bóveda KF-1. Todos los derechos reservados.</p>
        <KitificaCredit />
      </div>
    </footer>
  );
}
