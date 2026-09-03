"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DownloadIcon } from "@/components/icons";

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
          throw new Error(body.error ?? "No se pudo cargar el link.");
        }
        return res.json();
      })
      .then(async (body: { payload: string; permission: "READ" | "DOWNLOAD" }) => {
        const data = await decryptPayload(body.payload, key);
        setState({ status: "ready", data, permission: body.permission });
      })
      .catch((err: Error) => setState({ status: "error", message: err.message }));
  }, [publicId]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, not photographic content */}
        <img src="/logo-on-dark.svg" alt="Bóveda KF-1" className="mb-5 h-6 w-auto" />
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Credencial compartida
        </h1>

        <div aria-live="polite">
          {state.status === "loading" && (
            <p className="mt-4 text-sm text-ink-soft">Descifrando en tu navegador…</p>
          )}
          {state.status === "error" && (
            <p role="alert" className="mt-4 rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.message}
            </p>
          )}
        </div>

        {state.status === "ready" && (
          <div
            className={`mt-5 flex flex-col gap-1.5 rounded-2xl bg-gray/60 p-4 text-sm ${state.permission === "READ" ? "select-none" : ""}`}
            onCopy={(e) => {
              if (state.permission === "READ") e.preventDefault();
            }}
            onContextMenu={(e) => {
              if (state.permission === "READ") e.preventDefault();
            }}
          >
            <p><span className="text-ink-soft">Servicio:</span> {state.data.service}</p>
            <p><span className="text-ink-soft">Usuario:</span> {state.data.username}</p>
            <p>
              <span className="text-ink-soft">Secreto:</span>{" "}
              <code className="rounded bg-paper px-1.5 py-0.5 select-all">{state.data.secret}</code>
            </p>
            {state.data.notes && <p className="text-ink-soft">Notas: {state.data.notes}</p>}

            {state.permission === "DOWNLOAD" && (
              <button
                className="mt-3 flex cursor-pointer items-center gap-1.5 self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-gray transition hover:bg-ink/90"
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
      </div>
    </main>
  );
}
