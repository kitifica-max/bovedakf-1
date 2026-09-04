import type { ComponentType } from "react";
import {
  ClockIcon,
  ShieldOffIcon,
  FingerprintIcon,
  LogOutIcon,
  ShuffleIcon,
  SearchXIcon,
  ShieldAlertIcon,
  KeyRoundIcon,
} from "@/components/icons";
import { StepSaveIllustration } from "@/components/illustrations/step-save";
import { StepShareIllustration } from "@/components/illustrations/step-share";
import { StepAuditIllustration } from "@/components/illustrations/step-audit";

export type IconType = ComponentType<{ className?: string }>;
type IllustrationType = () => React.JSX.Element;

export const stats: { label: string; value: string; Icon: IconType }[] = [
  { label: "Credenciales gratis de libre uso por cuenta", value: "20", Icon: KeyRoundIcon },
  { label: "Rango de expiración configurable por link", value: "1h–7d", Icon: ClockIcon },
];

export const problems: { title: string; body: string; Icon: IconType }[] = [
  {
    title: "Contraseñas dispersas",
    body: "Un poco en el email, un poco en Slack, un poco en un Notion que nadie actualiza. Nadie sabe cuál es la versión real.",
    Icon: ShuffleIcon,
  },
  {
    title: "Cero auditoría",
    body: "Cuando algo sale mal, no hay forma de saber quién entró a qué credencial, ni cuándo.",
    Icon: SearchXIcon,
  },
  {
    title: "Texto plano para siempre",
    body: "Un mensaje de Slack con una contraseña adentro no se borra solo. Vive ahí, sin cifrar, indefinidamente.",
    Icon: ShieldAlertIcon,
  },
];

export const steps: { n: string; title: string; body: string; Illustration: IllustrationType }[] = [
  {
    n: "01",
    title: "Guarda",
    body: "Añades la credencial y se encripta al instante con AES-256-GCM antes de tocar la base de datos.",
    Illustration: StepSaveIllustration,
  },
  {
    n: "02",
    title: "Comparte",
    body: "Generas un link con expiración (1h a 7 días) y permiso de lectura o descarga.",
    Illustration: StepShareIllustration,
  },
  {
    n: "03",
    title: "Audita",
    body: "Ves exactamente quién entró, cuándo y desde qué IP — el link se puede revocar con un click.",
    Illustration: StepAuditIllustration,
  },
];

export const teamSteps: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Invitás por correo",
    body: "Escribís el mail y elegís rol: Editor o Lector. Le llega una invitación al instante.",
  },
  {
    n: "02",
    title: "Crea su contraseña",
    body: "Abre el link, elige una clave y listo. La organización ya está definida — no llena ningún formulario.",
  },
  {
    n: "03",
    title: "Entra con su rol",
    body: "El Lector ve y copia; el Editor además agrega y comparte. Cada acción queda firmada con su nombre en la auditoría.",
  },
];

export const features: { title: string; body: string; Icon: IconType; wide?: boolean }[] = [
  {
    title: "Expiración automática",
    body: "El link deja de funcionar solo. No depende de que te acuerdes de revocarlo.",
    Icon: ClockIcon,
  },
  {
    title: "Revocación instantánea",
    body: "¿Algo se filtró? Un click y el link muere, aunque todavía no haya expirado.",
    Icon: ShieldOffIcon,
  },
  {
    title: "Passkeys y 2FA",
    body: "Entrá con Face ID, Touch ID o Windows Hello, o con un código de 6 dígitos. Vos elegís.",
    Icon: FingerprintIcon,
  },
  {
    title: "Sesión que se cuida sola",
    body: "2 minutos sin actividad y te preguntamos si seguís ahí, antes de cerrar la sesión.",
    Icon: LogOutIcon,
  },
];

export const faqs: { q: string; a: string }[] = [
  {
    q: "¿Cómo agrego a mi equipo?",
    a: "Desde el panel de tu bóveda, en \"Equipo\", invitás por correo y elegís el rol: Editor (agrega, edita y comparte credenciales) o Lector (solo ve y copia). La persona recibe un link, crea su contraseña y ya queda dentro de tu organización. Podés cambiar roles o quitar a alguien cuando quieras, y cada acción queda registrada con su nombre.",
  },
  {
    q: "¿Ustedes pueden ver mis contraseñas?",
    a: "No. Las credenciales se guardan cerradas con llave. Nosotros guardamos solo la versión cerrada; la llave para abrir cada link la tiene únicamente la persona a la que se lo mandás. Ni nosotros ni nadie que entre a nuestra base de datos puede leer lo que hay adentro.",
  },
  {
    q: "¿Qué pasa si alguien reenvía el link a otra persona?",
    a: "Cualquiera con el link completo (incluida la clave) puede verlo mientras esté activo. Por eso cada link tiene expiración y podés revocarlo en cualquier momento desde el dashboard.",
  },
  {
    q: "¿Necesito instalar algo?",
    a: "No. Bóveda KF-1 es una PWA — funciona en el navegador y se puede instalar como app si querés, pero no es obligatorio.",
  },
  {
    q: "¿Qué pasa cuando expira un link?",
    a: "Deja de funcionar automáticamente. Nadie puede volver a acceder a esa credencial con ese link, y el intento queda registrado en la auditoría.",
  },
  {
    q: "¿Es gratis?",
    a: "Sí, hasta 20 credenciales por bóveda, sin tarjeta de crédito.",
  },
  {
    q: "¿Tienen doble factor de autenticación?",
    a: "Sí. Podés activar 2FA con app de autenticación (TOTP) o entrar directo con una passkey — Face ID, Touch ID o Windows Hello, sin contraseña. Además, si te quedás inactivo 2 minutos, te avisamos antes de cerrar la sesión sola.",
  },
];

export const securitySpec: { label: string; items: { claim: string; plain: string }[] }[] = [
  {
    label: "Cifrado",
    items: [
      { claim: "AES-256-GCM", plain: "Cada credencial se guarda cifrada, con un estándar que usan bancos y gobiernos." },
      { claim: "Zero-knowledge en los links", plain: "La llave para abrir un link nunca toca nuestro servidor. Sin ella, lo que guardamos es texto ilegible." },
    ],
  },
  {
    label: "Compartir",
    items: [
      { claim: "Expiración 1h–7d", plain: "Cada link deja de funcionar solo, en el plazo que elijas." },
      { claim: "Revocación instantánea", plain: "Cortás cualquier link con un click, antes de que expire." },
      { claim: "Un destinatario", plain: "Un link es para una persona. Cada apertura queda registrada." },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { claim: "Passkeys y 2FA", plain: "Entrá con huella, cara o PIN, o con código de una app de autenticación." },
      { claim: "Sesión que expira", plain: "Si te quedás inactivo, te avisamos antes de cerrar la sesión." },
      { claim: "Anti-fuerza bruta", plain: "Límite de intentos en el login por IP." },
    ],
  },
  {
    label: "Auditoría",
    items: [
      { claim: "Registro inmutable", plain: "Cada vista, cada revocación, cada cambio de acceso queda escrito y no se puede editar." },
      { claim: "Con IP aproximada y persona", plain: "Sabés quién entró a qué y cuándo. La IP se guarda truncada." },
    ],
  },
];
