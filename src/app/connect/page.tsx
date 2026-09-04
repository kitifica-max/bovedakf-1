import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Section } from "@/components/site/section";
import { SectionHead } from "@/components/site/section-head";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kf1.kitifica.com";

export const metadata = {
  title: "Conectar agente de IA — Boveda KF-1",
  description:
    "Conecta Claude u otro agente de IA a tu Boveda KF-1 para acceder a credenciales de forma segura.",
};

export default function ConnectPage() {
  return (
    <div className="flex flex-col items-center gap-10 px-4 pb-16 sm:gap-16 sm:px-8">
      <SiteHeader />
      <main className="w-full max-w-3xl rounded-2xl border border-border-soft bg-paper p-8 sm:p-12">
        <SectionHead
          kicker="MCP"
          title="Conectá tu agente a KF-1"
          lead="Tu agente de IA puede listar credenciales y generar links temporales para que vos las veas. Las contraseñas NUNCA se exponen al modelo."
        />

        <div className="flex flex-col gap-6">
          {/* Claude Code */}
          <div className="rounded-2xl border border-border-soft bg-gray/40 p-6">
            <h3 className="font-display text-lg font-semibold text-ink">Claude Code (terminal)</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Copiá y pegá este comando en tu terminal:
            </p>
            <code className="mt-3 block break-all rounded-xl bg-gray px-4 py-3 font-mono text-xs text-ink">
              claude mcp add --transport streamable-http kf1 {BASE_URL}/api/mcp
            </code>
            <p className="mt-3 text-xs text-ink-soft">
              Después, abrí Claude en el directorio de tu proyecto y pedile credenciales.
              Te va a pedir autorizar en el navegador.
            </p>
          </div>

          {/* Claude Desktop */}
          <div className="rounded-2xl border border-border-soft bg-gray/40 p-6">
            <h3 className="font-display text-lg font-semibold text-ink">Claude Desktop (escritorio)</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Andá a <strong>Claude &gt; Settings &gt; Developer &gt; Edit Config</strong> y agregá:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-gray px-4 py-3 font-mono text-xs text-ink">
{`{
  "mcpServers": {
    "kf1": {
      "url": "${BASE_URL}/api/mcp"
    }
  }
}`}
            </pre>
            <p className="mt-3 text-xs text-ink-soft">
              Reiniciá Claude Desktop. Al primer uso, te pedirá autorizar.
            </p>
          </div>

          {/* Security */}
          <div className="rounded-2xl border border-blue/25 bg-blue/[0.07] p-6">
            <h3 className="mb-2 font-display text-sm font-semibold text-ink">Seguridad</h3>
            <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-ink-soft">
              <li>• El agente NUNCA recibe contraseñas — solo links temporales</li>
              <li>• Vos abrís el link en tu navegador para ver el secreto</li>
              <li>• Links expiran en 15 minutos, sesión en 2 horas</li>
              <li>• Todo queda registrado en auditoría</li>
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
