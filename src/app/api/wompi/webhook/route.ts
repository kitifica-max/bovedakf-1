import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateWebhookSignature } from "@/lib/wompi";
import { sendEmail, legacyPlanPaidEmail, legacyPlanPausedEmail, linkPackPaidEmail } from "@/lib/email";
import { generateReceipt } from "@/lib/pdf";
import { usd } from "@/lib/packs";

type WompiWebhook = {
  IdTransaccion: string;
  Monto: number;
  ResultadoTransaccion: string; // "ExitosaAprobada" | "ExitosaDeclinada" | "Fallida"
  EsProductiva: boolean;
  EnlacePago?: {
    Id: number;
    IdentificadorEnlaceComercio?: string;
    NombreProducto?: string;
  };
  cliente?: {
    Nombre?: string;
    Email?: string;
  };
};

const PLAN_PRICE: Record<string, string> = { personal: "3.00", starter: "9.00", team: "20.00" };
const PLAN_NAME: Record<string, string> = { personal: "Personal", starter: "Personal", team: "Equipo" };
const PLAN_SEATS: Record<string, number> = { personal: 1, starter: 5, team: 10 };

function resolvePlan(body: WompiWebhook): "personal" | "starter" | "team" | null {
  const nombre = body.EnlacePago?.NombreProducto ?? "";
  if (nombre.toLowerCase().includes("equipo")) return "team";
  if (nombre.toLowerCase().includes("personal")) return "personal";
  if (nombre.toLowerCase().includes("starter")) return "starter";
  // Fallback: match by amount
  if (body.Monto === 20 || body.Monto === 2000) return "team";
  if (body.Monto === 3 || body.Monto === 300) return "personal";
  // Legacy: old $29 team and $9 starter links
  if (body.Monto === 29 || body.Monto === 2900) return "team";
  if (body.Monto === 9 || body.Monto === 900) return "starter";
  return null;
}

async function creditLinkPack(body: WompiWebhook, purchase: { id: string; userId: string; links: number; amountCents: number }) {
  if (body.ResultadoTransaccion !== "ExitosaAprobada") return NextResponse.json({ ok: true });
  if (!body.EsProductiva && process.env.NODE_ENV === "production") {
    console.warn("[wompi/webhook] ignoring test transaction for purchase", purchase.id);
    return NextResponse.json({ ok: true });
  }
  if (Math.round(body.Monto * 100) !== purchase.amountCents) {
    console.error("[wompi/webhook] amount mismatch for purchase", purchase.id, body.Monto);
    return NextResponse.json({ ok: true });
  }

  // PENDING → PAID is the idempotency gate: a retried webhook finds nothing to flip and credits nothing.
  const credited = await db.$transaction(async (tx) => {
    const { count } = await tx.linkPurchase.updateMany({
      where: { id: purchase.id, status: "PENDING" },
      data: { status: "PAID", transactionId: body.IdTransaccion, paidAt: new Date() },
    });
    if (count !== 1) return null;
    return tx.user.update({
      where: { id: purchase.userId },
      data: { linkCredits: { increment: purchase.links } },
      select: { email: true, linkCredits: true },
    });
  });
  // Receipt goes out once, with the credit; a failed send never undoes it.
  if (credited) await sendLinkPackReceipt(credited, purchase, body.IdTransaccion);
  return NextResponse.json({ ok: true });
}

async function sendLinkPackReceipt(
  user: { email: string; linkCredits: number },
  purchase: { id: string; links: number; amountCents: number },
  transactionId: string,
) {
  const amount = usd(purchase.amountCents);
  let pdf: { filename: string; content: string }[] | undefined;
  try {
    const buf = await generateReceipt({
      userEmail: user.email,
      description: `Recarga de ${purchase.links} links — pago único`,
      amount,
      currency: "USD",
      transactionId,
      reference: purchase.id,
      date: new Date(),
    });
    pdf = [{ filename: "recibo-kf1.pdf", content: buf.toString("base64") }];
  } catch (err) {
    console.error("[wompi/webhook] PDF generation failed", err);
  }
  const { subject, html } = linkPackPaidEmail({ links: purchase.links, amount, balance: user.linkCredits });
  await sendEmail(user.email, subject, html, pdf);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("wompi_hash") ?? "";

  if (process.env.NODE_ENV === "production") {
    if (!signature || !validateWebhookSignature(rawBody, signature)) {
      console.warn("[wompi/webhook] missing or invalid signature");
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  } else if (signature && !validateWebhookSignature(rawBody, signature)) {
    console.warn("[wompi/webhook] invalid signature");
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: WompiWebhook;
  try {
    body = JSON.parse(rawBody) as WompiWebhook;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Link packs: matched by our purchase id, never by the payer's email.
  const ref = body.EnlacePago?.IdentificadorEnlaceComercio;
  if (ref) {
    const purchase = await db.linkPurchase.findUnique({ where: { id: ref } });
    if (purchase) return creditLinkPack(body, purchase);
  }

  const email = body.cliente?.Email;
  if (!email) return NextResponse.json({ ok: true });

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.warn("[wompi/webhook] no user for email:", email);
    return NextResponse.json({ ok: true });
  }

  // Payment failed — suspend only a paid plan; a declined first charge must not end a trial.
  if (body.ResultadoTransaccion !== "ExitosaAprobada") {
    const sub = await db.subscription.findUnique({ where: { userId: user.id } });
    if (sub?.status === "ACTIVE") {
      await db.subscription.update({ where: { id: sub.id }, data: { status: "SUSPENDED" } });
      const planName = PLAN_NAME[sub.plan] ?? sub.plan;
      const { subject, html } = legacyPlanPausedEmail({ planName });
      await sendEmail(email, subject, html);
    }
    return NextResponse.json({ ok: true });
  }

  // Payment succeeded — upsert subscription (handles first-time activation)
  const plan = resolvePlan(body);
  if (!plan) {
    console.warn("[wompi/webhook] cannot resolve plan from webhook:", body.EnlacePago);
    return NextResponse.json({ ok: true });
  }

  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const sub = await db.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      plan,
      status: "ACTIVE",
      seats: PLAN_SEATS[plan],
      currentPeriodEnd: periodEnd,
    },
    update: {
      plan,
      status: "ACTIVE",
      seats: PLAN_SEATS[plan],
      currentPeriodEnd: periodEnd,
    },
  });

  // Send receipt email
  const planName = PLAN_NAME[sub.plan] ?? sub.plan;
  const amount = PLAN_PRICE[sub.plan] ?? String(body.Monto ?? "0.00");
  const nextDate = periodEnd.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

  let pdfAttachment: { filename: string; content: string }[] | undefined;
  try {
    const pdfBuffer = await generateReceipt({
      userEmail: email,
      description: `Plan ${planName} — mensual (plan anterior)`,
      amount,
      currency: "USD",
      transactionId: body.IdTransaccion,
      reference: String(body.EnlacePago?.Id ?? ""),
      date: new Date(),
    });
    pdfAttachment = [{ filename: "recibo-kf1.pdf", content: pdfBuffer.toString("base64") }];
  } catch (err) {
    console.error("[wompi/webhook] PDF generation failed", err);
  }

  const { subject, html } = legacyPlanPaidEmail({ planName, amount, nextBillingDate: nextDate });
  await sendEmail(email, subject, html, pdfAttachment);

  return NextResponse.json({ ok: true });
}
