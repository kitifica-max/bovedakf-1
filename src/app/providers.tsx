"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

// Seeding the session from the server skips the on-mount /api/auth/session fetch.
export function Providers({ children, session }: { children: React.ReactNode; session: Session | null }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return <SessionProvider session={session}>{children}</SessionProvider>;
}
