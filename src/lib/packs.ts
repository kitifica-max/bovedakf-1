// Prepaid share-link packs. Shared by the landing (client-safe, no imports) and the purchase flow.
export const GIFT_LINKS = 5;

export const PACKS = [
  { links: 5, cents: 199 },
  { links: 10, cents: 299 },
  { links: 20, cents: 499 },
  { links: 40, cents: 799 },
] as const;

export type Pack = (typeof PACKS)[number];

export const findPack = (links: number): Pack | undefined => PACKS.find((p) => p.links === links);

export const usd = (cents: number) => (cents / 100).toFixed(2);

export const perLink = (p: Pack) => usd(Math.round(p.cents / p.links));
