// Consent API endpoint — handles approve/deny from the consent screen.
// On approval, generates authorization code and returns redirect URL.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes } from "node:crypto";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { token, approved } = await req.json();
  if (!token || typeof approved !== "boolean") {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  // Look up consent record
  const consentRecord = await db.verificationToken.findFirst({
    where: { identifier: `mcp-consent:${token}` },
  });

  if (!consentRecord) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
  }

  if (consentRecord.expires < new Date()) {
    await db.verificationToken.deleteMany({ where: { identifier: `mcp-consent:${token}` } });
    return NextResponse.json({ error: "Token expirado" }, { status: 400 });
  }

  let authParams: {
    clientId: string;
    redirectUri: string;
    scope: string;
    state: string;
    codeChallenge: string;
    vaultId: string;
    userId: string;
    email: string;
  };

  try {
    authParams = JSON.parse(consentRecord.token);
  } catch {
    await db.verificationToken.deleteMany({ where: { identifier: `mcp-consent:${token}` } });
    return NextResponse.json({ error: "Datos corruptos" }, { status: 400 });
  }

  // Verify the user matches
  if (authParams.userId !== session.user.id) {
    return NextResponse.json({ error: "Usuario no coincide" }, { status: 403 });
  }

  // Delete the consent record (single-use)
  await db.verificationToken.deleteMany({ where: { identifier: `mcp-consent:${token}` } });

  if (!approved) {
    // User denied — redirect back with error
    const redirectUrl = new URL(authParams.redirectUri);
    redirectUrl.searchParams.set("error", "access_denied");
    redirectUrl.searchParams.set("error_description", "User denied authorization");
    redirectUrl.searchParams.set("state", authParams.state);
    return NextResponse.json({ redirectUrl: redirectUrl.toString() });
  }

  // Generate authorization code
  const authCode = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.verificationToken.create({
    data: {
      identifier: `mcp-consent:${authCode}`,
      token: JSON.stringify(authParams),
      expires,
    },
  });

  // Redirect through our styled success page, which then forwards to mcp-remote's callback
  const successUrl = new URL("/oauth/success", BASE_URL);
  successUrl.searchParams.set("code", authCode);
  successUrl.searchParams.set("state", authParams.state);
  successUrl.searchParams.set("callback", authParams.redirectUri);
  return NextResponse.json({ redirectUrl: successUrl.toString() });
}
