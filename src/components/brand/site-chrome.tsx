import Link from "next/link";
import { LogoBadge } from "./logo-badge";
import { display, pill, pillSm } from "./styles";

// Header and footer shared by the home and every public page (agencies brand).
export function BrandHeader({ signedIn }: { signedIn: boolean }) {
  const navLink = `${display} inline-flex min-h-11 items-center text-[24px] text-kf-azul no-underline hover:text-kf-azul-hondo`;
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pt-6 md:grid md:grid-cols-[1fr_auto_1fr]">
      <nav aria-label="Principal" className="hidden flex-wrap gap-x-8 gap-y-2 md:flex">
        <Link href="/#como" className={navLink}>Cómo funciona</Link>
        <Link href="/#seguridad" className={navLink}>Seguridad</Link>
        <Link href="/#planes" className={navLink}>Precios</Link>
      </nav>
      <Link href="/" aria-label="Bóveda KF-1, inicio" className="flex">
        <LogoBadge id="kf-ring-header" className="h-16 w-16 sm:h-24 sm:w-24" />
      </Link>
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-3 sm:gap-x-6">
        {signedIn ? (
          <Link href="/dashboard" prefetch={false} className={`${pillSm} bg-kf-azul text-white`}>MI BÓVEDA</Link>
        ) : (
          <>
            <Link href="/login" prefetch={false} className={`${display} inline-flex min-h-11 items-center text-[20px] text-kf-azul no-underline hover:text-kf-azul-hondo sm:text-[24px]`}>Entrar</Link>
            <Link href="/register" prefetch={false} className={`${pillSm} bg-kf-azul text-white`}>CREAR CUENTA</Link>
          </>
        )}
      </div>
    </header>
  );
}

export function BrandFooter() {
  return (
  <footer className="flex flex-wrap justify-between gap-12 rounded-[48px] bg-kf-azul p-8 text-white sm:p-14 lg:p-20">
    <div className="flex min-w-0 flex-[1_1_360px] flex-col items-start gap-5">
      <LogoBadge id="kf-ring-footer" size={104} ink="#fff" center="var(--kf-manteca)" />
      <h2 className={`${display} m-0 text-[clamp(48px,5vw,76px)] leading-[1.02]`}>Hablemos</h2>
      <p className="m-0 max-w-[420px] text-[17px] font-semibold text-white">
        Contanos cuántos clientes manejás y te armamos el piloto. Escribinos a <span className="text-white">hola@kitifica.com</span>.
      </p>
      <Link href="/contacto" className={`${pill} bg-kf-carmesi text-white`}>ESCRIBINOS</Link>
    </div>
    <nav aria-label="Pie de página" className="grid min-w-0 flex-[2_1_480px] grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-6">
      {[
        { h: "Producto", links: [["/#como", "Cómo funciona"], ["/#planes", "Precios"], ["/extension", "Extensión"]] },
        { h: "Confianza", links: [["/seguridad", "Seguridad"], ["/privacidad", "Privacidad"], ["/terminos", "Términos"]] },
        { h: "Ayuda", links: [["/contacto", "Contacto"], ["/devoluciones", "Devoluciones"], ["/login", "Entrar"]] },
      ].map((col) => (
        <div key={col.h} className="flex flex-col gap-1">
          <span className="text-[15px] font-bold text-white">{col.h}</span>
          {col.links.map(([href, label]) => (
            <Link key={href} href={href} prefetch={false} className={`${display} inline-flex min-h-11 items-center text-[24px] text-white no-underline hover:text-kf-manteca`}>
              {label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
    <div className="basis-full text-[13px] font-semibold tracking-[0.08em] text-white">© 2026 BÓVEDA KF-1 · KITIFICA</div>
  </footer>
  );
}
