import Link from "next/link";
import { BrandFooter, BrandHeader } from "./site-chrome";
import { display, pill, pillCard } from "./styles";
import { GIFT_LINKS, PACKS, perLink, usd } from "@/lib/packs";

// Prepaid model: the account is free, only external share links consume credit (one-time Wompi payments, no recurring billing).
const ACCOUNT = ["Hasta 5 personas", "Clientes ilimitados", "Contraseñas y códigos 2FA", "Auditoría completa", `${GIFT_LINKS} links de regalo`];
const BEST = PACKS[PACKS.length - 1].links;
const PACK_CARDS = PACKS.map((p) => ({ links: p.links, price: usd(p.cents), perLink: perLink(p), best: p.links === BEST }));



function Icon({ d, className = "" }: { d: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {d}
    </svg>
  );
}
const phone = <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M9.5 12h1M11.5 12h1M13.5 12h1M11 18h2" /></>;
const lock = <><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>;
const refresh = <><path d="M4 12a8 8 0 1 0 8-8" /><path d="M4 5v4h4" /></>;
const link = <><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" /></>;
const clock = <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 1.5" /></>;
const ban = <><circle cx="12" cy="12" r="8" /><path d="M6.4 6.4l11.2 11.2" /></>;
const eye = <><path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></>;
const insta = <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" /></>;
const note = <><path d="M14 3v11a4 4 0 1 1-4-4" /><path d="M14 3c.5 2.5 2.5 4.5 5 5" /></>;

function Sticker() {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`${GIFT_LINKS} links de regalo`} className="h-24 w-24 sm:h-36 sm:w-36">
      <polygon
        points="100.0,4.0 114.2,19.2 132.8,9.8 141.0,29.0 161.7,26.5 162.8,47.3 183.1,52.0 177.1,72.0 194.5,83.3 182.0,100.0 194.5,116.7 177.1,128.0 183.1,148.0 162.8,152.7 161.7,173.5 141.0,171.0 132.8,190.2 114.2,180.8 100.0,196.0 85.8,180.8 67.2,190.2 59.0,171.0 38.3,173.5 37.2,152.7 16.9,148.0 22.9,128.0 5.5,116.7 18.0,100.0 5.5,83.3 22.9,72.0 16.9,52.0 37.2,47.3 38.3,26.5 59.0,29.0 67.2,9.8 85.8,19.2"
        fill="var(--kf-carmesi)"
      />
      <text x="100" y="72" textAnchor="middle" fontFamily="var(--font-montserrat), sans-serif" fontWeight={800} fontSize={17} letterSpacing={2} fill="var(--kf-manteca)">REGALO</text>
      <text x="100" y="130" textAnchor="middle" fontFamily="var(--font-barlow), sans-serif" fontWeight={800} fontSize={66} fill="#fff">{GIFT_LINKS}</text>
      <text x="100" y="157" textAnchor="middle" fontFamily="var(--font-montserrat), sans-serif" fontWeight={800} fontSize={20} letterSpacing={3} fill="var(--kf-manteca)">LINKS</text>
    </svg>
  );
}

function CodeChip({ code, left }: { code: string; left: number }) {
  // `left` = remaining fraction of the 30 s window, drawn as the ring's arc.
  return (
    <span className="flex items-center gap-2 rounded-full bg-kf-bosque px-3.5 py-2 text-kf-lima">
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="8" fill="none" stroke="#2e8a62" strokeWidth="3" />
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="50.3" strokeDashoffset={50.3 * (1 - left)} transform="rotate(-90 10 10)" />
      </svg>
      <span className="font-mono text-[17px] font-semibold tracking-[0.06em]">{code}</span>
    </span>
  );
}

