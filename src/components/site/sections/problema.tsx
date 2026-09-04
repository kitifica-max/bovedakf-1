import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { Illustration } from "@/components/site/illustration";
import { ScatteredSecretsIllustration } from "@/components/illustrations/scattered-secrets";
import { problems } from "@/content/landing";

export function ProblemaSection() {
  return (
    <Section aria-labelledby={slug("No es la contraseña. Es dónde vive.")}>
      <SectionHead kicker="El problema" title="No es la contraseña. Es dónde vive." />
      <Illustration>
        <div className="mb-8 max-w-xl">
          <ScatteredSecretsIllustration />
        </div>
      </Illustration>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {problems.map((p) => (
          <div key={p.title} data-reveal className="rounded-2xl border border-border-soft bg-paper p-6">
            <p.Icon aria-hidden="true" className="h-6 w-6 text-blue" />
            <h3 className="t-h3 mt-4 text-ink">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
