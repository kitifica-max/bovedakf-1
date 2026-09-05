"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const ALLOWED = ["/login"];
const DISMISS_KEY = "kap-install-dismissed";

export function InstallPrompt() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!ALLOWED.includes(pathname)) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (navigator.standalone === true) return;

    function onPrompt(e: BeforeInstallPromptEvent) {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    }

    function onInstalled() {
      setShow(false);
      localStorage.setItem(DISMISS_KEY, "1");
    }

    window.addEventListener("beforeinstallprompt", onPrompt as EventListener);
    window.addEventListener("appinstalled", onInstalled);

    // Show anyway after 2s even if no native prompt (for iOS / non-supported browsers)
    const timer = setTimeout(() => {
      if (!localStorage.getItem(DISMISS_KEY)) setShow(true);
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(timer);
    };
  }, [pathname]);

  if (!ALLOWED.includes(pathname) || !show) return null;

  function dismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      setShow(false);
      localStorage.setItem(DISMISS_KEY, "1");
    }
    setDeferred(null);
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

        {deferred ? (
          <button
            type="button"
            onClick={install}
            className="mb-3 inline-flex w-full cursor-pointer items-center justify-center rounded-full border-none bg-blue px-6 py-3 text-sm font-medium text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            Instalar ahora &#8594;
          </button>
        ) : (
          <Link
            href="https://kitifica.com/appdirecta/"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 inline-flex w-full items-center justify-center rounded-full bg-blue px-6 py-3 text-sm font-medium text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            Cómo instalar &#8594;
          </Link>
        )}

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

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
