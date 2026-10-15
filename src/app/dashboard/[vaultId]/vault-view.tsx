"use client";

import { useEffect, useId, useState } from "react";
import type { AuditLog, Credential, ShareLink, Vault } from "@prisma/client";
import {
  createCredentialAction,
  createShareLinkAction,
  deleteCredentialAction,
  revealCredentialAction,
  revokeShareLinkAction,
  setTotpAction,
  totpCodeAction,
  updateCredentialAction,
  updateClientAction,
  deleteClientAction,
} from "../actions";
import { ConfirmDialog } from "@/components/brand/confirm-dialog";
import { ChevronDownIcon } from "@/components/icons";
import { CopyButton } from "@/components/copy-button";
import { DashboardSurvey } from "@/components/dashboard-survey";
import { VerifyBanner } from "@/components/verify-banner";
import { VerifyResult } from "@/components/verify-result";
import { VaultMembers } from "@/components/vault-members";
import { AiAccessPanel } from "@/components/ai-access-panel";
import { PlatformIcon } from "@/components/brand/platform-icon";
import { CLIENT_COLORS, PLATFORMS, clientColor, platformOf } from "@/lib/platforms";

type Role = "OWNER" | "EDITOR" | "VIEWER";
type Tab = "cuentas" | "actividad" | "equipo";

type CredentialWithLinks = Credential & { shareLinks: ShareLink[] };
type VaultWithCredentials = Vault & { credentials: CredentialWithLinks[] };

// Canvas building blocks: pill buttons (filled / outline / quiet), pill inputs, kicker labels.
const pill = "inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full px-5 text-xs font-extrabold tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-50";
const pillFill = `${pill} bg-kf-azul text-white hover:opacity-90`;
const pillLine = `${pill} border-2 border-kf-azul bg-white text-kf-azul hover:bg-kf-azul hover:text-white`;
const pillDanger = `${pill} border-2 border-kf-carmesi bg-white text-kf-carmesi hover:bg-kf-carmesi hover:text-white`;
const quietBtn = "inline-flex h-11 cursor-pointer items-center px-3 text-[13px] font-bold text-kf-tinta transition hover:text-kf-azul";
const inputCls =
  "h-12 w-full rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm";
const kicker = "text-xs font-extrabold tracking-[0.18em] text-kf-tinta-suave";

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Propietario",
  EDITOR: "Editor",
  VIEWER: "Lector",
};

