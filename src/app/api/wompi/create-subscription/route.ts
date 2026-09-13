import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createEnlacePagoRecurrente } from "@/lib/wompi";

const PLANS = {
  starter: { monto: 9, seats: 5 },
  team: { monto: 29, seats: 25 },
} as const;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: string };
  if (!(plan in PLANS)) {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }

  const planKey = plan as keyof typeof PLANS;
  const { monto, seats } = PLANS[planKey];
  // Cap at 28 to avoid issues in months with fewer days
  const diaDePago = Math.min(new Date().getDate(), 28);

  try {
    const enlace = await createEnlacePagoRecurrente({ plan: planKey, monto, diaDePago });

    await db.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        plan: planKey,
        wompiEnlaceId: enlace.idEnlace,
        status: "PENDING",
        seats,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        plan: planKey,
        wompiEnlaceId: enlace.idEnlace,
        status: "PENDING",
        seats,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ url: enlace.urlEnlace });
  } catch (err) {
    console.error("[wompi] create-subscription", err);
    return NextResponse.json({ error: "Error al crear suscripción" }, { status: 500 });
  }
}
