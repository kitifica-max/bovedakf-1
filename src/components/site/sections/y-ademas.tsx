import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { FeatureCard } from "@/components/site/feature-card";
import { features } from "@/content/landing";

export function YAdemasSection() {
  return (
    <Section aria-labelledby={slug("Todo lo que incluye")}>
      <SectionHead kicker="Y además" title="Todo lo que incluye" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <FeatureCard key={f.title} Icon={f.Icon} title={f.title} body={f.body} wide={f.wide} />
        ))}
      </div>
    </Section>
  );
}
