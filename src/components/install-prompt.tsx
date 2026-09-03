"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// The Kitifica "App Directa" popup is a full-screen overlay with no dismiss
// control (public/kap/kitifica-install-popup.js). Only load it where a user
// can't get trapped: the marketing pages. Never on auth, the dashboard, the
// shared-link viewer, or the pages an email verify/reset link lands on —
// otherwise the wall blocks sign-in.
const BLOCKED = ["/login", "/register", "/reset", "/verify", "/dashboard", "/admin", "/s"];

export function InstallPrompt() {
  const pathname = usePathname();
  const blocked = BLOCKED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (blocked) return null;
  return <Script src="/kap/kitifica-install-popup.js" strategy="afterInteractive" />;
}
