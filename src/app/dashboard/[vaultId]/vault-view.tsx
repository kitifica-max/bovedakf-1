"use client";

import { useId, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import type { AuditLog, Credential, ShareLink, Vault } from "@prisma/client";
import {
  createCredentialAction,
  createShareLinkAction,
  deleteCredentialAction,
  revealCredentialAction,
  revokeShareLinkAction,
} from "../actions";
import {
  ActivityIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  Link2Icon,
  LockIcon,
  LogOutIcon,
  PlusIcon,
  Share2Icon,
  ShieldCheckIcon,
  Trash2Icon,
  UsersIcon,
  XCircleIcon,
} from "@/components/icons";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { DashboardSurvey } from "@/components/dashboard-survey";
import { VerifyBanner } from "@/components/verify-banner";
import { VerifyResult } from "@/components/verify-result";
import { TwoFactorSettings } from "@/components/two-factor-settings";
import { PasskeySettings } from "@/components/passkey-settings";
import { VaultMembers } from "@/components/vault-members";
import { AiAccessPanel } from "@/components/ai-access-panel";

type Role = "OWNER" | "EDITOR" | "VIEWER";
type Tab = "credenciales" | "actividad" | "equipo" | "seguridad";

type CredentialWithLinks = Credential & { shareLinks: ShareLink[] };
type VaultWithCredentials = Vault & { credentials: CredentialWithLinks[] };

const inputCls =
  "w-full rounded-2xl border border-border-soft bg-gray/40 px-3 py-2 text-base sm:text-sm outline-none transition focus:border-ink";
const linkBtnCls =
  "flex cursor-pointer items-center gap-1 text-ink-soft underline decoration-border-soft underline-offset-4 transition hover:text-ink";
const dangerLinkBtnCls =
  "flex cursor-pointer items-center gap-1 text-danger underline decoration-danger/30 underline-offset-4 transition hover:decoration-danger";

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Propietario",
  EDITOR: "Editor",
  VIEWER: "Lector",
};

const TABS: { id: Tab; label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { id: "credenciales", label: "Credenciales", Icon: KeyRoundIcon },
  { id: "actividad", label: "Actividad", Icon: ActivityIcon },
  { id: "equipo", label: "Equipo", Icon: UsersIcon },
  { id: "seguridad", label: "Seguridad", Icon: LockIcon },
];

