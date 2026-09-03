import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-6 p-4 pb-16 sm:p-8">
      <div className="w-full max-w-5xl">
        <SiteHeader />
      </div>
      <main className="w-full max-w-3xl rounded-2xl border border-border-soft bg-paper p-6 sm:p-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
