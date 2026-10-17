import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, StarDot, pageCard } from "@/components/brand/shapes";

export const metadata: Metadata = {
  title: "Política de devoluciones",
  description: "Política de devoluciones de Bóveda KF-1: recargas de links con pago único, sin suscripción ni cobros automáticos.",
  alternates: { canonical: "/devoluciones" },
};

// Update this date whenever the policy text below changes.
const LAST_UPDATE = "octubre de 2026";

const sections = [
  {
    h: "1. Pagos únicos, sin suscripción",
    p: [
      "Bóveda KF-1 no es una suscripción. La cuenta es gratuita y solo pagás cuando recargás links para compartir credenciales con alguien de afuera. Cada recarga es un pago único procesado mediante Wompi.",
      "Las recargas nuevas nunca generan cobros automáticos ni renovaciones: si no volvés a recargar, no se te cobra nada y no hay nada que cancelar. (Los planes mensuales anteriores tienen su propia sección más abajo.)",
    ],
  },
  {
    h: "2. Qué recibís al pagar",
    p: [
      "Cuando Wompi aprueba el pago, los links del pack se suman a tu saldo de inmediato y te enviamos el recibo a tu correo. Si no te llega, escribinos y te lo reenviamos. Los links se consumen al crear un link compartible; ver credenciales dentro de tu equipo no gasta saldo.",
    ],
  },
  {
    h: "3. Política de reembolsos",
    p: [
      "Solo reembolsamos cuando el problema es un error técnico de nuestra plataforma o del procesador de pagos. No reembolsamos errores manuales ni cambios de opinión: elegir un pack equivocado, comprar por error, usar o compartir links con la persona equivocada, o links ya utilizados.",
      "Procesamos un reembolso completo de la recarga afectada en estos casos de error técnico:",
    ],
    list: [
      "Se realizó un cobro duplicado.",
      "El pago fue aprobado pero los links no se acreditaron en tu saldo.",
      "Un fallo técnico de la plataforma te impidió usar los links que compraste.",
      "Plan mensual anterior: se te cobró después de que lo cancelaras correctamente.",
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
      "Si un cobro del plan mensual no se aprueba (tarjeta vencida, saldo insuficiente, etc.), el plan queda suspendido y te avisamos por correo. Tus datos no se eliminan: actualizá tu tarjeta en panel.wompi.sv/Recurrentes y tu acceso se restaura al aprobarse el pago.",
    ],
  },
  {
    h: "6. Cómo solicitar un reembolso",
    p: [
      "Si creés que tu caso es un error técnico de los del punto 3, escribinos a hola@kitifica.com con el asunto «Solicitud de reembolso» e incluí tu correo de cuenta y el ID de transacción de Wompi.",
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
      <PageHero pair="durazno" icon="refund" kicker={`Última actualización: ${LAST_UPDATE}`} title="Devoluciones" />
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
