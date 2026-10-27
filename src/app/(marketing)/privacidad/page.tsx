import type { Metadata } from "next";
import { PageHero, StarDot, pageCard } from "@/components/brand/shapes";

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
    h: "Extensión de Chrome",
    p: [
      "La extensión Bóveda KF-1 tiene una sola función: completar el formulario de inicio de sesión de la pestaña activa con las credenciales de tu bóveda, cuando hacés clic en \"Llenar\".",
      "Qué se guarda en tu equipo: el token de API que pegás vos, en el almacenamiento local de Chrome (chrome.storage.local). No lo almacenamos en ningún otro lado; se borra cuando cerrás sesión desde la extensión o cuando la desinstalás.",
      "A dónde habla: únicamente a kf1.kitifica.com, por HTTPS, usando tu token como autenticación. Pide la lista de credenciales de tus bóvedas (servicio y usuario) y, cuando elegís una, esa credencial para llenarla. No hay llamadas a otros servicios ni a terceros.",
      "Qué toca en la página: al hacer clic en \"Llenar\", un script escribe el usuario y la contraseña en el formulario de login de esa pestaña. No lee, guarda ni transmite el contenido de la página, lo que escribís ni tu historial de navegación. El único dato de la pestaña que usa es el dominio (hostname), en memoria, para ordenar primero las credenciales que coinciden con ese sitio.",
      "Sin código remoto ni analítica: todo el código y las fuentes van dentro del paquete de la extensión. No hay rastreadores, SDKs de analítica ni publicidad.",
      "Cómo revocar el acceso: cerrá sesión desde la extensión, revocá el token desde la app web (sección \"Token CLI\"), o desinstalá la extensión. Los tokens además expiran solos a los 30 días.",
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
    <>
      <PageHero pair="amarillo" icon="eye" kicker="Última actualización: 27 de octubre de 2026" title="Privacidad" />
      <div className={pageCard}>

      <div className="mt-8 flex flex-col gap-6">
        {sections.map((s, si) => (
          <section key={s.h}>
            <h2 className="t-h2 flex items-center gap-3"><StarDot i={si} />{s.h}</h2>
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
    </>
  );
}
