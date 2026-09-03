import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { LogOutIcon } from "@/components/icons";
import { KitificaCredit } from "@/components/kitifica-credit";
import { CompanyNameEditor } from "@/components/company-name-editor";
import { IdleSessionGuard } from "@/components/idle-session-guard";

export const metadata: Metadata = {
  title: "Mi bóveda",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-6">
      <IdleSessionGuard />
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between rounded-full bg-ink px-5 py-3 text-gray">
        {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, not photographic content */}
        <img src="/logo-on-light.svg" alt="Bóveda KF-1" className="h-6 w-auto" />
        <div className="flex items-center gap-4 text-sm">
          <CompanyNameEditor initialName={session.user.companyName || session.user.email || ""} />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray/25 px-3 py-1.5 transition hover:bg-gray/10">
              <LogOutIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 py-6">{children}</main>
      <footer className="flex flex-col items-center gap-1 py-4 text-center">
        <p className="text-xs text-ink-soft">© {new Date().getFullYear()} Bóveda KF-1</p>
        <KitificaCredit />
      </footer>
    </div>
  );
}
