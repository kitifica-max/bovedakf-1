import { HeroReveal } from "@/components/hero-reveal";
import { CTAButton } from "@/components/site/cta-button";
import { Illustration } from "@/components/site/illustration";
import { KeyFlowIllustration } from "@/components/illustrations/key-flow";
import { LockIcon } from "@/components/icons";
import { stats } from "@/content/landing";

export function HeroSection() {
  return (
    <div className="w-full max-w-5xl rounded-2xl border border-border-soft bg-paper p-6 shadow-[0_1px_0_rgba(22,19,14,0.04)] sm:p-10">
      <HeroReveal>
        <div data-hero className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="flex flex-col">
            <span
              data-reveal
              className="mb-5 inline-flex w-fit items-center gap-2 text-xs font-medium text-blue"
            >
              <LockIcon aria-hidden="true" className="h-3.5 w-3.5" /> Encriptado extremo a extremo en cada link
            </span>
            <h1 data-reveal className="t-display text-ink">
              Comparte credenciales sin dejar rastro en el chat
            </h1>
            <p data-reveal className="mt-5 max-w-md leading-relaxed text-ink-soft">
              Invitá a tu equipo por correo, guarda accesos con links que se autodestruyen en
              horas o días, y mira exactamente quién entró a qué y cuándo. Sin spreadsheets,
              sin plaintext.
            </p>
            <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
              <CTAButton href="/register">Crear mi bóveda →</CTAButton>
              <CTAButton href="/login" variant="secondary">Ya tengo cuenta</CTAButton>
            </div>
            <div data-reveal className="mt-8 grid grid-cols-1 gap-5 border-t border-border-soft pt-5 sm:grid-cols-2 sm:gap-6">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <s.Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-blue" />
                  <div>
                    <p className="font-display text-lg font-semibold leading-none text-ink">{s.value}</p>
                    <p className="mt-1 text-xs text-ink-soft">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Illustration>
            <KeyFlowIllustration />
          </Illustration>
        </div>
      </HeroReveal>
    </div>
  );
}
