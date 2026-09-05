import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { CTAButton } from "@/components/site/cta-button";
import { CopyCodeBlock } from "@/components/copy-code-block";

export function AiAgentSection() {
  return (
    <Section aria-labelledby={slug("Acceso desde IA")}>
      <SectionHead
        kicker="Skill"
        title="Tus secretos nunca llegan al LLM"
        lead="Instalá la skill de KF-1 en Claude Code y pedile credenciales en lenguaje natural. Las contraseñas NUNCA se exponen al modelo — solo ves links temporales."
      />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex-1 rounded-2xl border border-border-soft bg-gray/40 p-6">
          <h3 className="t-h3 text-ink">Cómo funciona</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue">1.</span>
              <span>Activá &quot;Acceso AI&quot; en las credenciales que quieras usar con IA</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue">2.</span>
              <span>Generá un token CLI en el dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue">3.</span>
              <span>Instalá la skill con dos comandos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue">4.</span>
              <span>Pedile credenciales — la skill genera links temporales que vos abrís</span>
            </li>
          </ul>
        </div>
        <div className="flex-1 rounded-2xl border border-blue/25 bg-blue/[0.07] p-6">
          <h3 className="t-h3 text-ink">Seguridad</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-blue">✓</span>
              <span><strong className="text-ink">El agente NUNCA recibe contraseñas.</strong> Solo ve nombres de servicios.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-blue">✓</span>
              <span>Para ver el secreto, la skill genera un link que solo vos abrís en el navegador.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-blue">✓</span>
              <span>Los links expiran en 1 hora y el token CLI en 30 días.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-blue">✓</span>
              <span>Cada acceso queda registrado con quién, qué y cuándo.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Install */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-border-soft bg-paper">
        <div className="border-b border-border-soft bg-gray/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-danger/40" />
              <span className="h-3 w-3 rounded-full bg-yellow-400/40" />
              <span className="h-3 w-3 rounded-full bg-green-400/40" />
            </div>
            <p className="ml-2 font-mono text-[11px] text-ink-soft">instalación — 4 pasos</p>
          </div>
        </div>

        <div className="divide-y divide-border-soft">
          {/* Step 1 */}
          <div className="flex gap-4 p-5">
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-[11px] font-bold text-paper">1</span>
              <span className="w-px flex-1 bg-border-soft" />
            </div>
            <div className="flex-1 pb-2">
              <p className="text-sm font-semibold text-ink">Generá un token CLI</p>
              <p className="mt-1 text-xs text-ink-soft">
                En <span className="font-medium text-blue">Dashboard → AI &amp; Skill</span> → Token CLI → Generar.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 p-5">
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-[11px] font-bold text-paper">2</span>
              <span className="w-px flex-1 bg-border-soft" />
            </div>
            <div className="flex-1 pb-2">
              <p className="text-sm font-semibold text-ink">Instalá la skill</p>
              <div className="mt-2">
                <CopyCodeBlock code="mkdir -p ~/.claude/skills/kf1 && curl -sL https://kf1.kitifica.com/skill/SKILL.md -o ~/.claude/skills/kf1/SKILL.md && curl -sL https://kf1.kitifica.com/skill/kf1.sh -o ~/.claude/skills/kf1/kf1.sh" />
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 p-5">
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-[11px] font-bold text-paper">3</span>
              <span className="w-px flex-1 bg-border-soft" />
            </div>
            <div className="flex-1 pb-2">
              <p className="text-sm font-semibold text-ink">Configurá el token</p>
              <div className="mt-2">
                <CopyCodeBlock code="bash ~/.claude/skills/kf1/kf1.sh setup" />
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 p-5">
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-[11px] font-bold text-paper">4</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Usá la skill en Claude Code</p>
              <div className="mt-2 flex flex-col gap-2">
                <CopyCodeBlock code="/kf1 list" />
                <CopyCodeBlock code="/kf1 view <credential-id>" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <CTAButton href="/connect" variant="secondary">
          Ver guía de instalación →
        </CTAButton>
      </div>
    </Section>
  );
}
