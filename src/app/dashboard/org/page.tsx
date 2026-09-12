import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrgRole } from "@prisma/client";
import { changeMemberRole, createOrgVault } from "./actions";

export const metadata = { title: "Mi organización" };

const ROLE_LABELS: Record<OrgRole, string> = {
  OWNER: "Dueño",
  ADMIN: "Admin",
  MEMBER: "Miembro",
};

export default async function OrgDashboardPage() {
  const session = await auth();
  const orgRole = session?.user?.orgRole as OrgRole | null;

  if (!session?.user?.id || (orgRole !== OrgRole.OWNER && orgRole !== OrgRole.ADMIN)) {
    redirect("/dashboard");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });

  if (!user?.organizationId) redirect("/dashboard");

  const [org, members, orgVaults] = await Promise.all([
    db.organization.findUnique({ where: { id: user.organizationId } }),
    db.user.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true, email: true, name: true, orgRole: true },
      orderBy: { createdAt: "asc" },
    }),
    db.vault.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true, name: true, orgMinRole: true, _count: { select: { credentials: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!org) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">{org.name}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {org.domain} · SSO {org.ssoEnabled ? "activo" : "inactivo"}
      </p>

      {/* Miembros */}
      <section className="mt-8">
        <h2 className="font-semibold text-ink">Miembros ({members.length})</h2>
        <div className="mt-3 flex flex-col gap-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-border-soft bg-paper px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{m.name || m.email}</p>
                {m.name && <p className="text-xs text-ink-soft">{m.email}</p>}
              </div>
              <form action={async (fd: FormData) => {
                "use server";
                const newRole = fd.get("role") as OrgRole;
                await changeMemberRole(m.id, newRole);
              }} className="flex items-center gap-2">
                <select name="role" defaultValue={m.orgRole ?? OrgRole.MEMBER}
                  className="rounded-lg border border-border-soft bg-paper px-2 py-1 text-xs text-ink focus:outline-none">
                  {Object.values(OrgRole).map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <button type="submit"
                  className="rounded-full border border-border-soft px-3 py-1 text-xs font-medium text-ink hover:bg-gray/20">
                  Guardar
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* Bóvedas de org */}
      <section className="mt-8">
        <h2 className="font-semibold text-ink">Bóvedas de organización ({orgVaults.length})</h2>
        <div className="mt-3 flex flex-col gap-2">
          {orgVaults.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-xl border border-border-soft bg-paper px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{v.name}</p>
                <p className="text-xs text-ink-soft">
                  Acceso mínimo: {ROLE_LABELS[v.orgMinRole ?? OrgRole.MEMBER]} · {v._count.credentials} credenciales
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Crear nueva bóveda de org */}
        <form action={createOrgVault} className="mt-4 flex gap-2">
          <input name="name" required placeholder="Nombre de la bóveda"
            className="flex-1 rounded-xl border border-border-soft bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-blue focus:outline-none" />
          <select name="orgMinRole"
            className="rounded-xl border border-border-soft bg-paper px-3 py-2 text-sm text-ink focus:outline-none">
            <option value={OrgRole.MEMBER}>Todos</option>
            <option value={OrgRole.ADMIN}>Admin+</option>
            <option value={OrgRole.OWNER}>Solo dueño</option>
          </select>
          <button type="submit"
            className="rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            + Crear
          </button>
        </form>
      </section>
    </main>
  );
}
