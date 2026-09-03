import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Passkey from "next-auth/providers/passkey";
import { db } from "@/lib/db";
import { decryptAtRest, verifyPassword } from "@/lib/crypto";
import { matchBackupCode, verifyTotp, type BackupCode } from "@/lib/totp";

class TotpRequiredSignin extends CredentialsSignin {
  code = "TotpRequired";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Only used to back the Passkey/WebAuthn provider (register + list
  // credentials). Sessions stay JWT — the adapter's session/verification
  // token methods are never called.
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  experimental: { enableWebAuthn: true },
  providers: [
    Passkey({
      // Netlify's Next.js runtime hands @auth/core a Request whose own URL
      // doesn't reflect the public host (it resolves to the deploy's
      // internal *.netlify.app permalink even behind a custom domain),
      // which would make the passkey's relying-party ID mismatch the page
      // origin and fail every ceremony. x-forwarded-host carries the real,
      // browser-visible host correctly, so read it directly instead of
      // trusting the framework's own URL detection for this one thing.
      getRelayingParty(_options, request) {
        const headers = (request.headers ?? {}) as Record<string, string>;
        const host = headers["x-forwarded-host"] ?? headers["host"] ?? "localhost:3000";
        const proto = headers["x-forwarded-proto"] ?? "https";
        return { id: host.split(":")[0], name: "Bóveda KF-1", origin: `${proto}://${host}` };
      },
    }),
    Credentials({
      credentials: { email: {}, password: {}, totpCode: {} },
      authorize: async (creds) => {
        const email = creds?.email as string | undefined;
        const password = creds?.password as string | undefined;
        const totpCode = (creds?.totpCode as string | undefined)?.trim();
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = verifyPassword(password, user.passwordHash, user.passwordSalt);
        if (!valid) return null;

        if (user.totpEnabled && user.totpSecret) {
          // The login form only asks for a code once it already knows (via
          // checkPasswordAction) that this account has 2FA — this branch is
          // a defense-in-depth backstop, not the normal signal path.
          if (!totpCode) throw new TotpRequiredSignin();

          const secret = decryptAtRest(user.totpSecret);
          const validTotp = verifyTotp(secret, totpCode);

          if (!validTotp) {
            const codes = (user.totpBackupCodes as BackupCode[] | null) ?? [];
            const idx = matchBackupCode(codes, totpCode);
            if (idx === -1) return null;
            codes[idx] = { ...codes[idx], usedAt: new Date().toISOString() };
            await db.user.update({ where: { id: user.id }, data: { totpBackupCodes: codes } });
          }
        }

        return { id: user.id, email: user.email, companyName: user.companyName };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.companyName = user.companyName;
      }
      // Client called `update({ companyName })` after saving — refresh the cached value.
      if (trigger === "update" && session && typeof session.companyName === "string") {
        token.companyName = session.companyName;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.companyName = token.companyName ?? null;
      }
      return session;
    },
  },
});
