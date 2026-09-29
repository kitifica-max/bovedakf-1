"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { exportMyCredentialsAction, switchToFreeAction } from "@/app/dashboard/actions";

// OWASP CSV-injection guard: a leading = + - @ tab/CR makes spreadsheets run the cell as a formula.
const cell = (v: string) => `"${(/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;

export function PlanBannerActions() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmFree, setConfirmFree] = useState(false);

  function exportCsv() {
    start(async () => {
      setError(null);
      const res = await exportMyCredentialsAction();
      if (res.error !== null) return setError(res.error);
      const csv = [
        ["bóveda", "servicio", "usuario", "contraseña", "notas"],
        ...res.rows.map((r) => [r.vault, r.service, r.username, r.secret, r.notes]),
      ]
        .map((row) => row.map(cell).join(","))
        .join("\n");
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })),
        download: `credenciales-kf1-${new Date().toISOString().slice(0, 10)}.csv`,
      });
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  function switchToFree() {
    start(async () => {
      setError(null);
      const err = await switchToFreeAction();
      if (err) return setError(err);
      router.refresh();
    });
  }

  const secondary =
    "rounded-full border border-border-soft px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5 disabled:opacity-50";

  return (
    <>
      {confirmFree ? (
        <span className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          Plan gratis: 10 credenciales, 1 miembro extra. Conservás todo lo que ya tenés.
          <button type="button" onClick={switchToFree} disabled={pending} className={secondary}>
            Confirmar
          </button>
          <button type="button" onClick={() => setConfirmFree(false)} disabled={pending} className="text-sm underline">
            Cancelar
          </button>
        </span>
      ) : (
        <button type="button" onClick={() => setConfirmFree(true)} disabled={pending} className={secondary}>
          Pasarme al plan gratis
        </button>
      )}
      <button type="button" onClick={exportCsv} disabled={pending} className={secondary}>
        Exportar credenciales (CSV)
      </button>
      {error && <p role="alert" className="w-full text-sm text-danger">{error}</p>}
    </>
  );
}
