import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Extensión de Chrome — Bóveda KF-1",
  description:
    "Instala la extensión de Chrome de Bóveda KF-1 y rellena tus credenciales automáticamente en cualquier sitio web.",
};

const steps = [
  {
    phase: "01",
    title: "Descargá la extensión",
    sub: "Un archivo ZIP con todo lo necesario",
    body: (
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm leading-relaxed text-ink-soft">
          Hacé click en el botón de descarga de esta página. Se guardará un archivo{" "}
          <code className="rounded bg-gray/50 px-1 py-0.5 font-mono text-xs text-ink">
            kf1-extension.zip
          </code>{" "}
          en tu carpeta de descargas.
        </p>
        <p className="text-sm leading-relaxed text-ink-soft">
          Antes de instalar, <strong className="text-ink">descomprimí</strong> el archivo
          haciendo doble click sobre él. Vas a obtener una carpeta llamada{" "}
          <code className="rounded bg-gray/50 px-1 py-0.5 font-mono text-xs text-ink">
            chrome-extension
          </code>
          . No muevas ni borres esa carpeta — Chrome la necesita en esa ubicación.
        </p>
        {/* Visual: zip → folder */}
        <div className="flex w-full items-center justify-center gap-4 rounded-2xl border border-border-soft bg-gray/30 py-6">
          <div className="flex flex-col items-center gap-2">
            <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
              <rect x="1" y="1" width="38" height="46" rx="4" fill="#FAF7F2" stroke="#E5E0D8" strokeWidth="1.5"/>
              <path d="M26 1v10h10" fill="#E5E0D8" stroke="#E5E0D8" strokeWidth="1"/>
              <path d="M26 1L36 11H26V1Z" fill="#D4CFC8"/>
              <text x="20" y="33" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#6B6560">
                .zip
              </text>
            </svg>
            <span className="text-xs text-ink-soft">kf1-extension.zip</span>
          </div>
          <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
            <path d="M1 7h24M19 1l6 6-6 6" stroke="#2B4EAF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="flex flex-col items-center gap-2">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path d="M2 14C2 11.8 3.8 10 6 10H22L28 16H38C40.2 16 42 17.8 42 20V38C42 40.2 40.2 42 38 42H6C3.8 42 2 40.2 2 38V14Z" fill="#EBF0FF" stroke="#2B4EAF" strokeWidth="1.5" opacity="0.7"/>
              <path d="M22 22v10M18 28l4 4 4-4" stroke="#2B4EAF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
            </svg>
            <span className="text-xs text-ink-soft">chrome-extension/</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    phase: "02",
    title: "Instalá en Chrome",
    sub: "Cuatro clics y listo",
    body: (
      <div className="flex flex-col gap-5">
        <ol className="flex flex-col gap-4">
          {[
            {
              n: "A",
              text: (
                <>
                  Abrí Chrome y en la barra de direcciones escribí{" "}
                  <code className="rounded bg-gray/50 px-1.5 py-0.5 font-mono text-xs font-bold text-blue">
                    chrome://extensions
                  </code>{" "}
                  y presioná Enter.
                </>
              ),
            },
            {
              n: "B",
              text: (
                <>
                  En la esquina superior derecha activá el interruptor que dice{" "}
                  <strong className="text-ink">&ldquo;Modo de desarrollador&rdquo;</strong>. El
                  interruptor se pondrá azul.
                </>
              ),
            },
            {
              n: "C",
              text: (
                <>
                  Hacé click en el botón{" "}
                  <strong className="text-ink">&ldquo;Cargar sin empaquetar&rdquo;</strong> que
                  aparece arriba a la izquierda.
                </>
              ),
            },
            {
              n: "D",
              text: (
                <>
                  En el explorador de archivos, navegá hasta la carpeta{" "}
                  <code className="rounded bg-gray/50 px-1.5 py-0.5 font-mono text-xs text-ink">
                    chrome-extension
                  </code>{" "}
                  que descomprimiste y hacé click en <strong className="text-ink">Abrir</strong>.
                </>
              ),
            },
          ].map(({ n, text }) => (
            <li key={n} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue text-[10px] font-bold text-white">
                {n}
              </span>
              <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
            </li>
          ))}
        </ol>

        {/* Chrome extensions page mockup */}
        <div className="overflow-hidden rounded-2xl border border-border-soft">
          {/* Chrome chrome */}
          <div className="flex items-center gap-2 bg-[#DEE1E6] px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <div className="h-3 w-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="mx-2 flex h-6 flex-1 items-center rounded-full bg-white px-3">
              <span className="font-mono text-xs text-gray-500">chrome://extensions</span>
            </div>
          </div>
          {/* Page body */}
          <div className="bg-[#F1F3F4] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Extensiones</span>
              <div className="flex items-center gap-1.5 rounded-full border border-[#2B4EAF] bg-[#2B4EAF] px-2.5 py-1">
                <span className="text-[10px] font-semibold text-white">Modo desarrollador</span>
                <div className="relative h-3 w-5 rounded-full bg-white/40">
                  <div className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
            </div>
            <button className="rounded-lg border border-[#2B4EAF] bg-white px-3 py-1.5 text-xs font-semibold text-[#2B4EAF] shadow-sm">
              Cargar sin empaquetar
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    phase: "03",
    title: "Fijá la extensión",
    sub: "Para tenerla siempre a mano",
    body: (
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-ink-soft">
          Después de instalarla, la extensión puede estar oculta en el menú de extensiones. Para
          tenerla visible en la barra:
        </p>
        <ol className="flex flex-col gap-3">
          {[
            <>
              Hacé click en el ícono de pieza de rompecabezas{" "}
              <svg
                className="inline -mt-0.5"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M5 2H9V5L11 7V9H9V12H5V9H3V7L5 5V2Z"
                  stroke="#6B6560"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>{" "}
              en la barra de Chrome.
            </>,
            <>
              Buscá <strong className="text-ink">Bóveda KF-1</strong> en la lista y hacé click en
              el ícono de alfiler para fijarlo.
            </>,
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue/10 text-[10px] font-bold text-blue">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    phase: "04",
    title: "Conectá tu cuenta",
    sub: "Solo la primera vez",
    body: (
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-ink-soft">
          Para que la extensión pueda acceder a tus credenciales necesita un{" "}
          <strong className="text-ink">token de acceso</strong>. Es como una llave que vos le das.
        </p>
        <ol className="flex flex-col gap-3">
          {[
            <>
              Iniciá sesión en{" "}
              <Link
                href="/login"
                className="font-medium text-blue underline underline-offset-2 hover:opacity-80"
              >
                kf1.kitifica.com
              </Link>{" "}
              y andá a{" "}
              <Link
                href="/dashboard/ai"
                className="font-medium text-blue underline underline-offset-2 hover:opacity-80"
              >
                Conectar IA
              </Link>
              .
            </>,
            <>
              En la sección <strong className="text-ink">Token CLI</strong>, hacé click en{" "}
              <strong className="text-ink">&ldquo;Generar token&rdquo;</strong>. Copialo.
            </>,
            <>
              Hacé click en el ícono de Bóveda KF-1 en Chrome, pegá el token y hacé click en{" "}
              <strong className="text-ink">&ldquo;Conectar&rdquo;</strong>.
            </>,
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
            </li>
          ))}
        </ol>
        {/* Token flow mockup */}
        <div className="overflow-hidden rounded-2xl border border-border-soft">
          <div className="bg-[#FAF7F2] p-4">
            <div className="mb-3 flex items-center justify-between border-b border-border-soft pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2B4EAF]">
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                    <path
                      d="M6 1L1 3V7C1 9.5 3 12 6 13C9 12 11 9.5 11 7V3L6 1Z"
                      fill="white"
                      opacity="0.9"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold text-gray-800">Bóveda KF-1</span>
              </div>
            </div>
            <p className="mb-2 text-[11px] font-medium text-gray-500">
              Pegá tu token de API aquí
            </p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg border border-[#E5E0D8] bg-white px-2.5 py-1.5 font-mono text-[10px] text-gray-400">
                kf1_xxxxxxxxxx...
              </div>
              <div className="rounded-lg bg-[#2B4EAF] px-3 py-1.5 text-[11px] font-semibold text-white">
                Conectar
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Nav */}
      <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-border-soft bg-paper/80 px-5 py-3 backdrop-blur-xl sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-on-dark.svg" alt="Bóveda KF-1" className="h-5 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-blue px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Mi bóveda
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          {/* Shield icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue shadow-lg shadow-blue/20">
            <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
              <path
                d="M14 2L2 7V16C2 22.6 7.6 28.7 14 30.5C20.4 28.7 26 22.6 26 16V7L14 2Z"
                fill="white"
                opacity="0.92"
              />
              <path
                d="M9 16L12.5 19.5L19 12.5"
                stroke="#2B4EAF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue/25 bg-blue/[0.07] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue">
            Extensión para Chrome
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Autofill desde tu bóveda
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-soft">
            Instalá la extensión una sola vez y rellená cualquier formulario de login con tus
            credenciales en un click. Sin copiar y pegar.
          </p>

          {/* Download CTA */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="/kf1-extension.zip"
              download="kf1-extension.zip"
              className="inline-flex items-center gap-2.5 rounded-full bg-blue px-7 py-3 text-sm font-semibold text-white shadow-md shadow-blue/25 transition-opacity hover:opacity-90"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2v8M4 7l4 4 4-4M2 13h12"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Descargar extensión
            </a>
            <span className="text-xs text-ink-soft">Chrome · Gratis · v1.0</span>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-8">
          {steps.map(({ phase, title, sub, body }) => (
            <div key={phase} className="rounded-3xl border border-border-soft bg-white p-6 sm:p-7">
              <div className="mb-5 flex items-start gap-4">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue text-sm font-bold text-white">
                  {phase}
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
                  <p className="text-xs text-ink-soft">{sub}</p>
                </div>
              </div>
              {body}
            </div>
          ))}
        </div>

        {/* Done state */}
        <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-green-100">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path
                  d="M1.5 7L6.5 12L16.5 1.5"
                  stroke="#16A34A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-green-800">¡Listo para usar!</h3>
              <p className="mt-1 text-sm leading-relaxed text-green-700">
                Andá a cualquier sitio web con un formulario de login, hacé click en el ícono de
                Bóveda KF-1 en Chrome, elegí la credencial y listo — los campos se rellenan solos.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-10 flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-ink">Preguntas frecuentes</h2>
          {[
            {
              q: "¿Por qué necesita el modo desarrollador?",
              a: "Chrome requiere el modo desarrollador para instalar extensiones que no están en la Chrome Web Store. Esto es temporal — la extensión estará disponible en la tienda oficial próximamente.",
            },
            {
              q: "¿Mis contraseñas viajan por internet al hacer autofill?",
              a: "Las contraseñas se descifran en el servidor usando tu token de acceso y se envían al navegador de forma cifrada (HTTPS). Nunca se guardan en la extensión ni en el navegador.",
            },
            {
              q: "¿Funciona en Firefox, Edge u otros navegadores?",
              a: "Por ahora solo Chrome. El soporte para otros navegadores basados en Chromium (Edge, Brave, Arc) está en la hoja de ruta.",
            },
            {
              q: "¿Qué pasa si pierdo el token?",
              a: "Podés generar un nuevo token en cualquier momento desde tu dashboard en Conectar IA. El token viejo dejará de funcionar automáticamente.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-2xl border border-border-soft bg-white p-5">
              <p className="font-semibold text-ink">{q}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a}</p>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-ink-soft">
            ¿Tenés problemas con la instalación?{" "}
            <a
              href="mailto:hola@kitifica.com"
              className="font-medium text-blue hover:underline"
            >
              Escribinos
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
