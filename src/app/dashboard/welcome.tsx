import { PAIRS, PageHero, type PairName } from "@/components/brand/shapes";
import { appCard, appH2 } from "@/components/brand/styles";
import { GIFT_LINKS } from "@/lib/packs";
import { FirstClientForm } from "./first-client-form";

const STEPS: { n: number; pair: PairName; title: string; text: string }[] = [
  { n: 1, pair: "carmesi", title: "Creá un cliente", text: "Una bóveda por cada marca que manejás." },
  { n: 2, pair: "bosque", title: "Guardá sus cuentas", text: "Usuario, contraseña y el código 2FA de cada red." },
  { n: 3, pair: "durazno", title: "Compartí sin chat", text: `Links que expiran. Tenés ${GIFT_LINKS} de regalo.` },
];

// First-run screen: shown once, instead of the grid with the untouched signup client.
export function Welcome({ vaultId, agency }: { vaultId: string; agency: string }) {
  return (
    <>
      <PageHero
        pair="azul"
        icon="spark"
        kicker={agency ? `Cuenta creada · ${agency}` : "Cuenta creada"}
        title="Tu bóveda está lista"
        lead="Sumá a tu primer cliente en un minuto. Todo queda cifrado y cada acceso queda registrado."
      />
      <ol data-stagger className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 p-0">
        {STEPS.map((s) => {
          const c = PAIRS[s.pair];
          return (
            <li key={s.n} style={{ background: c.bg, color: c.ink }} className="flex min-w-0 flex-col gap-2 rounded-[28px] p-5">
              <span className="font-brand text-5xl leading-none font-extrabold">{s.n}</span>
              <h2 className="m-0 font-brand text-[28px] leading-[1.04] font-extrabold uppercase">{s.title}</h2>
              <p className="m-0 text-sm font-bold">{s.text}</p>
            </li>
          );
        })}
      </ol>
      <section data-reveal data-delay=".3" className={`${appCard} flex max-w-2xl flex-col gap-5`}>
        <div className="flex flex-col gap-1">
          <p className="m-0 text-xs font-extrabold tracking-[0.18em] text-kf-tinta-suave uppercase">Paso 1 de 3</p>
          <h2 className={appH2}>¿Cómo se llama tu primer cliente?</h2>
        </div>
        <FirstClientForm vaultId={vaultId} />
      </section>
    </>
  );
}
