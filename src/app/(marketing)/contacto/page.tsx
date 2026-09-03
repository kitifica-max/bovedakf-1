import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contactá al equipo de Bóveda KF-1 para soporte, dudas de seguridad o consultas comerciales.",
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Contacto</h1>
      <p className="mt-3 text-ink-soft">
        ¿Preguntas sobre seguridad, un bug, o algo comercial? Escribinos directamente — leemos
        todo, respondemos en persona.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <a
          href="mailto:hola@kitifica.com?subject=B%C3%B3veda%20KF-1%20-%20Consulta"
          className="rounded-2xl border border-border-soft bg-gray/40 p-6 transition hover:bg-gray/60"
        >
          <p className="font-display text-lg font-semibold text-ink">Soporte y consultas generales</p>
          <p className="mt-1 text-sm text-ink-soft">hola@kitifica.com</p>
        </a>
        <a
          href="mailto:hola@kitifica.com?subject=B%C3%B3veda%20KF-1%20-%20Reporte%20de%20seguridad"
          className="rounded-2xl border border-border-soft bg-gray/40 p-6 transition hover:bg-gray/60"
        >
          <p className="font-display text-lg font-semibold text-ink">Reportar una vulnerabilidad</p>
          <p className="mt-1 text-sm text-ink-soft">hola@kitifica.com</p>
        </a>
      </div>

      <p className="mt-8 text-xs text-ink-soft">
        Bóveda KF-1 es un producto en etapa temprana — respondemos personalmente, así que puede
        tomar hasta 48h hábiles.
      </p>
    </div>
  );
}
