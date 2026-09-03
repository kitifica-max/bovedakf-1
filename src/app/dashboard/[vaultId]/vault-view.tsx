"use client";

import { useId, useState } from "react";
import type { AuditLog, Credential, ShareLink, Vault } from "@prisma/client";
import {
  createCredentialAction,
  createShareLinkAction,
  deleteCredentialAction,
  revealCredentialAction,
  revokeShareLinkAction,
} from "../actions";
import { ChevronDownIcon, EyeIcon, EyeOffIcon, Link2Icon, Share2Icon, ShieldCheckIcon, Trash2Icon, XCircleIcon } from "@/components/icons";
import { CopyButton } from "@/components/copy-button";
import { DashboardSurvey } from "@/components/dashboard-survey";

type CredentialWithLinks = Credential & { shareLinks: ShareLink[] };
type VaultWithCredentials = Vault & { credentials: CredentialWithLinks[] };

const inputCls =
  "w-full rounded-2xl border border-border-soft bg-gray/40 px-3 py-2 text-sm outline-none transition focus:border-ink";
const linkBtnCls =
  "flex cursor-pointer items-center gap-1 text-ink-soft underline decoration-border-soft underline-offset-4 transition hover:text-ink";
const dangerLinkBtnCls =
  "flex cursor-pointer items-center gap-1 text-danger underline decoration-danger/30 underline-offset-4 transition hover:decoration-danger";

export function VaultView({
  vault,
  auditLogs,
  showSurvey,
}: {
  vault: VaultWithCredentials;
  auditLogs: AuditLog[];
  showSurvey: boolean;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-blue text-paper">
          <ShieldCheckIcon className="h-4 w-4" />
        </span>
        <h1 className="font-pixel text-xl leading-[1.3] tracking-tight text-ink">{vault.name}</h1>
      </div>
      {showSurvey && <DashboardSurvey />}
      <AddCredentialForm vaultId={vault.id} />
      <ul className="flex flex-col gap-3">
        {vault.credentials.map((c) => (
          <CredentialRow key={c.id} vaultId={vault.id} credential={c} />
        ))}
        {vault.credentials.length === 0 && (
          <p className="rounded-3xl border border-dashed border-border-soft p-6 text-center text-sm text-ink-soft">
            Sin credenciales todavía.
          </p>
        )}
      </ul>
      <AuditLogTable logs={auditLogs} />
    </div>
  );
}

