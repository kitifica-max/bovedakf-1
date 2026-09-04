import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { securitySpec } from "@/content/landing";
import { SecuritySpec } from "@/components/site/security-spec";

const AUTH_SPEC = securitySpec.filter(
  (g) => g.label === "Cifrado" || g.label === "Auditoría"
);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 p-4 sm:p-8">
      <div className="w-full max-w-5xl">
        <SiteHeader />
      </div>
      <main className="flex w-full max-w-5xl flex-1 items-center justify-center gap-16">
        <div className="hidden max-w-xs flex-col gap-7 lg:flex">
          <h2 className="t-h2 text-ink">
            Tu bóveda, cifrada de punta a punta
          </h2>
          <SecuritySpec compact groups={AUTH_SPEC} />
        </div>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
