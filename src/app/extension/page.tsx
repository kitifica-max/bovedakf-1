import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Extensión de Chrome — Bóveda KF-1",
  description:
    "Instalá la extensión de Chrome de Bóveda KF-1 y rellená tus credenciales en cualquier formulario de login con un solo click.",
};

export default function ExtensionPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-4 pb-20 sm:px-8" style={{ paddingTop: "5.75rem" }}>

        {/* ── Hero ── */}
        <div className="w-full text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue/30 bg-blue/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-soft">
            Extensión para Chrome
          </span>

          <h1 className="font-display mt-4 text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Autofill desde tu bóveda
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-soft">
            Instalá la extensión una sola vez y rellená cualquier formulario de login con tus
            credenciales en un click. Sin copiar y pegar.
          </p>

          {/* Download CTA */}
          <div className="mt-10 flex flex-col items-center gap-2">
            <a
              href="/kf1-extension.zip"
              download="kf1-extension.zip"
              className="inline-flex items-center gap-3 whitespace-nowrap rounded-full bg-blue px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-blue/25 transition-opacity hover:opacity-90"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
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
            <span className="text-xs text-ink-soft/60">Chrome · Gratis · v1.0</span>
          </div>
        </div>

        {/* ── Steps ── */}
        <div className="flex w-full flex-col gap-4">

          {/* Step 01 */}
          <div className="rounded-2xl border border-border-soft bg-paper p-6 sm:p-7">
            <div className="mb-5 flex items-start gap-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue text-sm font-bold text-white">
                01
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Descargá la extensión</h2>
                <p className="text-xs text-ink-soft">Un archivo ZIP con todo lo necesario</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-ink-soft">
                Hacé click en <strong className="text-ink">&ldquo;Descargar extensión&rdquo;</strong> arriba. Se
                guardará un archivo{" "}
                <code className="rounded bg-gray-deep/60 px-1.5 py-0.5 font-mono text-xs text-blue-soft">
                  kf1-extension.zip
                </code>{" "}
                en tu carpeta de descargas.
              </p>
              <p className="text-sm leading-relaxed text-ink-soft">
                <strong className="text-ink">Importante:</strong> Antes de instalar, descomprimí el
                archivo haciendo doble click sobre él. Obtenés una carpeta llamada{" "}
                <code className="rounded bg-gray-deep/60 px-1.5 py-0.5 font-mono text-xs text-blue-soft">
                  chrome-extension
                </code>
                . No la muevas ni la borres — Chrome la va a necesitar en esa ubicación para
                siempre.
              </p>

              {/* Visual: zip → folder */}
              <div className="flex items-center justify-center gap-6 rounded-xl border border-border-soft bg-gray/30 py-6">
                <div className="flex flex-col items-center gap-2">
                  <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
                    <rect x="1" y="1" width="38" height="46" rx="4" fill="#2d3548" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
                    <path d="M26 1L36 11H26V1Z" fill="rgba(255,255,255,0.18)"/>
                    <text x="20" y="33" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#edf0f4">.zip</text>
                  </svg>
                  <span className="text-xs text-ink-soft">kf1-extension.zip</span>
                </div>
                <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                  <path d="M1 7h24M19 1l6 6-6 6" stroke="#6bb5d6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="flex flex-col items-center gap-2">
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <path d="M2 14C2 11.8 3.8 10 6 10H22L28 16H38C40.2 16 42 17.8 42 20V38C42 40.2 40.2 42 38 42H6C3.8 42 2 40.2 2 38V14Z" fill="#1d5f8f" opacity="0.4" stroke="#6bb5d6" strokeWidth="1.5"/>
                    <path d="M22 24v8M19 29l3 3 3-3" stroke="#6bb5d6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs text-ink-soft">chrome-extension/</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 02 */}
          <div className="rounded-2xl border border-border-soft bg-paper p-6 sm:p-7">
            <div className="mb-5 flex items-start gap-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue text-sm font-bold text-white">
                02
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Instalá en Chrome</h2>
                <p className="text-xs text-ink-soft">Cuatro clics y listo</p>
              </div>
            </div>
            <ol className="mb-5 flex flex-col gap-3">
              {[
                <>
                  Abrí Chrome y en la barra de direcciones escribí{" "}
                  <code className="rounded bg-gray-deep/60 px-1.5 py-0.5 font-mono text-xs font-bold text-blue-soft">
                    chrome://extensions
                  </code>{" "}
                  y presioná Enter.
                </>,
                <>
                  En la esquina superior derecha activá el interruptor{" "}
                  <strong className="text-ink">&ldquo;Modo de desarrollador&rdquo;</strong>. Se va a
                  poner azul.
                </>,
                <>
                  Hacé click en el botón{" "}
                  <strong className="text-ink">&ldquo;Cargar sin empaquetar&rdquo;</strong> que
                  aparece arriba a la izquierda.
                </>,
                <>
                  Navegá hasta la carpeta{" "}
                  <code className="rounded bg-gray-deep/60 px-1.5 py-0.5 font-mono text-xs text-blue-soft">
                    chrome-extension
                  </code>{" "}
                  que descomprimiste y hacé click en <strong className="text-ink">Abrir</strong>.
                </>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue/20 text-[10px] font-bold text-blue-soft">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
                </li>
              ))}
            </ol>

            {/* Chrome extensions page mockup */}
            <div className="overflow-hidden rounded-xl border border-border-soft">
              {/* Chrome window chrome */}
              <div className="flex items-center gap-2 bg-[#292a2c] px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                  <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="mx-2 flex h-6 flex-1 items-center rounded-full bg-[#1e1f21] px-3">
                  <span className="font-mono text-xs text-[#9aa0aa]">chrome://extensions</span>
                </div>
              </div>
              {/* Page body */}
              <div className="bg-[#292a2c] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#c8cdd6]">Extensiones</span>
                  <div className="flex items-center gap-1.5 rounded-full border border-[#1d5f8f] bg-[#1d5f8f]/80 px-2.5 py-1">
                    <span className="text-[10px] font-semibold text-white">Modo desarrollador</span>
                    <div className="relative h-3 w-5 rounded-full bg-white/30">
                      <div className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
                <div className="w-fit rounded-lg border border-[#1d5f8f] bg-transparent px-3 py-1.5 text-xs font-semibold text-[#6bb5d6]">
                  Cargar sin empaquetar
                </div>
              </div>
            </div>
          </div>

          {/* Step 03 */}
          <div className="rounded-2xl border border-border-soft bg-paper p-6 sm:p-7">
            <div className="mb-5 flex items-start gap-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue text-sm font-bold text-white">
                03
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Fijá la extensión</h2>
                <p className="text-xs text-ink-soft">Para tenerla siempre visible en la barra</p>
              </div>
            </div>
            <ol className="flex flex-col gap-3">
              {[
                <>
                  Hacé click en el ícono de pieza de rompecabezas 🧩 en la barra de herramientas de
                  Chrome (arriba a la derecha).
                </>,
                <>
                  Buscá <strong className="text-ink">Bóveda KF-1</strong> en la lista y hacé click
                  en el ícono de alfiler 📌 para fijarlo en la barra.
                </>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue/20 text-[10px] font-bold text-blue-soft">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Step 04 */}
          <div className="rounded-2xl border border-blue/25 bg-blue/[0.07] p-6 sm:p-7">
            <div className="mb-5 flex items-start gap-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue text-sm font-bold text-white">
                04
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Conectá tu cuenta</h2>
                <p className="text-xs text-ink-soft">Solo una vez — tarda 2 minutos</p>
              </div>
            </div>
            <ol className="mb-5 flex flex-col gap-3">
              {[
                <>
                  Iniciá sesión en tu bóveda y andá a{" "}
                  <Link
                    href="/dashboard/ai"
                    className="font-medium text-blue-soft underline underline-offset-2 hover:opacity-80"
                  >
                    Conectar IA
                  </Link>{" "}
                  en el menú.
                </>,
                <>
                  En la sección <strong className="text-ink">Token CLI</strong>, hacé click en{" "}
                  <strong className="text-ink">&ldquo;Generar token&rdquo;</strong> y copiá el
                  token que aparece.
                </>,
                <>
                  Hacé click en el ícono de Bóveda KF-1 en Chrome, pegá el token en el campo y
                  hacé click en <strong className="text-ink">&ldquo;Conectar&rdquo;</strong>.
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

            {/* Extension popup mockup */}
            <div className="mx-auto max-w-xs overflow-hidden rounded-xl border border-border-soft">
              {/* Popup header */}
              <div className="flex items-center justify-between border-b border-border-soft bg-paper px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue">
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                      <path d="M5 1L1 2.5V6C1 8.5 2.8 10.7 5 11.5C7.2 10.7 9 8.5 9 6V2.5L5 1Z" fill="white" opacity="0.9"/>
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-ink">Bóveda KF-1</span>
                </div>
              </div>
              {/* Popup body */}
              <div className="bg-paper p-3">
                <p className="mb-2 text-[10px] font-medium text-ink-soft">Pegá tu token de API aquí</p>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-lg border border-border-soft bg-gray/40 px-2.5 py-1.5 font-mono text-[10px] text-ink-soft/50">
                    kf1_xxxxxxxxxx...
                  </div>
                  <div className="rounded-lg bg-blue px-3 py-1.5 text-[11px] font-semibold text-white">
                    Conectar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Done ── */}
        <div className="w-full rounded-2xl border border-blue/30 bg-blue/[0.08] p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue/20">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path d="M1.5 7L6.5 12L16.5 1.5" stroke="#6bb5d6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-ink">¡Listo para usar!</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                Andá a cualquier sitio con un formulario de login, hacé click en el ícono de Bóveda
                KF-1 en Chrome, elegí la credencial y listo — los campos se rellenan solos.
              </p>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="flex w-full flex-col gap-3">
          <h2 className="font-display text-xl font-bold text-ink">Preguntas frecuentes</h2>
          {[
            {
              q: "¿Por qué necesita el modo desarrollador?",
              a: "Chrome requiere el modo desarrollador para instalar extensiones que no están en la Chrome Web Store. Es temporal — la extensión estará en la tienda oficial próximamente.",
            },
            {
              q: "¿Mis contraseñas son seguras al hacer autofill?",
              a: "Sí. Las contraseñas se descifran en el servidor con tu token de acceso y viajan al navegador cifradas (HTTPS). La extensión nunca las almacena localmente.",
            },
            {
              q: "¿Funciona en Edge, Brave u otros navegadores Chromium?",
              a: "En teoría sí — también usan el mismo sistema de extensiones. Pero solo está probado en Chrome oficial por ahora.",
            },
            {
              q: "¿Qué pasa si pierdo el token?",
              a: 'Podés generar uno nuevo en Conectar IA dentro de tu bóveda. El token viejo deja de funcionar automáticamente.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-border-soft bg-paper p-4 sm:p-5">
              <p className="font-semibold text-ink">{q}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{a}</p>
            </div>
          ))}
        </div>

        {/* ── Footer CTA ── */}
        <p className="text-center text-sm text-ink-soft/60">
          ¿Tenés problemas con la instalación?{" "}
          <a href="mailto:hola@kitifica.com" className="text-blue-soft hover:underline">
            Escribinos a hola@kitifica.com
          </a>
        </p>

        <SiteFooter />
      </main>
    </>
  );
}
