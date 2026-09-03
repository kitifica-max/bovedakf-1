"use client";

import { useState } from "react";
import { signIn } from "next-auth/webauthn";
import { removePasskeyAction } from "@/app/dashboard/actions";
import { FingerprintIcon, Trash2Icon } from "@/components/icons";

type Passkey = { credentialID: string; credentialDeviceType: string; createdAt: Date };

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
        setError("No se pudo registrar la passkey.");
        return;
      }
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray/60 text-ink-soft">
            <FingerprintIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-ink">Passkeys</p>
            <p className="text-sm text-ink-soft">
              Entrá con Face ID, Touch ID o Windows Hello — sin contraseña.
            </p>
          </div>
        </div>
        <button
          onClick={addPasskey}
          disabled={pending}
          className="shrink-0 cursor-pointer rounded-full bg-ink px-4 py-2 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "..." : "Agregar passkey"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <p className="mt-3 border-t border-border-soft pt-3 text-xs text-ink-soft">
        Al tocar &quot;Agregar passkey&quot; tu navegador te va a pedir tu huella, cara o PIN —
        no una app de autenticación. Si te aparece un código QR, es para usar una passkey
        que ya tenés guardada en tu celular: escaneala con la cámara (no con un lector de
        códigos ni una app de 2FA).
      </p>

      {passkeys.length > 0 && (
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
      )}
    </div>
  );
}
