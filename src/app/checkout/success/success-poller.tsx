"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MAX_SECONDS = 60;
const POLL_INTERVAL = 3000;

export function SuccessPoller() {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (elapsed >= MAX_SECONDS) return;
    const t = setTimeout(() => {
      setElapsed((e) => e + POLL_INTERVAL / 1000);
      router.refresh();
    }, POLL_INTERVAL);
    return () => clearTimeout(t);
  }, [elapsed, router]);

  if (elapsed >= MAX_SECONDS) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-border-soft bg-paper p-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-blue/10">
          <svg className="h-6 w-6 text-blue" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="font-display text-lg font-semibold text-ink">Todavía no recibimos la confirmación</p>
        <p className="mt-2 text-sm text-ink-soft">
          Si el pago se aprobó, tu plan se activa en unos minutos y te llega el recibo por email.
          Si fue rechazado, no se hizo ningún cobro y podés intentarlo de nuevo.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            href="/dashboard/billing"
            className="inline-block rounded-full bg-blue px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Ir a facturación →
          </Link>
          <Link href="/dashboard/plans" className="text-sm text-ink-soft underline hover:text-ink">
            Intentar el pago de nuevo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border-soft bg-paper p-8 text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue border-t-transparent" />
      <p className="font-display text-lg font-semibold text-ink">Confirmando pago…</p>
      <p className="mt-2 text-sm text-ink-soft">Esto tarda unos segundos.</p>
    </div>
  );
}
