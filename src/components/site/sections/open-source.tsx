import { Section } from "@/components/site/section";

export function OpenSourceSection() {
  return (
    <Section aria-label="Código abierto">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border-soft bg-paper px-8 py-10 text-center sm:px-12">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          Open source · AGPL v3
        </div>
        <div>
          <h2 className="t-h2 text-ink">Código abierto. Arquitectura auditable.</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
            Revisá cómo KF-1 cifra, comparte y revoca — cada afirmación
            de seguridad tiene su línea de código.
          </p>
        </div>
        <a
          href="https://github.com/kitifica-max/bovedakf-1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-gray/40 px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink/20 hover:bg-gray/60"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Ver en GitHub →
        </a>
      </div>
    </Section>
  );
}
