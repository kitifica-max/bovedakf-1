import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seguridad — Bóveda KF-1",
  description:
    "Arquitectura Zero-Knowledge, cifrado AES-256-GCM en el cliente, y auditoría completa. Solo vos tenés la llave.",
  alternates: { canonical: "/seguridad" },
};

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

// ── Reusable section card ─────────────────────────────────────────────────────

function SectionCard({
  icon,
  kicker,
  title,
  children,
}: {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue/10 text-blue">
          {icon}
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue">{kicker}</p>
          <h2 className="t-h2 text-ink">{title}</h2>
        </div>
      </div>
      <div className="ml-12 flex flex-col gap-3 text-sm leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}

// ── Badge component ───────────────────────────────────────────────────────────

function Badge({ grade, label, sub, href }: { grade: string; label: string; sub: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-border-soft bg-gray/30 px-4 py-3 transition hover:border-blue/30 hover:bg-blue/5"
    >
      <span className="font-display text-2xl font-bold text-blue group-hover:text-blue/80">{grade}</span>
      <div>
        <p className="text-xs font-semibold text-ink">{label}</p>
        <p className="text-[11px] text-ink-soft">{sub}</p>
      </div>
    </a>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  return (
    <div>
      <h1 className="t-display text-ink">Seguridad</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Cómo protegemos tus credenciales — con especificaciones técnicas verificables.
      </p>

      {/* Badges */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Badge
          grade="A+"
          label="SSL Labs"
          sub="TLS 1.3 · HSTS · OCSP Stapling"
          href="https://www.ssllabs.com/ssltest/analyze.html?d=kf1.kitifica.com"
        />
        <Badge
          grade="A+"
          label="HTTP Observatory"
          sub="120 / 100 · 12 / 12 tests"
          href="https://developer.mozilla.org/en-US/observatory/analyze?host=kf1.kitifica.com"
        />
        <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-gray/30 px-4 py-3">
          <span className="font-display text-2xl font-bold text-blue">ZK</span>
          <div>
            <p className="text-xs font-semibold text-ink">Zero-Knowledge</p>
            <p className="text-[11px] text-ink-soft">Arquitectura by design</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-10">

        {/* 1 — Promesa */}
        <SectionCard icon={<IconShield />} kicker="Promesa de privacidad" title="Solo vos tenés la llave">
          <p>
            Bóveda KF-1 opera bajo una arquitectura de{" "}
            <strong className="text-ink">confianza cero (Zero-Knowledge)</strong>. Esto significa que
            ninguna credencial viaja al servidor en texto plano, en ningún momento, bajo ninguna
            circunstancia.
          </p>
          <p>
            Ni los creadores de la aplicación pueden leer, recuperar ni restablecer las contraseñas
            que guardás. Si perdés tu clave maestra, no hay backdoor. Esa es la garantía.
          </p>
        </SectionCard>

        <hr className="border-border-soft" />

        {/* 2 — Cifrado */}
        <SectionCard icon={<IconLock />} kicker="Arquitectura de cifrado" title="La seguridad se sella en tu pantalla">
          <p>
            Todo el cifrado ocurre <strong className="text-ink">del lado del cliente</strong> — en tu
            navegador, antes de que cualquier dato salga de tu dispositivo. El servidor de Bóveda KF-1
            solo recibe y almacena texto ya cifrado; nunca ve los valores originales.
          </p>

          <div className="rounded-xl border border-border-soft bg-gray/30 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink">Flujo end-to-end</p>
            <ol className="flex flex-col gap-2">
              {[
                "Ingresás la credencial en el formulario (navegador).",
                "JavaScript local genera una clave derivada con scrypt y cifra el valor con AES-256-GCM.",
                "El texto cifrado (ciphertext) viaja a la base de datos — el secreto nunca sale de tu dispositivo.",
                "Para leer la credencial, el cliente descifra en memoria usando tu clave. El servidor no participa.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue/15 text-[10px] font-bold text-blue">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              ["Algoritmo de cifrado", "AES-256-GCM"],
              ["Derivación de clave", "scrypt (N=32768)"],
              ["Cifrado de links", "AES-256-GCM + clave efímera"],
              ["Transporte", "TLS 1.3 obligatorio"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border-soft bg-paper px-3 py-2">
                <p className="text-ink-soft">{label}</p>
                <p className="font-mono font-medium text-ink">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <hr className="border-border-soft" />

        {/* 3 — Links dinámicos */}
        <SectionCard icon={<IconLink />} kicker="Compartir sin riesgos" title="Links a prueba de intrusos">
          <p>
            Cuando compartís una credencial — con un compañero o con un asistente de IA — Bóveda KF-1
            nunca expone la contraseña en texto plano. En su lugar, genera un{" "}
            <strong className="text-ink">enlace dinámico de un solo uso</strong> con una clave efímera
            embebida en el fragmento de URL (<code className="rounded bg-gray/60 px-1 font-mono text-[10px]">#k=…</code>
            ).
          </p>
          <p>
            La clave de descifrado viaja exclusivamente en el fragmento — esa parte de la URL que el
            navegador{" "}
            <strong className="text-ink">nunca envía al servidor</strong>. El servidor almacena el
            ciphertext pero es matemáticamente imposible que lo descifre.
          </p>

          <div className="rounded-xl border border-blue/20 bg-blue/5 p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-blue">
              Integración con IA (Claude Code · Skill KF-1)
            </p>
            <p>
              La skill genera un link seguro mediante la API. El agente ve el link pero{" "}
              <strong className="text-ink">nunca ve la contraseña</strong>. El secreto solo se
              revela cuando vos abrís el link en tu navegador. Cada link expira en 1 hora.
            </p>
          </div>

          <ul className="flex flex-col gap-1.5">
            {[
              "Cada link es único y de un solo uso — reutilizarlo es imposible.",
              "Podés revocar cualquier link activo en cualquier momento desde el dashboard.",
              "Rate limiting: máximo 20 req/min por IP en el endpoint público.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-blue"><IconCheck /></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <hr className="border-border-soft" />

        {/* 4 — Auditoría */}
        <SectionCard icon={<IconClipboard />} kicker="Control y auditoría" title="Control total desde tu panel">
          <p>
            Cada acción sobre una credencial compartida queda registrada en el audit log. El
            dashboard te muestra exactamente qué pasó, quién lo hizo, y desde dónde.
          </p>

          <div className="rounded-xl border border-border-soft bg-gray/30 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink">
              Qué registra el audit log
            </p>
            <ul className="flex flex-col gap-2">
              {[
                ["Acción", "Creación, visualización, denegación o revocación del link"],
                ["Actor", "Email o cuenta que generó el link"],
                ["IP de acceso", "Dirección IP anonimizada del visitante"],
                ["Agente de IA", "Nombre de la skill o cliente que solicitó el link"],
                ["Timestamp", "Fecha y hora exacta (UTC)"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-start gap-2 text-[12px]">
                  <span className="mt-0.5 shrink-0 text-blue"><IconCheck /></span>
                  <span>
                    <strong className="text-ink">{k}:</strong> {v}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>

        <hr className="border-border-soft" />

        {/* 5 — Transparencia técnica */}
        <SectionCard icon={<IconCode />} kicker="Para usuarios avanzados" title="Transparencia tecnológica">
          <p>
            El sistema opera sin infraestructuras intermedias innecesarias. No hay proxies
            propietarios, no hay servicios de terceros con acceso a tus datos cifrados.
          </p>

          <div className="rounded-xl border border-border-soft bg-gray/30 p-4 font-mono text-[11px]">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Stack técnico verificable</p>
            <div className="flex flex-col gap-1.5 text-ink-soft">
              <span><span className="text-blue">Framework  </span> Next.js 16 (App Router) · Netlify Functions</span>
              <span><span className="text-blue">Base de datos  </span> PostgreSQL via Supabase (datos cifrados at-rest)</span>
              <span><span className="text-blue">Auth  </span> NextAuth v5 · JWT · Credentials provider</span>
              <span><span className="text-blue">Cifrado  </span> Node.js crypto · AES-256-GCM · scrypt</span>
              <span><span className="text-blue">TLS  </span> TLS 1.3 · HSTS · OCSP Stapling · CAA</span>
              <span><span className="text-blue">Headers  </span> CSP · X-Frame-Options · Referrer-Policy</span>
            </div>
          </div>

          <p>
            La ejecución criptográfica ocurre íntegramente en el cliente, eliminando puntos de falla
            centralizados. El servidor es un repositorio de texto cifrado — sin valor si es
            comprometido.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://www.ssllabs.com/ssltest/analyze.html?d=kf1.kitifica.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border-soft bg-paper px-3 py-2 text-[11px] transition hover:border-blue/30 hover:bg-blue/5"
            >
              <span className="font-bold text-blue">A+</span>
              <span className="text-ink-soft">Ver reporte SSL Labs →</span>
            </a>
            <a
              href="https://developer.mozilla.org/en-US/observatory/analyze?host=kf1.kitifica.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border-soft bg-paper px-3 py-2 text-[11px] transition hover:border-blue/30 hover:bg-blue/5"
            >
              <span className="font-bold text-blue">120</span>
              <span className="text-ink-soft">Ver reporte HTTP Observatory →</span>
            </a>
          </div>
        </SectionCard>

      </div>

      {/* Footer note */}
      <p className="mt-12 text-center text-[11px] text-ink-soft/60">
        ¿Tenés preguntas de seguridad?{" "}
        <Link href="/contacto" className="underline decoration-border-soft underline-offset-4 hover:text-ink-soft">
          Contactanos
        </Link>{" "}
        ·{" "}
        <Link href="/privacidad" className="underline decoration-border-soft underline-offset-4 hover:text-ink-soft">
          Política de privacidad
        </Link>
      </p>
    </div>
  );
}
