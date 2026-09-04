import Link from "next/link";
import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { CTAButton } from "@/components/site/cta-button";

export function AiAgentSection() {
  return (
    <Section aria-labelledby={slug("Acceso desde IA")}>
      <SectionHead
        kicker="MCP"
        title="Tus secretos nunca llegan al LLM"
        lead="Conectá Claude u otro agente de IA a tu Bóveda. El agente puede listar credenciales y generar links temporales para que vos las veas. Las contraseñas NUNCA se exponen al modelo."
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
              <span>Conectá tu agente via MCP (una línea de comando)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue">3.</span>
              <span>El agente genera un link temporal — lo abrís en tu navegador para ver la credencial</span>
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
              <span>Para ver el secreto, el agente genera un link que solo vos abrís en el navegador.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-blue">✓</span>
              <span>Los links expiran en 15 minutos y la sesión del agente en 2 horas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-blue">✓</span>
              <span>Cada acceso queda registrado con quién, qué y cuándo.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Diagram */}
      <div className="mt-8 rounded-2xl border border-border-soft bg-gray/40 p-6">
        <h3 className="t-h3 mb-4 text-center text-ink">Flujo de seguridad</h3>
        <div className="flex flex-col items-center gap-3 text-center text-sm text-ink-soft sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-paper">1</span>
            <span>Agente pide credencial</span>
          </div>
          <span className="hidden text-ink-soft sm:inline">→</span>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-paper">2</span>
            <span>Servidor genera link temporal</span>
          </div>
          <span className="hidden text-ink-soft sm:inline">→</span>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-paper">3</span>
            <span>Agente te da el link</span>
          </div>
          <span className="hidden text-ink-soft sm:inline">→</span>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-paper">4</span>
            <span>Vos lo abrís en el navegador</span>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-ink-soft">
          El secreto nunca toca el servidor ni el contexto del LLM — vive solo en el navegador.
        </p>
      </div>

      <div className="mt-8">
        <CTAButton href="/connect" variant="secondary">
          Ver guía de instalación →
        </CTAButton>
      </div>
    </Section>
  );
}
