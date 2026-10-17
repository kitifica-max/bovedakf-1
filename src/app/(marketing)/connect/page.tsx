import { PageHero, pageCard } from "@/components/brand/shapes";
import Link from "next/link";
import { CopyCodeBlock } from "@/components/copy-code-block";

export const metadata = {
  title: "Conectar agente de IA",
  description:
    "Conecta Claude u otro agente de IA a tu Boveda KF-1 para acceder a credenciales de forma segura.",
};

export default function ConnectPage() {
  return (
    <>
      <PageHero
        pair="lavanda"
        icon="spark"
        kicker="Skill para agentes de IA"
        title="Conectá tu agente a KF-1"
        lead="Tu agente puede listar cuentas y generar links temporales para que vos las veas. Las contraseñas nunca se exponen al modelo."
      />
      <div className={pageCard}>

        <div className="flex flex-col gap-6">
          {/* Claude Code - Skill */}
          <div className="rounded-[28px] bg-kf-amarillo p-6">
            <h2 className="font-brand text-2xl leading-[1.04] font-extrabold text-kf-azul-hondo uppercase">Claude Code — Skill</h2>
            <p className="mt-2 text-sm text-ink-soft">
              La forma más simple. Funciona en terminal, escritorio, y cualquier modo.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div className="rounded-xl bg-gray/60 p-4">
                <p className="mb-2 text-xs font-medium text-ink">1. Generá un token CLI</p>
                <p className="text-xs text-ink-soft">
                  Andá a <Link href="/dashboard/ai" className="font-bold text-kf-azul-hondo underline">Conectar IA</Link> y generá un token.
                </p>
              </div>
              <div className="rounded-xl bg-gray/60 p-4">
                <p className="mb-2 text-xs font-medium text-ink">2. Instalá la skill</p>
                <CopyCodeBlock code="mkdir -p ~/.claude/skills/kf1 && curl -sL https://kf1.kitifica.com/skill/SKILL.md -o ~/.claude/skills/kf1/SKILL.md && curl -sL https://kf1.kitifica.com/skill/kf1.sh -o ~/.claude/skills/kf1/kf1.sh" />
              </div>
              <div className="rounded-xl bg-gray/60 p-4">
                <p className="mb-2 text-xs font-medium text-ink">3. Configurá el token</p>
                <CopyCodeBlock code="bash ~/.claude/skills/kf1/kf1.sh setup" />
              </div>
              <div className="rounded-xl bg-gray/60 p-4">
                <p className="mb-2 text-xs font-medium text-ink">4. Usá la skill</p>
                <CopyCodeBlock code="/kf1 list" />
                <CopyCodeBlock code="/kf1 view <credential-id>" />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-[28px] bg-kf-amarillo p-6">
            <h2 className="mb-2 font-brand text-2xl leading-[1.04] font-extrabold text-kf-azul-hondo uppercase">Seguridad</h2>
            <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-ink-soft">
              <li>• El agente NUNCA recibe contraseñas — solo links temporales</li>
              <li>• Vos abrís el link en tu navegador para ver el secreto</li>
              <li>• Links expiran en 1 hora, token CLI en 30 días</li>
              <li>• Todo queda registrado en auditoría</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
