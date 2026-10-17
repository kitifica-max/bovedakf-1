import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { IdleSessionGuard } from "@/components/idle-session-guard";

export const metadata: Metadata = {
  title: "Mi bóveda",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return (
    <div className="kf-app flex min-h-dvh flex-col">
      <IdleSessionGuard />
      {children}
    </div>
  );
}
