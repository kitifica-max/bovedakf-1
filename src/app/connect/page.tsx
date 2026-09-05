import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHead } from "@/components/site/section-head";
import Link from "next/link";

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
          {/* Claude Code - Skill (Recommended) */}
          <div className="rounded-2xl border border-blue/25 bg-blue/[0.07] p-6">
            <h3 className="font-display text-lg font-semibold text-ink">Claude Code — Skill (Recomendado)</h3>
            <p className="mt-2 text-sm text-ink-soft">
              La forma más simple. Funciona en terminal, escritorio, y cualquier modo.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div className="rounded-xl bg-gray/60 p-4">
                <p className="mb-2 text-xs font-medium text-ink">1. Generá un token CLI</p>
                <p className="text-xs text-ink-soft">
                  Andá a <Link href="/dashboard/ai" className="text-blue underline">AI &amp; MCP</Link> y generá un token.
                </p>
              </div>
              <div className="rounded-xl bg-gray/60 p-4">
                <p className="mb-2 text-xs font-medium text-ink">2. Instalá la skill</p>
                <code className="block break-all rounded-lg bg-gray px-3 py-2 font-mono text-[10px] text-ink">
                  mkdir -p ~/.claude/skills/kf1 && cp .claude/skills/kf1/* ~/.claude/skills/kf1/
                </code>
              </div>
              <div className="rounded-xl bg-gray/60 p-4">
                <p className="mb-2 text-xs font-medium text-ink">3. Configurá el token</p>
                <code className="block break-all rounded-lg bg-gray px-3 py-2 font-mono text-[10px] text-ink">
                  bash ~/.claude/skills/kf1/kf1.sh setup
                </code>
              </div>
              <div className="rounded-xl bg-gray/60 p-4">
                <p className="mb-2 text-xs font-medium text-ink">4. Usá la skill</p>
                <code className="block break-all rounded-lg bg-gray px-3 py-2 font-mono text-[10px] text-ink">
                  /kf1 list<br/>
                  /kf1 view &lt;credential-id&gt;
                </code>
              </div>
            </div>
          </div>

          {/* Claude Code - MCP */}
          <div className="rounded-2xl border border-border-soft bg-gray/40 p-6">
            <h3 className="font-display text-lg font-semibold text-ink">Claude Code — MCP (Terminal)</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Solo funciona en terminal. Para Cowork/Code sessions, usá la skill.
            </p>
            <code className="mt-3 block break-all rounded-xl bg-gray px-4 py-3 font-mono text-xs text-ink">
              claude mcp add kf1 npx -y mcp-remote {BASE_URL}/api/mcp
            </code>
          </div>

          {/* Claude Desktop */}
          <div className="rounded-2xl border border-border-soft bg-gray/40 p-6">
            <h3 className="font-display text-lg font-semibold text-ink">Claude Desktop (escritorio)</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Copiá y pegá este comando en tu terminal. Detecta tu sistema operativo automáticamente:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-gray px-4 py-3 font-mono text-[10px] leading-relaxed text-ink">{`python3 -c "
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
            <p className="mt-3 text-xs text-ink-soft">
              Reiniciá Claude Desktop después de ejecutarlo.
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
