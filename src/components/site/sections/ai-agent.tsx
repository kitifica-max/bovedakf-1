import Link from "next/link";
import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { CTAButton } from "@/components/site/cta-button";

export function AiAgentSection() {
  return (
    <Section aria-labelledby={slug("Acceso desde IA")}>
      <SectionHead
        kicker="MCP"
        title="Acceso desde agentes de IA"
        lead="Conectá Claude u otro agente de IA a tu Bóveda. El agente puede listar y leer credenciales que vos autorices, con sesiones temporales de 2 horas y auditoría completa."
      />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex-1 rounded-2xl border border-border-soft bg-gray/40 p-6">
          <h3 className="t-h3 text-ink">Cómo funciona</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue">1.</span>
              <span>Activá &quot;Acceso AI&quot; en las credenciales que quieras compartir</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue">2.</span>
              <span>Conectá tu agente via MCP (una línea de comando)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue">3.</span>
              <span>Autorizá en el navegador — la sesión dura 2 horas</span>
            </li>
          </ul>
        </div>
        <div className="flex-1 rounded-2xl border border-blue/25 bg-blue/[0.07] p-6">
          <h3 className="t-h3 text-ink">Seguridad</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
            <li>• El agente solo ve lo que vos autorizás</li>
            <li>• Sesiones temporales, no acceso permanente</li>
            <li>• Cada consulta quedó registrada en auditoría</li>
            <li>• Revocá el acceso en cualquier momento</li>
          </ul>
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
