import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
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
      <header className="sticky top-4 z-40 mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-full bg-ink px-4 py-2.5 text-gray shadow-lg shadow-black/25 ring-1 ring-white/5 sm:top-6 sm:px-5 sm:py-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, not photographic content */}
        <img src="/logo-on-light.svg" alt="Bóveda KF-1" className="h-6 w-auto shrink-0" />
        <div className="flex min-w-0 items-center gap-2 text-xs sm:gap-4 sm:text-sm">
          {isAdmin(session.user.email) && (
            <Link href="/admin" className="shrink-0 rounded-full border border-gray/25 px-2.5 py-1 transition hover:bg-gray/10 sm:px-3 sm:py-1.5">
              Admin
            </Link>
          )}
          <CompanyNameEditor initialName={session.user.companyName || session.user.email || ""} />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-gray/25 px-2.5 py-1 transition hover:bg-gray/10 sm:px-3 sm:py-1.5">
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
