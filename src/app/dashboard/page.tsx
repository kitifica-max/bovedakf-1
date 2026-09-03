import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardIndexPage() {
  const session = await auth();
  const vault = await db.vault.findFirst({ where: { ownerId: session!.user.id } });
  if (!vault) redirect("/login");
  redirect(`/dashboard/${vault.id}`);
}
