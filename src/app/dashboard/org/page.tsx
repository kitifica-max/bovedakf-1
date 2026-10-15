import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrgRole } from "@prisma/client";
import { changeMemberRole, createOrgVault } from "./actions";
import { AppShell } from "../app-shell";
import { PAIRS, PageHero, StarDot, type PairName } from "@/components/brand/shapes";
import { appCard, appH2, fieldCls, pillFill, pillLine } from "@/components/brand/styles";

const VAULT_PAIRS: PairName[] = ["rosa", "amarillo", "durazno", "azul", "carmesi"];

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
    <AppShell active="org">
      <PageHero
        pair="bosque"
        icon="users"
        kicker={`${org.domain} · SSO ${org.ssoEnabled ? "activo" : "inactivo"}`}
        title={org.name}
        lead="Roles del equipo y bóvedas compartidas por toda la organización."
      />

      <section className={`${appCard} flex flex-col gap-4`}>
        <h2 className={appH2}>Miembros · {members.length}</h2>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {members.map((m, i) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-kf-niebla px-5 py-3.5">
              <div className="flex min-w-0 flex-[1_1_200px] items-center gap-3">
                <StarDot i={i} />
                <div className="min-w-0">
                  <p className="m-0 truncate text-sm font-extrabold">{m.name || m.email}</p>
                  {m.name && <p className="m-0 truncate text-xs font-semibold text-kf-tinta-suave">{m.email}</p>}
                </div>
              </div>
              <form
                action={async (fd: FormData) => {
                  "use server";
                  const newRole = fd.get("role") as OrgRole;
                  await changeMemberRole(m.id, newRole);
                }}
                className="flex flex-wrap items-center gap-2"
              >
                <label className="mb-1.5 block text-xs font-extrabold tracking-[0.14em] text-kf-tinta-suave uppercase" htmlFor={`role-${m.id}`}>Rol de {m.email}</label>
                <select id={`role-${m.id}`} name="role" defaultValue={m.orgRole ?? OrgRole.MEMBER} className={`${fieldCls} h-11 w-auto cursor-pointer`}>
                  {Object.values(OrgRole).map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <button type="submit" className={pillLine}>GUARDAR</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${appCard} flex flex-col gap-4`}>
        <h2 className={appH2}>Bóvedas de la organización · {orgVaults.length}</h2>
        {orgVaults.length > 0 && (
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 p-0">
            {orgVaults.map((v, i) => {
              const c = PAIRS[VAULT_PAIRS[i % VAULT_PAIRS.length]];
              return (
                <li key={v.id} style={{ background: c.bg, color: c.ink }} className="flex min-w-0 flex-col gap-3 rounded-[28px] p-5">
                  <p className="m-0 font-brand text-[28px] leading-[1.04] font-extrabold break-words uppercase">{v.name}</p>
                  <p className="m-0 text-xs font-bold">
                    Acceso: {ROLE_LABELS[v.orgMinRole ?? OrgRole.MEMBER]} · {v._count.credentials} cuentas
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        <form action={createOrgVault} className="flex flex-wrap gap-2.5 rounded-[28px] bg-kf-niebla p-4">
          <label className="mb-1.5 block text-xs font-extrabold tracking-[0.14em] text-kf-tinta-suave uppercase" htmlFor="org-vault-name">Nombre de la bóveda</label>
          <input id="org-vault-name" name="name" required placeholder="Nueva bóveda" className={`${fieldCls} min-w-0 flex-[1_1_200px]`} />
          <label className="mb-1.5 block text-xs font-extrabold tracking-[0.14em] text-kf-tinta-suave uppercase" htmlFor="org-vault-role">Quién accede</label>
          <select id="org-vault-role" name="orgMinRole" className={`${fieldCls} w-auto cursor-pointer`}>
            <option value={OrgRole.MEMBER}>Todos</option>
            <option value={OrgRole.ADMIN}>Admin+</option>
            <option value={OrgRole.OWNER}>Solo dueño</option>
          </select>
          <button type="submit" className={pillFill}>+ CREAR</button>
        </form>
      </section>
    </AppShell>
  );
}
