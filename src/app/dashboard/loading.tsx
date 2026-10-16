// Skeleton for every dashboard route while server data loads. Mirrors AppShell (misty sidebar +
// hero + cards) so nothing jumps when the page arrives. The pulse stops under prefers-reduced-motion
// (global rule in globals.css); screen readers hear one "Cargando…" status.
const block = "animate-pulse rounded-[28px]";
// Pastel brand grounds, so the wait already feels like KF-1.
const CARD_TONES = ["bg-kf-rosa", "bg-kf-amarillo", "bg-kf-niebla", "bg-kf-rosa"];

export default function DashboardLoading() {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <div className="flex flex-col gap-6 bg-kf-niebla px-5 py-6 md:h-dvh md:w-64 md:shrink-0 md:gap-7">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-kf-borde" />
          <div className="flex flex-col gap-2">
            <div className="h-3.5 w-28 animate-pulse rounded-full bg-kf-borde" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-kf-borde" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:flex-col">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-28 animate-pulse rounded-[18px] bg-kf-borde md:w-full" />
          ))}
        </div>
      </div>
      <main id="main" tabIndex={-1} className="flex min-w-0 flex-1 flex-col gap-7 p-5 md:p-10">
        <p role="status" className="sr-only">Cargando…</p>
        <div className={`${block} h-48 rounded-[48px] bg-kf-amarillo`} />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${block} h-45 rounded-[32px] ${CARD_TONES[i]}`} />
          ))}
        </div>
      </main>
    </div>
  );
}
