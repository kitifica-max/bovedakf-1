import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-10 px-4 pb-16 sm:gap-16 sm:px-8">
      <SiteHeader />
      <main className="w-full max-w-3xl rounded-2xl border border-border-soft bg-paper p-8 sm:p-12">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
