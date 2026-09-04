import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROLE_LABEL } from "@/lib/team-validation";
import type { Role } from "@/lib/vault-access";

export default async function DashboardIndexPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [owned, memberships] = await Promise.all([
    db.vault.findMany({ where: { ownerId: userId }, select: { id: true, name: true } }),
    db.vaultMember.findMany({
      where: { userId, vault: { ownerId: { not: userId } } },
      orderBy: { createdAt: "asc" },
      select: { role: true, vault: { select: { id: true, name: true } } },
    }),
  ]);

  const vaults: { id: string; name: string; role: Role }[] = [
    ...owned.map((v) => ({ id: v.id, name: v.name, role: "OWNER" as Role })),
    ...memberships.map((m) => ({ id: m.vault.id, name: m.vault.name, role: m.role as Role })),
  ];

  if (vaults.length === 0) redirect("/login");
  if (vaults.length === 1) redirect(`/dashboard/${vaults[0].id}`);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="font-pixel text-xl leading-[1.3] text-ink">Tus bóvedas</h1>
      <ul className="flex flex-col gap-3">
        {vaults.map((v) => (
          <li key={v.id}>
            <Link
              href={`/dashboard/${v.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-blue/25 bg-blue/[0.07] p-5 transition hover:bg-blue/[0.12]"
            >
              <span className="font-display text-lg font-semibold text-ink">{v.name}</span>
              <span className="text-xs text-ink-soft">{ROLE_LABEL[v.role]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
