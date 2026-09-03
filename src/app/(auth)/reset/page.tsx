import type { Metadata } from "next";
import { ResetRequestForm } from "./reset-request-form";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  robots: { index: false, follow: false },
};

export default function ResetRequestPage() {
  return <ResetRequestForm />;
}
