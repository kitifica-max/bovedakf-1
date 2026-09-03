// Transactional email via Resend's REST API. ponytail: one fetch, no SDK —
// the endpoint is stable and we only ever send.
// kitifica.com is the verified Resend domain; override with EMAIL_FROM if it changes.
const FROM = process.env.EMAIL_FROM ?? "Bóveda KF-1 <no-reply@kitifica.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type SendResult = { ok: boolean; error?: string };

export async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", to);
    return { ok: false, error: "no api key" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html }),
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
// Dark, table-based, all styles inline — matches the app: bg #0a0e15,
// card #212631, ink #edf0f4, accent #1d5f8f. The wordmark is rendered as
// text (pixel font can't load in mail clients) with the "KF-1" chip.

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function shell(opts: {
  preview: string;
  heading: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footnote?: string;
}) {
  const { preview, heading, bodyHtml, cta, footnote } = opts;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<style>:root{color-scheme:dark;supported-color-schemes:dark}</style>
</head>
<body style="margin:0;padding:0;background:#0a0e15;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preview)}${"&#847;&zwnj;&nbsp;".repeat(30)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e15;padding:32px 16px;">
    <tr><td align="center">
      <!--[if mso]><table role="presentation" width="480" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:480px;">
        <tr><td style="padding:0 4px 20px;">
          <img src="${APP_URL}/logo-email.png" width="150" height="21" alt="Bóveda KF-1"
               style="display:block;border:0;outline:none;text-decoration:none;width:150px;height:21px;font-family:'Arial Black',Arial,Helvetica,sans-serif;font-weight:800;font-size:16px;color:#edf0f4;">
        </td></tr>
        <tr><td style="background:#212631;border:1px solid rgba(255,255,255,0.10);border-radius:20px;padding:32px;">
          <h1 style="margin:0 0 16px;font-family:'Archivo',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:22px;line-height:1.3;font-weight:700;color:#edf0f4;">${esc(heading)}</h1>
          <div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#c8cdd6;">${bodyHtml}</div>
          ${
            cta
              ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 4px;"><tr><td style="border-radius:999px;background:#1d5f8f;">
                   <a href="${esc(cta.href)}" style="display:inline-block;padding:12px 28px;mso-padding-alt:12px 28px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${esc(cta.label)}</a>
                 </td></tr></table>
                 <p style="margin:12px 0 0;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#9aa2b1;word-break:break-all;">O pegá este enlace: ${esc(cta.href)}</p>`
              : ""
          }
          ${
            footnote
              ? `<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#9aa2b1;">${esc(footnote)}</p>`
              : ""
          }
        </td></tr>
        <tr><td style="padding:18px 4px 0;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:#7b8494;">
          Bóveda KF-1 · Compartí credenciales sin dejar rastro en el chat.<br>
          <a href="${esc(APP_URL)}" style="color:#9aa2b1;text-decoration:underline;">${esc(APP_URL.replace(/^https?:\/\//, ""))}</a>
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
      preview: "Confirmá tu dirección de correo para activar tu bóveda.",
      heading: "Confirmá tu correo",
      bodyHtml:
        "<p style='margin:0 0 12px;'>Tu bóveda ya está creada. Confirmá que esta dirección es tuya para poder recuperar el acceso si alguna vez perdés la contraseña.</p>",
      cta: { label: "Confirmar correo", href: link },
      footnote: "Si no creaste una cuenta en Bóveda KF-1, ignorá este mensaje. El enlace vence en 24 horas.",
    }),
  };
}

export function passwordResetEmail(link: string) {
  return {
    subject: "Restablecer contraseña — Bóveda KF-1",
    html: shell({
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
      preview: "Ya existe una bóveda con esta dirección. No se creó ninguna cuenta nueva.",
      heading: "Alguien intentó registrarse con tu correo",
      bodyHtml:
        "<p style='margin:0 0 12px;'>Recibimos un intento de crear una bóveda nueva con esta dirección, pero ya existe una cuenta asociada. <strong>No se creó nada nuevo</strong> y tus datos no cambiaron.</p><p style='margin:0;'>Si fuiste vos, entrá con tu contraseña de siempre. Si no, no hace falta que hagas nada — pero si querés, cambiá tu contraseña por las dudas.</p>",
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
      preview: "Uno de tus links compartidos se abrió por primera vez.",
      heading: "Abrieron tu link compartido",
      bodyHtml: `<p style='margin:0 0 12px;'>El link que compartiste para <strong>${esc(
        service
      )}</strong> se abrió por primera vez. Podés ver el detalle (fecha, IP aproximada) en el registro de auditoría de tu bóveda.</p><p style='margin:0;'>Si ya no querés que sea accesible, revocá el link desde el panel.</p>`,
      cta: { label: "Ver auditoría", href: `${appUrl}/dashboard` },
    }),
  };
}
