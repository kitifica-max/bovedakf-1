// Transactional email via Resend's REST API. ponytail: one fetch, no SDK —
// the endpoint is stable and we only ever send.
// kitifica.com is the verified Resend domain; override with EMAIL_FROM if it changes.
const FROM = process.env.EMAIL_FROM ?? "Bóveda KF-1 <no-reply@kitifica.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type SendResult = { ok: boolean; error?: string };
type Attachment = { filename: string; content: string }; // base64

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: Attachment[],
): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", to);
    return { ok: false, error: "no api key" };
  }
  try {
    const body: Record<string, unknown> = { from: FROM, to, subject, html };
    if (attachments?.length) body.attachments = attachments;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[email] resend", res.status, body);
      return { ok: false, error: `resend ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false, error: "network" };
  }
}

// ── Shared shell ────────────────────────────────────────────────────────
// Light agencies brand, table-based, all styles inline. Header = the KF-1 seal (same as the
// landing). Each email opens with a colored hero: one color pair + a starburst PNG on its own
// row above the title — a condensed heading beside it would overflow on 320px phones, and
// fallback fonts (Arial) are much wider than Barlow. Images are decorative except the seal,
// whose alt text keeps the brand readable when a client blocks images.

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const SANS = "Montserrat,'Helvetica Neue',Helvetica,Arial,sans-serif";
const DISPLAY = "'Barlow Condensed','Arial Narrow','Roboto Condensed',Arial,sans-serif";
const INK = "#1b2340";
const INK_SOFT = "#5b6383";
const LINE = "#e4e7f0";
const AZUL = "#1f6fb2";

// Hero color pairs (ground, ink) + the starburst file in public/email/.
const HEROES = {
  verify: { bg: "#1f6fb2", ink: "#ffffff", star: "star-verify.png" },
  reset: { bg: "#f4eea6", ink: "#4e52a6", star: "star-reset.png" },
  duplicate: { bg: "#f7c55a", ink: "#a81b42", star: "star-duplicate.png" },
  opened: { bg: "#0b6b47", ink: "#b9e35a", star: "star-opened.png" },
  invite: { bg: "#f1d3e3", ink: "#1b5a93", star: "star-invite.png" },
  paid: { bg: "#4e52a6", ink: "#f4eea6", star: "star-paid.png" },
  failed: { bg: "#c8234f", ink: "#ffd27a", star: "star-failed.png" },
} as const;
type Hero = keyof typeof HEROES;

function shell(opts: {
  hero: Hero;
  preview: string;
  heading: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footnote?: string;
}) {
  const { hero, preview, heading, bodyHtml, cta, footnote } = opts;
  const h = HEROES[hero];
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=Montserrat:wght@500;700;800&display=swap" rel="stylesheet">
<style>:root{color-scheme:light only;supported-color-schemes:light}</style>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preview)}${"&#847;&zwnj;&nbsp;".repeat(30)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:24px 12px;">
    <tr><td align="center">
      <!--[if mso]><table role="presentation" width="520" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;">
        <tr><td style="padding:0 4px 16px;">
          <img src="${APP_URL}/email/seal.png" width="64" height="64" alt="Bóveda KF-1"
               style="display:block;border:0;outline:none;text-decoration:none;width:64px;height:64px;border-radius:32px;font-family:${DISPLAY};font-size:18px;font-weight:800;color:${AZUL};">
        </td></tr>
        <tr><td style="background:${h.bg};border-radius:32px;padding:22px 24px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="right" style="padding-bottom:6px;">
              <img src="${APP_URL}/email/${h.star}" width="72" height="72" alt="" style="display:block;border:0;outline:none;width:72px;height:72px;">
            </td></tr>
            <tr><td style="font-family:${DISPLAY};font-size:30px;line-height:1.08;font-weight:800;text-transform:uppercase;color:${h.ink};word-break:break-word;">${esc(heading)}</td></tr>
          </table>
        </td></tr>
        <tr><td style="height:12px;line-height:12px;font-size:0;">&nbsp;</td></tr>
        <tr><td style="border:2px solid ${LINE};border-radius:28px;padding:24px;">
          <div style="font-family:${SANS};font-size:15px;line-height:1.6;font-weight:500;color:${INK};">${bodyHtml}</div>
          ${
            cta
              ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;"><tr><td style="border-radius:999px;background:${AZUL};">
                   <a href="${esc(cta.href)}" style="display:inline-block;padding:14px 26px;mso-padding-alt:14px 26px;font-family:${SANS};font-size:12px;line-height:1.4;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:999px;">${esc(cta.label)}</a>
                 </td></tr></table>
                 <p style="margin:12px 0 0;font-family:${SANS};font-size:12px;line-height:1.5;color:${INK_SOFT};word-break:break-all;">O pegá este enlace: ${esc(cta.href)}</p>`
              : ""
          }
          ${
            footnote
              ? `<p style="margin:20px 0 0;padding-top:16px;border-top:2px solid ${LINE};font-family:${SANS};font-size:12px;line-height:1.5;color:${INK_SOFT};">${esc(footnote)}</p>`
              : ""
          }
        </td></tr>
        <tr><td style="padding:18px 4px 0;font-family:${SANS};font-size:11px;line-height:1.5;font-weight:500;color:${INK_SOFT};">
          Bóveda KF-1 · Las contraseñas y códigos 2FA de tus clientes, ordenados.<br>
          <a href="${esc(APP_URL)}" style="color:${AZUL};font-weight:700;text-decoration:underline;">${esc(APP_URL.replace(/^https?:\/\//, ""))}</a>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Specific emails ────────────────────────────────────────────────────

export function verificationEmail(link: string) {
  return {
    subject: "Confirmá tu correo — Bóveda KF-1",
    html: shell({
      hero: "verify",
      preview: "Confirmá tu dirección de correo para activar tu cuenta.",
      heading: "Confirmá tu correo",
      bodyHtml:
        "<p style='margin:0 0 12px;'>Tu cuenta ya está creada. Confirmá que esta dirección es tuya para poder recuperar el acceso si alguna vez perdés la contraseña.</p>",
      cta: { label: "Confirmar correo", href: link },
      footnote: "Si no creaste una cuenta en Bóveda KF-1, ignorá este mensaje. El enlace vence en 24 horas.",
    }),
  };
}

export function passwordResetEmail(link: string) {
  return {
    subject: "Restablecer contraseña — Bóveda KF-1",
    html: shell({
      hero: "reset",
      preview: "Enlace para elegir una contraseña nueva.",
      heading: "Restablecer contraseña",
      bodyHtml:
        "<p style='margin:0 0 12px;'>Pediste cambiar tu contraseña. Elegí una nueva desde el botón. Tus credenciales guardadas no se ven afectadas.</p>",
      cta: { label: "Elegir contraseña nueva", href: link },
      footnote:
        "Si no pediste esto, ignorá el mensaje y tu contraseña seguirá igual. El enlace vence en 1 hora.",
    }),
  };
}

export function duplicateSignupEmail(appUrl: string) {
  return {
    subject: "Alguien intentó registrarse con tu correo — Bóveda KF-1",
    html: shell({
      hero: "duplicate",
      preview: "Ya existe una cuenta con esta dirección. No se creó ninguna cuenta nueva.",
      heading: "Alguien intentó registrarse con tu correo",
      bodyHtml:
        "<p style='margin:0 0 12px;'>Recibimos un intento de crear una cuenta nueva con esta dirección, pero ya existe una cuenta asociada. <strong>No se creó nada nuevo</strong> y tus datos no cambiaron.</p><p style='margin:0;'>Si fuiste vos, entrá con tu contraseña de siempre. Si no, no hace falta que hagas nada — pero si querés, cambiá tu contraseña por las dudas.</p>",
      cta: { label: "Ir a Bóveda KF-1", href: appUrl },
    }),
  };
}

export function linkOpenedEmail(service: string, appUrl: string) {
  return {
    // Service name stays out of the subject and preheader — both surface in
    // lock-screen / notification previews, which is exactly the leak the
    // product exists to avoid. It only appears inside the email body.
    subject: "Abrieron un link compartido de tu bóveda",
    html: shell({
      hero: "opened",
      preview: "Uno de tus links compartidos se abrió por primera vez.",
      heading: "Abrieron tu link compartido",
      bodyHtml: `<p style='margin:0 0 12px;'>El link que compartiste para <strong>${esc(
        service
      )}</strong> se abrió por primera vez. Podés ver el detalle (fecha, IP aproximada) en el registro de auditoría de tu bóveda.</p><p style='margin:0;'>Si ya no querés que sea accesible, revocá el link desde el panel.</p>`,
      cta: { label: "Ver auditoría", href: `${appUrl}/dashboard` },
    }),
  };
}

export function inviteEmail(link: string, vaultName: string, inviterName: string, roleLabel: string) {
  return {
    subject: `${inviterName} te invitó a una bóveda en KF-1`,
    html: shell({
      hero: "invite",
      preview: `Te sumaron a "${vaultName}" como ${roleLabel}.`,
      heading: "Te invitaron a una bóveda",
      bodyHtml: `<p style='margin:0 0 12px;'><strong>${esc(inviterName)}</strong> te sumó a la bóveda <strong>${esc(
        vaultName
      )}</strong> como <strong>${esc(roleLabel)}</strong>. Aceptá para ver las credenciales compartidas del equipo.</p>`,
      cta: { label: "Aceptar invitación", href: link },
      footnote: "Si no esperabas esto, ignorá el mensaje. El enlace vence en 7 días.",
    }),
  };
}

export function paymentSuccessEmail(opts: {
  planName: string;
  amount: string;
  currency: string;
  nextBillingDate: string;
}) {
  return {
    subject: `Pago recibido — Plan ${opts.planName} activado · Bóveda KF-1`,
    html: shell({
      hero: "paid",
      preview: `Tu plan ${opts.planName} está activo. Adjuntamos tu recibo.`,
      heading: `Plan ${opts.planName} activo`,
      bodyHtml: `
        <p style='margin:0 0 16px;'>Recibimos tu pago correctamente. Tu suscripción está activa y podés usar todas las funciones del plan.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 16px;">
          <tr>
            <td style="padding:10px 0;border-bottom:2px solid #e4e7f0;font-size:13px;color:#5b6383;">Plan</td>
            <td style="padding:10px 0;border-bottom:2px solid #e4e7f0;font-size:13px;color:#1b2340;text-align:right;font-weight:600;">${esc(opts.planName)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:2px solid #e4e7f0;font-size:13px;color:#5b6383;">Monto</td>
            <td style="padding:10px 0;border-bottom:2px solid #e4e7f0;font-size:13px;color:#1b2340;text-align:right;font-weight:600;">${esc(opts.currency)} $${esc(opts.amount)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;font-size:13px;color:#5b6383;">Próximo cobro</td>
            <td style="padding:10px 0;font-size:13px;color:#1b2340;text-align:right;">${esc(opts.nextBillingDate)}</td>
          </tr>
        </table>
        <p style='margin:0;font-size:13px;color:#5b6383;'>El recibo en PDF va adjunto a este correo. Para cancelar o gestionar tu suscripción, entrá a tu panel de facturación.</p>`,
      cta: { label: "Ver panel de facturación", href: `${APP_URL}/dashboard/billing` },
      footnote: "El pago fue procesado por Wompi. Política de devoluciones: kf1.kitifica.com/devoluciones",
    }),
  };
}

export function paymentFailedEmail(opts: { planName: string; manageUrl: string }) {
  return {
    subject: `Pago no procesado — Bóveda KF-1`,
    html: shell({
      hero: "failed",
      preview: "No pudimos procesar tu pago. Tu suscripción puede quedar suspendida.",
      heading: "No pudimos procesar tu pago",
      bodyHtml: `
        <p style='margin:0 0 12px;'>Intentamos cobrar tu suscripción del plan <strong>${esc(opts.planName)}</strong> pero el pago no fue aprobado.</p>
        <p style='margin:0 0 12px;'>Esto puede ocurrir si:</p>
        <ul style='margin:0 0 16px;padding-left:20px;color:#1b2340;font-size:14px;line-height:1.7;'>
          <li>Tu método de pago expiró o fue rechazado</li>
          <li>No había fondos suficientes</li>
          <li>Tu banco bloqueó el cargo</li>
        </ul>
        <p style='margin:0;'>Actualizá tu método de pago en <a href="https://panel.wompi.sv/Recurrentes" style="color:#1f6fb2;">panel.wompi.sv/Recurrentes</a> para evitar la suspensión de tu cuenta.</p>`,
      cta: { label: "Actualizar pago", href: opts.manageUrl },
      footnote: "Si el problema persiste, contactanos en contacto@kitifica.com.",
    }),
  };
}
