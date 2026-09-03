import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Crear bóveda",
  description: "Creá tu bóveda gratis en Bóveda KF-1: hasta 20 credenciales encriptadas, sin tarjeta de crédito.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