export function VaultView({
  vault,
  auditLogs,
  showSurvey,
  totpEnabled,
  emailVerified,
  passkeys,
  role,
  members,
  invites,
  userEmail,
  isAdminUser,
  isOrgAdmin,
}: {
  vault: VaultWithCredentials;
  auditLogs: AuditLog[];
  showSurvey: boolean;
  totpEnabled: boolean;
  emailVerified: boolean;
  passkeys: { credentialID: string; credentialDeviceType: string; createdAt: Date }[];
  role: Role;
  members: { id: string; email: string; role: Role }[];
  invites: { id: string; email: string; role: Role }[];
  userEmail: string;
  isAdminUser: boolean;
  isOrgAdmin: boolean;
}) {
  const canEdit = role === "OWNER" || role === "EDITOR";
  const [activeTab, setActiveTab] = useState<Tab>("credenciales");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeLinks = vault.credentials
    .flatMap((c) => c.shareLinks)
    .filter((l) => !l.revokedAt && l.expiresAt > new Date()).length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const eventsToday = auditLogs.filter((l) => l.createdAt >= todayStart).length;
  const initials = userEmail.slice(0, 2).toUpperCase();
  const tabLabel = TABS.find((t) => t.id === activeTab)?.label ?? "";

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* ── Desktop sidebar ───────────────────── */}
      <aside className="hidden md:flex w-52 flex-col border-r border-border-soft bg-paper/40 backdrop-blur-xl">
        <div className="flex h-14 items-center px-4 border-b border-border-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-on-dark.svg" alt="KF-1" className="h-5 w-auto" />
        </div>

        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-blue/[0.07] border border-blue/20">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-blue text-white">
              <ShieldCheckIcon className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{vault.name}</p>
              <p className="text-[10px] text-ink-soft">{ROLE_LABEL[role]}</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 pt-1 flex-1">
          <p className="px-2.5 py-1.5 text-[10px] font-bold tracking-widest text-ink-soft/50 uppercase">
            Secciones
          </p>
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all text-left w-full ${
                activeTab === id
                  ? "bg-blue/[0.12] text-blue border border-blue/20"
                  : "text-ink-soft hover:bg-paper hover:text-ink border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
          {isOrgAdmin && (
            <Link
              href="/dashboard/org"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink border border-transparent transition-all mt-1"
            >
              Mi organización
            </Link>
          )}
          {isAdminUser && (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink border border-transparent transition-all mt-1"
            >
              Admin
            </Link>
          )}
          {isAdminUser && (
            <Link
              href="/admin/orgs/auth"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink border border-transparent transition-all"
            >
              Organizaciones
            </Link>
          )}
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink border border-transparent transition-all mt-1"
          >
            Facturación
          </Link>
        </nav>

        <div className="px-3 py-3 border-t border-border-soft">
          <div className="flex items-center gap-2 px-1.5">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue/15 border border-border-soft text-[11px] font-bold text-blue">
              {initials}
            </div>
            <p className="flex-1 min-w-0 text-xs font-medium text-ink truncate">{userEmail}</p>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Cerrar sesión"
              className="cursor-pointer rounded-lg p-1 text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main column ───────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border-soft bg-paper/60 backdrop-blur-xl relative">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-on-dark.svg" alt="KF-1" className="h-5 w-auto" />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue/[0.07] border border-blue/20">
              <ShieldCheckIcon className="h-3 w-3 text-blue shrink-0" />
              <span className="text-[11px] font-medium text-ink-soft">{ROLE_LABEL[role]}</span>
            </div>
          </div>
          <div className="flex items-center gap-2" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="grid h-7 w-7 place-items-center rounded-full bg-blue/15 border border-border-soft text-[10px] font-bold text-blue"
              aria-label="Menú de cuenta"
              aria-expanded={showUserMenu}
            >
              {initials}
            </button>
            {showUserMenu && (
              <div className="absolute top-full right-4 z-50 mt-1 min-w-[180px] rounded-2xl border border-border-soft bg-paper/95 backdrop-blur-xl shadow-lg overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-border-soft">
                  <p className="text-[11px] text-ink-soft truncate">{userEmail}</p>
                </div>
                {role === "OWNER" && (
                  <Link
                    href="/dashboard/ai"
                    className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-ink hover:bg-gray/40 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Conectar IA
                  </Link>
                )}
                {isOrgAdmin && (
                  <Link
                    href="/dashboard/org"
                    className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-ink hover:bg-gray/40 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Mi organización
                  </Link>
                )}
                {isAdminUser && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-ink hover:bg-gray/40 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Admin
                  </Link>
                )}
                {isAdminUser && (
                  <Link
                    href="/admin/orgs/auth"
                    className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-ink hover:bg-gray/40 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Organizaciones
                  </Link>
                )}
                <Link
                  href="/dashboard/billing"
                  className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-ink hover:bg-gray/40 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  Facturación
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors border-t border-border-soft"
                >
                  <LogOutIcon className="h-3.5 w-3.5" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Desktop section header */}
        <div className="hidden md:flex items-center justify-between px-6 py-3.5 border-b border-border-soft">
          <h1 className="font-display text-base font-bold text-ink">{tabLabel}</h1>
          <div className="flex items-center gap-2">
            {role === "OWNER" && (
              <Link
                href="/dashboard/ai"
                className="rounded-full border border-border-soft px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:text-ink"
              >
                Conectar IA →
              </Link>
            )}
            {activeTab === "credenciales" && canEdit && (
              <button
                onClick={() => setShowAddForm((v) => !v)}
                className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-gray transition hover:bg-ink/90"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Añadir
              </button>
            )}
          </div>
        </div>

        {/* Stats row — 2×2 mobile, 4×1 desktop */}
        <div className="grid grid-cols-2 gap-2 px-4 py-3 border-b border-border-soft md:grid-cols-4 md:px-6">
          {[
            { value: vault.credentials.length, label: "Credenciales" },
            { value: activeLinks, label: "Links activos" },
            { value: members.length, label: "Miembros" },
            { value: eventsToday, label: "Eventos hoy" },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl border border-border-soft bg-paper/60 px-4 py-3">
              <p className="font-display text-xl font-bold leading-none text-ink">{value}</p>
              <p className="mt-1 text-[11px] text-ink-soft">{label}</p>
            </div>
          ))}
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-5 md:px-6">
            <VerifyResult />
            {!emailVerified && <VerifyBanner />}
            {showSurvey && <DashboardSurvey />}

            {activeTab === "credenciales" && (
              <div className="flex flex-col gap-4">
                {(showAddForm || (canEdit && vault.credentials.length === 0)) && (
                  <AddCredentialForm vaultId={vault.id} onDone={() => setShowAddForm(false)} />
                )}
                <ul className="flex flex-col gap-3">
                  {vault.credentials.map((c) => (
                    <CredentialRow key={c.id} vaultId={vault.id} credential={c} canEdit={canEdit} role={role} />
                  ))}
                  {vault.credentials.length === 0 && !showAddForm && (
                    <p className="rounded-3xl border border-dashed border-border-soft p-6 text-center text-sm text-ink-soft">
                      Sin credenciales todavía.
                    </p>
                  )}
                </ul>
              </div>
            )}

            {activeTab === "actividad" && <AuditLogTable logs={auditLogs} />}

            {activeTab === "equipo" &&
              (role === "OWNER" ? (
                <VaultMembers vaultId={vault.id} members={members} invites={invites} />
              ) : (
                <p className="text-sm text-ink-soft">Solo el propietario puede gestionar el equipo.</p>
              ))}

            {activeTab === "seguridad" && (
              <div className="flex flex-col gap-4">
                <PasskeySettings initialPasskeys={passkeys} />
                <TwoFactorSettings initialEnabled={totpEnabled} />
              </div>
            )}
          </div>
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden flex border-t border-border-soft bg-paper/80 backdrop-blur-xl">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[9px] font-bold tracking-widest uppercase transition-colors ${
                activeTab === id ? "text-blue" : "text-ink-soft"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile FAB */}
      {activeTab === "credenciales" && canEdit && (
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="md:hidden fixed bottom-[68px] right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue text-white shadow-lg shadow-blue/40 transition hover:bg-blue/90 active:scale-95"
          aria-label="Añadir credencial"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function AddCredentialForm({ vaultId, onDone }: { vaultId: string; onDone?: () => void }) {
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
        onDone?.();
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
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState<{ secret: string; notes: string } | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const idPrefix = useId();

  function toggleExpanded() {
    setExpanded((wasExpanded) => {
      if (wasExpanded) {
        setRevealed(null);
        setSharing(false);
        setShareUrl(null);
        setShareError(null);
      }
      return !wasExpanded;
    });
  }

  return (
    <li className="rounded-2xl border border-blue/25 bg-blue/[0.07] p-5">
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
              {revealed ? (
                <EyeOffIcon aria-hidden="true" className="h-3.5 w-3.5" />
              ) : (
                <EyeIcon aria-hidden="true" className="h-3.5 w-3.5" />
              )}
              {revealed ? "Ocultar" : "Ver"}
            </button>
            {canEdit && (
              <>
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
              </>
            )}
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

          {canEdit && sharing && (
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
                      {canEdit && status === "activo" && (
                        <span className="flex shrink-0 items-center gap-3">
                          <button
                            type="button"
                            className={linkBtnCls}
                            title="La clave del link original no se guarda — esto genera uno nuevo con los mismos permisos."
                            onClick={async () => {
                              const fd = new FormData();
                              fd.set("credentialId", credential.id);
                              fd.set("permission", l.permission);
                              const hrs = Math.min(
                                168,
                                Math.max(1, Math.ceil((l.expiresAt.getTime() - Date.now()) / 3_600_000))
                              );
                              fd.set("expiresInHours", String(hrs));
                              const result = await createShareLinkAction(vaultId, fd);
                              if (typeof result !== "string") {
                                setShareUrl(`${window.location.origin}/s/${result.publicId}#k=${result.key}`);
                              }
                            }}
                          >
                            <Link2Icon aria-hidden="true" className="h-3.5 w-3.5" />
                            Nuevo link
                          </button>
                          <button className={dangerLinkBtnCls} onClick={() => revokeShareLinkAction(vaultId, l.id)}>
                            <XCircleIcon aria-hidden="true" className="h-3.5 w-3.5" />
                            Revocar
                          </button>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {role === "OWNER" && (
            <AiAccessPanel
              credentialId={credential.id}
              credentialService={credential.service}
              initialAiAccessible={credential.aiAccessible}
            />
          )}
        </>
      )}
    </li>
  );
}

const AUDIT_ACTION_LABELS: Record<string, string> = {
  link_created: "Link creado",
  link_viewed: "Link visto",
  link_revoked: "Link revocado",
  link_denied_expired_or_revoked: "Acceso denegado (expirado o revocado)",
  link_denied_not_found: "Acceso denegado (link inexistente)",
  credential_viewed: "Credencial vista",
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
    <div className="rounded-2xl border border-border-soft bg-paper p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-ink">Auditoría</h2>
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
