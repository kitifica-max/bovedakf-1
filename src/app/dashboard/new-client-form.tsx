"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientAction } from "./actions";
import { CLIENT_COLORS } from "@/lib/platforms";

export function NewClientForm({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-45 w-full cursor-pointer items-center justify-center rounded-[32px] border-3 border-dashed border-[#c9cedd] p-6 text-center font-brand text-[28px] leading-[1.1] font-extrabold text-kf-tinta-suave uppercase transition hover:border-kf-azul hover:text-kf-azul"
      >
        + Agregar cliente
      </button>
    );
  }

  return (
    <form
      id="nuevo-cliente"
      className="flex min-h-45 flex-col gap-4 rounded-[32px] border-2 border-kf-borde p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        try {
          const result = await createClientAction(new FormData(e.currentTarget));
          if (result.error === null) return router.push(`/dashboard/${result.id}`);
          setError(result.error);
        } catch {
          setError("Error al crear el cliente. Recargá la página e intentá de nuevo.");
        }
        setPending(false);
      }}
    >
      <label className="flex flex-col gap-1.5 text-xs font-extrabold tracking-[0.14em] text-kf-tinta-suave">
        NOMBRE DEL CLIENTE
        <input
          name="name"
          required
          maxLength={60}
          autoFocus
          placeholder="Ej. Panadería Lula"
          className="h-12 w-full rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold tracking-normal text-kf-tinta outline-none transition focus:border-kf-azul sm:text-sm"
        />
      </label>
      <fieldset className="flex flex-wrap gap-2.5">
        <legend className="mb-1.5 text-xs font-extrabold tracking-[0.14em] text-kf-tinta-suave">COLOR</legend>
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
      {error && <p role="alert" className="rounded-2xl bg-kf-carmesi/10 px-4 py-2 text-sm font-semibold text-kf-carmesi-hondo">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button
          disabled={pending}
          className="h-11 cursor-pointer rounded-full bg-kf-azul px-6 text-xs font-extrabold tracking-[0.14em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "CREANDO..." : "CREAR CLIENTE"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-11 cursor-pointer px-3 text-sm font-bold text-kf-tinta-suave hover:text-kf-tinta">
          Cancelar
        </button>
      </div>
    </form>
  );
}
