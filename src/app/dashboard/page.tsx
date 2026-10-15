import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "./app-shell";
import { ClientGrid } from "./client-grid";
import { listClients } from "./clients";

export default async function DashboardIndexPage({ searchParams }: { searchParams: Promise<{ nuevo?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const clients = await listClients(session.user.id);
  if (clients.length === 0) redirect("/login");
  const { nuevo } = await searchParams;

  return (
    <AppShell active="clientes">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-brand text-6xl leading-none font-extrabold text-kf-azul uppercase md:text-7xl">Clientes</h1>
        <Link
          href="/dashboard?nuevo=1#nuevo-cliente"
          className="inline-flex h-13 items-center rounded-full bg-kf-azul px-7 text-[13px] font-extrabold tracking-[0.14em] text-white no-underline transition hover:opacity-90"
        >
          + NUEVO CLIENTE
        </Link>
      </div>
      <ClientGrid clients={clients} openNew={nuevo === "1"} />
    </AppShell>
  );
}
