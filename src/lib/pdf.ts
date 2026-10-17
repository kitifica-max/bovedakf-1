import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Agencies brand: tinta #1b2340, azul #1f6fb2, tinta suave #5b6383, niebla #eef0f6, borde #e4e7f0.
const DARK = rgb(0.106, 0.137, 0.251);
const ACCENT = rgb(0.122, 0.435, 0.698);
const GRAY = rgb(0.357, 0.388, 0.514);
const LIGHT_BG = rgb(0.933, 0.941, 0.965);
const BORDER = rgb(0.894, 0.906, 0.941);

export async function generateReceipt(opts: {
  userEmail: string;
  description: string; // e.g. "Recarga de 20 links — pago único"
  amount: string;
  currency: string;
  transactionId: string;
  reference: string; // our purchase id
  date: Date;
}): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const mx = 56;

  // Header bar
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: ACCENT });
  page.drawText("BÓVEDA KF-1", { x: mx, y: height - 46, size: 18, font: bold, color: rgb(1, 1, 1) });
  page.drawText("kitifica.com", { x: width - mx - 75, y: height - 46, size: 11, font, color: rgb(1, 0.824, 0.478) });

  // Title
  page.drawText("RECIBO DE PAGO", { x: mx, y: height - 125, size: 22, font: bold, color: DARK });
  page.drawRectangle({ x: mx, y: height - 136, width: 56, height: 3, color: ACCENT });

  // Meta
  const dateStr = opts.date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  page.drawText(`Fecha: ${dateStr}`, { x: mx, y: height - 165, size: 11, font, color: DARK });
  page.drawText(`ID transacción: ${opts.transactionId}`, { x: mx, y: height - 183, size: 9, font, color: GRAY });
  page.drawText(`Referencia: ${opts.reference}`, { x: mx, y: height - 197, size: 9, font, color: GRAY });

  // Divider
  page.drawLine({ start: { x: mx, y: height - 218 }, end: { x: width - mx, y: height - 218 }, thickness: 1, color: BORDER });

  // Table header
  const col2 = width - mx - 110;
  let y = height - 248;
  page.drawText("Descripción", { x: mx, y, size: 10, font: bold, color: DARK });
  page.drawText("Monto", { x: col2, y, size: 10, font: bold, color: DARK });

  y -= 22;
  page.drawText(opts.description, { x: mx, y, size: 11, font, color: DARK });
  page.drawText(`${opts.currency} $${opts.amount}`, { x: col2, y, size: 11, font: bold, color: ACCENT });

  y -= 12;
  page.drawLine({ start: { x: mx, y }, end: { x: width - mx, y }, thickness: 1, color: BORDER });

  y -= 24;
  page.drawText("Total pagado", { x: mx, y, size: 12, font: bold, color: DARK });
  page.drawText(`${opts.currency} $${opts.amount}`, { x: col2, y, size: 13, font: bold, color: DARK });

  // Account box
  const boxY = y - 80;
  page.drawRectangle({ x: mx, y: boxY, width: width - mx * 2, height: 65, color: LIGHT_BG, borderColor: BORDER, borderWidth: 1 });
  page.drawText("Cuenta", { x: mx + 16, y: boxY + 40, size: 9, font: bold, color: GRAY });
  page.drawText(opts.userEmail, { x: mx + 16, y: boxY + 20, size: 11, font, color: DARK });

  // Footer
  page.drawLine({ start: { x: mx, y: 100 }, end: { x: width - mx, y: 100 }, thickness: 1, color: BORDER });
  page.drawText("Este recibo confirma el pago procesado mediante Wompi.", { x: mx, y: 82, size: 9, font, color: GRAY });
  page.drawText("Bóveda KF-1 · kitifica.com · no-reply@kitifica.com", { x: mx, y: 68, size: 9, font, color: GRAY });
  page.drawText("Consultas o devoluciones: kf1.kitifica.com/devoluciones", { x: mx, y: 54, size: 9, font, color: GRAY });

  return Buffer.from(await doc.save());
}
