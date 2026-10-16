import { db } from "@/lib/db";
import { DEFAULT_VAULT_NAME } from "@/lib/onboarding";

export type OnboardingStep = { id: string; label: string; hint: string; done: boolean; href: string };

// Progress derived from real data (no flag to keep in sync): every step flips by itself when the user
// does the thing, wherever they do it.
export async function getOnboarding(userId: string) {
  const owned = await db.vault.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, _count: { select: { credentials: true } } },
  });
  const accounts = owned.reduce((n, v) => n + v._count.credentials, 0);
  const [totp, links, invites, members] = await Promise.all([
    db.credential.count({ where: { vault: { ownerId: userId }, hasTotp: true } }),
    db.shareLink.count({ where: { credential: { vault: { ownerId: userId } } } }),
    db.vaultInvite.count({ where: { vault: { ownerId: userId } } }),
    db.vaultMember.count({ where: { vault: { ownerId: userId }, userId: { not: userId } } }),
  ]);
  const anchor = owned.find((v) => v._count.credentials > 0) ?? owned[0];
  const clientHref = anchor ? `/dashboard/${anchor.id}` : "/dashboard";

  const steps: OnboardingStep[] = [
    {
      id: "client",
      label: "Crear tu primer cliente",
      hint: "Una bóveda por cada marca que manejás.",
      done: owned.some((v) => v.name !== DEFAULT_VAULT_NAME) || accounts > 0,
      href: "/dashboard?nuevo=1#nuevo-cliente",
    },
    { id: "account", label: "Guardar una cuenta", hint: "Instagram, TikTok, Meta Ads… usuario y contraseña, cifrados.", done: accounts > 0, href: clientHref },
    { id: "totp", label: "Agregar un código 2FA", hint: "Pegá la clave de la red y todo el equipo ve el código vigente.", done: totp > 0, href: clientHref },
    { id: "link", label: "Compartir sin chat", hint: "Un link que expira y se revoca, en vez de mandar la clave por WhatsApp.", done: links > 0, href: clientHref },
    { id: "team", label: "Invitar a tu equipo", hint: "Hasta 5 personas gratis, con rol de editor o lector.", done: invites + members > 0, href: clientHref },
  ];

  return {
    // Only the untouched signup client: one client, default name, no accounts.
    firstRun: owned.length === 1 && owned[0].name === DEFAULT_VAULT_NAME && accounts === 0,
    firstVaultId: owned[0]?.id ?? null,
    steps,
    allDone: steps.every((s) => s.done),
  };
}
