import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/brand/shapes";

// TODO(store): cuando la extensión esté publicada, reemplazar por la URL exacta
// del listing: https://chromewebstore.google.com/detail/boveda-kf-1/<EXTENSION_ID>
const CWS_URL = "https://chromewebstore.google.com/search/B%C3%B3veda%20KF-1";

export const metadata: Metadata = {
  title: "Extensión de Chrome",
  description:
    "Instalá la extensión de Chrome de Bóveda KF-1 desde la Chrome Web Store y rellená tus credenciales en cualquier formulario de login con un solo click.",
};

export default function ExtensionPage() {
  return (
    <div className="flex w-full flex-col gap-8">

        <PageHero
          pair="azul"
          icon="puzzle"
          kicker="Extensión para Chrome"
          title="Autocompletá logins en un clic"
          lead="Instalá la extensión una vez y rellená el login de cualquier cuenta de tus clientes. Sin copiar y pegar."
        >
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={CWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-13 items-center gap-2.5 rounded-full bg-kf-manteca px-7 text-[13px] font-extrabold tracking-[0.14em] text-kf-azul-hondo no-underline transition hover:opacity-90"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
              AGREGAR A CHROME
            </a>
            <span className="text-xs font-bold tracking-[0.12em]">CHROME WEB STORE · GRATIS · V1.1</span>
          </div>
        </PageHero>

        {/* ── Steps ── */}
        <div className="flex w-full flex-col gap-4">

          {/* Step 01 */}
          <div className="rounded-[40px] border-2 border-kf-borde bg-white p-6 sm:p-10">
            <div className="mb-5 flex items-start gap-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full font-brand text-lg font-extrabold bg-kf-carmesi text-kf-manteca">
                01
              </span>
              <div>
                <h2 className="font-brand text-2xl leading-[1.04] font-extrabold text-kf-azul-hondo uppercase">Andá a la Chrome Web Store</h2>
                <p className="text-xs text-ink-soft">La tienda oficial de extensiones de Google</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-ink-soft">
                Hacé click en <strong className="text-ink">&ldquo;Agregar a Chrome&rdquo;</strong>{" "}
                arriba. Se abre el listing de <strong className="text-ink">Bóveda KF-1</strong> en la
                Chrome Web Store — nada de modos raros ni archivos sueltos.
              </p>

              {/* Visual: store listing card */}
              <div className="flex items-center justify-center rounded-xl border border-border-soft bg-gray/30 py-6">
                <div className="w-full max-w-sm rounded-xl border border-border-soft bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue">
                      <svg aria-hidden="true" width="20" height="24" viewBox="0 0 10 12" fill="none">
                        <path d="M5 1L1 2.5V6C1 8.5 2.8 10.7 5 11.5C7.2 10.7 9 8.5 9 6V2.5L5 1Z" fill="white" opacity="0.9"/>
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">Bóveda KF-1</p>
                      <p className="text-xs text-ink-soft">Autocompletá logins en un clic</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold tracking-wide text-bosque">
                      Ofrecido por kitifica.com
                    </span>
                    <span className="rounded-md bg-blue px-3 py-1.5 text-xs font-bold text-white">
                      Agregar a Chrome
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 02 */}
          <div className="rounded-[40px] border-2 border-kf-borde bg-white p-6 sm:p-10">
            <div className="mb-5 flex items-start gap-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full font-brand text-lg font-extrabold bg-kf-bosque text-kf-lima">
                02
              </span>
              <div>
                <h2 className="font-brand text-2xl leading-[1.04] font-extrabold text-kf-azul-hondo uppercase">Confirmá la instalación</h2>
                <p className="text-xs text-ink-soft">Un clic en el diálogo de Chrome</p>
              </div>
            </div>
            <ol className="mb-5 flex flex-col gap-3">
              {[
                <>
                  Chrome muestra un diálogo <strong className="text-ink">&ldquo;¿Agregar Bóveda KF-1?&rdquo;</strong>{" "}
                  con lo que la extensión necesita. Acá no hay letra chica: solo pide acceso a{" "}
                  <code className="rounded bg-kf-niebla px-1.5 py-0.5 font-mono text-xs text-kf-azul">
                    kf1.kitifica.com
                  </code>
                  , no a todos los sitios.
                </>,
                <>
                  Hacé click en <strong className="text-ink">&ldquo;Agregar extensión&rdquo;</strong> y
                  Chrome la instala en un segundo. El ícono de Bóveda KF-1 aparece en tu navegador.
                </>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue/20 text-[10px] font-bold text-kf-azul">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
                </li>
              ))}
            </ol>

            {/* Chrome install dialog mockup */}
            <div className="overflow-hidden rounded-xl border border-border-soft">
              {/* Chrome window chrome */}
              <div className="flex items-center gap-2 bg-[#292a2c] px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                  <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="mx-2 flex h-6 flex-1 items-center rounded-full bg-[#1e1f21] px-3">
                  <span className="font-mono text-xs text-[#9aa0aa]">chromewebstore.google.com</span>
                </div>
              </div>
              {/* Dialog body */}
              <div className="bg-[#292a2c] p-4">
                <div className="mx-auto max-w-xs rounded-xl bg-white p-4 shadow-lg">
                  <p className="text-sm font-semibold text-ink">¿Agregar &ldquo;Bóveda KF-1&rdquo;?</p>
                  <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-gray/50 px-2.5 py-2">
                    <span className="mt-px text-xs">🔐</span>
                    <p className="text-xs leading-relaxed text-ink-soft">
                      Esta extensión podrá leer y modificar los datos de{" "}
                      <span className="font-mono text-[11px] text-kf-azul">kf1.kitifica.com</span>
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <span className="rounded-md px-3 py-1.5 text-xs font-semibold text-ink-soft">
                      Cancelar
                    </span>
                    <span className="rounded-md bg-blue px-3 py-1.5 text-xs font-bold text-white">
                      Agregar extensión
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 03 */}
          <div className="rounded-[40px] border-2 border-kf-borde bg-white p-6 sm:p-10">
            <div className="mb-5 flex items-start gap-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full font-brand text-lg font-extrabold bg-kf-durazno text-kf-carmesi-hondo">
                03
              </span>
              <div>
                <h2 className="font-brand text-2xl leading-[1.04] font-extrabold text-kf-azul-hondo uppercase">Fijá la extensión</h2>
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
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue/20 text-[10px] font-bold text-kf-azul">
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
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full font-brand text-lg font-extrabold bg-kf-lavanda text-kf-amarillo">
                04
              </span>
              <div>
                <h2 className="font-brand text-2xl leading-[1.04] font-extrabold text-kf-azul-hondo uppercase">Conectá tu cuenta</h2>
                <p className="text-xs text-ink-soft">Solo una vez — tarda 2 minutos</p>
              </div>
            </div>
            <ol className="mb-5 flex flex-col gap-3">
              {[
                <>
                  Iniciá sesión en tu bóveda y andá a{" "}
                  <Link
                    href="/dashboard/ai"
                    className="font-medium text-kf-azul underline underline-offset-2 hover:opacity-80"
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
                    <svg aria-hidden="true" width="10" height="12" viewBox="0 0 10 12" fill="none">
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
              <svg aria-hidden="true" width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path d="M1.5 7L6.5 12L16.5 1.5" stroke="#6bb5d6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-brand text-2xl leading-[1.04] font-extrabold text-kf-azul-hondo uppercase">¡Listo para usar!</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                Andá a cualquier sitio con un formulario de login, hacé click en el ícono de Bóveda
                KF-1 en Chrome, elegí la credencial y listo — los campos se rellenan solos.
              </p>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="flex w-full flex-col gap-3">
          <h2 className="font-brand text-2xl leading-[1.04] font-extrabold text-kf-azul-hondo uppercase">Preguntas frecuentes</h2>
          {[
            {
              q: "¿La extensión lee lo que hago en las páginas que visito?",
              a: "No. No lee, guarda ni transmite el contenido de las páginas ni tu historial. Solo escribe el usuario y la contraseña en el formulario de login cuando vos hacés clic en “Llenar”, y no tiene permisos sobre los sitios que visitás.",
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
              a: 'Podés generar uno nuevo en Conectar IA dentro de tu bóveda y revocar el viejo desde la sección Token CLI. El token viejo deja de funcionar automáticamente.',
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
          <a href="mailto:hola@kitifica.com" className="text-kf-azul hover:underline">
            Escribinos a hola@kitifica.com
          </a>
        </p>

    </div>
  );
}
