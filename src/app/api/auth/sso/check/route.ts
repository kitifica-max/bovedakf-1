import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  if (!(await rateLimit(`sso-check:${clientIp(req.headers)}`, 20)).success) {
    return NextResponse.json({ sso: false });
  }

  const domain = req.nextUrl.searchParams.get("domain")?.trim().toLowerCase();
  if (!domain || !domain.includes(".")) {
    return NextResponse.json({ sso: false });
  }

  const org = await db.organization.findFirst({
    where: { domain, ssoEnabled: true },
    select: { id: true },
  });

  return NextResponse.json({ sso: !!org });
}
