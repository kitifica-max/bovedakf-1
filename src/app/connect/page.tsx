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
          title="Conecta tu agente de IA"
          lead="Boveda KF-1 se integra con agentes de IA via MCP (Model Context Protocol). Tu agente puede listar y leer credenciales que vos autorices, con sesiones temporales de 2 horas."
        />

        <div className="flex flex-col gap-8">
          {/* Step 1 */}
          <div className="rounded-2xl border border-border-soft bg-gray/40 p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue text-sm font-bold text-paper">
                1
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">
                Activa credenciales para AI
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">
              Entra a tu bóveda, expandí una credencial y activá el toggle{" "}
              <strong className="text-ink">&quot;Acceso AI (MCP)&quot;</strong>.
              Solo las credenciales con este toggle activo serán visibles para el agente.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-border-soft bg-gray/40 p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue text-sm font-bold text-paper">
                2
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">
                Instalá el MCP en tu agente
              </h3>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {/* Claude Code */}
              <details className="group rounded-xl border border-border-soft bg-paper p-4">
                <summary className="cursor-pointer list-none font-medium text-ink transition hover:text-blue">
                  Claude Code (terminal)
                </summary>
                <div className="mt-3 rounded-xl bg-gray/60 p-4">
                  <p className="mb-2 text-xs text-ink-soft">
                    Copiá y pegá este comando en tu terminal:
                  </p>
                  <code className="block break-all rounded-lg bg-gray px-3 py-2 font-mono text-xs text-ink">
                    claude mcp add --transport streamable-http securevault {BASE_URL}/api/mcp
                  </code>
                  <p className="mt-2 text-xs text-ink-soft">
                    Cuando el agente necesite acceder a credenciales, te va a pedir autorizar
                    via el navegador. La sesión dura 2 horas.
                  </p>
                </div>
              </details>

              {/* Claude Desktop */}
              <details className="group rounded-xl border border-border-soft bg-paper p-4">
                <summary className="cursor-pointer list-none font-medium text-ink transition hover:text-blue">
                  Claude Desktop (app de escritorio)
                </summary>
                <div className="mt-3 rounded-xl bg-gray/60 p-4">
                  <p className="mb-2 text-xs text-ink-soft">
                    Andá a <strong>Claude &gt; Settings &gt; Developer &gt; Edit Config</strong> y agregá:
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-gray px-3 py-2 font-mono text-xs text-ink">
{`{
  "mcpServers": {
    "securevault": {
      "url": "${BASE_URL}/api/mcp"
    }
  }
}`}
                  </pre>
                  <p className="mt-2 text-xs text-ink-soft">
                    Reiniciá Claude Desktop. Al primer uso, te pedirá autorizar en el navegador.
                  </p>
                </div>
              </details>

              {/* Other agents */}
              <details className="group rounded-xl border border-border-soft bg-paper p-4">
                <summary className="cursor-pointer list-none font-medium text-ink transition hover:text-blue">
                  Otros agentes (Cursor, Windsurf, etc.)
                </summary>
                <div className="mt-3 rounded-xl bg-gray/60 p-4">
                  <p className="text-xs text-ink-soft">
                    Cualquier agente que soporte MCP con{" "}
                    <strong>streamable HTTP</strong> puede conectarse. Configurá el endpoint:
                  </p>
                  <code className="mt-2 block break-all rounded-lg bg-gray px-3 py-2 font-mono text-xs text-ink">
                    {BASE_URL}/api/mcp
                  </code>
                </div>
              </details>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-border-soft bg-gray/40 p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue text-sm font-bold text-paper">
                3
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">
                Autorizá el acceso
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">
              La primera vez que el agente pida una credencial, se abrirá tu navegador
              con una pantalla de autorización. Hace login con tu usuario de Boveda KF-1
              y aprobá el acceso. El token dura 2 horas y se renueva automáticamente.
            </p>
          </div>

          {/* Security note */}
          <div className="rounded-2xl border border-blue/25 bg-blue/[0.07] p-6">
            <h3 className="mb-2 font-display text-sm font-semibold text-ink">
              Seguridad
            </h3>
            <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-ink-soft">
              <li>• El agente NUNCA recibe contraseñas en texto plano</li>
              <li>• Solo recibe links temporales que el usuario abre en su navegador</li>
              <li>• Los links expiran en 15 minutos</li>
              <li>• La sesión del agente dura 2 horas</li>
              <li>• Cada acceso queda registrado en el log de auditoría</li>
              <li>• Podes revocar el acceso en cualquier momento desde el dashboard</li>
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
