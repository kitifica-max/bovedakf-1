import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeToken } from "@/lib/tokens";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Email verification is soft — this just stamps User.emailVerified so the
// dashboard banner goes away and password reset has a trusted address.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const email = req.nextUrl.searchParams.get("email") ?? "";

  const ok = email && token && (await consumeToken("verify", email, token));
  if (!ok) {
    return NextResponse.redirect(`${APP_URL}/login?verify=invalid`);
  }

  await db.user.updateMany({
    where: { email: email.toLowerCase(), emailVerified: null },
    data: { emailVerified: new Date() },
  });
  return NextResponse.redirect(`${APP_URL}/dashboard?verify=ok`);
}
