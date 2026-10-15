import { redirect } from "next/navigation";

// Subscriptions are no longer sold; link packs are bought from the dashboard.
export default function CheckoutPage() {
  redirect("/dashboard/plans");
}
