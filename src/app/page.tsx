import Link from "next/link";
import {
  ActivityIcon,
  ChevronDownIcon,
  ClockIcon,
  KeyRoundIcon,
  ListChecksIcon,
  LockIcon,
  SaveIcon,
  SearchXIcon,
  Share2Icon,
  ShieldAlertIcon,
  ShieldOffIcon,
  ShuffleIcon,
} from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroReveal } from "@/components/hero-reveal";

const stats = [
  { label: "Credenciales gratis en el plan inicial", value: "20", Icon: KeyRoundIcon },
  { label: "Rango de expiración configurable por link", value: "1h–7d", Icon: ClockIcon },
];

const problems = [
  {
    title: "Contraseñas dispersas",
    body: "Un poco en el email, un poco en Slack, un poco en un Notion que nadie actualiza. Nadie sabe cuál es la versión real.",
    Icon: ShuffleIcon,
  },
  {
    title: "Cero auditoría",
    body: "Cuando algo sale mal, no hay forma de saber quién entró a qué credencial, ni cuándo.",
    Icon: SearchXIcon,
  },
  {
    title: "Texto plano para siempre",
    body: "Un mensaje de Slack con una contraseña adentro no se borra solo. Vive ahí, sin cifrar, indefinidamente.",
    Icon: ShieldAlertIcon,
  },
];

const steps = [
  {
    n: "01",
    title: "Guarda",
    body: "Añades la credencial y se encripta al instante con AES-256-GCM antes de tocar la base de datos.",
    Icon: SaveIcon,
  },
  {
    n: "02",
    title: "Comparte",
    body: "Generas un link con expiración (1h a 7 días) y permiso de lectura o descarga.",
    Icon: Share2Icon,
  },
  {
    n: "03",
    title: "Audita",
    body: "Ves exactamente quién entró, cuándo y desde qué IP — el link se puede revocar con un click.",
    Icon: ActivityIcon,
  },
];

const features = [
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
];

