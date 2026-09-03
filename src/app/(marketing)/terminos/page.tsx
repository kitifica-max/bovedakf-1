import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso de Bóveda KF-1.",
  alternates: { canonical: "/terminos" },
};

const sections = [
  {
    h: "1. Aceptación de los términos",
    p: [
      "Al crear una cuenta o usar Bóveda KF-1 de cualquier forma, aceptás estos términos. Si no estás de acuerdo, no uses el servicio.",
    ],
  },
  {
    h: "2. Qué es Bóveda KF-1",
    p: [
      "Bóveda KF-1 es un gestor de credenciales compartidas: te permite guardar accesos de equipo de forma encriptada y compartirlos mediante links con expiración configurable. El plan gratuito incluye hasta 20 credenciales por bóveda.",
    ],
  },
  {
    h: "3. Tu cuenta",
    p: [
      "Sos responsable de mantener la confidencialidad de tu contraseña y de toda la actividad que ocurra en tu cuenta. Notificanos de inmediato si sospechás un acceso no autorizado.",
      "Debés proveer un email válido. No podés compartir tu cuenta de gestor con terceros — para eso existen los links compartibles.",
    ],
  },
  {
    h: "4. Uso aceptable",
    p: [
      "No uses Bóveda KF-1 para almacenar o distribuir contenido ilegal, ni para credenciales obtenidas sin autorización. Nos reservamos el derecho de suspender cuentas que violen esto.",
    ],
  },
  {
    h: "5. Tus datos y credenciales",
    p: [
      "Las credenciales que guardás se encriptan (AES-256-GCM) antes de almacenarse. Los links compartidos usan una clave de descifrado que vive únicamente en la URL — nunca la guardamos en nuestra base de datos, y por lo tanto no podemos descifrar esos links por nuestra cuenta.",
      "Sos el único responsable de a quién le compartís un link, y de revocarlo cuando corresponda. Ver la Política de Privacidad para más detalle sobre qué datos recolectamos.",
    ],
  },
  {
    h: "6. Disponibilidad del servicio",
    p: [
      "Hacemos un esfuerzo razonable por mantener el servicio disponible, pero no garantizamos disponibilidad ininterrumpida. Bóveda KF-1 se ofrece \"tal cual\", sin garantías explícitas o implícitas de ningún tipo.",
    ],
  },
  {
    h: "7. Límite de responsabilidad",
    p: [
      "En la máxima medida permitida por la ley, Bóveda KF-1 no será responsable por daños indirectos, incidentales o consecuentes derivados del uso del servicio, incluida la pérdida de datos o accesos compartidos indebidamente por el usuario.",
    ],
  },
  {
    h: "8. Terminación",
    p: [
      "Podés eliminar tu cuenta cuando quieras. Podemos suspender o terminar cuentas que violen estos términos, con aviso previo cuando sea razonablemente posible.",
    ],
  },
  {
    h: "9. Cambios a estos términos",
    p: [
      "Podemos actualizar estos términos ocasionalmente. Si el cambio es significativo, te avisaremos por email antes de que entre en vigencia.",
    ],
  },
  {
    h: "10. Contacto",
    p: ["Dudas sobre estos términos: hola@kitifica.com."],
  },
];

export default function TermsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        Términos y condiciones
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Última actualización: 26 de agosto de 2026.</p>
      <p className="mt-4 bg-blue/10 px-4 py-3 text-sm text-ink-soft">
        Bóveda KF-1 está en etapa temprana. Este documento es un marco general de uso — si tu
        organización necesita un acuerdo formal (DPA, SLA), escribinos.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-lg font-semibold text-ink">{s.h}</h2>
            {s.p.map((para, i) => (
              <p key={i} className="mt-2 text-sm text-ink-soft">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