function AddCredentialForm({ vaultId }: { vaultId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const idPrefix = useId();

  return (
    <form
      className="flex flex-col gap-2 rounded-2xl border border-border-soft bg-paper p-5"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const formData = new FormData(e.currentTarget);
        const result = await createCredentialAction(formData);
        setPending(false);
        if (result) {
          setError(result);
          return;
        }
        (e.target as HTMLFormElement).reset();
      }}
    >
      <input type="hidden" name="vaultId" value={vaultId} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`${idPrefix}-service`} className="sr-only">Servicio</label>
          <input id={`${idPrefix}-service`} name="service" placeholder="Servicio (ej. AWS)" required className={inputCls} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-username`} className="sr-only">Usuario</label>
          <input id={`${idPrefix}-username`} name="username" placeholder="Usuario" required className={inputCls} />
        </div>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-secret`} className="sr-only">Contraseña o secreto</label>
        <input id={`${idPrefix}-secret`} name="secret" placeholder="Contraseña / secreto" required className={inputCls} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-notes`} className="sr-only">Notas</label>
        <textarea id={`${idPrefix}-notes`} name="notes" placeholder="Notas (opcional)" className={inputCls} />
      </div>
      {error && <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <button
        disabled={pending}
        className="mt-1 cursor-pointer self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Añadir credencial"}
      </button>
    </form>
  );
}

function CredentialRow({ vaultId, credential }: { vaultId: string; credential: CredentialWithLinks }) {
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState<{ secret: string; notes: string } | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const idPrefix = useId();

  function toggleExpanded() {
    setExpanded((wasExpanded) => {
      if (wasExpanded) {
        // Collapsing — close any open secret/share panel so it doesn't linger hidden.
        setRevealed(null);
        setSharing(false);
        setShareUrl(null);
        setShareError(null);
      }
      return !wasExpanded;
    });
  }

  return (
    <li className="rounded-2xl border border-border-soft bg-paper p-5">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
        aria-expanded={expanded}
        onClick={toggleExpanded}
      >
        <div>
          <p className="font-display text-lg font-semibold text-ink">{credential.service}</p>
          <p className="text-sm text-ink-soft">{credential.username}</p>
        </div>
        <ChevronDownIcon
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
      <>
      <div className="mt-4 flex justify-end gap-3 border-t border-border-soft pt-4 text-sm">
          <button
            className={linkBtnCls}
            aria-expanded={!!revealed}
            onClick={async () => {
              if (revealed) return setRevealed(null);
              const data = await revealCredentialAction(vaultId, credential.id);
              setRevealed(data);
            }}
          >
            {revealed ? <EyeOffIcon aria-hidden="true" className="h-3.5 w-3.5" /> : <EyeIcon aria-hidden="true" className="h-3.5 w-3.5" />}
            {revealed ? "Ocultar" : "Ver"}
          </button>
          <button className={linkBtnCls} aria-expanded={sharing} onClick={() => setSharing((s) => !s)}>
            <Share2Icon aria-hidden="true" className="h-3.5 w-3.5" />
            Compartir
          </button>
          <button
            className={dangerLinkBtnCls}
            onClick={() => deleteCredentialAction(vaultId, credential.id)}
          >
            <Trash2Icon aria-hidden="true" className="h-3.5 w-3.5" />
            Eliminar
          </button>
      </div>

      {revealed && (
        <div className="mt-4 flex flex-col gap-1.5 rounded-2xl bg-gray/60 p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <p>
              <span className="text-ink-soft">Secreto:</span>{" "}
              <code className="select-all rounded bg-paper px-1.5 py-0.5">{revealed.secret}</code>
            </p>
            <CopyButton value={revealed.secret} label="Copiar secreto" />
          </div>
          {revealed.notes && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-ink-soft">Notas: {revealed.notes}</p>
              <CopyButton value={revealed.notes} label="Copiar notas" />
            </div>
          )}
        </div>
      )}

      {sharing && (
        <form
          className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-soft pt-4"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            setShareError(null);
            const formData = new FormData(e.currentTarget);
            formData.set("credentialId", credential.id);
            const result = await createShareLinkAction(vaultId, formData);
            if (typeof result === "string") {
              setShareError(result);
              return;
            }
            setShareUrl(`${window.location.origin}/s/${result.publicId}#k=${result.key}`);
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={`${idPrefix}-permission`} className="sr-only">Permiso del link</label>
            <div className="relative w-auto">
              <select
                id={`${idPrefix}-permission`}
                name="permission"
                className={`${inputCls} w-auto cursor-pointer appearance-none py-1.5 pr-9`}
              >
                <option value="READ">Solo lectura</option>
                <option value="DOWNLOAD">Lectura + descarga</option>
              </select>
              <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
            </div>
            <label htmlFor={`${idPrefix}-expires`} className="sr-only">Expiración del link</label>
            <div className="relative w-auto">
              <select
                id={`${idPrefix}-expires`}
                name="expiresInHours"
                defaultValue="24"
                className={`${inputCls} w-auto cursor-pointer appearance-none py-1.5 pr-9`}
              >
                <option value="1">1 hora</option>
                <option value="24">24 horas</option>
                <option value="72">3 días</option>
                <option value="168">7 días</option>
              </select>
              <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
            </div>
          </div>
          <button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-soft px-4 py-1.5 text-sm font-medium text-ink-reverse transition hover:brightness-95">
            <Link2Icon aria-hidden="true" className="h-3.5 w-3.5" />
            Generar link
          </button>
          {shareError && (
            <p role="alert" className="w-full rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
              {shareError}
            </p>
          )}
        </form>
      )}

      {shareUrl && (
        <div className="mt-3 rounded-2xl border border-blue bg-blue/10 p-3 text-sm">
          <p className="mb-1.5 text-ink">
            Copia este link ahora — la clave de descifrado no se guarda, no podrás verla otra vez.
          </p>
          <div className="flex items-center gap-1.5 rounded-xl border border-border-soft bg-paper pr-1.5">
            <label htmlFor={`${idPrefix}-share-url`} className="sr-only">Link compartible</label>
            <input
              id={`${idPrefix}-share-url`}
              readOnly
              value={shareUrl}
              className="w-full min-w-0 bg-transparent px-3 py-2 text-xs outline-none"
              onFocus={(e) => e.currentTarget.select()}
            />
            <CopyButton value={shareUrl} label="Copiar link" />
          </div>
        </div>
      )}

      {credential.shareLinks.length > 0 && (
        <div className="mt-4 border-t border-border-soft pt-4 text-sm">
          <p className="mb-2 text-ink-soft">Links generados</p>
          <ul className="flex flex-col gap-1.5">
            {credential.shareLinks.map((l) => {
              const status = l.revokedAt ? "revocado" : l.expiresAt < new Date() ? "expirado" : "activo";
              const badgeCls =
                status === "activo"
                  ? "bg-blue-soft text-ink-reverse"
                  : status === "expirado"
                    ? "bg-gray text-ink-soft"
                    : "bg-danger/10 text-danger";
              return (
                <li key={l.id} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeCls}`}>
                      {status}
                    </span>
                    <span className="text-ink-soft">
                      {l.permission === "READ" ? "Lectura" : "Descarga"} · expira{" "}
                      {l.expiresAt.toLocaleString()}
                    </span>
                  </span>
                  {status === "activo" && (
                    <button className={dangerLinkBtnCls} onClick={() => revokeShareLinkAction(vaultId, l.id)}>
                      <XCircleIcon aria-hidden="true" className="h-3.5 w-3.5" />
                      Revocar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      </>
      )}
    </li>
  );
}

function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-paper p-5">
      <h2 className="mb-3 font-display text-lg font-semibold text-ink">Auditoría</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Historial de accesos y acciones sobre esta bóveda</caption>
          <thead>
            <tr className="border-b border-border-soft text-ink-soft">
              <th scope="col" className="py-1.5 pr-4 font-medium">Cuándo</th>
              <th scope="col" className="py-1.5 pr-4 font-medium">Acción</th>
              <th scope="col" className="py-1.5 pr-4 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border-soft last:border-0">
                <td className="py-1.5 pr-4 text-ink-soft">{log.createdAt.toLocaleString()}</td>
                <td className="py-1.5 pr-4">{log.action}</td>
                <td className="py-1.5 pr-4 text-ink-soft">{log.ipAddress ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td className="py-2 text-ink-soft" colSpan={3}>
                  Sin actividad todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
