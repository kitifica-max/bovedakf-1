"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Mono, StarBadge } from "@/components/brand/shapes";
import { display, pillBase } from "@/components/brand/styles";

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
    if ((navigator as Navigator & { standalone?: boolean }).standalone === true) return;

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
      aria-labelledby="install-title"
      className="fixed inset-0 z-[99999] flex items-end justify-center bg-kf-tinta/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") dismiss();
      }}
    >
      <div className="relative flex w-full max-w-md flex-col gap-5 rounded-[40px] bg-kf-durazno p-7 font-brand-sans text-kf-tinta shadow-[0_30px_70px_rgba(0,0,0,0.35)] sm:p-9">
        <button
          type="button"
          aria-label="Cerrar"
          onClick={dismiss}
          className="absolute right-4 top-4 grid h-11 w-11 cursor-pointer place-items-center rounded-full text-kf-carmesi-hondo transition hover:bg-kf-carmesi-hondo/10"
        >
          <Mono name="close" className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4 pr-10">
          <StarBadge fill="var(--kf-carmesi)" ink="var(--kf-manteca)" icon="download" className="h-20 w-20" />
          <h2 id="install-title" className={`${display} m-0 text-[40px] leading-[1.04] text-kf-carmesi-hondo`}>
            Instalar App Directa
          </h2>
        </div>

        <p className="m-0 text-[15px] leading-relaxed font-semibold">
          Instalá la app directamente en tu dispositivo, sin tiendas de apps. Accedé a tu bóveda como una app nativa.
        </p>

        {deferred ? (
          <button
            type="button"
            ref={(n) => n?.focus()}
            onClick={install}
            className={`${pillBase} min-h-13 w-full cursor-pointer bg-kf-carmesi-hondo px-6 text-[13px] tracking-[0.14em] text-white`}
          >
            INSTALAR AHORA
          </button>
        ) : (
          <Link
            href="https://kitifica.com/appdirecta/"
            target="_blank"
            rel="noopener noreferrer"
            ref={(n) => n?.focus()}
            className={`${pillBase} min-h-13 w-full bg-kf-carmesi-hondo px-6 text-[13px] tracking-[0.14em] text-white`}
          >
            CÓMO INSTALAR
          </Link>
        )}

        <button
          type="button"
          onClick={dismiss}
          className="min-h-11 w-full cursor-pointer text-center text-sm font-bold text-kf-carmesi-hondo underline decoration-2 underline-offset-4"
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
