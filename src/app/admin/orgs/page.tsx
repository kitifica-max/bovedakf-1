import { createHmac } from "crypto";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  createOrganization,
  toggleSso,
  generateAdminPortalLink,
} from "./actions";

export const metadata = {
  title: "Admin — Organizaciones",
  robots: { index: false },
};

function verifySudoCookie(userId: string, raw: string | undefined): boolean {
  if (!raw) return false;
  const parts = raw.split(":");
  if (parts.length < 3) return false;
  const sig = parts.pop()!;
  const payload = parts.join(":");
  const [cookieUserId, expStr] = parts;
  if (cookieUserId !== userId) return false;
  if (Date.now() > parseInt(expStr, 10)) return false;
  const expected = createHmac("sha256", process.env.AUTH_SECRET!).update(payload).digest("hex");
  return expected === sig;
}

export default async function AdminOrgsPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.email)) redirect("/dashboard");

  const jar = await cookies();
  const sudoCookie = jar.get("kf1_sudo_orgs")?.value;
  if (!verifySudoCookie(session.user.id, sudoCookie)) redirect("/admin/orgs/auth");

  const orgs = await db.organization.findMany({
    include: { _count: { select: { members: true, vaults: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 rounded-full bg-ink px-5 py-3 text-gray">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-on-light.svg" alt="Bóveda KF-1" className="h-5 w-auto" />
          <span className="hidden text-sm text-gray/70 sm:inline">· Organizaciones</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="shrink-0 rounded-full border border-gray/25 px-3 py-1.5 text-sm transition hover:bg-gray/10"
          >
            Admin
          </Link>
          <Link
            href="/dashboard"
            className="shrink-0 rounded-full border border-gray/25 px-3 py-1.5 text-sm transition hover:bg-gray/10"
          >
            ← Bóveda
          </Link>
        </div>
      </header>

      <div className="px-1">
        <h1 className="font-display text-2xl font-bold text-ink">Organizaciones</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Administrá las organizaciones enterprise y sus conexiones SSO.
        </p>
      </div>

      {/* Formulario de creación */}
      <section className="rounded-2xl border border-border-soft bg-paper p-6">
        <h2 className="font-semibold text-ink">Nueva organización</h2>
        <form action={createOrganization} className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                Nombre
              </label>
              <input
                name="name"
                required
                placeholder="Acme Corp"
                className="w-full rounded-2xl border border-border-soft bg-gray/40 px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-ink placeholder:text-ink-soft/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                Dominio SSO
              </label>
              <input
                name="domain"
                required
                placeholder="acme.com"
                className="w-full rounded-2xl border border-border-soft bg-gray/40 px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-ink placeholder:text-ink-soft/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                Email primer OWNER
              </label>
              <input
                name="firstOwnerEmail"
                type="email"
                placeholder="cto@acme.com"
                className="w-full rounded-2xl border border-border-soft bg-gray/40 px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-ink placeholder:text-ink-soft/40"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-blue px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Crear organización
            </button>
          </div>
        </form>
      </section>

      {/* Lista de orgs */}
      <section className="flex flex-col gap-4">
        {orgs.length === 0 && (
          <p className="text-sm text-ink-soft">No hay organizaciones todavía.</p>
        )}
        {orgs.map((org) => (
          <div
            key={org.id}
            className="rounded-2xl border border-border-soft bg-paper p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">{org.name}</p>
                <p className="text-xs text-ink-soft">
                  {org.domain} · {org._count.members} miembros ·{" "}
                  {org._count.vaults} bóvedas
                </p>
                {org.workosOrgId && (
                  <p className="mt-0.5 font-mono text-xs text-ink-soft">
                    {org.workosOrgId}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold ${
                  org.ssoEnabled
                    ? "bg-green-100 text-green-700"
                    : "bg-gray/40 text-ink-soft"
                }`}
              >
                {org.ssoEnabled ? "SSO activo" : "SSO inactivo"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <form
                action={async () => {
                  "use server";
                  await toggleSso(org.id, !org.ssoEnabled);
                }}
              >
                <button
                  type="submit"
                  className="rounded-full border border-border-soft px-4 py-1.5 text-xs font-medium text-ink hover:bg-gray/20"
                >
                  {org.ssoEnabled ? "Desactivar SSO" : "Activar SSO"}
                </button>
              </form>
              {org.workosOrgId && (
                <form
                  action={async () => {
                    "use server";
                    await generateAdminPortalLink(org.id);
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-full border border-border-soft px-4 py-1.5 text-xs font-medium text-blue hover:bg-blue/5"
                  >
                    Configurar SSO en WorkOS →
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
