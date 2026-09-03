import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROLE_LABEL } from "@/lib/team-validation";
import { AcceptForm } from "./accept-form";

export const metadata: Metadata = {
  title: "Invitación a una bóveda",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-sm rounded-2xl p-8 text-sm">{children}</div>
    </main>
  );
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await db.vaultInvite.findUnique({
    where: { token },
    include: { vault: { select: { name: true } } },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-semibold text-ink">Invitación no válida</h1>
        <p className="mt-2 text-ink-soft">
          El enlace venció o ya se usó. Pedile a quien te invitó que te mande uno nuevo.
        </p>
        <Link href="/login" className="mt-5 block text-center underline">Ir a entrar</Link>
      </Shell>
    );
  }

  const session = await auth();
  const roleLabel = ROLE_LABEL[invite.role];

  if (!session?.user?.email) {
    const next = encodeURIComponent(`/invite/${token}`);
    return (
      <Shell>
        <h1 className="font-display text-2xl font-semibold text-ink">Te invitaron a “{invite.vault.name}”</h1>
        <p className="mt-2 text-ink-soft">
          Rol: <strong className="text-ink">{roleLabel}</strong>. Entrá o creá una cuenta con{" "}
          <strong className="text-ink">{invite.email}</strong> para aceptar.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link href={`/login?next=${next}`} className="rounded-full bg-ink px-4 py-3 text-center font-medium text-gray">
            Entrar
          </Link>
          <Link
            href={`/register?email=${encodeURIComponent(invite.email)}&next=${next}`}
            className="rounded-full border border-border-soft px-4 py-3 text-center font-medium text-ink"
          >
            Crear cuenta
          </Link>
        </div>
      </Shell>
    );
  }

  if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-semibold text-ink">Invitación para otra cuenta</h1>
        <p className="mt-2 text-ink-soft">
          Esta invitación es para <strong className="text-ink">{invite.email}</strong>, pero estás con{" "}
          <strong className="text-ink">{session.user.email}</strong>. Salí y entrá con la cuenta correcta.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold text-ink">Unirte a “{invite.vault.name}”</h1>
      <p className="mt-2 text-ink-soft">
        Vas a entrar como <strong className="text-ink">{roleLabel}</strong>. Vas a ver las credenciales
        compartidas del equipo.
      </p>
      <AcceptForm token={token} />
    </Shell>
  );
}
