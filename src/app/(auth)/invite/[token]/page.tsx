import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROLE_LABEL } from "@/lib/team-validation";
import { AcceptForm } from "./accept-form";
import { InviteSignupForm } from "./invite-signup-form";

export const metadata: Metadata = {
  title: "Invitación a una bóveda",
  robots: { index: false, follow: false },
};

// Rendered inside (auth)/layout.tsx — which already provides the branded
// header, footer, and centered wrapper.
function Shell({ children }: { children: React.ReactNode }) {
  return <div className="glass w-full max-w-sm rounded-2xl p-8 text-sm">{children}</div>;
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
        <h1 className="t-h2 text-ink">Invitación no válida</h1>
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
        <h1 className="t-h2 text-ink">Te invitaron a “{invite.vault.name}”</h1>
        <p className="mt-2 text-ink-soft">
          Rol: <strong className="text-ink">{roleLabel}</strong>. Elegí una contraseña para unirte —
          el correo ya está fijado por la invitación.
        </p>
        <InviteSignupForm token={token} email={invite.email} />
        <p className="mt-4 text-center text-xs text-ink-soft">
          ¿Ya tenés cuenta con ese correo?{" "}
          <Link href={`/login?next=${next}`} className="underline">Entrá para aceptar</Link>
        </p>
      </Shell>
    );
  }

  if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <Shell>
        <h1 className="t-h2 text-ink">Invitación para otra cuenta</h1>
        <p className="mt-2 text-ink-soft">
          Esta invitación es para <strong className="text-ink">{invite.email}</strong>, pero estás con{" "}
          <strong className="text-ink">{session.user.email}</strong>. Salí y entrá con la cuenta correcta.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="t-h2 text-ink">Unirte a “{invite.vault.name}”</h1>
      <p className="mt-2 text-ink-soft">
        Vas a entrar como <strong className="text-ink">{roleLabel}</strong>. Vas a ver las credenciales
        compartidas del equipo.
      </p>
      <AcceptForm token={token} />
    </Shell>
  );
}
