import { Section } from "@/components/site/section";
import { SectionHead, slug } from "@/components/site/section-head";
import { SecuritySpec } from "@/components/site/security-spec";
import { securitySpec } from "@/content/landing";

export function SeguridadSection() {
  return (
    <Section variant="glass" aria-labelledby={slug("Ni nosotros podemos abrir lo que compartís")}>
      <SectionHead kicker="Seguridad" title="Ni nosotros podemos abrir lo que compartís" />
      <div className="max-w-2xl">
        <p data-reveal className="text-sm leading-relaxed text-ink-soft">
          Pensá cada link como una llave que le das a una sola persona. Nosotros guardamos la
          credencial cerrada — la llave para abrirla no la tenemos, así que no podemos leer lo
          que compartís, y nadie que entre a nuestros servidores tampoco: encontraría texto
          ilegible.
        </p>
        <p data-reveal className="mt-3 text-sm leading-relaxed text-ink-soft">
          La persona que recibe el link lo abre en su propio dispositivo. Y esa llave caduca
          sola —a las horas o días que elijas deja de servir— y podés cortarla antes con un
          click. El control siempre es tuyo.
        </p>
      </div>
      <div className="mt-10">
        <SecuritySpec groups={securitySpec} />
      </div>
    </Section>
  );
}
