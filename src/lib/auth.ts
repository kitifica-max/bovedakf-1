import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { decryptAtRest, verifyPassword } from "@/lib/crypto";
import { matchBackupCode, verifyTotp, type BackupCode } from "@/lib/totp";

class TotpRequiredSignin extends CredentialsSignin {
  code = "TotpRequired";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
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
