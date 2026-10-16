"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SystemPage } from "@/components/brand/system-page";
import { pillFill, pillLine } from "@/components/brand/styles";

// Route-level error boundary. The message stays generic: error details can hold data the user shouldn't see.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SystemPage
      code="500"
      pair="carmesi"
      icon="refund"
      title="Algo salió mal"
      lead="No pudimos cargar esta pantalla. Tus datos están a salvo: probá de nuevo en unos segundos."
    >
      <button type="button" onClick={reset} className={pillFill}>REINTENTAR</button>
      <Link href="/dashboard" className={pillLine}>IR A MIS CLIENTES</Link>
      {error.digest && <p className="m-0 w-full text-xs font-semibold text-kf-tinta-suave">Código de referencia: {error.digest}</p>}
    </SystemPage>
  );
}
