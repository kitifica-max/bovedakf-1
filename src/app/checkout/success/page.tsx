import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SuccessPoller } from "./success-poller";

export const metadata: Metadata = {
  title: "Confirmando pago — Bóveda KF-1",
  robots: { index: false },
};

// Wompi redirects here after payment. We poll every 3s (via router.refresh)
// until the webhook fires and activates the subscription, then redirect.
export default async function CheckoutSuccessPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sub = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (sub?.status === "ACTIVE") {
    redirect("/dashboard/billing?activated=1");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <SuccessPoller />
    </div>
  );
}
