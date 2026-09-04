import { CTAButton } from "@/components/site/cta-button";

export function CtaFinalSection() {
  return (
    <section className="w-full max-w-5xl rounded-2xl bg-ink p-10 text-center text-gray sm:p-16">
      <h2 data-reveal className="t-display">Dejá de reenviar contraseñas por chat</h2>
      <p data-reveal className="mx-auto mt-4 max-w-md leading-relaxed text-gray/70">
        Creá tu bóveda en menos de un minuto. Sin tarjeta de crédito, hasta 20 credenciales gratis.
      </p>
      <div data-reveal className="mt-8 flex justify-center">
        <CTAButton href="/register" className="bg-blue-soft text-ink-reverse hover:brightness-95">
          Crear mi bóveda gratis →
        </CTAButton>
      </div>
    </section>
  );
}
