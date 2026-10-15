"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buyLinksAction } from "@/app/dashboard/actions";

export function BuyPackButton({ links, label }: { links: number; label: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function buy() {
    start(async () => {
      setError(null);
      const res = await buyLinksAction(links);
      if (res.error !== null) return setError(res.error);
      window.location.href = res.url;
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={buy}
        disabled={pending}
        className="rounded-full bg-blue py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Abriendo pago…" : label}
      </button>
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  );
}

// After Wompi redirects back, poll until the webhook marks the purchase as paid.
export function PurchasePoller() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (seconds >= 60) return;
    const t = setTimeout(() => {
      setSeconds((s) => s + 3);
      router.refresh();
    }, 3000);
    return () => clearTimeout(t);
  }, [seconds, router]);

  return seconds >= 60 ? (
    <p className="text-sm text-ink-soft">
      Todavía no recibimos la confirmación de Wompi. Si el pago se aprobó, los links aparecen en unos minutos. Si fue rechazado, no se hizo ningún cobro.
    </p>
  ) : (
    <p className="flex items-center gap-2 text-sm text-ink-soft">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue border-t-transparent" />
      Confirmando tu pago…
    </p>
  );
}
