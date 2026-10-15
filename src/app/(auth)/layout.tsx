import { BrandFooter, BrandHeader } from "@/components/brand/site-chrome";
import { Mono, STAR_POINTS, type IconName } from "@/components/brand/shapes";
import { GIFT_LINKS } from "@/lib/packs";

const PERKS: { icon: IconName; text: string }[] = [
  { icon: "lock", text: "Contraseñas cifradas con AES-256-GCM" },
  { icon: "clock", text: "Links que expiran y se revocan en un clic" },
  { icon: "eye", text: "Auditoría de quién vio qué y cuándo" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kf-app min-h-dvh">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-10 px-4 pb-12 sm:px-8">
        <BrandHeader signedIn={false} />
        <main className="flex w-full flex-1 flex-wrap items-stretch justify-center gap-8">
          <div className="order-last flex max-w-md flex-[1_1_380px] flex-col gap-8 rounded-[48px] bg-kf-carmesi p-7 text-kf-manteca sm:p-10 lg:order-none">
            {/* Sticker on its own row: the condensed headline needs the panel's full width. */}
            <div className="flex flex-col gap-4">
              <svg viewBox="0 0 200 200" role="img" aria-label={`${GIFT_LINKS} links de regalo`} className="h-28 w-28 shrink-0 self-end">
                <polygon points={STAR_POINTS} fill="var(--kf-manteca)" />
                <text x="100" y="72" textAnchor="middle" fontFamily="var(--font-montserrat), sans-serif" fontWeight={800} fontSize={17} letterSpacing={2} fill="var(--kf-carmesi)">REGALO</text>
                <text x="100" y="130" textAnchor="middle" fontFamily="var(--font-barlow), sans-serif" fontWeight={800} fontSize={66} fill="var(--kf-carmesi-hondo)">{GIFT_LINKS}</text>
                <text x="100" y="157" textAnchor="middle" fontFamily="var(--font-montserrat), sans-serif" fontWeight={800} fontSize={20} letterSpacing={3} fill="var(--kf-carmesi)">LINKS</text>
              </svg>
              <h2 className="m-0 font-brand text-[clamp(40px,12vw,52px)] leading-[1.04] font-extrabold break-words uppercase">
                Chau Excel de contraseñas
              </h2>
            </div>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {PERKS.map((p) => (
                <li key={p.icon} className="flex items-center gap-4 rounded-[22px] bg-white/12 px-4 py-3.5 text-[15px] font-bold">
                  <Mono name={p.icon} className="h-8 w-8 shrink-0" />
                  <span className="min-w-0">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-[1_1_380px] items-center justify-center lg:max-w-md">{children}</div>
        </main>
        <BrandFooter />
      </div>
    </div>
  );
}
