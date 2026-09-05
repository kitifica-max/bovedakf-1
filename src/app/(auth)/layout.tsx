import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { securitySpec } from "@/content/landing";
import { SecuritySpec } from "@/components/site/security-spec";

const AUTH_SPEC = securitySpec.filter(
  (g) => g.label === "Cifrado" || g.label === "Auditoría"
);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 pb-8">
      <SiteHeader />
      <main className="flex w-full max-w-5xl flex-1 items-center justify-center gap-16 px-4 sm:px-8">
        <div className="hidden max-w-xs flex-col gap-7 lg:flex">
          <h2 className="t-h2 text-ink">
            Tu bóveda, cifrada y bajo tu control
          </h2>
          <SecuritySpec compact groups={AUTH_SPEC} />
        </div>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
