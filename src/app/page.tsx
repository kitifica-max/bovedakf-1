import Link from "next/link";
import {
  ChevronDownIcon,
  ClockIcon,
  FingerprintIcon,
  ListChecksIcon,
  LockIcon,
  LogOutIcon,
  Share2Icon,
  ShieldOffIcon,
} from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { Reveals } from "@/components/reveals";
import { HeroSection } from "@/components/site/sections/hero";
import { ProblemaSection } from "@/components/site/sections/problema";
import { ComoFuncionaSection } from "@/components/site/sections/como-funciona";
import { ParaEquiposSection } from "@/components/site/sections/para-equipos";
import { SeguridadSection } from "@/components/site/sections/seguridad";

const features: { title: string; body: string; Icon: typeof ClockIcon; wide?: boolean }[] = [
  {
    title: "Tu equipo, con roles",
    body: "Invitá por correo con rol de Editor (agrega y comparte) o Lector (solo ve). Cada persona crea su propia cuenta y cada acción queda firmada en la auditoría con su nombre.",
    Icon: Share2Icon,
    wide: true,
  },
  {
    title: "Expiración automática",
    body: "El link deja de funcionar solo. No depende de que te acuerdes de revocarlo.",
    Icon: ClockIcon,
  },
  {
    title: "Clave que nunca vemos",
    body: "El link se descifra en el navegador de quien lo recibe. Nuestra base de datos solo guarda el texto cifrado.",
    Icon: LockIcon,
  },
  {
    title: "Auditoría completa",
    body: "Cada vista, cada revocación, con IP y fecha exacta. Historial que no se puede editar.",
    Icon: ListChecksIcon,
  },
  {
    title: "Revocación instantánea",
    body: "¿Algo se filtró? Un click y el link muere, aunque todavía no haya expirado.",
    Icon: ShieldOffIcon,
  },
  {
    title: "Passkeys y 2FA",
    body: "Entrá con Face ID, Touch ID o Windows Hello, o con un código de 6 dígitos. Vos elegís.",
    Icon: FingerprintIcon,
  },
  {
    title: "Sesión que se cuida sola",
    body: "2 minutos sin actividad y te preguntamos si seguís ahí, antes de cerrar la sesión.",
    Icon: LogOutIcon,
  },
];

const faqs = [
  {
    q: "¿Cómo agrego a mi equipo?",
    a: "Desde el panel de tu bóveda, en “Equipo”, invitás por correo y elegís el rol: Editor (agrega, edita y comparte credenciales) o Lector (solo ve y copia). La persona recibe un link, crea su contraseña y ya queda dentro de tu organización. Podés cambiar roles o quitar a alguien cuando quieras, y cada acción queda registrada con su nombre.",
  },
  {
    q: "¿Ustedes pueden ver mis contraseñas?",
    a: "No. Las credenciales se guardan cerradas con llave. Nosotros guardamos solo la versión cerrada; la llave para abrir cada link la tiene únicamente la persona a la que se lo mandás. Ni nosotros ni nadie que entre a nuestra base de datos puede leer lo que hay adentro.",
  },
  {
    q: "¿Qué pasa si alguien reenvía el link a otra persona?",
    a: "Cualquiera con el link completo (incluida la clave) puede verlo mientras esté activo. Por eso cada link tiene expiración y podés revocarlo en cualquier momento desde el dashboard.",
  },
  {
    q: "¿Necesito instalar algo?",
    a: "No. Bóveda KF-1 es una PWA — funciona en el navegador y se puede instalar como app si querés, pero no es obligatorio.",
  },
  {
    q: "¿Qué pasa cuando expira un link?",
    a: "Deja de funcionar automáticamente. Nadie puede volver a acceder a esa credencial con ese link, y el intento queda registrado en la auditoría.",
  },
  {
    q: "¿Es gratis?",
    a: "Sí, hasta 20 credenciales por bóveda, sin tarjeta de crédito.",
  },
  {
    q: "¿Tienen doble factor de autenticación?",
    a: "Sí. Podés activar 2FA con app de autenticación (TOTP) o entrar directo con una passkey — Face ID, Touch ID o Windows Hello, sin contraseña. Además, si te quedás inactivo 2 minutos, te avisamos antes de cerrar la sesión sola.",
  },
];

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
    <main className="flex flex-col items-center gap-6 p-4 pb-16 sm:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <HeroSection />

      {/* Problema */}
      <ProblemaSection />

      {/* Cómo funciona */}
      <ComoFuncionaSection />

      {/* Para equipos */}
      <ParaEquiposSection />

      {/* Features */}
      <section aria-labelledby="features-heading" className="w-full max-w-5xl">
        <div data-reveal className="mb-6 max-w-xl">
          <p className="text-sm font-medium text-blue">Qué incluye</p>
          <h2 id="features-heading" className="mt-1 font-pixel text-2xl leading-[1.3] text-ink">
            Todo lo que incluye
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              data-reveal
              className={`rounded-2xl border border-blue/30 bg-blue/[0.08] p-6 backdrop-blur-md ${
                f.wide ? "sm:col-span-2" : ""
              }`}
            >
              <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-blue-soft text-blue">
                <f.Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-1 max-w-xl text-sm text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mecanismo de seguridad */}
      <SeguridadSection />

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="w-full max-w-5xl">
        <h2 data-reveal id="faq-heading" className="mb-6 text-center font-pixel text-2xl leading-[1.3] text-ink">
          Preguntas frecuentes
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((f) => (
            <details key={f.q} data-reveal className="group rounded-2xl border border-border-soft bg-paper p-5 open:pb-5">
              <summary className="cursor-pointer list-none font-display text-base font-semibold text-ink marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {f.q}
                  <ChevronDownIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-blue transition group-open:rotate-180" />
                </span>
              </summary>
              <p className="mt-2 text-sm text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="w-full max-w-5xl rounded-2xl bg-ink p-8 text-center text-gray sm:p-14">
        <h2 data-reveal className="font-pixel text-2xl leading-[1.3] sm:text-3xl">
          Dejá de reenviar contraseñas por chat
        </h2>
        <p data-reveal className="mx-auto mt-3 max-w-md text-gray/70">
          Creá tu bóveda en menos de un minuto. Sin tarjeta de crédito, hasta 20 credenciales gratis.
        </p>
        <div data-reveal className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-full bg-blue-soft px-6 py-3 text-sm font-medium text-ink-reverse transition hover:brightness-95 active:scale-[0.98]"
          >
            Crear mi bóveda gratis →
          </Link>
        </div>
      </section>

      <SiteFooter />
      <Reveals />
    </main>
  );
}
