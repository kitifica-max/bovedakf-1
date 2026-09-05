import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { CTAButton } from "@/components/site/cta-button";

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
      <div className="mt-8 rounded-2xl border border-border-soft bg-gray/40 p-6">
        <h3 className="t-h3 mb-4 text-center text-ink">Instalación</h3>
        <div className="flex flex-col items-center gap-4 text-center text-sm text-ink-soft">
          <div className="flex items-start gap-3 text-left">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-paper">1</span>
            <div>
              <p className="font-medium text-ink">Generá un token CLI</p>
              <p className="text-xs">Andá a tu dashboard y creá un token</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-paper">2</span>
            <div>
              <p className="font-medium text-ink">Instalá la skill</p>
              <code className="mt-1 block rounded-lg bg-gray px-3 py-2 font-mono text-[10px] text-ink">
                mkdir -p ~/.claude/skills/kf1 && cp .claude/skills/kf1/* ~/.claude/skills/kf1/
              </code>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-paper">3</span>
            <div>
              <p className="font-medium text-ink">Configurá el token</p>
              <code className="mt-1 block rounded-lg bg-gray px-3 py-2 font-mono text-[10px] text-ink">
                bash ~/.claude/skills/kf1/kf1.sh setup
              </code>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-paper">4</span>
            <div>
              <p className="font-medium text-ink">Usá la skill</p>
              <code className="mt-1 block rounded-lg bg-gray px-3 py-2 font-mono text-[10px] text-ink">
                /kf1 list<br/>
                /kf1 view &lt;credential-id&gt;
              </code>
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
