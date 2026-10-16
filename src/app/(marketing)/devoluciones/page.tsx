import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, StarDot, pageCard } from "@/components/brand/shapes";

export const metadata: Metadata = {
  title: "Política de devoluciones",
  description: "Política de devoluciones de Bóveda KF-1: recargas de links con pago único, sin suscripción ni cobros automáticos.",
  alternates: { canonical: "/devoluciones" },
};

const sections = [
  {
    h: "1. Pagos únicos, sin suscripción",
    p: [
      "Bóveda KF-1 no es una suscripción. La cuenta es gratuita y solo pagás cuando recargás links para compartir credenciales con alguien de afuera. Cada recarga es un pago único procesado mediante Wompi.",
      "Nunca hacemos cobros automáticos ni renovaciones: si no volvés a recargar, no se te cobra nada y no hay nada que cancelar.",
    ],
  },
  {
    h: "2. Qué recibís al pagar",
    p: [
      "Cuando Wompi aprueba el pago, los links del pack se suman a tu saldo de inmediato y te enviamos un comprobante por correo. Los links se consumen al crear un link compartible; ver credenciales dentro de tu equipo no gasta saldo.",
    ],
  },
  {
    h: "3. Política de reembolsos",
    p: [
      "Dado que Bóveda KF-1 es un servicio digital con acceso inmediato, no ofrecemos reembolsos por links ya utilizados como política general.",
      "Sin embargo, en los siguientes casos procesamos un reembolso completo de la recarga afectada:",
    ],
    list: [
      "Se realizó un cobro duplicado.",
      "El pago fue aprobado pero los links no se acreditaron en tu saldo.",
      "Ocurrió un error técnico imputable a nuestra plataforma que te impidió usar los links que compraste.",
    ],
  },
  {
    h: "4. Pago no aprobado",
    p: [
      "Si un pago no puede ser procesado (saldo insuficiente, tarjeta vencida, etc.), no se te cobra y no se acreditan links. Podés volver a intentarlo desde Links en tu panel. No queda ninguna deuda pendiente.",
    ],
  },
  {
    h: "5. Si tenías un plan mensual anterior",
    p: [
      "Antes de pasar a links prepagos vendimos planes mensuales. Si tenés uno activo, se mantiene hasta que lo canceles y conservás los links ilimitados mientras siga activo. Podés cancelarlo cuando quieras desde el panel de Wompi en panel.wompi.sv/Recurrentes; la cancelación es efectiva al final del período en curso y no se generan cargos adicionales.",
      "Si se te cobró después de cancelarlo correctamente, te reembolsamos ese cobro.",
    ],
  },
  {
    h: "6. Cómo solicitar un reembolso",
    p: [
      "Si creés que tu caso aplica, escribinos a hola@kitifica.com con el asunto «Solicitud de reembolso» e incluí tu correo de cuenta y el ID de transacción de Wompi.",
      "Respondemos en un plazo máximo de 5 días hábiles. Los reembolsos aprobados pueden tardar de 3 a 7 días hábiles en reflejarse según tu banco.",
    ],
  },
  {
    h: "7. Cambios a esta política",
    p: [
      "Nos reservamos el derecho de modificar esta política. Publicaremos los cambios en esta página con al menos 15 días de anticipación. El uso continuado del servicio implica la aceptación de la política vigente.",
    ],
  },
];

export default function DevolucionesPage() {
  return (
    <>
      <PageHero pair="durazno" icon="refund" kicker="Última actualización: octubre de 2026" title="Devoluciones" />
      <div className={pageCard}>

      <div className="mt-8 flex flex-col gap-8">
        {sections.map((s, si) => (
          <div key={s.h}>
            <h2 className="t-h2 flex items-center gap-3"><StarDot i={si} />{s.h}</h2>
            {s.p.map((p, i) => (
              <p key={i} className="mt-2 text-sm leading-relaxed text-ink-soft">{p}</p>
            ))}
            {s.list && (
              <ul className="mt-3 flex flex-col gap-1.5 pl-4">
                {s.list.map((item) => (
                  <li key={item} className="list-disc text-sm leading-relaxed text-ink-soft">{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border-soft bg-gray/20 p-5">
        <p className="text-sm font-medium text-ink">¿Necesitás ayuda?</p>
        <p className="mt-1 text-sm text-ink-soft">
          Escribinos a{" "}
          <a href="mailto:hola@kitifica.com" className="text-blue underline">hola@kitifica.com</a>
          {" "}o visitá nuestra{" "}
          <Link href="/contacto" className="text-blue underline">página de contacto</Link>.
        </p>
      </div>
      </div>
    </>
  );
}
