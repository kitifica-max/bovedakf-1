import { auth } from "@/lib/auth";
import { BrandFooter, BrandHeader } from "@/components/brand/site-chrome";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <div className="kf-app min-h-dvh">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-10 px-4 pb-12 sm:px-8">
        <BrandHeader signedIn={!!session?.user} />
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">{children}</main>
        <BrandFooter />
      </div>
    </div>
  );
}
