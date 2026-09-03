import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 p-4 sm:p-8">
      <div className="w-full max-w-5xl">
        <SiteHeader />
      </div>
      <main className="flex w-full flex-1 items-center justify-center">{children}</main>
      <SiteFooter />
    </div>
  );
}
