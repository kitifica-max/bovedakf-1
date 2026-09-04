import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { CTAButton } from "@/components/site/cta-button";
import { IllustrationLoop } from "@/components/illustrations/illustration-loop";
import { steps } from "@/content/landing";

export function ComoFuncionaSection() {
  return (
    <Section variant="light" aria-labelledby={slug("Tres pasos, cero fricción")}>
      <SectionHead kicker="Cómo funciona" title="Tres pasos, cero fricción" light />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} data-reveal>
            <IllustrationLoop name={s.loop} className="max-w-[7rem] [&>svg]:h-auto [&>svg]:w-full">
              <s.Illustration />
            </IllustrationLoop>
            <p className="mt-4 font-display text-sm font-semibold text-blue">{s.n}</p>
            <h3 className="t-h3 mt-2 text-ink-reverse">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-reverse/70">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-10" data-reveal>
        <CTAButton href="/register" variant="dark">Crear mi bóveda</CTAButton>
      </div>
    </Section>
  );
}
