import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { KitificaCredit } from "@/components/kitifica-credit";
import { AppShell } from "@/app/dashboard/app-shell";
import { PAIRS, PageHero, StarDot, type PairName } from "@/components/brand/shapes";
import { appCard, appH2, kicker } from "@/components/brand/styles";

const BAR_COLORS = ["bg-kf-carmesi", "bg-kf-azul", "bg-kf-bosque", "bg-kf-durazno", "bg-kf-lavanda"];
const STAT_PAIRS: PairName[] = ["azul", "rosa", "bosque", "amarillo"];

export const metadata: Metadata = {
  title: "Admin — respuestas",
  robots: { index: false, follow: false },
};

function tally(rows: (string | null)[]): [string, number][] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = (r ?? "").trim();
    if (k) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function TallyCard({ title, rows, total, nonce }: { title: string; rows: [string, number][]; total: number; nonce: string }) {
  const prefix = `tc-${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  const barCss = rows.map(([, count], i) => `.${prefix}-${i}{width:${(count / total) * 100}%}`).join("");
  return (
    <div className={`${appCard} flex flex-col gap-4`}>
      {barCss && <style nonce={nonce}>{barCss}</style>}
      <h2 className={appH2}>{title}</h2>
      {rows.length === 0 ? (
        <p className="m-0 text-sm font-semibold text-kf-tinta-suave">Sin respuestas todavía.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0 text-sm">
          {rows.map(([label, count], i) => (
            <li key={label} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="min-w-0 font-bold">{label}</span>
                <span className="shrink-0 font-semibold text-kf-tinta-suave">
                  {count} · {Math.round((count / total) * 100)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-kf-niebla">
                <div className={`${prefix}-${i} h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Row = {
  email: string;
  companyName: string | null;
  industry: string | null;
  bottleneck: string | null;
  currentSolution: string | null;
  surveyAnswer: string | null;
  createdAt: Date;
};

// A free-text answer list grouped by industry and ordered by volume — the
// point is spotting demand patterns ("17% de marketing menciona X").
function RadarSection({
  title,
  users,
  pick,
  secondary,
}: {
  title: string;
  users: Row[];
  pick: (u: Row) => string | null;
  secondary?: (u: Row) => string | null;
}) {
  const rows = users.filter((u) => pick(u)?.trim());
  const groups = new Map<string, Row[]>();
  for (const u of rows) {
    const k = u.industry?.trim() || "Sin rubro";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(u);
  }
  const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <div className={`${appCard} flex flex-col gap-4`}>
      <div className="flex flex-col gap-1">
        <p className={kicker}>{rows.length} respuestas · por rubro</p>
        <h2 className={appH2}>{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="m-0 text-sm font-semibold text-kf-tinta-suave">Nadie escribió una todavía.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {sorted.map(([industry, gr], gi) => (
            <div key={industry} className="flex flex-col gap-2.5">
              <p className="m-0 flex items-center gap-2.5 text-xs font-extrabold tracking-[0.16em] text-kf-tinta uppercase">
                <StarDot i={gi} />
                {industry} · {gr.length}
              </p>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm">
                {gr.map((u) => (
                  <li key={u.email} className="rounded-[22px] bg-kf-niebla px-5 py-3.5">
                    <p className="m-0 font-bold break-words">{pick(u)}</p>
                    {secondary?.(u)?.trim() ? (
                      <p className="m-0 mt-1 text-xs font-semibold break-words text-kf-tinta-suave">Hoy lo resuelve con: {secondary(u)}</p>
                    ) : null}
                    <p className="m-0 mt-1 text-xs font-semibold break-words text-kf-tinta-suave">
                      {u.companyName || u.email} · {u.createdAt.toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?from=/admin");
  if (!isAdmin(session.user.email)) notFound();
  const nonce = (await headers()).get("x-nonce") ?? "";

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      email: true,
      companyName: true,
      industry: true,
      bottleneck: true,
      currentSolution: true,
      surveyAnswer: true,
      surveyDismissedAt: true,
      createdAt: true,
    },
  });

  const industries = tally(users.map((u) => u.industry));
  const answered = users.filter((u) => u.surveyAnswer).length;
  const seenSurvey = users.filter((u) => u.surveyAnswer || u.surveyDismissedAt).length;

  return (
    <AppShell active="admin">
      <PageHero
        pair="carmesi"
        icon="eye"
        kicker="Admin"
        title="Respuestas de usuarios"
        lead="Qué rubros se registran y qué tareas quieren simplificar: la materia prima para las próximas herramientas."
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {[
          ["Registros", users.length],
          ["Con rubro", industries.reduce((s, [, c]) => s + c, 0)],
          ["Vieron la encuesta", seenSurvey],
          ["Respondieron", answered],
        ].map(([label, value], i) => {
          const c = PAIRS[STAT_PAIRS[i]];
          return (
            <div key={label} style={{ background: c.bg, color: c.ink }} className="flex min-w-0 flex-col gap-1 rounded-[28px] p-5">
              <p className="m-0 font-brand text-5xl leading-none font-extrabold">{value}</p>
              <p className="m-0 text-sm font-bold break-words">{label}</p>
            </div>
          );
        })}
      </div>

      <TallyCard title="Rubro de la empresa" rows={industries} total={users.length || 1} nonce={nonce} />

      <RadarSection
        title="Qué tarea les quita más tiempo"
        users={users}
        pick={(u) => u.bottleneck}
        secondary={(u) => u.currentSolution}
      />

      <RadarSection
        title="Otra tarea que automatizarían"
        users={users}
        pick={(u) => u.surveyAnswer}
      />

      <section className={`${appCard} flex flex-col gap-4`}>
        <h2 className={appH2}>Registros · {users.length}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-kf-borde">
                {["Email", "Empresa", "Rubro", "Respuesta", "Alta"].map((h) => (
                  <th key={h} className="pr-3 pb-2 text-xs font-extrabold tracking-[0.14em] text-kf-tinta-suave uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b-2 border-kf-borde/60 align-top">
                  <td className="py-2.5 pr-3 font-bold">{u.email}</td>
                  <td className="py-2.5 pr-3 font-semibold text-kf-tinta-suave">{u.companyName || "—"}</td>
                  <td className="py-2.5 pr-3 font-semibold text-kf-tinta-suave">{u.industry ?? "—"}</td>
                  <td className="py-2.5 pr-3 font-semibold text-kf-tinta-suave">{u.surveyAnswer ?? (u.surveyDismissedAt ? "(cerró)" : "—")}</td>
                  <td className="py-2.5 font-semibold whitespace-nowrap text-kf-tinta-suave">{u.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="flex flex-col items-center gap-1 pt-2 text-center">
        <KitificaCredit />
      </footer>
    </AppShell>
  );
}
