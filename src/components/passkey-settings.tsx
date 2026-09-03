"use client";

import { useState } from "react";
import { signIn } from "next-auth/webauthn";
import { removePasskeyAction } from "@/app/dashboard/actions";
import { ChevronDownIcon, FingerprintIcon, Trash2Icon } from "@/components/icons";

type Passkey = { credentialID: string; credentialDeviceType: string; createdAt: Date };

const STEPS = [
  "Tocás “Crear passkey”.",
  "Tu dispositivo te pide la huella, la cara, o el PIN — no escribís nada.",
  "Listo. La próxima vez entrás con eso, sin contraseña.",
];

export function PasskeySettings({ initialPasskeys }: { initialPasskeys: Passkey[] }) {
  const [passkeys, setPasskeys] = useState(initialPasskeys);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addPasskey() {
    setPending(true);
    setError(null);
    try {
      const result = await signIn("passkey", { action: "register", redirect: false });
      if (result?.error) {
        setError("No se pudo crear la passkey. Probá de nuevo.");
        return;
      }
      try {
        localStorage.setItem("boveda-has-passkey", "1");
      } catch {}
      // The provider doesn't return the new row directly — refresh from the server.
      window.location.reload();
    } catch {
      setError("Tu navegador o dispositivo no soporta passkeys, o cancelaste la solicitud.");
    } finally {
      setPending(false);
    }
  }

  async function remove(credentialID: string) {
    setPending(true);
    setError(null);
    const result = await removePasskeyAction(credentialID);
    setPending(false);
    if (result) {
      setError(result);
      return;
    }
    setPasskeys((prev) => prev.filter((p) => p.credentialID !== credentialID));
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-paper p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray/60 text-ink-soft">
          <FingerprintIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-ink">Entrar sin contraseña</p>
          <p className="text-sm text-ink-soft">Con tu huella, tu cara, o el PIN del dispositivo (passkey).</p>
        </div>
      </div>

      {passkeys.length === 0 ? (
        <>
          <ol className="mt-4 flex flex-col gap-2 border-t border-border-soft pt-4 text-sm text-ink-soft">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-2.5">
                <span className="font-display grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-soft text-[11px] font-semibold text-ink-reverse">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <button
            onClick={addPasskey}
            disabled={pending}
            className="mt-4 w-full cursor-pointer rounded-full bg-ink px-4 py-3 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Creando..." : "Crear passkey"}
          </button>
        </>
      ) : (
        <>
          <ul className="mt-4 flex flex-col gap-1.5 border-t border-border-soft pt-4 text-sm">
            {passkeys.map((p) => (
              <li key={p.credentialID} className="flex items-center justify-between gap-2">
                <span className="text-ink-soft">
                  {p.credentialDeviceType === "multiDevice" ? "Sincronizada" : "Este dispositivo"} · agregada{" "}
                  {p.createdAt.toLocaleDateString()}
                </span>
                <button
                  onClick={() => remove(p.credentialID)}
                  disabled={pending}
                  className="flex cursor-pointer items-center gap-1 text-danger underline decoration-danger/30 underline-offset-4 transition hover:decoration-danger disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={addPasskey}
            disabled={pending}
            className="mt-3 cursor-pointer text-sm text-ink-soft underline decoration-border-soft underline-offset-4 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Creando..." : "+ Agregar otra passkey"}
          </button>
        </>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <details className="group mt-4 border-t border-border-soft pt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-medium text-ink-soft marker:hidden">
          ¿Me sale un código QR? Qué hacer
          <ChevronDownIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 transition group-open:rotate-180" />
        </summary>
        <p className="mt-2 text-xs text-ink-soft">
          Ese QR es para usar una passkey guardada en tu celular desde otra computadora.
          Escaneala con la <strong>cámara del celular</strong> — no es un código de una app de
          autenticación (2FA) ni hace falta si vas a usar el mismo dispositivo.
        </p>
      </details>
    </div>
  );
}
