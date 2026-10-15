import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { LogoBadge } from "@/components/brand/logo-badge";
import { SignOutButton } from "./sign-out-button";

type NavId = "clientes";

const navCls = (active: boolean) =>
  `rounded-[18px] px-4 py-2.5 no-underline transition ${active ? "bg-kf-azul text-white" : "text-kf-azul hover:bg-white"}`;

// Platform frame from the canvas: misty sidebar (logo, condensed nav, link balance, account) + white main column.
export async function AppShell({ active, children }: { active?: NavId; children: React.ReactNode }) {
  const session = await auth();
  const userId = session?.user?.id ?? "";
  const me = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, companyName: true, linkCredits: true },
  });
  const email = me?.email ?? session?.user?.email ?? "";
  const orgRole = session?.user?.orgRole;
  const credits = me?.linkCredits ?? 0;

  const nav: { id?: NavId; href: string; label: string }[] = [
    { id: "clientes", href: "/dashboard", label: "Clientes" },
    { href: "/dashboard/plans", label: "Links" },
    { href: "/dashboard/billing", label: "Facturación" },
    { href: "/dashboard/ai", label: "Conectar IA" },
    { href: "/extension", label: "Extensión" },
    ...(orgRole === "OWNER" || orgRole === "ADMIN" ? [{ href: "/dashboard/org", label: "Organización" }] : []),
    ...(isAdmin(email) ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="flex flex-col gap-6 bg-kf-niebla px-5 py-6 md:sticky md:top-0 md:h-dvh md:w-64 md:shrink-0 md:gap-7 md:overflow-y-auto">
        <div className="flex items-center gap-3">
          <LogoBadge id="app-logo" size={56} ink="#ffffff" center="var(--kf-manteca)" fill="var(--kf-azul)" />
          <div className="flex min-w-0 flex-col">
            <b className="truncate text-[15px]">{me?.companyName || "Mi agencia"}</b>
            <span className="text-xs font-semibold text-kf-tinta-suave">Cuenta gratis</span>
          </div>
          <div className="ml-auto md:hidden">
            <SignOutButton />
          </div>
        </div>
        <nav
          aria-label="Secciones"
          className="flex flex-wrap gap-1 font-brand text-xl leading-[1.1] font-extrabold uppercase md:flex-col md:text-2xl"
        >
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={n.id === active ? "page" : undefined} className={navCls(n.id === active)}>
              {n.label}
            </Link>
          ))}
        </nav>
        {/* Mobile: the balance lives on the "Links" page; the sidebar stays a short header. */}
        <div className="hidden flex-col gap-2.5 rounded-3xl bg-kf-durazno p-5 text-kf-carmesi-hondo md:mt-auto md:flex">
          <b className="font-brand text-[26px] leading-[1.1] font-extrabold uppercase">
            {credits === 1 ? "Te queda 1 link" : `Te quedan ${credits} links`}
          </b>
          <Link
            href="/dashboard/plans"
            className="inline-flex h-11 items-center self-start rounded-full bg-kf-carmesi-hondo px-5 text-xs font-extrabold tracking-[0.14em] text-white no-underline transition hover:opacity-90"
          >
            COMPRAR LINKS
          </Link>
        </div>
        <div className="hidden items-center gap-2.5 text-[13px] font-semibold md:flex">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-kf-rosa font-extrabold text-kf-azul-hondo">
            {email.slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate">{email}</span>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col gap-7 p-5 md:p-10">{children}</main>
    </div>
  );
}
