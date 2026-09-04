import type { Metadata } from "next";
import { MailIcon, ShieldAlertIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contactá al equipo de Bóveda KF-1 para soporte, dudas de seguridad o consultas comerciales.",
  alternates: { canonical: "/contacto" },
};

const channels = [
  {
    title: "Soporte y consultas generales",
    email: "hola@kitifica.com",
    href: "mailto:hola@kitifica.com?subject=B%C3%B3veda%20KF-1%20-%20Consulta",
    Icon: MailIcon,
  },
  {
    title: "Reportar una vulnerabilidad",
    email: "hola@kitifica.com",
    href: "mailto:hola@kitifica.com?subject=B%C3%B3veda%20KF-1%20-%20Reporte%20de%20seguridad",
    Icon: ShieldAlertIcon,
  },
];

export default function ContactPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Contacto</h1>
      <p className="mt-3 text-ink-soft">
        ¿Preguntas sobre seguridad, un bug, o algo comercial? Escribinos directamente — leemos
        todo, respondemos en persona.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {channels.map(({ title, email, href, Icon }) => (
          <a
            key={title}
            href={href}
            className="flex items-start gap-4 rounded-2xl border border-border-soft bg-gray/40 p-6 transition hover:bg-gray/60 active:scale-[0.99]"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-soft text-blue"
            >
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold text-ink">{title}</span>
              <span className="mt-1 block text-sm text-ink-soft">{email}</span>
            </span>
          </a>
        ))}
      </div>

      <p className="mt-8 text-xs text-ink-soft">
        Bóveda KF-1 es un producto en etapa temprana — respondemos personalmente, así que puede
        tomar hasta 48h hábiles.
      </p>
    </div>
  );
}
