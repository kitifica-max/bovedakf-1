import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { Illustration } from "@/components/site/illustration";
import { CTAButton } from "@/components/site/cta-button";
import { IllustrationLoop } from "@/components/illustrations/illustration-loop";
import { RolesIllustration } from "@/components/illustrations/roles";
import { BuildingIcon } from "@/components/icons";
import { teamSteps } from "@/content/landing";

export function ParaEquiposSection() {
  return (
    <Section variant="emphasis" aria-labelledby={slug("Sumá a tu equipo por correo, en segundos")}>
      <SectionHead
        kicker="Para equipos"
        title="Sumá a tu equipo por correo, en segundos"
        lead="Sin asientos que pagar, sin panel de IT. Invitás, la persona crea su cuenta y entra con el rol que le diste."
        center
      />
      <Illustration>
        <IllustrationLoop name="roles" className="mx-auto mb-8 max-w-xl [&>svg]:h-auto [&>svg]:w-full">
          <RolesIllustration />
        </IllustrationLoop>
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

      {/* Enterprise SSO callout */}
      <div
        data-reveal
        className="mt-10 flex items-start gap-4 rounded-2xl border border-blue/20 bg-blue/5 px-6 py-5"
      >
        <BuildingIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue" />
        <div>
          <p className="font-semibold text-ink">¿Tu empresa usa Okta, Azure AD o Google Workspace?</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Conectá tu proveedor de identidad con SSO corporativo. Tu equipo entra con su cuenta de empresa — sin contraseñas nuevas — y el acceso se revoca automáticamente cuando alguien sale de la organización.
          </p>
        </div>
      </div>
    </Section>
  );
}
