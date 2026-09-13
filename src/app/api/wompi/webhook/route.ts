import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateWebhookSignature } from "@/lib/wompi";
import { sendEmail, paymentSuccessEmail, paymentFailedEmail } from "@/lib/email";
import { generateReceipt } from "@/lib/pdf";

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

const PLAN_PRICE: Record<string, string> = { starter: "9.00", team: "29.00" };
const PLAN_NAME: Record<string, string> = { starter: "Starter", team: "Equipo" };

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("wompi_hash") ?? "";

  if (signature && !validateWebhookSignature(rawBody, signature)) {
    console.warn("[wompi/webhook] invalid signature");
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: WompiWebhook;
  try {
    body = JSON.parse(rawBody) as WompiWebhook;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Only process successful transactions
  if (body.ResultadoTransaccion !== "ExitosaAprobada") {
    // Payment failed — notify user if we can find them
    const email = body.cliente?.Email;
    if (email) {
      const user = await db.user.findUnique({ where: { email } });
      if (user) {
        const sub = await db.subscription.findUnique({ where: { userId: user.id } });
        if (sub) {
          await db.subscription.update({ where: { id: sub.id }, data: { status: "SUSPENDED" } });
          const planName = PLAN_NAME[sub.plan] ?? sub.plan;
          const { subject, html } = paymentFailedEmail({ planName, manageUrl: "https://panel.wompi.sv" });
          await sendEmail(email, subject, html);
        }
      }
    }
    return NextResponse.json({ ok: true });
  }

  const email = body.cliente?.Email;
  if (!email) return NextResponse.json({ ok: true });

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.warn("[wompi/webhook] no user found for email:", email);
    return NextResponse.json({ ok: true });
  }

  const sub = await db.subscription.findUnique({ where: { userId: user.id } });
  if (!sub) {
    console.warn("[wompi/webhook] no subscription found for userId:", user.id);
    return NextResponse.json({ ok: true });
  }

  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.subscription.update({
    where: { id: sub.id },
    data: { status: "ACTIVE", currentPeriodEnd: periodEnd },
  });

  // Send receipt email
  const planName = PLAN_NAME[sub.plan] ?? sub.plan;
  const amount = PLAN_PRICE[sub.plan] ?? String(body.Monto ?? "0.00");
  const nextDate = periodEnd.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

  let pdfAttachment: { filename: string; content: string }[] | undefined;
  try {
    const pdfBuffer = await generateReceipt({
      userEmail: email,
      planName,
      amount,
      currency: "USD",
      transactionId: body.IdTransaccion,
      subscriptionId: sub.wompiEnlaceId,
      date: new Date(),
    });
    pdfAttachment = [{ filename: "recibo-kf1.pdf", content: pdfBuffer.toString("base64") }];
  } catch (err) {
    console.error("[wompi/webhook] PDF generation failed", err);
  }

  const { subject, html } = paymentSuccessEmail({ planName, amount, currency: "USD", nextBillingDate: nextDate });
  await sendEmail(email, subject, html, pdfAttachment);

  return NextResponse.json({ ok: true });
}
