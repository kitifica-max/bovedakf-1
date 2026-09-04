import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { Illustration } from "@/components/site/illustration";
import { CTAButton } from "@/components/site/cta-button";
import { RolesIllustration } from "@/components/illustrations/roles";
import { teamSteps } from "@/content/landing";

export function ParaEquiposSection() {
  return (
    <Section variant="emphasis" aria-labelledby={slug("Sumá a tu equipo por correo, en segundos")}>
      <SectionHead
        kicker="Para equipos"
        title="Sumá a tu equipo por correo, en segundos"
        lead="Sin asientos que pagar, sin panel de IT. Invitás, la persona crea su cuenta y entra con el rol que le diste."
      />
      <Illustration>
        <div className="mb-8 max-w-xl">
          <RolesIllustration />
        </div>
      </Illustration>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {teamSteps.map((s) => (
          <div key={s.n} data-reveal>
            <p className="font-display text-sm font-semibold text-blue">{s.n}</p>
            <h3 className="t-h3 mt-2 text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-10" data-reveal>
        <CTAButton href="/register" variant="secondary">Crear mi bóveda</CTAButton>
      </div>
    </Section>
  );
}
