import "server-only";
import crypto from "crypto";

const AUTH_URL = "https://id.wompi.sv/connect/token";
const API_URL = "https://api.wompi.sv";

async function getToken(): Promise<string> {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.WOMPI_APP_ID!,
      client_secret: process.env.WOMPI_CLIENT_SECRET!,
      audience: "wompi_api",
    }),
  });
  if (!res.ok) throw new Error(`Wompi auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function wompiRequest<T>(path: string, method = "GET", body?: object): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wompi ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function listEnlacesPagoRecurrentes() {
  return wompiRequest<Array<{
    idEnlace: string;
    nombre: string;
    urlEnlace: string;
    estaProductivo: boolean;
  }>>("/EnlacePagoRecurrente");
}

export async function getEnlaceSuscripciones(idEnlace: string) {
  return wompiRequest<{
    items: Array<{ email: string; nombre: string; activo: boolean }>;
  }>(`/EnlacePagoRecurrente/${idEnlace}/suscripciones`);
}

// One-time payment link, usable for a single successful payment. `ref` comes back in the
// webhook as EnlacePago.IdentificadorEnlaceComercio, so the purchase is matched by id, not email.
export async function createEnlacePago(opts: {
  ref: string;
  amountCents: number;
  productName: string;
  redirectUrl: string;
  webhookUrl: string;
}) {
  return wompiRequest<{ idEnlace: number; urlEnlace: string; estaProductivo: boolean }>("/EnlacePago", "POST", {
    identificadorEnlaceComercio: opts.ref,
    monto: opts.amountCents / 100,
    nombreProducto: opts.productName,
    formaPago: {
      permitirTarjetaCreditoDebido: true,
      permitirPagoConPuntoAgricola: false,
      permitirPagoEnCuotasAgricola: false,
      permitirPagoEnBitcoin: false,
      permitePagoQuickPay: false,
    },
    configuracion: {
      urlRedirect: opts.redirectUrl,
      urlWebhook: opts.webhookUrl,
      esMontoEditable: false,
      esCantidadEditable: false,
      cantidadPorDefecto: 1,
      notificarTransaccionCliente: true,
    },
    limitesDeUso: { cantidadMaximaPagosExitosos: 1 },
  });
}

export function validateWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.WOMPI_CLIENT_SECRET!;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}
