import "server-only";
import { db } from "@/lib/db";
import { getEnlacePago } from "@/lib/wompi";
import { sendEmail, linkPackPaidEmail } from "@/lib/email";
import { generateReceipt } from "@/lib/pdf";
import { usd } from "@/lib/packs";

// Credits a PENDING purchase once Wompi's own API says its payment link was paid.
// Called by the webhook and by the redirect back, so either one alone is enough.
// Nothing here trusts the caller: the paid state, amount and mode all come from Wompi.
export async function settleLinkPurchase(purchaseId: string) {
  const purchase = await db.linkPurchase.findUnique({ where: { id: purchaseId } });
  if (!purchase || purchase.status !== "PENDING" || !purchase.wompiLinkId) return;

  const tx = (await getEnlacePago(purchase.wompiLinkId)).transaccionCompra;
  if (!tx?.esAprobada) return;
  if (!tx.esReal && process.env.NODE_ENV === "production") {
    console.warn("[link-purchase] ignoring test transaction for purchase", purchase.id);
    return;
  }
  if (Math.round(tx.monto * 100) !== purchase.amountCents) {
    console.error("[link-purchase] amount mismatch for purchase", purchase.id, tx.monto);
    return;
  }

  // PENDING → PAID is the idempotency gate: a second caller finds nothing to flip and credits nothing.
  const credited = await db.$transaction(async (t) => {
    const { count } = await t.linkPurchase.updateMany({
      where: { id: purchase.id, status: "PENDING" },
      data: { status: "PAID", transactionId: tx.idTransaccion, paidAt: new Date() },
    });
    if (count !== 1) return null;
    return t.user.update({
      where: { id: purchase.userId },
      data: { linkCredits: { increment: purchase.links } },
      select: { email: true, linkCredits: true },
    });
  });
  // Receipt goes out once, with the credit; a failed send never undoes it.
  if (credited) await sendLinkPackReceipt(credited, purchase, tx.idTransaccion);
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
    console.error("[link-purchase] PDF generation failed", err);
  }
  const { subject, html } = linkPackPaidEmail({ links: purchase.links, amount, balance: user.linkCredits });
  await sendEmail(user.email, subject, html, pdf);
}
