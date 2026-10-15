import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "../app-shell";
import { PageHero } from "@/components/brand/shapes";
import { appCard, appH2, kicker } from "@/components/brand/styles";
import { ErrorBoundary } from "@/components/error-boundary";
import { PasskeySettings } from "@/components/passkey-settings";
import { TwoFactorSettings } from "@/components/two-factor-settings";
import { CompanyForm, DeleteAccountForm, PasswordForm } from "./settings-forms";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [me, passkeys, ownedClients, sharedMembers] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { email: true, companyName: true, totpEnabled: true } }),
    db.authenticator.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { credentialID: true, credentialDeviceType: true, createdAt: true },
    }),
    db.vault.count({ where: { ownerId: userId } }),
    db.vaultMember.findMany({ where: { vault: { ownerId: userId }, userId: { not: userId } }, distinct: ["userId"], select: { userId: true } }),
  ]);
  if (!me) redirect("/login");

  return (
    <AppShell active="ajustes">
      <PageHero
        pair="amarillo"
        icon="shield"
        kicker="Ajustes"
        title="Tu cuenta"
        lead="Nombre de la agencia, contraseña, verificación en dos pasos y passkeys."
      />

      <section className={`${appCard} flex flex-col gap-5`}>
        <div className="flex flex-col gap-1">
          <p className={kicker}>Perfil</p>
          <h2 className={appH2}>Tu agencia</h2>
          <p className="m-0 text-sm font-semibold break-all text-kf-tinta-suave">Entrás con {me.email}</p>
        </div>
        <CompanyForm initialName={me.companyName ?? ""} />
      </section>

      <section className={`${appCard} flex flex-col gap-5`}>
        <div className="flex flex-col gap-1">
          <p className={kicker}>Acceso</p>
          <h2 className={appH2}>Contraseña</h2>
        </div>
        <PasswordForm />
      </section>

      <section className={`${appCard} flex flex-col gap-5`}>
        <div className="flex flex-col gap-1">
          <p className={kicker}>Seguridad</p>
          <h2 className={appH2}>Verificación en dos pasos y passkeys</h2>
        </div>
        <ErrorBoundary>
          <PasskeySettings initialPasskeys={passkeys} />
        </ErrorBoundary>
        <TwoFactorSettings initialEnabled={me.totpEnabled} />
      </section>

      <section className="flex flex-col gap-5 rounded-[32px] border-2 border-kf-carmesi/40 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <p className="m-0 text-xs font-extrabold tracking-[0.18em] text-kf-carmesi uppercase">Zona de peligro</p>
          <h2 className="m-0 font-brand text-[28px] leading-[1.04] font-extrabold text-kf-carmesi-hondo uppercase">Eliminar cuenta</h2>
        </div>
        <DeleteAccountForm email={me.email} ownedClients={ownedClients} sharedWith={sharedMembers.length} />
      </section>
    </AppShell>
  );
}
