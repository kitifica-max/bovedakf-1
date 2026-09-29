const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "hotmail.com", "hotmail.es", "outlook.com",
  "outlook.es", "live.com", "live.es", "yahoo.com", "yahoo.es", "icloud.com",
  "me.com", "mac.com", "msn.com", "protonmail.com", "proton.me",
]);

// The team plan relies on SSO by company domain, so it needs a corporate address.
export function isPersonalEmail(email: string | null | undefined): boolean {
  return FREE_EMAIL_DOMAINS.has(email?.split("@")[1]?.toLowerCase() ?? "");
}

export const TEAM_NEEDS_CORPORATE_EMAIL =
  "El plan Equipo requiere un email corporativo. Usá el de tu empresa o elegí el plan Personal.";
