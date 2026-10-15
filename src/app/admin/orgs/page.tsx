import { createHmac } from "crypto";
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
import { AppShell } from "@/app/dashboard/app-shell";
import { PAIRS, PageHero, type PairName } from "@/components/brand/shapes";
import { appCard, appH2, fieldCls, kicker, pillFill } from "@/components/brand/styles";

const ORG_PAIRS: PairName[] = ["rosa", "bosque", "amarillo", "durazno", "azul"];
// White pill that reads on any color-pair card.
const onColorPill =
  "inline-flex min-h-11 cursor-pointer items-center rounded-full bg-white px-5 text-xs font-extrabold tracking-[0.12em] text-kf-tinta transition hover:opacity-90";

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
    <AppShell active="admin-orgs">
      <PageHero
        pair="lavanda"
        icon="users"
        kicker="Admin"
        title="Organizaciones"
        lead="Organizaciones enterprise y sus conexiones SSO."
      />

      <section className={`${appCard} flex flex-col gap-4`}>
        <h2 className={appH2}>Nueva organización</h2>
        <form action={createOrganization} className="flex flex-col gap-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className={kicker}>Nombre</span>
              <input name="name" required placeholder="Acme Corp" className={fieldCls} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className={kicker}>Dominio SSO</span>
              <input name="domain" required placeholder="acme.com" className={fieldCls} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className={kicker}>Email del dueño</span>
              <input name="firstOwnerEmail" type="email" placeholder="cto@acme.com" className={fieldCls} />
            </label>
          </div>
          <button type="submit" className={`${pillFill} self-start`}>
            CREAR ORGANIZACIÓN
          </button>
        </form>
      </section>

      <section className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {orgs.length === 0 && (
          <p className="m-0 text-sm font-semibold text-kf-tinta-suave">No hay organizaciones todavía.</p>
        )}
        {orgs.map((org, i) => {
          const c = PAIRS[ORG_PAIRS[i % ORG_PAIRS.length]];
          return (
            <div key={org.id} style={{ background: c.bg, color: c.ink }} className="flex min-w-0 flex-col gap-4 rounded-[32px] p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="m-0 min-w-0 font-brand text-[32px] leading-[1.04] font-extrabold break-words uppercase">{org.name}</p>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold tracking-[0.12em] uppercase ${
                    org.ssoEnabled ? "bg-kf-lima text-kf-bosque-hondo" : "bg-white text-kf-tinta-suave"
                  }`}
                >
                  {org.ssoEnabled ? "SSO activo" : "SSO inactivo"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 text-sm font-bold">
                <span className="break-words">{org.domain}</span>
                <span>
                  {org._count.members} miembros · {org._count.vaults} bóvedas
                </span>
                {org.workosOrgId && <span className="font-mono text-xs break-all opacity-90">{org.workosOrgId}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <form
                  action={async () => {
                    "use server";
                    await toggleSso(org.id, !org.ssoEnabled);
                  }}
                >
                  <button type="submit" className={onColorPill}>
                    {org.ssoEnabled ? "DESACTIVAR SSO" : "ACTIVAR SSO"}
                  </button>
                </form>
                {org.workosOrgId && (
                  <form
                    action={async () => {
                      "use server";
                      await generateAdminPortalLink(org.id);
                    }}
                  >
                    <button type="submit" className={onColorPill}>
                      CONFIGURAR EN WORKOS ↗
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </AppShell>
  );
}
