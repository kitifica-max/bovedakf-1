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
  if (!session?.user) redirect("/login");
  return (
    <>
      <IdleSessionGuard />
      {children}
    </>
  );
}
