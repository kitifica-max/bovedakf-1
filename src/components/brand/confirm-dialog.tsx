"use client";

import { useEffect, useId, useRef, useState } from "react";

// Brand confirmation for destructive actions. Native <dialog>: focus trap, Esc to close and a
// backdrop for free. `requireText` makes the user type a word (e.g. the client's name) to arm it.
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  requireText,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  requireText?: string;
  onConfirm: (typed: string) => Promise<string | null | void>; // gets what the user typed (server re-checks it)
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const armed = !requireText || typed.trim().toLowerCase() === requireText.trim().toLowerCase();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      onClose={() => {
        setTyped("");
        setError(null);
        onClose();
      }}
      className="m-auto w-[min(92vw,440px)] overflow-hidden rounded-[32px] border-0 bg-white p-0 text-kf-tinta shadow-2xl backdrop:bg-kf-tinta/50"
    >
      <div className="bg-kf-carmesi px-6 py-5 text-kf-manteca">
        <h2 id={`${id}-title`} className="m-0 font-brand text-[32px] leading-[1.04] font-extrabold break-words uppercase">
          {title}
        </h2>
      </div>
      <form
        method="dialog"
        className="flex flex-col gap-4 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!armed) return;
          setPending(true);
          setError(null);
          try {
            const msg = await onConfirm(typed);
            if (msg) setError(msg);
            else ref.current?.close();
          } catch {
            setError("No se pudo completar. Recargá la página e intentá de nuevo.");
          }
          setPending(false);
        }}
      >
        <div className="text-sm font-semibold text-kf-tinta-suave">{children}</div>
        {requireText && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-extrabold tracking-[0.16em] text-kf-tinta-suave uppercase">Escribí el nombre para confirmar</span>
            <span className="text-sm font-bold break-all text-kf-carmesi-hondo">{requireText}</span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className="h-12 w-full rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none focus:border-kf-carmesi sm:text-sm"
            />
          </label>
        )}
        {error && <p role="alert" className="m-0 rounded-2xl bg-kf-carmesi/10 px-4 py-2 text-sm font-semibold text-kf-carmesi-hondo">{error}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={!armed || pending}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-kf-carmesi px-5 text-xs font-extrabold tracking-[0.12em] text-white uppercase transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="min-h-11 cursor-pointer px-3 text-sm font-bold text-kf-tinta-suave hover:text-kf-tinta"
          >
            Cancelar
          </button>
        </div>
      </form>
    </dialog>
  );
}
