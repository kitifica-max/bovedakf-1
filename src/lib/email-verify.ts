// Accounts that predate the email-verification feature (or are otherwise
// exempt) are treated as verified so the dashboard banner doesn't nag them.
// Comma-separated in PREVERIFIED_EMAILS; the owner's own account is the
// default so a fresh deploy needs no env change.
const PREVERIFIED = (process.env.PREVERIFIED_EMAILS ?? "kitifica@gmail.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function emailIsVerified(user: {
  email: string;
  emailVerified: Date | null;
}): boolean {
  return user.emailVerified != null || PREVERIFIED.includes(user.email.toLowerCase());
}
