"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/connect", label: "Skill", mobileHidden: true },
  { href: "/seguridad", label: "Seguridad", mobileHidden: true },
  { href: "/contacto", label: "Contacto", mobileHidden: true },
  { href: "/login", label: "Entrar", mobileHidden: false },
];

export function SiteHeader() {
  const pathname = usePathname();
  const active = (href: string) => pathname === href;

  return (
    <div className="sticky top-0 z-40 mx-auto w-full max-w-5xl px-4 pt-4 sm:pt-6">
    <nav aria-label="Principal" className="flex items-center justify-between gap-2 rounded-full bg-ink px-4 py-2.5 text-gray shadow-lg shadow-black/25 ring-1 ring-white/5 sm:px-5 sm:py-3">
      <Link href="/" className="flex shrink-0 items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, not photographic content */}
        <img src="/logo-on-light.svg" alt="Bóveda KF-1" className="h-5 w-auto sm:h-6" />
      </Link>
      <div className="flex shrink-0 items-center gap-2 text-xs sm:gap-3 sm:text-sm">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active(l.href) ? "page" : undefined}
            className={`${l.mobileHidden ? "hidden sm:inline " : ""}whitespace-nowrap rounded-full px-3 py-1.5 transition ${
              active(l.href) ? "bg-blue-soft font-medium text-ink-reverse" : "text-gray/80 hover:text-gray"
            }`}
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/register"
          aria-current={active("/register") ? "page" : undefined}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition sm:px-4 ${
            active("/register")
              ? "bg-blue-soft text-ink-reverse"
              : "border border-gray/30 text-gray hover:bg-gray/10"
          }`}
        >
          Crear bóveda
        </Link>
      </div>
    </nav>
    </div>
  );
}
