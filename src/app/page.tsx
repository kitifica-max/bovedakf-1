import { HeroSection } from "@/components/site/sections/hero";
import { ProblemaSection } from "@/components/site/sections/problema";
import { ComoFuncionaSection } from "@/components/site/sections/como-funciona";
import { ParaEquiposSection } from "@/components/site/sections/para-equipos";
import { SeguridadSection } from "@/components/site/sections/seguridad";
import { YAdemasSection } from "@/components/site/sections/y-ademas";
import { FaqSection } from "@/components/site/sections/faq";
import { CtaFinalSection } from "@/components/site/sections/cta-final";
import { SiteFooter } from "@/components/site-footer";
import { Reveals } from "@/components/reveals";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Bóveda KF-1",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  description:
    "Gestor de credenciales compartidas seguro para equipos: invitá a tu equipo por correo con rol de Editor o Lector, encriptación en cada link, expiración configurable y auditoría completa de accesos.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function HomePage() {
  return (
    <main className="flex flex-col items-center gap-16 p-4 pb-16 sm:gap-24 sm:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeroSection />
      <ProblemaSection />
      <ComoFuncionaSection />
      <ParaEquiposSection />
      <SeguridadSection />
      <YAdemasSection />
      <FaqSection />
      <CtaFinalSection />
      <SiteFooter />
      <Reveals />
    </main>
  );
}
