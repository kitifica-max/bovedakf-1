// Accounts exempt from the "confirmá tu correo" dashboard banner: those
// that predate the email-verification feature, plus admins (the owner
// accounts). No literal emails in source — PREVERIFIED_EMAILS overrides,
// otherwise it falls back to the ADMIN_EMAILS allowlist.
const PREVERIFIED = (process.env.PREVERIFIED_EMAILS ?? process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function emailIsVerified(user: {
  email: string;
  emailVerified: Date | null;
}): boolean {
  return user.emailVerified != null || PREVERIFIED.includes(user.email.toLowerCase());
}
