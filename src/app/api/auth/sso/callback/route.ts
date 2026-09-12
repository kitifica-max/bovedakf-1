import { NextRequest, NextResponse } from "next/server";
import { workos } from "@/lib/workos";
import { db } from "@/lib/db";
import { handleSsoUser } from "@/lib/sso-provisioning";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = req.cookies.get("sso_state")?.value;

  // CSRF: validate state
  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL("/login?error=sso_invalid", req.url));
  }

  try {
    const { profile } = await workos.sso.getProfileAndToken({
      code,
      clientId: process.env.WORKOS_CLIENT_ID!,
    });
    const userId = await handleSsoUser(profile);

    const record = await db.ssoNonce.create({
      data: {
        userId,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    const res = NextResponse.redirect(
      new URL(`/login?sso_nonce=${record.nonce}`, req.url)
    );
    res.cookies.delete("sso_state");
    return res;
  } catch (err) {
    console.error("[sso/callback]", err);
    return NextResponse.redirect(new URL("/login?error=sso_failed", req.url));
  }
}
