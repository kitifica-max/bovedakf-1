// Client-safe catalog for agency vaults: each client vault gets a color, each credential a platform.
export const PLATFORMS = [
  { id: "instagram", label: "Instagram", short: "IG", color: "#c8234f" },
  { id: "tiktok", label: "TikTok", short: "TT", color: "#1b2340" },
  { id: "facebook", label: "Facebook", short: "FB", color: "#1f6fb2" },
  { id: "meta_business", label: "Meta Business", short: "MB", color: "#1b5a93" },
  { id: "linkedin", label: "LinkedIn", short: "IN", color: "#1b5a93" },
  { id: "x", label: "X", short: "X", color: "#1b2340" },
  { id: "youtube", label: "YouTube", short: "YT", color: "#a81b42" },
  { id: "google_ads", label: "Google Ads", short: "GA", color: "#0b6b47" },
  { id: "email", label: "Email", short: "@", color: "#4e52a6" },
  { id: "other", label: "Otros", short: "•", color: "#5b6383" },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];
export const PLATFORM_IDS = PLATFORMS.map((p) => p.id) as [PlatformId, ...PlatformId[]];
export const platformOf = (id: string) => PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[PLATFORMS.length - 1];

// Client "flavors": the canvas color pairs, one ground + one tone-on-tone ink (--kf-*).
// `text` = whichever of the pair reads on white, for titles outside the colored card.
export const CLIENT_COLORS = [
  { id: "azul", label: "Azul", bg: "#1f6fb2", ink: "#ffffff", text: "#1f6fb2" },
  { id: "rosa", label: "Rosa", bg: "#f1d3e3", ink: "#1b5a93", text: "#1b5a93" },
  { id: "bosque", label: "Bosque", bg: "#0b6b47", ink: "#b9e35a", text: "#0b6b47" },
  { id: "amarillo", label: "Amarillo", bg: "#f4eea6", ink: "#4e52a6", text: "#4e52a6" },
  { id: "carmesi", label: "Carmesí", bg: "#c8234f", ink: "#ffd27a", text: "#c8234f" },
  { id: "durazno", label: "Durazno", bg: "#f7c55a", ink: "#a81b42", text: "#a81b42" },
] as const;

export type ClientColorId = (typeof CLIENT_COLORS)[number]["id"];
export const CLIENT_COLOR_IDS = CLIENT_COLORS.map((c) => c.id) as [ClientColorId, ...ClientColorId[]];
export const clientColor = (id: string | null | undefined) => CLIENT_COLORS.find((c) => c.id === id) ?? CLIENT_COLORS[0];
