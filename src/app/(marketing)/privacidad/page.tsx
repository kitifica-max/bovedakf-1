import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Qué datos recolecta Bóveda KF-1, cómo los protegemos, y tus derechos sobre ellos.",
  alternates: { canonical: "/privacidad" },
};

const sections = [
  {
    h: "Qué datos recolectamos",
    p: [
      "Cuenta: tu email y una contraseña con hash (scrypt) — nunca guardamos tu contraseña en texto plano.",
      "Credenciales: el servicio, usuario, secreto y notas que guardás se encriptan (AES-256-GCM) antes de tocar la base de datos.",
      "Links compartidos: cuando generás un link, la clave de descifrado vive únicamente en la URL que reciben tus compañeros — no la almacenamos, así que no podemos descifrar ese link nosotros mismos.",
      "Auditoría: registramos quién generó o accedió a un link, la dirección IP, el user agent, y la fecha — esto es parte central del producto, para que sepas quién entró a qué.",
    ],
  },
  {
    h: "Cómo usamos tus datos",
    p: [
      "Solo para operar el servicio: autenticarte, guardar y mostrar tus credenciales, y generar el registro de auditoría. No vendemos tus datos ni los usamos para publicidad. No hay rastreadores de terceros con fines publicitarios en el sitio.",
    ],
  },
  {
    h: "Dónde viven tus datos",
    p: [
      "La aplicación corre en Netlify. La base de datos (Postgres) corre en Supabase. Ambos actúan como encargados del tratamiento (sub-procesadores) — no acceden al contenido de tus credenciales, que llega encriptado.",
    ],
  },
  {
    h: "Cookies",
    p: [
      "Usamos una única cookie de sesión, necesaria para mantenerte conectado. No usamos cookies de rastreo ni de publicidad.",
    ],
  },
  {
    h: "Cuánto tiempo guardamos tus datos",
    p: [
      "Mientras tu cuenta exista. Los links compartidos y su registro de auditoría se conservan aunque el link haya expirado, como historial de acceso.",
    ],
  },
  {
    h: "Tus derechos",
    p: [
      "Podés pedirnos acceso, corrección o eliminación de tus datos en cualquier momento escribiendo a hola@kitifica.com. Como el producto está en etapa temprana, la eliminación de cuenta hoy se procesa manualmente, no de forma automática.",
    ],
  },
  {
    h: "Contacto",
    p: ["Preguntas sobre esta política: hola@kitifica.com."],
  },
];

export default function PrivacyPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Privacidad</h1>
      <p className="mt-2 text-sm text-ink-soft">Última actualización: 26 de agosto de 2026.</p>

      <div className="mt-8 flex flex-col gap-6">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-lg font-semibold text-ink">{s.h}</h2>
            <ul className="mt-2 flex flex-col gap-1.5">
              {s.p.map((para, i) => (
                <li key={i} className="text-sm text-ink-soft">
                  {para}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
