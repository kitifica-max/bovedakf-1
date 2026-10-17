import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateWebhookSignature } from "@/lib/wompi";
import { sendEmail, linkPackPaidEmail } from "@/lib/email";
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

  return NextResponse.json({ ok: true });
}
