import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { revokeCliToken } from "@/lib/cli-auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const revoked = await revokeCliToken(session.user.id, id);
  if (!revoked) {
    return NextResponse.json({ error: "Token no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
