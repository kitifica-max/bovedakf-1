import type { Metadata } from "next";
import Link from "next/link";
import { SystemPage } from "@/components/brand/system-page";
import { pillFill, pillLine } from "@/components/brand/styles";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

export default function NotFound() {
  return (
    <SystemPage
      code="404"
      pair="amarillo"
      icon="eye"
      title="Esta página no existe"
      lead="Puede que el link esté mal escrito o que esa página se haya movido. Tus clientes y cuentas siguen donde estaban."
    >
      <Link href="/dashboard" className={pillFill}>IR A MIS CLIENTES</Link>
      <Link href="/" className={pillLine}>VOLVER AL INICIO</Link>
    </SystemPage>
  );
}
