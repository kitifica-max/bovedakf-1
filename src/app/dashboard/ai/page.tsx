import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheckIcon } from "@/components/icons";
import { CliTokenManager } from "@/components/cli-token-manager";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kf1.kitifica.com";

export default async function AiDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Get all vaults the user owns
  const vaults = await db.vault.findMany({
    where: { owner: { id: session.user.id } },
    include: {
      credentials: {
        select: { id: true, service: true, username: true, aiAccessible: true },
        orderBy: { service: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const aiCredentials = vaults.flatMap((v) =>
    v.credentials
      .filter((c) => c.aiAccessible)
      .map((c) => ({ ...c, vaultId: v.id, vaultName: v.name }))
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink w-fit"
      >
        <span aria-hidden="true">&larr;</span> Volver al dashboard
      </Link>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-blue text-paper">
          <ShieldCheckIcon className="h-4 w-4" />
        </span>
        <h1 className="font-pixel text-xl leading-[1.3] text-ink">AI &amp; MCP</h1>
      </div>

      {/* Status */}
      <div className="rounded-2xl border border-blue/25 bg-blue/[0.07] p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Estado</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {aiCredentials.length > 0 ? (
            <>
              <strong className="text-ink">{aiCredentials.length}</strong> credencial(es) disponible(s) para agentes de IA.
            </>
          ) : (
            "No hay credenciales habilitadas para AI todavía."
          )}
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-border-soft bg-paper p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Cómo funciona</h2>
        <ol className="mt-3 flex flex-col gap-3 text-sm text-ink-soft">
          <li className="flex items-start gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-paper">1</span>
            <span>Instalá el MCP en tu agente (Claude Code, Desktop, etc.) con el comando de abajo.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-paper">2</span>
            <span>Cuando el agente necesite credenciales, te va a pedir autorizar en el navegador.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-paper">3</span>
            <span>Hacé login y aprobá. La sesión dura 2 horas.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-paper">4</span>
            <span>Pedile credenciales en lenguaje natural. El agente genera links temporales que vos abrís en el navegador.</span>
          </li>
        </ol>
      </div>

      {/* Install */}
      <div className="rounded-2xl border border-border-soft bg-paper p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Instalar MCP</h2>

        <div className="mt-4 flex flex-col gap-3">
          <details className="group rounded-xl border border-border-soft bg-gray/40 p-4">
            <summary className="cursor-pointer list-none font-medium text-sm text-ink transition hover:text-blue">
              Claude Code (terminal)
            </summary>
            <div className="mt-3 rounded-xl bg-gray/60 p-4">
              <p className="mb-2 text-xs text-ink-soft">Copiá y pegá en tu terminal:</p>
              <code className="block break-all rounded-lg bg-gray px-3 py-2 font-mono text-xs text-ink">
                claude mcp add --transport streamable-http kf1 {BASE_URL}/api/mcp
              </code>
            </div>
          </details>

          <details className="group rounded-xl border border-border-soft bg-gray/40 p-4">
            <summary className="cursor-pointer list-none font-medium text-sm text-ink transition hover:text-blue">
              Claude Desktop (escritorio)
            </summary>
            <div className="mt-3 rounded-xl bg-gray/60 p-4">
              <p className="text-xs text-ink-soft">
                Copiá y pegá este comando en tu terminal. Detecta tu sistema operativo automáticamente:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-gray px-3 py-2 font-mono text-[10px] leading-relaxed text-ink">{`python3 -c "
import json, os, sys
if sys.platform == 'win32':
    path = os.path.expandvars(r'%APPDATA%\\Claude\\claude_desktop_config.json')
else:
    path = os.path.expanduser('~/Library/Application Support/Claude/claude_desktop_config.json')
os.makedirs(os.path.dirname(path), exist_ok=True)
try:
    with open(path) as f: config = json.load(f)
except: config = {}
config.setdefault('mcpServers', {})['kf1'] = {'command': 'npx', 'args': ['-y', 'mcp-remote', '${BASE_URL}/api/mcp']}
with open(path, 'w') as f: json.dump(config, f, indent=2)
print('KF-1 instalado. Reiniciá Claude Desktop.')
"`}</pre>
              <p className="mt-2 text-xs text-ink-soft">
                Reiniciá Claude Desktop después de ejecutarlo.
              </p>
            </div>
          </details>

          <details className="group rounded-xl border border-border-soft bg-gray/40 p-4">
            <summary className="cursor-pointer list-none font-medium text-sm text-ink transition hover:text-blue">
              Otros agentes (Cursor, Windsurf, etc.)
            </summary>
            <div className="mt-3 rounded-xl bg-gray/60 p-4">
              <p className="text-xs text-ink-soft">
                Endpoint para cualquier agente con soporte MCP streamable HTTP:
              </p>
              <code className="mt-2 block break-all rounded-lg bg-gray px-3 py-2 font-mono text-xs text-ink">
                {BASE_URL}/api/mcp
              </code>
            </div>
          </details>
        </div>
      </div>

      {/* CLI Token */}
      <div className="rounded-2xl border border-border-soft bg-paper p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Token CLI</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Generá un token para usar con la skill de Claude Code. El token se almacena localmente
          y permite acceder a tus credenciales sin OAuth.
        </p>
        <CliTokenManager />
      </div>

      {/* AI-accessible credentials */}
      <div className="rounded-2xl border border-border-soft bg-paper p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Credenciales disponibles para AI</h2>
        {aiCredentials.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            No hay credenciales habilitadas. Andá a tu bóveda, expandí una credencial y activá el toggle &quot;Acceso AI&quot;.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {aiCredentials.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl bg-gray/40 px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink">{c.service}</p>
                  <p className="text-xs text-ink-soft">{c.username} · {c.vaultName}</p>
                </div>
                <Link
                  href={`/dashboard/${c.vaultId}`}
                  className="text-xs text-ink-soft underline decoration-border-soft underline-offset-4 transition hover:text-ink"
                >
                  Ver bóveda
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Security */}
      <div className="rounded-2xl border border-border-soft bg-paper p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Seguridad</h2>
        <ul className="mt-3 flex flex-col gap-1.5 text-xs text-ink-soft">
          <li>• El agente <strong className="text-ink">NUNCA</strong> recibe contraseñas en texto plano</li>
          <li>• Solo recibe links temporales que vos abrís en el navegador</li>
          <li>• Los links expiran en 15 minutos</li>
          <li>• La sesión del agente dura 2 horas</li>
          <li>• Cada acceso queda registrado en auditoría</li>
          <li>• Podes desactivar el acceso a cualquier credencial en cualquier momento</li>
        </ul>
      </div>
    </div>
  );
}
