"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { updateCompanyNameAction } from "../actions";
import { changePasswordAction, deleteAccountAction } from "./actions";
import { fieldCls, kicker, pillFill, pillLine } from "@/components/brand/styles";

const errorCls = "m-0 rounded-2xl bg-kf-carmesi/10 px-4 py-2 text-sm font-semibold text-kf-carmesi-hondo";
const okCls = "m-0 rounded-2xl bg-kf-lima px-4 py-2 text-sm font-bold text-kf-bosque-hondo";

export function CompanyForm({ initialName }: { initialName: string }) {
  const { update } = useSession();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setStatus(null);
        const fd = new FormData(e.currentTarget);
        const error = await updateCompanyNameAction(fd);
        if (!error) await update({ companyName: fd.get("companyName") });
        setStatus(error ? { ok: false, msg: error } : { ok: true, msg: "Nombre guardado." });
        setPending(false);
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className={kicker}>Nombre de la agencia</span>
        <input name="companyName" required maxLength={120} defaultValue={initialName} className={fieldCls} />
      </label>
      {status && <p role={status.ok ? "status" : "alert"} className={status.ok ? okCls : errorCls}>{status.msg}</p>}
      <button disabled={pending} className={`${pillFill} self-start`}>
        {pending ? "GUARDANDO..." : "GUARDAR NOMBRE"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setPending(true);
        setStatus(null);
        try {
          const { error } = await changePasswordAction(new FormData(form));
          if (error) setStatus({ ok: false, msg: error });
          else {
            form.reset();
            setStatus({ ok: true, msg: "Contraseña actualizada." });
          }
        } catch {
          setStatus({ ok: false, msg: "Error al guardar. Recargá la página e intentá de nuevo." });
        }
        setPending(false);
      }}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className={kicker}>Actual</span>
          <input name="current" type="password" required autoComplete="current-password" className={fieldCls} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className={kicker}>Nueva (mín. 10)</span>
          <input name="next" type="password" required minLength={10} autoComplete="new-password" className={fieldCls} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className={kicker}>Repetir nueva</span>
          <input name="confirm" type="password" required minLength={10} autoComplete="new-password" className={fieldCls} />
        </label>
      </div>
      {status && <p role={status.ok ? "status" : "alert"} className={status.ok ? okCls : errorCls}>{status.msg}</p>}
      <button disabled={pending} className={`${pillFill} self-start`}>
        {pending ? "GUARDANDO..." : "CAMBIAR CONTRASEÑA"}
      </button>
    </form>
  );
}

export function DeleteAccountForm({ email, ownedClients, sharedWith }: { email: string; ownedClients: number; sharedWith: number }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${pillLine} self-start border-kf-carmesi text-kf-carmesi hover:bg-kf-carmesi hover:text-white`}>
        ELIMINAR MI CUENTA
      </button>
    );
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-[28px] bg-kf-carmesi/10 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        try {
          // On success the action signs out and redirects; only a failure returns here.
          const { error: msg } = await deleteAccountAction(new FormData(e.currentTarget));
          if (msg) setError(msg);
        } catch {
          setError("Error al eliminar. Recargá la página e intentá de nuevo.");
        }
        setPending(false);
      }}
    >
      <div className="flex flex-col gap-2 text-sm font-semibold text-kf-carmesi-hondo">
        <p className="m-0 font-extrabold">Esto no se puede deshacer. Se borran para siempre:</p>
        <ul className="m-0 flex flex-col gap-1 pl-5">
          <li>
            {ownedClients === 1 ? "Tu cliente" : `Tus ${ownedClients} clientes`}, con sus cuentas, códigos 2FA, links y auditoría.
          </li>
          {sharedWith > 0 && (
            <li>
              El acceso de {sharedWith === 1 ? "1 persona" : `${sharedWith} personas`} de tu equipo a esos clientes.
            </li>
          )}
          <li>Tu saldo de links, que no se reembolsa.</li>
        </ul>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className={kicker}>Escribí tu email para confirmar</span>
        <span className="text-sm font-bold break-all text-kf-carmesi-hondo">{email}</span>
        <input name="confirmEmail" type="email" required autoComplete="off" className={fieldCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={kicker}>Tu contraseña</span>
        <input name="password" type="password" required autoComplete="current-password" className={fieldCls} />
      </label>
      {error && <p role="alert" className={errorCls}>{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button
          disabled={pending}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-kf-carmesi px-5 text-xs font-extrabold tracking-[0.12em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "ELIMINANDO..." : "ELIMINAR PARA SIEMPRE"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="min-h-11 cursor-pointer px-3 text-sm font-bold text-kf-tinta-suave hover:text-kf-tinta">
          Cancelar
        </button>
      </div>
    </form>
  );
}