const faqs = [
  {
    q: "¿Ustedes pueden ver mis contraseñas?",
    a: "Las credenciales guardadas se encriptan en el servidor. Pero la clave de cada link compartido vive únicamente en la URL que reciben tus compañeros — nunca la guardamos, así que no podemos descifrar ese link nosotros mismos.",
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
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Bóveda KF-1",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  description:
    "Gestor de credenciales compartidas seguro para equipos: encriptación en cada link, expiración configurable y auditoría completa de accesos.",
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
      <div className="w-full max-w-5xl rounded-2xl border border-border-soft bg-paper p-4 shadow-[0_1px_0_rgba(22,19,14,0.04)] sm:p-6">
        <SiteHeader />

        <HeroReveal>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
            <div className="flex flex-col justify-center rounded-2xl border border-border-soft bg-gray/60 p-6 sm:p-10">
              <span data-reveal className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-blue-soft px-3 py-1 text-xs font-medium text-ink-reverse">
                <LockIcon aria-hidden="true" className="h-3.5 w-3.5" /> Encriptado extremo a extremo en cada link
              </span>
              <h1 data-reveal className="font-pixel text-3xl leading-[1.3] tracking-tight text-ink sm:text-4xl">
                Comparte credenciales sin dejar rastro en el chat
              </h1>
              <p data-reveal className="mt-5 max-w-md text-ink-soft">
                Guarda accesos de equipo, genera links que se autodestruyen en horas o días, y
                mira exactamente quién entró a qué y cuándo. Sin spreadsheets, sin plaintext.
              </p>
              <div data-reveal className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-gray transition hover:bg-ink/90"
                >
                  Crear mi bóveda →
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-border-soft px-6 py-3 text-sm font-medium text-ink transition hover:bg-paper"
                >
                  Ya tengo cuenta
                </Link>
              </div>
              <div data-reveal className="mt-8 flex flex-wrap items-center gap-6 border-t border-border-soft pt-5">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <s.Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-blue" />
                    <div>
                      <p className="font-display text-lg leading-none font-semibold text-ink">{s.value}</p>
                      <p className="mt-1 text-xs text-ink-soft">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div data-reveal className="glass relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-2xl p-8 text-center sm:p-10">
              <video
                aria-hidden="true"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover opacity-40"
              >
                <source src="/anim-bits-hero-1.mp4" type="video/mp4" />
                <source src="/anim-bits-hero-1.webm" type="video/webm" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-paper/40 via-paper/70 to-paper/90" />

              <div className="relative grid h-28 w-28 place-items-center rounded-full bg-blue-soft/10 ring-1 ring-blue/30">
                <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-blue-soft/20 ring-1 ring-blue/40">
                  <LockIcon aria-hidden="true" className="h-8 w-8 text-blue-soft" />
                </div>
              </div>
              <div className="relative flex flex-wrap items-center justify-center gap-2">
                {["AES-256", "GCM", "E2E"].map((tag) => (
                  <span
                    key={tag}
                    className="font-pixel rounded-full border border-blue/40 bg-blue/10 px-2.5 py-1 text-[10px] text-blue-soft"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="relative max-w-[15rem] text-sm text-ink-soft">
                Cifrado en tu navegador antes de tocar nuestra base de datos.
              </p>
            </div>
          </div>
        </HeroReveal>
      </div>

      {/* Problema */}
      <section aria-labelledby="problema-heading" className="w-full max-w-5xl">
        <div className="mb-6 max-w-xl">
          <p className="text-sm font-medium text-blue">El problema</p>
          <h2 id="problema-heading" className="mt-1 font-pixel text-2xl leading-[1.3] tracking-tight text-ink">
            No es la contraseña. Es dónde vive.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {problems.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border-soft bg-paper p-6">
              <p.Icon aria-hidden="true" className="h-6 w-6 text-blue" />
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section aria-labelledby="como-funciona-heading" className="w-full max-w-5xl rounded-2xl border border-border-soft bg-paper p-6 sm:p-10">
        <div className="mb-8 max-w-xl">
          <p className="text-sm font-medium text-blue">Cómo funciona</p>
          <h2 id="como-funciona-heading" className="mt-1 font-pixel text-2xl leading-[1.3] tracking-tight text-ink">
            Tres pasos, cero fricción
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n}>
              <div className="flex items-center gap-2">
                <s.Icon aria-hidden="true" className="h-5 w-5 text-blue" />
                <p className="font-display text-sm font-semibold text-blue">{s.n}</p>
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="features-heading" className="w-full max-w-5xl">
        <div className="mb-6 max-w-xl">
          <p className="text-sm font-medium text-blue">Qué incluye</p>
          <h2 id="features-heading" className="mt-1 font-pixel text-2xl leading-[1.3] tracking-tight text-ink">
            Diseñado para que nadie tenga que confiar a ciegas
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border-soft bg-paper p-6">
              <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-blue-soft text-blue">
                <f.Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mecanismo de seguridad */}
      <section aria-labelledby="seguridad-heading" className="glass w-full max-w-5xl rounded-2xl p-6 sm:p-10">
        <p className="text-sm font-medium text-ink">Cómo protegemos tu secreto</p>
        <h2 id="seguridad-heading" className="mt-1 max-w-2xl font-pixel text-xl leading-[1.3] tracking-tight text-ink sm:text-2xl">
          La clave de cada link vive solo en la URL — nunca en nuestra base de datos
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-ink-soft">
          Cuando generás un link, la clave de descifrado queda en el fragmento de la URL
          (todo lo que va después de <code className="rounded bg-paper px-1 py-0.5">#</code>).
          Los navegadores nunca envían esa parte al servidor. Nosotros guardamos el texto
          cifrado; quien recibe el link lo descifra en su propio navegador. No es una promesa
          de confianza — es cómo funciona el protocolo.
        </p>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="w-full max-w-3xl">
        <h2 id="faq-heading" className="mb-6 text-center font-pixel text-2xl leading-[1.3] tracking-tight text-ink">
          Preguntas frecuentes
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border-soft bg-paper p-5 open:pb-5">
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
        <h2 className="font-pixel text-2xl leading-[1.3] tracking-tight sm:text-3xl">
          Dejá de reenviar contraseñas por chat
        </h2>
        <p className="mx-auto mt-3 max-w-md text-gray/70">
          Creá tu bóveda en menos de un minuto. Sin tarjeta de crédito, hasta 20 credenciales gratis.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-full bg-blue-soft px-6 py-3 text-sm font-medium text-ink-reverse transition hover:brightness-95"
          >
            Crear mi bóveda gratis →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
