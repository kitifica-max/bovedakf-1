import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Crear bóveda",
  description: "Creá tu bóveda gratis en Bóveda KF-1: hasta 5 personas, clientes ilimitados y 5 links de regalo para compartir. Sin suscripción.",
  alternates: { canonical: "/register" },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; email?: string }>;
}) {
  const { next, email } = await searchParams;
  return <RegisterForm nextUrl={next} prefillEmail={email ?? ""} />;
}
