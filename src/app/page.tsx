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

export default async function HomePage({ searchParams }: { searchParams: Promise<{ cuenta?: string }> }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const session = await auth();
  const { cuenta } = await searchParams;
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {cuenta === "eliminada" && (
        <p role="status" className="m-0 bg-kf-lima px-5 py-3 text-center font-brand-sans text-sm font-bold text-kf-bosque-hondo">
          Tu cuenta y sus datos fueron eliminados. Gracias por haber usado Bóveda KF-1.
        </p>
      )}
      <BrandLanding signedIn={!!session?.user} />
    </>
  );
}
