import { Section } from "@/components/site/section";
import { slug } from "@/components/site/section-head";
import { ChevronDownIcon } from "@/components/icons";
import { faqs } from "@/content/landing";

export function FaqSection() {
  return (
    <Section aria-labelledby={slug("Preguntas frecuentes")}>
      <h2 id={slug("Preguntas frecuentes")} data-reveal className="t-h2 mb-8 text-center text-ink">
        Preguntas frecuentes
      </h2>
      <div className="flex flex-col gap-3">
        {faqs.map((f) => (
          <details key={f.q} data-reveal className="group rounded-2xl border border-border-soft bg-paper p-5 open:pb-5">
            <summary className="t-h3 flex cursor-pointer list-none items-center justify-between gap-4 text-ink marker:hidden">
              {f.q}
              <ChevronDownIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-blue transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
