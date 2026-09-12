import { NextRequest, NextResponse } from "next/server";
import { workos } from "@/lib/workos";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    if (!(await rateLimit(`sso-init:${clientIp(req.headers)}`, 10)).success) {
      return NextResponse.json({ error: "Demasiados intentos. Esperá un momento." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    const domain = email.split("@")[1];

    const org = await db.organization.findFirst({
      where: { domain, ssoEnabled: true },
      select: { workosOrgId: true },
    });

    if (!org?.workosOrgId) {
      return NextResponse.json(
        { error: "SSO no está configurado para este dominio." },
        { status: 404 }
      );
    }

    const state = crypto.randomUUID();

    const url = workos.sso.getAuthorizationUrl({
      clientId: process.env.WORKOS_CLIENT_ID!,
      organization: org.workosOrgId,
      redirectUri: process.env.WORKOS_REDIRECT_URI!,
      state,
    });

    const res = NextResponse.json({ url });
    res.cookies.set("sso_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60,
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Error interno. Intentá de nuevo." }, { status: 500 });
  }
}
