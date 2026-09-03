"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// The Kitifica "App Directa" popup only makes sense at the moment of intent
// to use the app — i.e. the login page. It's kept off the landing (which is
// for evaluating the pitch) and off every in-app / email-link route.
const ALLOWED = ["/login"];

export function InstallPrompt() {
  const pathname = usePathname();
  if (!ALLOWED.includes(pathname)) return null;
  return <Script src="/kap/kitifica-install-popup.js" strategy="afterInteractive" />;
}
