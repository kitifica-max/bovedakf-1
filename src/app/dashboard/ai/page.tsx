import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { KeyRoundIcon, LockIcon, ShieldCheckIcon } from "@/components/icons";
import { CliTokenManager } from "@/components/cli-token-manager";
import { CopyCodeBlock } from "@/components/copy-code-block";

export default async function AiDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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

  const firstVaultId = vaults[0]?.id;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Glass header */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border-soft bg-paper/60 px-4 py-3 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-on-dark.svg" alt="KF-1" className="h-5 w-auto" />
          <div className="h-4 w-px bg-border-soft" />
          <span className="text-sm font-semibold text-ink">Conectar IA</span>
        </div>
        {firstVaultId && (
          <Link
            href={`/dashboard/${firstVaultId}`}
            className="flex items-center gap-1.5 rounded-full border border-border-soft px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:text-ink"
          >
            <span aria-hidden="true">←</span> Volver
          </Link>
        )}
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6 md:px-6">

          {/* Status chip */}
          <div className={`flex items-center gap-3 rounded-2xl border p-4 ${aiCredentials.length > 0 ? "border-blue/25 bg-blue/[0.07]" : "border-border-soft bg-paper"}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue text-paper">
              <ShieldCheckIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                {aiCredentials.length > 0
                  ? `${aiCredentials.length} credencial${aiCredentials.length !== 1 ? "es" : ""} habilitada${aiCredentials.length !== 1 ? "s" : ""} para IA`
                  : "Sin credenciales habilitadas para IA"}
              </p>
              <p className="text-xs text-ink-soft">
                {aiCredentials.length > 0
                  ? "Los agentes pueden solicitar links temporales de acceso."
                  : "Habilitá el acceso IA en cada credencial desde tu bóveda."}
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl border border-border-soft bg-paper p-5">
            <h2 className="font-display text-sm font-semibold text-ink">Cómo funciona</h2>
            <ol className="mt-4 flex flex-col gap-0">
              {[
                "Generá un token CLI en esta página.",
                "Instalá la skill de KF-1 en Claude Code con dos comandos.",
                "Pedile credenciales en lenguaje natural. La skill genera links temporales.",
                "Abrí el link en tu navegador para ver la credencial.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 py-2.5 border-b border-border-soft last:border-0">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue/[0.12] text-[10px] font-bold text-blue mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-ink-soft">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Install */}
          <div className="rounded-2xl border border-border-soft bg-paper p-5">
            <h2 className="font-display text-sm font-semibold text-ink">Instalar Skill</h2>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <p className="mb-2 text-xs font-medium text-ink-soft">1. Descargá la skill:</p>
                <CopyCodeBlock code="mkdir -p ~/.claude/skills/kf1 && curl -sL https://kf1.kitifica.com/skill/SKILL.md -o ~/.claude/skills/kf1/SKILL.md && curl -sL https://kf1.kitifica.com/skill/kf1.sh -o ~/.claude/skills/kf1/kf1.sh" />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-ink-soft">2. Configurá tu token:</p>
                <CopyCodeBlock code="bash ~/.claude/skills/kf1/kf1.sh setup" />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-ink-soft">3. Usá la skill desde Claude Code:</p>
                <div className="flex flex-col gap-2">
                  <CopyCodeBlock code="/kf1 list" />
                  <CopyCodeBlock code="/kf1 view <credential-id>" />
                </div>
              </div>
            </div>
          </div>

          {/* CLI Token */}
          <div className="rounded-2xl border border-border-soft bg-paper p-5">
            <div className="flex items-start gap-3">
              <KeyRoundIcon className="h-4 w-4 shrink-0 text-ink-soft mt-0.5" />
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-sm font-semibold text-ink">Token CLI</h2>
                <p className="mt-1 text-xs text-ink-soft">
                  Autenticá la skill sin OAuth. Expira en 30 días. Regeneralo si lo comprometés.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <CliTokenManager />
            </div>
          </div>

          {/* IA-accessible credentials */}
          <div className="rounded-2xl border border-border-soft bg-paper p-5">
            <h2 className="font-display text-sm font-semibold text-ink">
              Credenciales disponibles para IA
            </h2>
            {aiCredentials.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">
                Andá a tu bóveda, expandí una credencial y activá el toggle <strong className="text-ink">Acceso IA</strong>.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {aiCredentials.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray/40 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{c.service}</p>
                      <p className="text-xs text-ink-soft">{c.username} · {c.vaultName}</p>
                    </div>
                    <Link
                      href={`/dashboard/${c.vaultId}`}
                      className="shrink-0 text-xs text-ink-soft underline decoration-border-soft underline-offset-4 transition hover:text-ink"
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
            <div className="flex items-start gap-3">
              <LockIcon className="h-4 w-4 shrink-0 text-ink-soft mt-0.5" />
              <h2 className="font-display text-sm font-semibold text-ink">Seguridad</h2>
            </div>
            <ul className="mt-3 flex flex-col gap-0">
              {[
                <>El agente <strong className="text-ink">nunca</strong> recibe contraseñas en texto plano.</>,
                "Solo recibe links temporales que vos abrís en el navegador.",
                "Los links expiran en 1 hora.",
                "El token CLI expira en 30 días.",
                "Cada acceso queda registrado en auditoría.",
                "Podés desactivar el acceso a cualquier credencial en cualquier momento.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 py-2 border-b border-border-soft last:border-0 text-xs text-ink-soft">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue/40" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>
    </div>
  );
}
