import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { KeyRoundIcon, LockIcon, ShieldCheckIcon } from "@/components/icons";
import { CliTokenManager } from "@/components/cli-token-manager";
import { CopyCodeBlock } from "@/components/copy-code-block";
import { AppShell } from "../app-shell";
import { PAIRS, PageHero, StarDot } from "@/components/brand/shapes";
import { appCard, appH2, kicker } from "@/components/brand/styles";

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

  const on = aiCredentials.length > 0;
  const STEP_PAIRS = ["carmesi", "bosque", "durazno", "azul"] as const;

  return (
    <AppShell active="ia">
      <PageHero
        pair="lavanda"
        icon="spark"
        kicker="Skill para agentes de IA"
        title="Conectá tu IA"
        lead="Tu agente pide cuentas en lenguaje natural y recibe links temporales que vos abrís. Nunca ve una contraseña."
      />

      <div className={`flex flex-wrap items-center gap-4 rounded-[28px] px-6 py-5 ${on ? "bg-kf-bosque text-kf-lima" : "bg-kf-amarillo text-kf-lavanda"}`}>
        <ShieldCheckIcon className="h-9 w-9 shrink-0" />
        <div className="flex min-w-0 flex-[1_1_240px] flex-col">
          <p className="m-0 font-brand text-[28px] leading-[1.04] font-extrabold uppercase">
            {on
              ? `${aiCredentials.length} cuenta${aiCredentials.length !== 1 ? "s" : ""} habilitada${aiCredentials.length !== 1 ? "s" : ""} para IA`
              : "Ninguna cuenta habilitada para IA"}
          </p>
          <p className="m-0 text-sm font-semibold">
            {on ? "Los agentes pueden pedir links temporales de esas cuentas." : "Activá «Acceso IA» en cada cuenta desde la ficha del cliente."}
          </p>
        </div>
      </div>

      <section className={`${appCard} flex flex-col gap-5`}>
        <h2 className={appH2}>Cómo funciona</h2>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 p-0">
          {[
            "Generá un token CLI en esta página.",
            "Instalá la skill de KF-1 en Claude Code con dos comandos.",
            "Pedile cuentas en lenguaje natural: la skill genera links temporales.",
            "Abrí el link en tu navegador para ver la contraseña.",
          ].map((step, i) => {
            const c = PAIRS[STEP_PAIRS[i]];
            return (
              <li key={i} style={{ background: c.bg, color: c.ink }} className="flex min-w-0 flex-col gap-3 rounded-[28px] p-5">
                <span className="font-brand text-5xl leading-none font-extrabold">{i + 1}</span>
                <span className="text-sm font-bold">{step}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={`${appCard} flex flex-col gap-4`}>
        <h2 className={appH2}>Instalar la skill</h2>
        <div className="flex flex-col gap-4">
          <div>
            <p className={`${kicker} mb-2`}>1 · Descargá la skill</p>
            <CopyCodeBlock code="mkdir -p ~/.claude/skills/kf1 && curl -sL https://kf1.kitifica.com/skill/SKILL.md -o ~/.claude/skills/kf1/SKILL.md && curl -sL https://kf1.kitifica.com/skill/kf1.sh -o ~/.claude/skills/kf1/kf1.sh" />
          </div>
          <div>
            <p className={`${kicker} mb-2`}>2 · Configurá tu token</p>
            <CopyCodeBlock code="bash ~/.claude/skills/kf1/kf1.sh setup" />
          </div>
          <div>
            <p className={`${kicker} mb-2`}>3 · Usala desde Claude Code</p>
            <div className="flex flex-col gap-2">
              <CopyCodeBlock code="/kf1 list" />
              <CopyCodeBlock code="/kf1 view <credential-id>" />
            </div>
          </div>
        </div>
      </section>

      <section className={`${appCard} flex flex-col gap-4`}>
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-kf-durazno text-kf-carmesi-hondo">
            <KeyRoundIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className={appH2}>Token CLI</h2>
            <p className="m-0 mt-1 text-sm font-semibold text-kf-tinta-suave">
              Autentica la skill sin OAuth. Expira en 30 días. Regeneralo si se filtra.
            </p>
          </div>
        </div>
        <CliTokenManager />
      </section>

      <section className={`${appCard} flex flex-col gap-4`}>
        <h2 className={appH2}>Cuentas disponibles para IA</h2>
        {!on ? (
          <p className="m-0 text-sm font-semibold text-kf-tinta-suave">
            Abrí un cliente y activá <strong className="text-kf-tinta">Acceso IA</strong> en la cuenta que quieras.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {aiCredentials.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-kf-niebla px-5 py-3.5">
                <div className="min-w-0">
                  <p className="m-0 truncate text-sm font-extrabold">{c.service}</p>
                  <p className="m-0 truncate font-mono text-xs text-kf-tinta-suave">{c.username} · {c.vaultName}</p>
                </div>
                <Link href={`/dashboard/${c.vaultId}`} className="shrink-0 text-[13px] font-bold text-kf-azul underline decoration-2 underline-offset-4">
                  Ver cliente
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-[32px] bg-kf-azul p-6 text-white sm:p-8">
        <div className="flex items-center gap-3">
          <LockIcon className="h-6 w-6 shrink-0 text-kf-manteca" />
          <h2 className="m-0 font-brand text-[28px] leading-[1.04] font-extrabold uppercase">Seguridad</h2>
        </div>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2.5 p-0">
          {[
            <>El agente <strong>nunca</strong> recibe contraseñas en texto plano.</>,
            "Solo recibe links temporales que vos abrís en el navegador.",
            "Los links expiran en 1 hora.",
            "El token CLI expira en 30 días.",
            "Cada acceso queda registrado en auditoría.",
            "Podés quitar el acceso a cualquier cuenta cuando quieras.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 rounded-[20px] bg-white/10 px-4 py-3 text-sm font-semibold">
              <StarDot i={i} color="var(--kf-manteca)" />
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
