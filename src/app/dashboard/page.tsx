import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "./app-shell";
import { ClientGrid } from "./client-grid";
import { listClients } from "./clients";
import { getOnboarding } from "./onboarding";
import { OnboardingChecklist } from "./onboarding-checklist";
import { Welcome } from "./welcome";

export default async function DashboardIndexPage({ searchParams }: { searchParams: Promise<{ nuevo?: string; omitir?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const [clients, onboarding] = await Promise.all([listClients(session.user.id), getOnboarding(session.user.id)]);
  if (clients.length === 0) redirect("/login");
  const { nuevo, omitir } = await searchParams;

  // First visit: the untouched signup client becomes a guided "name your first client" step.
  if (onboarding.firstRun && clients.length === 1 && onboarding.firstVaultId && omitir !== "1") {
    return (
      <AppShell active="clientes">
        <Welcome vaultId={onboarding.firstVaultId} agency={session.user.companyName ?? ""} />
      </AppShell>
    );
  }

  return (
    <AppShell active="clientes">
      <div data-reveal className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-brand text-6xl leading-none font-extrabold text-kf-azul uppercase md:text-7xl">Clientes</h1>
        <Link
          href="/dashboard?nuevo=1#nuevo-cliente"
          className="inline-flex h-13 items-center rounded-full bg-kf-azul px-7 text-[13px] font-extrabold tracking-[0.14em] text-white no-underline transition hover:opacity-90"
        >
          + NUEVO CLIENTE
        </Link>
      </div>
      {!onboarding.allDone && <OnboardingChecklist steps={onboarding.steps} />}
      <ClientGrid clients={clients} openNew={nuevo === "1"} />
    </AppShell>
  );
}
