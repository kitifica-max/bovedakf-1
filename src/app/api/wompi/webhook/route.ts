import { NextRequest, NextResponse } from "next/server";
import { settleLinkPurchase } from "@/lib/link-purchase";

// The body is untrusted: behind Netlify the `wompi_hash` HMAC never validates (a correctly
// signed request was rejected too), so it isn't checked. The body only names our purchase id;
// settleLinkPurchase asks Wompi's API whether that purchase's payment link was actually paid.
export async function POST(req: NextRequest) {
  let ref: unknown;
  try {
    ref = (await req.json())?.EnlacePago?.IdentificadorEnlaceComercio;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // A Wompi API failure throws → 500, so Wompi retries the webhook.
  if (typeof ref === "string" && ref) await settleLinkPurchase(ref);
  return NextResponse.json({ ok: true });
}
