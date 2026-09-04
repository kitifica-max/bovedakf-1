"use client";

import { useState } from "react";
import {
  changeMemberRoleAction,
  inviteMemberAction,
  removeMemberAction,
  revokeInviteAction,
} from "@/app/dashboard/actions";
import { ROLE_LABEL } from "@/lib/team-validation";
import { Trash2Icon, XCircleIcon } from "@/components/icons";

type Role = "OWNER" | "EDITOR" | "VIEWER";
type Member = { id: string; email: string; role: Role };
type Invite = { id: string; email: string; role: Role };

export function VaultMembers({
  vaultId,
  members,
  invites,
}: {
  vaultId: string;
  members: Member[];
  invites: Invite[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function invite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const result = await inviteMemberAction(vaultId, new FormData(form));
    setPending(false);
    if (result) setError(result);
    else form.reset();
  }

  async function changeRole(memberId: string, role: "EDITOR" | "VIEWER") {
    setError(null);
    const result = await changeMemberRoleAction(vaultId, memberId, role);
    if (result) setError(result);
  }

  async function remove(memberId: string) {
    setError(null);
    await removeMemberAction(vaultId, memberId);
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-paper p-5">
      <p className="font-display text-lg font-semibold text-ink">Equipo</p>
      <p className="mt-1 text-sm text-ink-soft">
        Los miembros ven las credenciales descifradas. Cada vista queda en la auditoría.
      </p>

      <ul className="mt-4 flex flex-col gap-2 border-t border-border-soft pt-4 text-sm">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-2">
            <span className="text-ink-soft">{m.email}</span>
            {m.role === "OWNER" ? (
              <span className="text-xs text-ink-soft">{ROLE_LABEL.OWNER}</span>
            ) : (
              <span className="flex items-center gap-2">
                <select
                  defaultValue={m.role}
                  onChange={(e) => changeRole(m.id, e.target.value as "EDITOR" | "VIEWER")}
                  className="cursor-pointer rounded-xl border border-border-soft bg-gray/40 px-2 py-1 text-xs outline-none"
                >
                  <option value="EDITOR">{ROLE_LABEL.EDITOR}</option>
                  <option value="VIEWER">{ROLE_LABEL.VIEWER}</option>
                </select>
                <button
                  type="button"
                  aria-label={`Quitar a ${m.email}`}
                  onClick={() => remove(m.id)}
                  className="cursor-pointer text-danger transition hover:text-danger/80"
                >
                  <Trash2Icon aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </li>
        ))}
        {invites.map((inv) => (
          <li key={inv.id} className="flex items-center justify-between gap-2 text-ink-soft">
            <span>
              {inv.email} · invitación pendiente ({ROLE_LABEL[inv.role]})
            </span>
            <button
              type="button"
              aria-label={`Cancelar invitación a ${inv.email}`}
              onClick={() => revokeInviteAction(vaultId, inv.id)}
              className="flex cursor-pointer items-center gap-1 text-danger transition hover:text-danger/80"
            >
              <XCircleIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={invite}
        className="mt-4 flex flex-wrap items-center gap-2 border-t border-border-soft pt-4"
        noValidate
      >
        <input
          name="email"
          type="email"
          required
          placeholder="correo@empresa.com"
          className="min-w-0 flex-1 rounded-2xl border border-border-soft bg-gray/40 px-3 py-2 text-base sm:text-sm outline-none transition focus:border-ink"
        />
        <select
          name="role"
          defaultValue="VIEWER"
          className="cursor-pointer rounded-2xl border border-border-soft bg-gray/40 px-3 py-2 text-sm outline-none"
        >
          <option value="VIEWER">{ROLE_LABEL.VIEWER}</option>
          <option value="EDITOR">{ROLE_LABEL.EDITOR}</option>
        </select>
        <button
          disabled={pending}
          className="cursor-pointer rounded-full bg-ink px-4 py-2 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Invitando..." : "Invitar"}
        </button>
        {error && (
          <p role="alert" className="w-full rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}
      </form>
    </div>
  );
}
