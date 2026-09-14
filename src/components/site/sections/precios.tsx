import { PricingCards } from "@/components/pricing-cards";

export function PreciosSection() {
  return (
    <section id="precios" className="w-full max-w-4xl scroll-mt-24">
      <div className="text-center">
        <p className="font-pixel text-xs tracking-widest text-blue uppercase">Planes</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
          Simple y sin sorpresas
        </h2>
        <p className="mt-3 text-lg text-ink-soft">
          Sin contratos. Cancela cuando quieras.
        </p>
      </div>
      <div className="mt-10">
        <PricingCards />
      </div>
    </section>
  );
}
