import type { Metadata } from "next";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = {
  title: "Elegir contraseña nueva",
  robots: { index: false, follow: false },
};

export default async function ResetTokenPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { token } = await params;
  const { email } = await searchParams;
  return <ResetForm token={token} email={email ?? ""} />;
}
