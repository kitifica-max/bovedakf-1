import Link from "next/link";
import { LogoBadge } from "./logo-badge";
import { PAIRS, StarBadge, type IconName, type PairName } from "./shapes";

// Full-screen brand card for 404 / error states: seal, colored hero with the code, and clear exits.
// No hooks and no server-only imports, so both server (not-found) and client (error) pages can use it.
export function SystemPage({
  code,
  title,
  lead,
  pair,
  icon,
  children,
}: {
  code: string;
  title: string;
  lead: string;
  pair: PairName;
  icon: IconName;
  children: React.ReactNode;
}) {
  const c = PAIRS[pair];
  return (
    <div className="kf-app flex min-h-dvh items-center justify-center px-4 py-10">
      <main id="main" tabIndex={-1} className="flex w-full max-w-xl flex-col gap-6">
        <Link href="/" aria-label="Bóveda KF-1, inicio" className="self-start">
          <LogoBadge id="kf-ring-system" className="h-16 w-16" />
        </Link>
        <section style={{ background: c.bg, color: c.ink }} className="flex flex-col gap-5 rounded-[48px] px-7 py-10 sm:px-12">
          {/* Starburst on its own row: the condensed title gets the full width at any size. */}
          <div className="flex items-center justify-between gap-4">
            <span className="font-brand text-6xl leading-none font-extrabold sm:text-7xl">{code}</span>
            <StarBadge fill={c.star} ink={c.starInk} icon={icon} className="h-20 w-20 sm:h-24 sm:w-24" />
          </div>
          <h1 className="m-0 font-brand text-[clamp(36px,9vw,56px)] leading-[1.04] font-extrabold break-words uppercase">{title}</h1>
          <p className="m-0 text-base font-semibold">{lead}</p>
        </section>
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      </main>
    </div>
  );
}
