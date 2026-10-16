import { display } from "./styles";

// Shared decorative vocabulary from the landing: starburst stickers, monoline icons, color-pair cards.

export const STAR_POINTS =
  "100.0,4.0 114.2,19.2 132.8,9.8 141.0,29.0 161.7,26.5 162.8,47.3 183.1,52.0 177.1,72.0 194.5,83.3 182.0,100.0 194.5,116.7 177.1,128.0 183.1,148.0 162.8,152.7 161.7,173.5 141.0,171.0 132.8,190.2 114.2,180.8 100.0,196.0 85.8,180.8 67.2,190.2 59.0,171.0 38.3,173.5 37.2,152.7 16.9,148.0 22.9,128.0 5.5,116.7 18.0,100.0 5.5,83.3 22.9,72.0 16.9,52.0 37.2,47.3 38.3,26.5 59.0,29.0 67.2,9.8 85.8,19.2";

// Monoline marks (24×24, stroke = currentColor).
export const ICONS = {
  lock: <><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" /></>,
  eye: <><path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></>,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 1.5" /></>,
  chat: <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9.5h8M8 12.5h5" /></>,
  doc: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 15.5h6" /></>,
  shield: <><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>,
  refund: <><path d="M4 12a8 8 0 1 0 8-8" /><path d="M4 5v4h4" /><path d="M12 8v8M9.5 10.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" /></>,
  puzzle: <><path d="M9 4h3a2 2 0 1 1 4 0h3v5a2 2 0 1 1 0 4v6h-6a2 2 0 1 0-4 0H4v-6a2 2 0 1 0 0-4V4z" /></>,
  spark: <><path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><circle cx="17" cy="9" r="2.5" /><path d="M16.5 14.6c2.6.3 4.5 2.2 4.5 5" /></>,
} as const;
export type IconName = keyof typeof ICONS;

export function Mono({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {ICONS[name]}
    </svg>
  );
}

// Decorative starburst with a monoline icon centered inside (the icon sits within the inner chord).
export function StarBadge({ fill, ink, icon, className = "h-32 w-32" }: { fill: string; ink: string; icon: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={`shrink-0 ${className}`}>
      <polygon points={STAR_POINTS} fill={fill} />
      <g transform="translate(58 58) scale(3.5)" fill="none" stroke={ink} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        {ICONS[icon]}
      </g>
    </svg>
  );
}

// Color pairs from the canvas: ground, tone-on-tone ink, and a sticker accent that pops on the ground.
export const PAIRS = {
  azul: { bg: "var(--kf-azul)", ink: "#ffffff", star: "var(--kf-manteca)", starInk: "var(--kf-azul)" },
  rosa: { bg: "var(--kf-rosa)", ink: "var(--kf-azul-hondo)", star: "var(--kf-azul)", starInk: "var(--kf-rosa)" },
  bosque: { bg: "var(--kf-bosque)", ink: "var(--kf-lima)", star: "var(--kf-lima)", starInk: "var(--kf-bosque)" },
  amarillo: { bg: "var(--kf-amarillo)", ink: "var(--kf-lavanda)", star: "var(--kf-lavanda)", starInk: "var(--kf-amarillo)" },
  carmesi: { bg: "var(--kf-carmesi)", ink: "var(--kf-manteca)", star: "var(--kf-manteca)", starInk: "var(--kf-carmesi)" },
  durazno: { bg: "var(--kf-durazno)", ink: "var(--kf-carmesi-hondo)", star: "var(--kf-carmesi)", starInk: "var(--kf-durazno)" },
  lavanda: { bg: "var(--kf-lavanda)", ink: "var(--kf-amarillo)", star: "var(--kf-amarillo)", starInk: "var(--kf-lavanda)" },
} as const;
export type PairName = keyof typeof PAIRS;

// Colored page opener for public pages. Text and sticker sit in a wrapping flex row (never absolutely
// positioned), so on narrow screens the sticker drops below the text instead of covering it.
export function PageHero({
  pair,
  icon,
  kicker,
  title,
  lead,
  children,
}: {
  pair: PairName;
  icon: IconName;
  kicker?: string;
  title: string;
  lead?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const c = PAIRS[pair];
  return (
    <header style={{ background: c.bg, color: c.ink }} className="flex flex-wrap items-center justify-between gap-8 rounded-[48px] px-7 py-10 sm:px-14 sm:py-16">
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
        {kicker && <span className="text-xs font-extrabold tracking-[0.18em] uppercase opacity-90">{kicker}</span>}
        <h1 className={`${display} m-0 text-[clamp(44px,7vw,92px)] leading-[1.04] break-words`}>{title}</h1>
        {lead && <p className="m-0 max-w-xl text-base font-semibold sm:text-lg">{lead}</p>}
        {children}
      </div>
      <StarBadge fill={c.star} ink={c.starInk} icon={icon} className="h-28 w-28 sm:h-40 sm:w-40" />
    </header>
  );
}

// White content card that follows a PageHero.
export const pageCard = "rounded-[40px] border-2 border-kf-borde bg-white p-6 sm:p-14";

const DOT_COLORS = ["var(--kf-carmesi)", "var(--kf-azul)", "var(--kf-bosque)", "var(--kf-durazno)", "var(--kf-lavanda)"];

// Small starburst bullet for section headings; cycles the palette by index, or a fixed `color` on colored grounds.
export function StarDot({ i, color }: { i: number; color?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className="h-7 w-7 shrink-0">
      <polygon points={STAR_POINTS} fill={color ?? DOT_COLORS[i % DOT_COLORS.length]} />
    </svg>
  );
}
