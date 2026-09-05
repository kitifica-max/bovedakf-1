"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const ALLOWED = ["/login"];
const DISMISS_KEY = "kap-install-dismissed";

export function InstallPrompt() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ALLOWED.includes(pathname)) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (navigator.standalone === true) return;
    setShow(true);
  }, [pathname]);

  if (!ALLOWED.includes(pathname) || !show) return null;

  function dismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Instalar App Directa"
      className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") dismiss();
      }}
    >
      <div className="glass relative w-full max-w-sm rounded-2xl p-6 text-ink shadow-2xl">
        <button
          type="button"
          aria-label="Cerrar"
          onClick={dismiss}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper hover:text-ink"
        >
          &#215;
        </button>

        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">&#128229;</span>
          <h2 className="t-h3 text-ink">Instalar App Directa</h2>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-ink-soft">
          Instalá la app directamente en tu dispositivo, sin tiendas de apps.
          Accedé a tu bóveda como una app nativa.
        </p>

        <Link
          href="https://kitifica.com/appdirecta/"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 inline-flex w-full items-center justify-center rounded-full bg-blue px-6 py-3 text-sm font-medium text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          Cómo instalar &#8594;
        </Link>

        <button
          type="button"
          onClick={dismiss}
          className="w-full cursor-pointer border-none bg-transparent py-1 text-center text-xs text-ink-soft transition hover:text-ink"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
