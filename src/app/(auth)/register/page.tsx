import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Crear bóveda",
  description: "Creá tu bóveda gratis en Bóveda KF-1: hasta 10 credenciales encriptadas, sin tarjeta de crédito.",
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