const TABS: { id: Tab; label: string }[] = [
  { id: "cuentas", label: "Cuentas" },
  { id: "actividad", label: "Auditoría" },
  { id: "equipo", label: "Equipo" },
];

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export function VaultView({
  vault,
  auditLogs,
  showSurvey,
  emailVerified,
  role,
  members,
  invites,
}: {
  vault: VaultWithCredentials;
  auditLogs: AuditLog[];
  showSurvey: boolean;
  emailVerified: boolean;
  role: Role;
  members: { id: string; email: string; role: Role }[];
  invites: { id: string; email: string; role: Role }[];
}) {
  const canEdit = role === "OWNER" || role === "EDITOR";
  const [activeTab, setActiveTab] = useState<Tab>("cuentas");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState(false);
  const [deletingClient, setDeletingClient] = useState(false);
  const color = clientColor(vault.color);
  const count = vault.credentials.length;
  // Grouped in catalog order; platforms without credentials are skipped.
  const groups = PLATFORMS.map((p) => ({
    platform: p,
    credentials: vault.credentials.filter((c) => platformOf(c.platform).id === p.id),
  })).filter((g) => g.credentials.length > 0);

  return (
    <section className="flex min-w-0 flex-[999_1_520px] flex-col gap-5 rounded-[40px] border-2 border-kf-borde p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            style={{ background: color.bg, color: color.ink }}
            className="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] font-brand text-[28px] font-extrabold"
            aria-hidden="true"
          >
            {initialsOf(vault.name)}
          </span>
          <div className="flex min-w-0 flex-col">
            <h2 style={{ color: color.text }} className="font-brand text-[40px] leading-[1.04] font-extrabold break-words uppercase">
              {vault.name}
            </h2>
            <span className="text-[13px] font-semibold text-kf-tinta-suave">
              {count} cuenta{count === 1 ? "" : "s"} · {members.length + 1} persona{members.length ? "s" : ""} · {ROLE_LABEL[role]}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {role === "OWNER" && (
            <button type="button" className={pillLine} aria-expanded={editingClient} onClick={() => setEditingClient((v) => !v)}>
              EDITAR CLIENTE
            </button>
          )}
          {canEdit && activeTab === "cuentas" && (
            <button type="button" className={pillFill} aria-expanded={showAddForm} onClick={() => setShowAddForm((v) => !v)}>
              + CUENTA
            </button>
          )}
        </div>
      </div>

      {editingClient && (
        <EditClientForm
          vaultId={vault.id}
          name={vault.name}
          color={vault.color}
          onDone={() => setEditingClient(false)}
          onDelete={() => setDeletingClient(true)}
        />
      )}
      <ConfirmDialog
        open={deletingClient}
        title="Eliminar cliente"
        confirmLabel="ELIMINAR CLIENTE"
        requireText={vault.name}
        onClose={() => setDeletingClient(false)}
        onConfirm={(typed) => deleteClientAction(vault.id, typed)}
      >
        Se borran para siempre sus {count === 1 ? "1 cuenta" : `${count} cuentas`}, códigos 2FA, links compartidos y auditoría, y el
        acceso de su equipo. No se puede deshacer.
      </ConfirmDialog>

      <nav aria-label="Secciones del cliente" className="flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-current={activeTab === id ? "page" : undefined}
            onClick={() => setActiveTab(id)}
            className={`h-11 cursor-pointer rounded-full px-5 font-brand text-xl font-extrabold uppercase transition ${
              activeTab === id ? "bg-kf-azul text-white" : "bg-kf-niebla text-kf-azul hover:bg-kf-borde"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <VerifyResult />
      {!emailVerified && <VerifyBanner />}
      {showSurvey && <DashboardSurvey />}

      {activeTab === "cuentas" && (
        <div className="flex flex-col gap-5">
          {(showAddForm || (canEdit && count === 0)) && (
            <AddCredentialForm vaultId={vault.id} onDone={() => setShowAddForm(false)} />
          )}
          {groups.map(({ platform, credentials }) => (
            <div key={platform.id} className="flex flex-col gap-3">
              <h3 className={kicker}>
                {platform.label.toUpperCase()} · {credentials.length}
              </h3>
              <ul className="flex flex-col gap-3">
                {credentials.map((c) => (
                  <CredentialRow key={c.id} vaultId={vault.id} credential={c} canEdit={canEdit} role={role} />
                ))}
              </ul>
            </div>
          ))}
          {count === 0 && !canEdit && (
            <p className="rounded-[28px] border-3 border-dashed border-[#c9cedd] p-6 text-center text-sm font-semibold text-kf-tinta-suave">
              Este cliente todavía no tiene cuentas.
            </p>
          )}
        </div>
      )}

      {activeTab === "actividad" && <AuditLogTable logs={auditLogs} />}

      {activeTab === "equipo" &&
        (role === "OWNER" ? (
          <VaultMembers vaultId={vault.id} members={members} invites={invites} />
        ) : (
          <p className="text-sm font-semibold text-kf-tinta-suave">Solo el propietario puede gestionar el equipo.</p>
        ))}

    </section>
  );
}

function AddCredentialForm({ vaultId, onDone }: { vaultId: string; onDone?: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const idPrefix = useId();

  return (
    <form
      className="flex flex-col gap-3 rounded-[28px] bg-kf-niebla p-5"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const formData = new FormData(e.currentTarget);
        try {
          const result = await createCredentialAction(formData);
          if (result) {
            setError(result);
            setPending(false);
            return;
          }
        } catch {
          setError("Error al guardar. Recargá la página e intentá de nuevo.");
        }
        setPending(false);
        (e.target as HTMLFormElement).reset();
        onDone?.();
      }}
    >
      <p className={kicker}>NUEVA CUENTA</p>
      <input type="hidden" name="vaultId" value={vaultId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative">
          <label htmlFor={`${idPrefix}-platform`} className="sr-only">Plataforma</label>
          <select id={`${idPrefix}-platform`} name="platform" defaultValue="instagram" className={`${inputCls} cursor-pointer appearance-none pr-11`}>
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 right-5 h-4 w-4 -translate-y-1/2 text-kf-tinta-suave" />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-service`} className="sr-only">Nombre de la cuenta</label>
          <input id={`${idPrefix}-service`} name="service" placeholder="Nombre" required className={inputCls} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-username`} className="sr-only">Usuario</label>
          <input id={`${idPrefix}-username`} name="username" placeholder="Usuario o email" required className={inputCls} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-secret`} className="sr-only">Contraseña</label>
          <input id={`${idPrefix}-secret`} name="secret" placeholder="Contraseña" required className={inputCls} />
        </div>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-loginUrl`} className="sr-only">URL de login</label>
        <input id={`${idPrefix}-loginUrl`} name="loginUrl" type="url" placeholder="URL de login" className={inputCls} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-totp`} className="sr-only">Clave 2FA</label>
        <input id={`${idPrefix}-totp`} name="totp" autoComplete="off" spellCheck={false} placeholder="Clave 2FA" className={`${inputCls} font-mono`} />
        <p className="px-5 text-xs font-semibold text-kf-tinta-suave">{TOTP_HINT}</p>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-notes`} className="sr-only">Notas</label>
        <textarea
          id={`${idPrefix}-notes`}
          name="notes"
          placeholder="Notas (opcional)"
          className="min-h-20 w-full rounded-[20px] border-2 border-kf-borde bg-white px-5 py-3 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm"
        />
      </div>
      {error && <p role="alert" className="rounded-2xl bg-kf-carmesi/10 px-4 py-2 text-sm font-semibold text-kf-carmesi-hondo">{error}</p>}
      <button disabled={pending} className={`${pillFill} self-start`}>
        {pending ? "GUARDANDO..." : "GUARDAR CUENTA"}
      </button>
    </form>
  );
}

function CredentialRow({
  vaultId,
  credential,
  canEdit,
  role,
}: {
  vaultId: string;
  credential: CredentialWithLinks;
  canEdit: boolean;
  role: Role;
}) {
  const [revealed, setRevealed] = useState<{ secret: string; notes: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const idPrefix = useId();
  const [now] = useState(() => Date.now());
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const activeLinks = credential.shareLinks.filter((l) => !l.revokedAt && l.expiresAt.getTime() > now);

  async function reveal() {
    try {
      const data = await revealCredentialAction(vaultId, credential.id);
      setRevealed(data);
      return data;
    } catch {
      return null; /* session expired — page will redirect */
    }
  }

  async function newLink(fd: FormData) {
    setShareError(null);
    fd.set("credentialId", credential.id);
    try {
      const result = await createShareLinkAction(vaultId, fd);
      if (typeof result === "string") return setShareError(result);
      setShareUrl(`${window.location.origin}/s/${result.publicId}#k=${result.key}`);
    } catch {
      setShareError("Error al generar el link. Recargá la página e intentá de nuevo.");
    }
  }

  return (
    <li className="flex flex-col gap-4 rounded-[28px] bg-kf-niebla p-5">
      <div className="flex flex-wrap items-center gap-3.5">
        <PlatformIcon id={credential.platform} />
        <div className="flex min-w-0 flex-[1_1_200px] flex-col">
          <b className="text-[17px]">{credential.service}</b>
          <span className="truncate font-mono text-sm text-kf-tinta-suave">{credential.username}</span>
        </div>
        {credential.loginUrl && (
          // loginUrl is validated http(s) on write (credentialSchema).
          <a
            href={credential.loginUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-bold text-kf-azul underline decoration-2 underline-offset-4"
          >
            Abrir login ↗
          </a>
        )}
        {credential.hasTotp && <TotpCode vaultId={vaultId} credentialId={credential.id} />}
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          className={pillFill}
          onClick={async () => {
            const data = revealed ?? (await reveal());
            if (!data) return;
            await navigator.clipboard.writeText(data.secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? "¡COPIADA!" : "COPIAR CONTRASEÑA"}
        </button>
        {canEdit && (
          <button type="button" className={pillLine} aria-expanded={sharing} onClick={() => setSharing((s) => !s)}>
            COMPARTIR LINK
          </button>
        )}
        <button type="button" className={quietBtn} aria-expanded={!!revealed} onClick={() => (revealed ? setRevealed(null) : reveal())}>
          {revealed ? "Ocultar contraseña" : "Ver contraseña"}
        </button>
        {canEdit && (
          <button type="button" className={quietBtn} aria-expanded={editing} onClick={() => setEditing((v) => !v)}>
            Editar
          </button>
        )}
        {canEdit && (
          <button
            type="button"
            className={`${quietBtn} text-kf-carmesi hover:text-kf-carmesi-hondo`}
            onClick={() => setConfirmDelete(true)}
          >
            Eliminar
          </button>
        )}
      </div>

      {canEdit && editing && <EditCredentialForm vaultId={vaultId} credential={credential} onDone={() => setEditing(false)} />}
      <ConfirmDialog
        open={confirmDelete}
        title={`Eliminar ${credential.service}`}
        confirmLabel="ELIMINAR CUENTA"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteCredentialAction(vaultId, credential.id)}
      >
        Se borran la contraseña{credential.hasTotp ? ", el código 2FA" : ""} y sus links compartidos. Queda registrado en la
        auditoría. No se puede deshacer.
      </ConfirmDialog>

      {revealed && (
        <div className="flex flex-col gap-2 rounded-[20px] bg-white p-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <code className="min-w-0 font-mono text-base break-all select-all">{revealed.secret}</code>
            <CopyButton value={revealed.secret} label="Copiar contraseña" />
          </div>
          {revealed.notes && (
            <div className="flex items-center justify-between gap-2 border-t-2 border-kf-borde pt-2">
              <p className="font-semibold text-kf-tinta-suave">{revealed.notes}</p>
              <CopyButton value={revealed.notes} label="Copiar notas" />
            </div>
          )}
        </div>
      )}

      {canEdit && sharing && (
        <form
          className="flex flex-wrap items-center gap-2.5 rounded-[20px] bg-white p-4"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            await newLink(new FormData(e.currentTarget));
          }}
        >
          <label htmlFor={`${idPrefix}-permission`} className="sr-only">Permiso del link</label>
          <div className="relative">
            <select id={`${idPrefix}-permission`} name="permission" className={`${inputCls} h-11 w-auto cursor-pointer appearance-none pr-11`}>
              <option value="READ">Solo lectura</option>
              <option value="DOWNLOAD">Lectura + descarga</option>
            </select>
            <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-kf-tinta-suave" />
          </div>
          <label htmlFor={`${idPrefix}-expires`} className="sr-only">Expiración del link</label>
          <div className="relative">
            <select id={`${idPrefix}-expires`} name="expiresInHours" defaultValue="24" className={`${inputCls} h-11 w-auto cursor-pointer appearance-none pr-11`}>
              <option value="1">1 hora</option>
              <option value="24">24 horas</option>
              <option value="72">3 días</option>
              <option value="168">7 días</option>
            </select>
            <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-kf-tinta-suave" />
          </div>
          <button className={pillFill}>GENERAR LINK</button>
          <p className="w-full text-xs font-semibold text-kf-tinta-suave">Usa 1 link de tu saldo.</p>
          {shareError && (
            <p role="alert" className="w-full rounded-2xl bg-kf-carmesi/10 px-4 py-2 text-sm font-semibold text-kf-carmesi-hondo">
              {shareError}
            </p>
          )}
        </form>
      )}

      {shareUrl && (
        <div className="flex flex-col gap-2 rounded-[20px] bg-kf-lima p-4 text-sm text-kf-bosque-hondo">
          <p className="font-bold">Copiá este link ahora: la clave no se guarda y no vas a poder verla otra vez.</p>
          <div className="flex items-center gap-1.5 rounded-full bg-white pr-1.5">
            <label htmlFor={`${idPrefix}-share-url`} className="sr-only">Link compartible</label>
            <input
              id={`${idPrefix}-share-url`}
              readOnly
              value={shareUrl}
              className="h-11 w-full min-w-0 rounded-full bg-transparent px-4 font-mono text-xs text-kf-tinta outline-none"
              onFocus={(e) => e.currentTarget.select()}
            />
            <CopyButton value={shareUrl} label="Copiar link" />
          </div>
        </div>
      )}

      {activeLinks.length > 0 && (
        <div className="flex flex-col gap-3 rounded-[28px] border-2 border-kf-borde bg-white px-5 py-4">
          <p className={kicker}>LINKS ACTIVOS</p>
          {activeLinks.map((l) => {
            const hours = Math.max(1, Math.round((l.expiresAt.getTime() - now) / 3_600_000));
            return (
              <div key={l.id} className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-kf-lima px-3 py-1.5 text-xs font-extrabold tracking-widest text-kf-bosque-hondo">ACTIVO</span>
                <span className="min-w-0 flex-[1_1_200px] text-sm font-semibold">
                  {l.permission === "READ" ? "Solo lectura" : "Lectura + descarga"} · expira en {hours} h
                </span>
                {canEdit && (
                  <button
                    type="button"
                    className={`${pillDanger} h-10`}
                    onClick={async () => {
                      try {
                        await revokeShareLinkAction(vaultId, l.id);
                      } catch {
                        /* session expired — page will redirect */
                      }
                    }}
                  >
                    REVOCAR
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!credential.hasTotp && canEdit && <AddTotp vaultId={vaultId} credentialId={credential.id} />}

      {role === "OWNER" && (
        <AiAccessPanel credentialId={credential.id} credentialService={credential.service} initialAiAccessible={credential.aiAccessible} />
      )}
    </li>
  );
}

function EditCredentialForm({
  vaultId,
  credential,
  onDone,
}: {
  vaultId: string;
  credential: CredentialWithLinks;
  onDone: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const id = useId();

  return (
    <form
      className="flex flex-col gap-3 rounded-[20px] bg-white p-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        try {
          const result = await updateCredentialAction(vaultId, credential.id, new FormData(e.currentTarget));
          if (result) setError(result);
          else return onDone();
        } catch {
          setError("Error al guardar. Recargá la página e intentá de nuevo.");
        }
        setPending(false);
      }}
    >
      <p className={kicker}>EDITAR CUENTA</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative">
          <label htmlFor={`${id}-platform`} className="sr-only">Plataforma</label>
          <select id={`${id}-platform`} name="platform" defaultValue={platformOf(credential.platform).id} className={`${inputCls} cursor-pointer appearance-none pr-11`}>
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 right-5 h-4 w-4 -translate-y-1/2 text-kf-tinta-suave" />
        </div>
        <div>
          <label htmlFor={`${id}-service`} className="sr-only">Nombre de la cuenta</label>
          <input id={`${id}-service`} name="service" defaultValue={credential.service} required className={inputCls} />
        </div>
        <div>
          <label htmlFor={`${id}-username`} className="sr-only">Usuario</label>
          <input id={`${id}-username`} name="username" defaultValue={credential.username} required className={inputCls} />
        </div>
        <div>
          <label htmlFor={`${id}-secret`} className="sr-only">Contraseña nueva</label>
          <input id={`${id}-secret`} name="secret" autoComplete="off" placeholder="Clave nueva" className={inputCls} />
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-loginUrl`} className="sr-only">URL de login</label>
        <input id={`${id}-loginUrl`} name="loginUrl" type="url" defaultValue={credential.loginUrl ?? ""} placeholder="URL de login" className={inputCls} />
      </div>
      <div>
        <label htmlFor={`${id}-notes`} className="sr-only">Notas nuevas</label>
        <textarea
          id={`${id}-notes`}
          name="notes"
          placeholder="Notas nuevas (opcional; reemplazan las actuales)"
          className="min-h-20 w-full rounded-[20px] border-2 border-kf-borde bg-white px-5 py-3 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm"
        />
      </div>
      <p className="m-0 px-1 text-xs font-semibold text-kf-tinta-suave">Lo que dejes vacío en contraseña y notas no cambia.</p>
      {credential.hasTotp && (
        <label className="flex cursor-pointer items-center gap-2.5 px-1 text-sm font-bold text-kf-carmesi-hondo">
          <input type="checkbox" name="removeTotp" className="h-5 w-5 accent-kf-carmesi" />
          Quitar el código 2FA de esta cuenta
        </label>
      )}
      {error && <p role="alert" className="m-0 rounded-2xl bg-kf-carmesi/10 px-4 py-2 text-sm font-semibold text-kf-carmesi-hondo">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button disabled={pending} className={pillFill}>{pending ? "GUARDANDO..." : "GUARDAR CAMBIOS"}</button>
        <button type="button" onClick={onDone} className={quietBtn}>Cancelar</button>
      </div>
    </form>
  );
}

function EditClientForm({
  vaultId,
  name,
  color,
  onDone,
  onDelete,
}: {
  vaultId: string;
  name: string;
  color: string | null;
  onDone: () => void;
  onDelete: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const id = useId();
  const current = clientColor(color).id;

  return (
    <form
      className="flex flex-col gap-4 rounded-[28px] bg-kf-niebla p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        try {
          const result = await updateClientAction(vaultId, new FormData(e.currentTarget));
          if (result) setError(result);
          else return onDone();
        } catch {
          setError("Error al guardar. Recargá la página e intentá de nuevo.");
        }
        setPending(false);
      }}
    >
      <p className={kicker}>EDITAR CLIENTE</p>
      <div>
        <label htmlFor={`${id}-name`} className="sr-only">Nombre del cliente</label>
        <input id={`${id}-name`} name="name" required maxLength={60} defaultValue={name} className={inputCls} />
      </div>
      <fieldset className="m-0 flex flex-wrap gap-2.5 border-0 p-0">
        <legend className={`${kicker} mb-1.5`}>COLOR</legend>
        {CLIENT_COLORS.map((c) => (
          <label key={c.id} className="cursor-pointer" title={c.label}>
            <input type="radio" name="color" value={c.id} defaultChecked={c.id === current} className="peer sr-only" />
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
      <div className="flex flex-wrap items-center gap-2">
        <button disabled={pending} className={pillFill}>{pending ? "GUARDANDO..." : "GUARDAR"}</button>
        <button type="button" onClick={onDone} className={quietBtn}>Cancelar</button>
        <button type="button" onClick={onDelete} className={`${quietBtn} ml-auto text-kf-carmesi hover:text-kf-carmesi-hondo`}>
          Eliminar cliente
        </button>
      </div>
    </form>
  );
}

const TOTP_HINT = "En la red social: Seguridad → Autenticación en dos pasos → app de autenticación → «¿No podés escanear?». Pegá esa clave o el link otpauth://.";

// Live code from the server (the seed never reaches the browser). Refetches at each period boundary
// while open and closes itself after 5 minutes.
function TotpCode({ vaultId, credentialId }: { vaultId: string; credentialId: string }) {
  const [state, setState] = useState<{ code: string; secondsLeft: number; period: number } | null>(null);
  const [openedAt, setOpenedAt] = useState(0);
  const [error, setError] = useState(false);

  async function load() {
    try {
      setState(await totpCodeAction(vaultId, credentialId));
      setError(false);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    if (!state) return;
    const t = setTimeout(() => {
      if (Date.now() - openedAt > 5 * 60_000) return setState(null);
      if (state.secondsLeft <= 1) return void load();
      setState({ ...state, secondsLeft: state.secondsLeft - 1 });
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load is stable for this credential
  }, [state, openedAt]);

  if (!state) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpenedAt(Date.now());
          load();
        }}
        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-kf-bosque px-5 text-xs font-extrabold tracking-[0.12em] text-kf-lima transition hover:opacity-90"
      >
        {error ? "REINTENTAR 2FA" : "VER CÓDIGO 2FA"}
      </button>
    );
  }

  const circumference = 50.3; // 2π·8
  const offset = circumference * (1 - state.secondsLeft / state.period);
  const spaced = state.code.length === 6 ? `${state.code.slice(0, 3)} ${state.code.slice(3)}` : state.code;
  return (
    <div className="flex items-center gap-3 rounded-[22px] bg-kf-bosque py-2.5 pr-2 pl-4 text-kf-lima">
      <svg width="30" height="30" viewBox="0 0 20 20" role="img" aria-label={`Quedan ${state.secondsLeft} segundos`}>
        <circle cx="10" cy="10" r="8" fill="none" stroke="#2e8a62" strokeWidth="3" />
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 10 10)"
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <div className="flex flex-col">
        <span className="text-[10px] font-extrabold tracking-[0.16em]">CÓDIGO 2FA</span>
        <span className="font-mono text-[26px] leading-tight font-semibold tracking-[0.06em]" aria-live="polite">
          {spaced}
        </span>
      </div>
      <CopyButton value={state.code} label="Copiar código 2FA" className="h-11 w-11 text-kf-lima! hover:bg-white/10!" />
    </div>
  );
}

function AddTotp({ vaultId, credentialId }: { vaultId: string; credentialId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const id = useId();

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${quietBtn} self-start px-0 text-kf-bosque`}>
        + Agregar código 2FA
      </button>
    );
  }
  return (
    <form
      className="flex flex-col gap-2.5 rounded-[20px] bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const raw = String(new FormData(e.currentTarget).get("totp") ?? "");
        try {
          const result = await setTotpAction(vaultId, credentialId, raw);
          if (result) setError(result);
        } catch {
          setError("Error al guardar. Recargá la página e intentá de nuevo.");
        }
        setPending(false);
      }}
    >
      <label htmlFor={id} className={kicker}>CLAVE 2FA DE ESTA CUENTA</label>
      <input id={id} name="totp" required autoFocus autoComplete="off" spellCheck={false} className={`${inputCls} font-mono`} />
      <p className="px-1 text-xs font-semibold text-kf-tinta-suave">{TOTP_HINT}</p>
      {error && <p role="alert" className="rounded-2xl bg-kf-carmesi/10 px-4 py-2 text-sm font-semibold text-kf-carmesi-hondo">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button disabled={pending} className={pillFill}>{pending ? "GUARDANDO..." : "GUARDAR 2FA"}</button>
        <button type="button" onClick={() => setOpen(false)} className={quietBtn}>Cancelar</button>
      </div>
    </form>
  );
}

const AUDIT_ACTION_LABELS: Record<string, string> = {
  link_created: "Link creado",
  link_viewed: "Link visto",
  link_revoked: "Link revocado",
  link_denied_expired_or_revoked: "Acceso denegado (expirado o revocado)",
  link_denied_not_found: "Acceso denegado (link inexistente)",
  credential_viewed: "Credencial vista",
  totp_added: "2FA agregado",
  credential_updated: "Cuenta editada",
  credential_updated_totp_removed: "Cuenta editada (2FA quitado)",
  credential_deleted: "Cuenta eliminada",
  totp_code_viewed: "Código 2FA visto",
  ai_access_enabled: "Acceso AI habilitado",
  ai_access_disabled: "Acceso AI deshabilitado",
  ai_credential_accessed: "Credencial accedida por AI",
  ai_link_created: "Link AI generado",
  member_invited: "Miembro invitado",
  invite_revoked: "Invitación cancelada",
  member_joined: "Miembro se unió",
  member_role_changed: "Rol de miembro cambiado",
  member_removed: "Miembro quitado",
};

function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = logs.filter((log) => {
    if (fromDate && log.createdAt < new Date(fromDate)) return false;
    if (toDate && log.createdAt > new Date(toDate + "T23:59:59")) return false;
    return true;
  });

  function exportCSV() {
    const rows = [
      ["Cuándo", "Credencial", "Acción", "Quién", "IP"],
      ...filtered.map((log) => [
        log.createdAt.toLocaleString(),
        log.credentialService ?? "",
        AUDIT_ACTION_LABELS[log.action] ?? log.action,
        log.actorEmail ?? "",
        log.ipAddress ?? "",
      ]),
    ];
    const csv = rows
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" })),
      download: `auditoria-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="rounded-[28px] border-2 border-kf-borde bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-extrabold tracking-[0.18em] text-kf-tinta-suave">AUDITORÍA</h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            aria-label="Desde"
            className="rounded-lg border border-border-soft bg-gray/40 px-2 py-1 text-xs text-ink outline-none focus:border-ink"
          />
          <span className="text-xs text-ink-soft">→</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            aria-label="Hasta"
            className="rounded-lg border border-border-soft bg-gray/40 px-2 py-1 text-xs text-ink outline-none focus:border-ink"
          />
          <button
            onClick={exportCSV}
            className="rounded-lg border border-border-soft bg-gray/40 px-3 py-1 text-xs text-ink transition hover:bg-gray/60"
          >
            Exportar CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="max-h-[360px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Historial de accesos y acciones sobre esta bóveda</caption>
            <thead className="sticky top-0 bg-paper">
              <tr className="border-b border-border-soft text-ink-soft">
                <th scope="col" className="py-1.5 pr-4 font-medium">Cuándo</th>
                <th scope="col" className="py-1.5 pr-4 font-medium">Credencial</th>
                <th scope="col" className="py-1.5 pr-4 font-medium">Acción</th>
                <th scope="col" className="py-1.5 pr-4 font-medium">Quién</th>
                <th scope="col" className="py-1.5 pr-4 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const denied = log.action.startsWith("link_denied");
                return (
                  <tr key={log.id} className="border-b border-border-soft last:border-0">
                    <td className="py-1.5 pr-4 text-ink-soft">{log.createdAt.toLocaleString()}</td>
                    <td className="py-1.5 pr-4 font-medium text-ink">{log.credentialService ?? "—"}</td>
                    <td className={`py-1.5 pr-4 ${denied ? "text-danger" : ""}`}>
                      {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                    </td>
                    <td className="py-1.5 pr-4 text-ink-soft">{log.actorEmail ?? "—"}</td>
                    <td className="py-1.5 pr-4 text-ink-soft">{log.ipAddress ?? "—"}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td className="py-2 text-ink-soft" colSpan={5}>
                    {logs.length === 0 ? "Sin actividad todavía." : "Sin resultados para ese rango de fechas."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {filtered.length > 0 && (
        <p className="mt-2 text-right text-[11px] text-ink-soft">
          {filtered.length} entrada{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
