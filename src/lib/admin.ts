// Admin gate. Set ADMIN_EMAILS to a comma-separated list of emails.
// ponytail: env list, not a DB role — swap when there's more than one admin surface.
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