export function BrandLanding({ signedIn }: { signedIn: boolean }) {
  // Packs are bought from inside the account, so logged-out visitors always start at signup.
  const startHref = signedIn ? "/dashboard/plans" : "/register";

  return (
    <div className="relative z-0 min-h-screen bg-white font-brand-sans text-kf-tinta">
      <div className="flex flex-wrap justify-center gap-x-12 gap-y-2 bg-kf-azul px-5 py-3.5 text-[11px] font-extrabold tracking-[0.16em] text-white sm:text-[13px]">
        <span>• SIN SUSCRIPCIÓN</span>
        <span className="hidden sm:inline">• PAGÁS SOLO LO QUE COMPARTÍS</span>
        <span className="hidden lg:inline">• CÓDIGOS 2FA PARA TODO EL EQUIPO</span>
      </div>

      <div className="mx-auto flex max-w-[1360px] flex-col gap-10 px-4 pb-12 sm:px-8">
        <BrandHeader signedIn={signedIn} />

        <main className="flex flex-col gap-10">
          {/* Hero */}
          <section className="flex flex-wrap overflow-hidden rounded-[48px] bg-kf-carmesi">
            <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-7 p-8 sm:p-12 lg:p-20">
              <h1 className={`${display} m-0 text-[clamp(36px,11vw,104px)] leading-[1] text-white`}>
                Chau Excel <span className="text-kf-manteca">de contraseñas</span>
              </h1>
              <p className="m-0 text-[15px] font-extrabold leading-relaxed tracking-[0.16em] text-white sm:text-[20px]">
                CONTRASEÑAS Y CÓDIGOS 2FA DE CADA RED, <span className="text-kf-manteca">ORDENADOS POR CLIENTE.</span>
              </p>
              <div className="flex flex-wrap gap-3.5">
                {signedIn ? (
                  <Link href="/dashboard" prefetch={false} className={`${pill} bg-white text-kf-carmesi-hondo`}>IR A MI BÓVEDA</Link>
                ) : (
                  <Link href="/register" prefetch={false} className={`${pill} bg-white text-kf-carmesi-hondo`}>CREAR CUENTA GRATIS</Link>
                )}
                <a href="#como" className={`${pill} border-2 border-kf-manteca text-kf-manteca`}>CÓMO FUNCIONA</a>
              </div>
            </div>
            <div className="flex min-w-0 flex-[1_1_440px] items-center justify-center bg-kf-manteca px-5 pb-8 pt-20 sm:p-12 sm:pt-20">
              {/* Sticker overlaps the card's top-right corner; the header keeps right padding so it never covers text. */}
              <div className="relative w-full max-w-[420px]">
                <div className="absolute -right-4 -top-16 z-10 rotate-[8deg] sm:-right-10 sm:-top-16">
                  <Sticker />
                </div>
              <div className="flex w-full flex-col gap-3.5 rounded-[32px] bg-white p-5 shadow-[0_30px_60px_rgba(120,20,45,0.25)] sm:p-6">
                <div className="flex items-center gap-3.5 pr-20 sm:pr-24">
                  <span className={`${display} flex h-13 w-13 items-center justify-center rounded-[18px] bg-kf-rosa text-[26px] text-kf-azul-hondo`}>PA</span>
                  <div className="flex flex-col">
                    <b className="text-[18px]">Tu cliente: Panadería</b>
                    <span className="text-[13px] font-semibold text-kf-tinta-suave">4 cuentas</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3.5 rounded-[22px] bg-kf-niebla px-4.5 py-4">
                  <Icon d={insta} className="h-7 w-7 text-kf-carmesi" />
                  <div className="flex min-w-[120px] flex-1 flex-col">
                    <b className="text-[15px]">Instagram</b>
                    <span className="truncate font-mono text-[13px] text-kf-tinta-suave">@tucliente</span>
                  </div>
                  <CodeChip code="482 913" left={0.6} />
                </div>
                <div className="flex flex-wrap items-center gap-3.5 rounded-[22px] bg-kf-niebla px-4.5 py-4">
                  <Icon d={note} className="h-7 w-7 text-kf-tinta" />
                  <div className="flex min-w-[120px] flex-1 flex-col">
                    <b className="text-[15px]">TikTok</b>
                    <span className="truncate font-mono text-[13px] text-kf-tinta-suave">@tucliente · ••••••••</span>
                  </div>
                  <span className="text-[13px] font-bold text-kf-tinta-suave">Copiar</span>
                </div>
                <div className="flex flex-wrap items-center gap-3.5 rounded-[22px] bg-kf-niebla px-4.5 py-4">
                  <Icon d={link} className="h-7 w-7 text-kf-azul" />
                  <div className="flex min-w-[120px] flex-1 flex-col">
                    <b className="text-[15px]">Link para freelancer</b>
                    <span className="text-[13px] font-semibold text-kf-tinta-suave">Solo lectura · expira en 24 h</span>
                  </div>
                  <span className="text-[12px] font-extrabold tracking-[0.1em] text-kf-bosque">ACTIVO</span>
                </div>
              </div>
              </div>
            </div>
          </section>

          {/* Statement */}
          <section id="como" className="scroll-mt-6 px-2 py-8 text-center sm:py-16">
            <p className={`${display} mx-auto m-0 max-w-[1180px] text-[clamp(38px,6.4vw,96px)] leading-[1.08] text-kf-azul`}>
              Un cliente <Icon d={phone} className="inline h-[0.85em] w-[0.85em] align-[-0.1em]" /> un código 2FA y todo tu equipo{" "}
              <Icon d={lock} className="inline h-[0.85em] w-[0.85em] align-[-0.1em]" /> entrando sin pedirle el celu{" "}
              <Icon d={refresh} className="inline h-[0.85em] w-[0.85em] align-[-0.1em]" /> a nadie
            </p>
          </section>

          {/* 2FA */}
          <section className="flex flex-wrap gap-6">
            <div className="flex min-w-0 flex-[1_1_520px] flex-col items-center gap-6 rounded-[48px] bg-kf-bosque p-8 text-center text-kf-lima sm:p-14 lg:p-18">
              <svg width="112" height="140" viewBox="0 0 160 200" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M52 74 V54 a28 28 0 0 1 56 0 V74" /><rect x="34" y="74" width="92" height="78" rx="18" /><circle cx="80" cy="106" r="9" /><path d="M80 115 V130" /><path d="M62 152 L56 182 H44" /><path d="M98 152 L104 182 H116" /><path d="M34 100 L14 84" /><path d="M126 98 L148 74" /><path d="M150 58 L156 52 M140 54 L142 44" />
              </svg>
              <h2 className={`${display} m-0 text-[clamp(44px,5vw,76px)] leading-[1.04]`}>Publicás. No pedís códigos.</h2>
              <p className="m-0 max-w-[520px] text-[17px] font-semibold leading-[1.65]">
                Pasás la verificación en dos pasos de cada cuenta a la bóveda una sola vez. Desde ahí, cada community manager ve el código de 6 dígitos de los clientes que tiene asignados, y queda registrado quién lo vio.
              </p>
            </div>
            <div className="flex min-w-0 flex-[1_1_420px] flex-col items-center justify-center gap-5 rounded-[48px] bg-kf-lima p-8 text-kf-bosque-hondo sm:p-14">
              <div className="text-center text-[13px] font-extrabold tracking-[0.2em]">INSTAGRAM · TU CLIENTE</div>
              <svg viewBox="0 0 120 120" role="img" aria-label="Código 2FA vigente por 18 segundos" className="h-52 w-52">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#9fcb45" strokeWidth="10" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--kf-bosque)" strokeWidth="10" strokeLinecap="round" strokeDasharray="326.7" strokeDashoffset="130" transform="rotate(-90 60 60)" />
                <text x="60" y="62" textAnchor="middle" fontFamily="var(--font-geist-mono), monospace" fontWeight={600} fontSize={17} fill="currentColor">482 913</text>
                <text x="60" y="78" textAnchor="middle" fontFamily="var(--font-montserrat), sans-serif" fontWeight={700} fontSize={7.5} letterSpacing={1.2} fill="currentColor">QUEDAN 18 S</text>
              </svg>
              <div className="font-mono text-[14px] font-semibold">visto por sofi@tuagencia.com · 22:14</div>
            </div>
          </section>

          {/* Clients by color */}
          <section className="flex flex-col gap-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className={`${display} m-0 text-[clamp(44px,5vw,72px)] leading-[1.02] text-kf-azul`}>Cada cliente, su color</h2>
              <span className="max-w-[460px] text-[16px] font-semibold text-kf-tinta-suave">
                Una bóveda por cliente. Tu equipo ve solo los clientes que le asignás.
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { name: "Panadería", nets: "Instagram · TikTok · Meta Ads · Gmail", cls: "bg-kf-rosa text-kf-azul-hondo" },
                { name: "Cafetería", nets: "Instagram · LinkedIn · Google Ads", cls: "bg-kf-bosque text-kf-lima" },
                { name: "Estudio de yoga", nets: "TikTok · YouTube · X", cls: "bg-kf-amarillo text-kf-lavanda" },
                { name: "Gimnasio", nets: "Instagram · Facebook · WordPress", cls: "bg-kf-carmesi text-kf-manteca" },
              ].map((c) => (
                <div key={c.name} className={`flex min-h-[260px] flex-col justify-between gap-10 rounded-[40px] p-8 ${c.cls}`}>
                  <span className={`${display} text-[52px] leading-[1.02]`}>{c.name}</span>
                  <span className="text-[15px] font-bold">{c.nets}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Security */}
          <section id="seguridad" className="flex scroll-mt-6 flex-col items-center gap-12 rounded-[48px] bg-kf-amarillo px-8 py-12 text-kf-lavanda sm:px-14 sm:py-20">
            <h2 className={`${display} m-0 text-center text-[clamp(38px,4.4vw,64px)] leading-[1.04]`}>Seguridad nivel banco, vibra nivel agencia</h2>
            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-10">
              {[
                { icon: lock, t: "Cifrado AES-256", b: "Cada clave se cifra antes de tocar la base de datos." },
                { icon: phone, t: "Códigos 2FA compartidos", b: "El código vive en la bóveda, no en el celular del cliente." },
                { icon: clock, t: "Links que expiran", b: "De 1 hora a 7 días. El freelancer no necesita cuenta." },
                { icon: ban, t: "Revocás en un clic", b: "Terminó el proyecto, se terminó el acceso." },
                { icon: eye, t: "Auditoría completa", b: "Quién entró, a qué cuenta y cuándo." },
              ].map((f) => (
                <div key={f.t} className="flex flex-col items-center gap-3.5 text-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border-[1.5px] border-current">
                    <Icon d={f.icon} className="h-9 w-9" />
                  </span>
                  <h3 className={`${display} m-0 text-[34px] leading-[1.06]`}>{f.t}</h3>
                  <p className="m-0 text-[16px] font-semibold leading-[1.55]">{f.b}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="flex flex-col items-start gap-8 rounded-[48px] bg-kf-durazno px-8 py-12 sm:px-16 sm:py-20 lg:px-20">
            <h2 className={`${display} m-0 max-w-[900px] text-[clamp(52px,8vw,128px)] leading-[1.02] text-kf-carmesi-hondo`}>¿Seguís pidiendo códigos por chat?</h2>
            <a href="#planes" className={`${pill} bg-kf-carmesi-hondo text-white`}>VER PRECIOS</a>
          </section>

          {/* Plans */}
          <section id="planes" className="flex scroll-mt-6 flex-col gap-10 rounded-[48px] bg-kf-rosa px-8 py-12 sm:px-14 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className={`${display} m-0 text-[clamp(48px,5.6vw,84px)] leading-[1.02] text-kf-azul-hondo`}>¿Pagar todos los meses? No.</h2>
              <ul className={`${display} m-0 flex list-none flex-col gap-2 p-0 text-[24px] font-bold text-kf-azul-hondo`}>
                <li>✓ Sin suscripción ni cobros automáticos</li>
                <li>✓ Tu equipo entra gratis</li>
                <li>✓ Pagás solo los links que compartís</li>
              </ul>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.15fr]">
              <div className="flex flex-col gap-6 rounded-[40px] bg-kf-azul p-8 text-white sm:p-12">
                <div className="text-[13px] font-extrabold tracking-[0.2em] text-kf-manteca">TU CUENTA</div>
                <div className={`${display} text-[clamp(72px,8vw,112px)] leading-[1]`}>Gratis</div>
                <ul className="m-0 flex flex-1 list-none flex-col gap-2.5 p-0 text-[17px] font-semibold">
                  {ACCOUNT.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
                <Link href={startHref} prefetch={false} className={`${pill} self-start bg-white text-kf-azul-hondo`}>
                  CREAR CUENTA
                </Link>
              </div>
              <div className="flex flex-col gap-6 rounded-[40px] bg-white p-8 sm:p-12">
                <div className="flex flex-col gap-2">
                  <div className="text-[13px] font-extrabold tracking-[0.2em] text-kf-tinta-suave">RECARGÁ LINKS</div>
                  <p className="m-0 text-[16px] font-semibold leading-[1.55]">
                    Cada link comparte una credencial con alguien de afuera: expira solo y lo revocás cuando quieras. Pago único, sin cobros automáticos.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {PACK_CARDS.map((p) => (
                    <div
                      key={p.links}
                      className={`flex flex-col gap-2 rounded-[28px] px-6 py-5 ${p.best ? "bg-kf-carmesi text-white" : "bg-kf-niebla text-kf-tinta"}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`${display} text-[34px] leading-[1.02] ${p.best ? "text-kf-manteca" : "text-kf-azul"}`}>{p.links} links</span>
                        {p.best && (
                          <span className="rounded-full bg-kf-manteca px-3 py-1 text-[11px] font-extrabold tracking-[0.12em] text-kf-carmesi-hondo">MEJOR PRECIO</span>
                        )}
                      </div>
                      <span className={`${display} text-[30px] leading-[1]`}>${p.price}</span>
                      <span className={`text-[13px] font-semibold ${p.best ? "text-white/85" : "text-kf-tinta-suave"}`}>USD {p.perLink} por link</span>
                    </div>
                  ))}
                </div>
                <Link href={startHref} prefetch={false} className={`${pillCard} self-start bg-kf-azul text-white`}>
                  RECARGAR
                </Link>
              </div>
            </div>
          </section>
        </main>

        <BrandFooter />
      </div>
    </div>
  );
}
