import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de devoluciones — Bóveda KF-1",
  description: "Política de cancelación y devoluciones de Bóveda KF-1.",
  alternates: { canonical: "/devoluciones" },
};

const sections = [
  {
    h: "1. Suscripciones y facturación",
    p: [
      "Bóveda KF-1 ofrece suscripciones mensuales procesadas mediante PayPal. Los cargos se realizan automáticamente al inicio de cada período de facturación.",
      "Al suscribirte aceptás que el primer cobro se realiza de inmediato y los siguientes cada 30 días hasta que canceles.",
    ],
  },
  {
    h: "2. Cancelación",
    p: [
      "Podés cancelar tu suscripción en cualquier momento desde tu panel de facturación en Bóveda KF-1, o directamente desde tu cuenta de PayPal en Pagos automáticos.",
      "La cancelación es efectiva al final del período de facturación en curso. Seguirás teniendo acceso a las funciones de tu plan hasta esa fecha. No se generan cargos adicionales.",
    ],
  },
  {
    h: "3. Política de reembolsos",
    p: [
      "Dado que Bóveda KF-1 es un servicio digital con acceso inmediato, no ofrecemos reembolsos por períodos ya utilizados como política general.",
      "Sin embargo, en los siguientes casos procesamos un reembolso completo del último período de facturación:",
    ],
    list: [
      "El cobro se realizó después de que hayas cancelado correctamente la suscripción.",
      "Ocurrió un error técnico imputable a nuestra plataforma que impidió el uso normal del servicio.",
      "Se realizó un cobro duplicado.",
    ],
  },
  {
    h: "4. Protección al comprador de PayPal",
    p: [
      "Los pagos procesados mediante PayPal están sujetos a la Protección al comprador de PayPal. Si considerás que un cargo es incorrecto, podés abrir una disputa directamente desde tu cuenta de PayPal.",
      "Cualquier disputa abierta en PayPal será revisada y resuelta de acuerdo con las políticas de PayPal y las presentes condiciones.",
    ],
  },
  {
    h: "5. Pago no aprobado",
    p: [
      "Si un pago no puede ser procesado (saldo insuficiente, tarjeta vencida, etc.), PayPal reintentará el cobro según su propia política. Recibirás un correo de aviso desde Bóveda KF-1 para que actualices tu método de pago.",
      "Si el pago no se regulariza, tu suscripción puede quedar suspendida. Tus datos no se eliminan: al regularizar el pago tu acceso se restaura automáticamente.",
    ],
  },
  {
    h: "6. Cómo solicitar un reembolso",
    p: [
      "Si creés que tu caso aplica a los supuestos del punto 3, escribinos a contacto@kitifica.com con el asunto «Solicitud de reembolso» e incluí tu correo de cuenta y el ID de transacción de PayPal.",
      "Respondemos en un plazo máximo de 5 días hábiles. Los reembolsos aprobados se procesan a través de PayPal y pueden tardar de 3 a 7 días hábiles en reflejarse.",
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
      <h1 className="font-display text-3xl font-bold text-ink">Política de devoluciones</h1>
      <p className="mt-3 text-sm text-ink-soft">Última actualización: septiembre de 2026</p>

      <div className="mt-8 flex flex-col gap-8">
        {sections.map((s) => (
          <div key={s.h}>
            <h2 className="text-base font-semibold text-ink">{s.h}</h2>
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
          <a href="mailto:contacto@kitifica.com" className="text-blue underline">contacto@kitifica.com</a>
          {" "}o visitá nuestra{" "}
          <Link href="/contacto" className="text-blue underline">página de contacto</Link>.
        </p>
      </div>
    </>
  );
}
