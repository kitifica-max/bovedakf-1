import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { BrandLanding } from "@/components/brand/landing";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Bóveda KF-1",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  description:
    "La bóveda para agencias: contraseñas y códigos 2FA de las redes de cada cliente, ordenados y cifrados con AES-256-GCM. Links para compartir que expiran, revocación en un clic y auditoría completa.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default async function HomePage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const session = await auth();
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BrandLanding signedIn={!!session?.user} />
    </>
  );
}
