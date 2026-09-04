import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { CTAButton } from "@/components/site/cta-button";
import { steps } from "@/content/landing";

export function ComoFuncionaSection() {
  return (
    <Section variant="card" aria-labelledby={slug("Tres pasos, cero fricción")}>
      <SectionHead kicker="Cómo funciona" title="Tres pasos, cero fricción" />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} data-reveal>
            <div className="max-w-[7rem]">
              <s.Illustration />
            </div>
            <p className="mt-4 font-display text-sm font-semibold text-blue">{s.n}</p>
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
