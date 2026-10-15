"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DownloadIcon, EyeIcon, EyeOffIcon } from "@/components/icons";
import { CopyButton } from "@/components/copy-button";
import { KitificaCredit } from "@/components/kitifica-credit";
import { LogoBadge } from "@/components/brand/logo-badge";

type Payload = { service: string; username: string; secret: string; notes?: string };

function base64ToBytes(b64: string) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function base64urlToBytes(b64url: string) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  return base64ToBytes(b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "="));
}

async function decryptPayload(payloadB64: string, keyB64url: string): Promise<Payload> {
  const raw = base64ToBytes(payloadB64);
  const iv = raw.slice(0, 12);
  const tag = raw.slice(12, 28);
  const ciphertext = raw.slice(28);
  const dataWithTag = new Uint8Array(ciphertext.length + tag.length);
  dataWithTag.set(ciphertext, 0);
  dataWithTag.set(tag, ciphertext.length);

  const keyBytes = base64urlToBytes(keyB64url);
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, dataWithTag);
  return JSON.parse(new TextDecoder().decode(plaintext));
}

export function SharedCredentialView() {
  const { publicId } = useParams<{ publicId: string }>();
  const [secretVisible, setSecretVisible] = useState(false);
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; data: Payload; permission: "READ" | "DOWNLOAD" }
  >(() => {
    if (typeof window === "undefined") return { status: "loading" };
    const key = window.location.hash.match(/k=([^&]+)/)?.[1];
    if (!key) return { status: "error", message: "Link incompleto: falta la clave de descifrado." };
    return { status: "loading" };
  });

  useEffect(() => {
    const key = window.location.hash.match(/k=([^&]+)/)?.[1];
    if (!key) return; // already reflected in the initial state above

    fetch(`/api/share/${publicId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setState({
            status: "error",
            message: (body.error as string) ?? "No se pudo cargar el link.",
          });
          return;
        }
        const body = (await res.json()) as { payload: string; permission: "READ" | "DOWNLOAD" };
        try {
          const data = await decryptPayload(body.payload, key);
          setState({ status: "ready", data, permission: body.permission });
        } catch {
          setState({
            status: "error",
            message: "No se pudo descifrar el contenido. Verifica que el enlace esté completo.",
          });
        }
      })
      .catch(() =>
        setState({
          status: "error",
          message: "Error de red. Verifica tu conexión e inténtalo de nuevo.",
        })
      );
  }, [publicId]);

  return (
    <main className="kf-app flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[40px] border-2 border-kf-borde bg-white">
        {/* Seal on its own row so the condensed title gets the full width at any screen size. */}
        <div className="flex flex-col gap-3 bg-kf-azul px-6 py-7 text-white sm:px-10">
          <LogoBadge id="kf-ring-share" title="Bóveda KF-1" ink="#ffffff" center="var(--kf-manteca)" className="h-20 w-20 shrink-0 self-end" />
          <h1 className="m-0 font-brand text-[clamp(36px,11vw,48px)] leading-[1.04] font-extrabold break-words uppercase">
            Te compartieron una cuenta
          </h1>
        </div>
        <div className="p-6 sm:p-10">

        <div aria-live="polite">
          {state.status === "loading" && (
            <p className="m-0 text-sm font-semibold text-kf-tinta-suave">Descifrando en tu navegador…</p>
          )}
          {state.status === "error" && (
            <p role="alert" className="m-0 rounded-2xl bg-kf-carmesi/10 px-4 py-3 text-sm font-semibold text-kf-carmesi-hondo">
              {state.message}
            </p>
          )}
        </div>

        {state.status === "ready" && (
          <div className="flex flex-col gap-2.5 rounded-[28px] bg-kf-niebla p-5 text-sm font-semibold">
            <div className="flex items-center justify-between gap-2">
              <p><span className="text-ink-soft">Servicio:</span> {state.data.service}</p>
              <CopyButton value={state.data.service} label="Copiar servicio" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p><span className="text-ink-soft">Usuario:</span> {state.data.username}</p>
              <CopyButton value={state.data.username} label="Copiar usuario" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5">
                <span className="text-ink-soft">Secreto:</span>{" "}
                <code className="rounded-lg bg-white px-2 py-1 font-mono text-base select-all">
                  {secretVisible ? state.data.secret : "•".repeat(Math.min(state.data.secret.length, 14))}
                </code>
              </p>
              <span className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  aria-label={secretVisible ? "Ocultar secreto" : "Ver secreto"}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full p-1.5 text-ink-soft transition hover:bg-paper hover:text-ink"
                  onClick={() => setSecretVisible((v) => !v)}
                >
                  {secretVisible ? (
                    <EyeOffIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  ) : (
                    <EyeIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  )}
                </button>
                <CopyButton value={state.data.secret} label="Copiar secreto" />
              </span>
            </div>
            {state.data.notes && (
              <div className="flex items-center justify-between gap-2">
                <p className="text-ink-soft">Notas: {state.data.notes}</p>
                <CopyButton value={state.data.notes} label="Copiar notas" />
              </div>
            )}

            {state.permission === "DOWNLOAD" && (
              <button
                className="mt-3 flex h-11 cursor-pointer items-center gap-1.5 self-start rounded-full bg-kf-azul px-5 text-xs font-extrabold tracking-[0.12em] text-white uppercase transition hover:opacity-90"
                onClick={() => {
                  const blob = new Blob(
                    [
                      `Servicio: ${state.data.service}\nUsuario: ${state.data.username}\nSecreto: ${state.data.secret}\nNotas: ${state.data.notes ?? ""}\n`,
                    ],
                    { type: "text/plain" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${state.data.service}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <DownloadIcon aria-hidden="true" className="h-4 w-4" />
                Descargar
              </button>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-2 border-t-2 border-kf-borde pt-5 text-center">
          <p className="text-xs text-ink-soft">
            ¿Recibiste esto por chat o email antes?{" "}
            <Link href="/" className="font-bold text-kf-azul underline decoration-2 underline-offset-4">
              Compartí credenciales seguras con Bóveda KF-1
            </Link>
          </p>
          <KitificaCredit />
        </div>
        </div>
      </div>
    </main>
  );
}
