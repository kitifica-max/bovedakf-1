"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateClientAction } from "./actions";
import { CLIENT_COLORS } from "@/lib/platforms";
import { FieldMsg, useInlineValidation } from "@/components/use-inline-validation";
import { fieldCls, kicker, pillFill } from "@/components/brand/styles";

// Step 1 of the welcome: the signup's empty client gets its real name and color, then we go add accounts.
export function FirstClientForm({ vaultId }: { vaultId: string }) {
  const v = useInlineValidation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!v.validateAll(e.currentTarget)) return;
        setPending(true);
        setError(null);
        try {
          const msg = await updateClientAction(vaultId, new FormData(e.currentTarget));
          if (!msg) return router.push(`/dashboard/${vaultId}`);
          setError(msg);
        } catch {
          setError("Error al guardar. Recargá la página e intentá de nuevo.");
        }
        setPending(false);
      }}
      {...v.formProps}
    >
      <label className="flex flex-col gap-1.5">
        <span className={kicker}>Nombre del cliente</span>
        <input name="name" required maxLength={60} autoComplete="off" placeholder="Ej. Panadería Lula" className={fieldCls} />
        <FieldMsg v={v} name="name" />
      </label>
      <fieldset className="m-0 flex flex-wrap gap-2.5 border-0 p-0">
        <legend className={`${kicker} mb-1.5`}>Su color en la bóveda</legend>
        {CLIENT_COLORS.map((c, i) => (
          <label key={c.id} className="cursor-pointer" title={c.label}>
            <input type="radio" name="color" value={c.id} defaultChecked={i === 0} className="peer sr-only" />
            <span
              style={{ background: c.bg, color: c.ink }}
              className="grid h-11 w-11 place-items-center rounded-full font-brand text-lg font-extrabold ring-kf-tinta ring-offset-2 peer-checked:ring-3 peer-focus-visible:ring-3"
              aria-hidden="true"
            >
              Aa
            </span>
            <span className="sr-only">{c.label}</span>
          </label>
        ))}
      </fieldset>
      {error && <p role="alert" className="m-0 rounded-2xl bg-kf-carmesi/10 px-4 py-2 text-sm font-semibold text-kf-carmesi-hondo">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className={pillFill}>
          {pending ? "GUARDANDO..." : "CONTINUAR"}
        </button>
        <Link href="/dashboard?omitir=1" className="inline-flex min-h-11 items-center text-[13px] font-bold text-kf-tinta-suave underline decoration-2 underline-offset-4 hover:text-kf-tinta">
          Saltar por ahora
        </Link>
      </div>
    </form>
  );
}
