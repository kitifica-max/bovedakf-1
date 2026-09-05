import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { KitificaCredit } from "@/components/kitifica-credit";

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
    <div className="rounded-2xl border border-border-soft bg-paper p-5">
      {barCss && <style nonce={nonce}>{barCss}</style>}
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Sin respuestas todavía.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {rows.map(([label, count], i) => (
            <li key={label} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-ink">{label}</span>
                <span className="shrink-0 text-ink-soft">
                  {count} · {Math.round((count / total) * 100)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray/60">
                <div className={`${prefix}-${i} h-full rounded-full bg-blue`} />
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
    <div className="rounded-2xl border border-border-soft bg-paper p-5">
      <p className="font-display text-lg font-semibold text-ink">
        {title} <span className="text-sm font-normal text-ink-soft">({rows.length}) · por rubro</span>
      </p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Nadie escribió una todavía.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-5">
          {sorted.map(([industry, gr]) => (
            <div key={industry}>
              <p className="text-xs font-semibold tracking-wide text-blue uppercase">
                {industry} · {gr.length}
              </p>
              <ul className="mt-2 flex flex-col gap-3 text-sm">
                {gr.map((u) => (
                  <li key={u.email} className="border-t border-border-soft pt-3 first:border-0 first:pt-0">
                    <p className="text-ink">{pick(u)}</p>
                    {secondary?.(u)?.trim() ? (
                      <p className="mt-0.5 text-xs text-ink-soft">Hoy lo resuelve con: {secondary(u)}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-ink-soft">
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
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 rounded-full bg-ink px-5 py-3 text-gray">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, not photographic content */}
          <img src="/logo-on-light.svg" alt="Bóveda KF-1" className="h-5 w-auto" />
          <span className="hidden text-sm text-gray/70 sm:inline">· Admin</span>
        </div>
        <Link
          href="/dashboard"
          className="shrink-0 rounded-full border border-gray/25 px-3 py-1.5 text-sm transition hover:bg-gray/10"
        >
          ← Volver a la bóveda
        </Link>
      </header>

      <p className="font-pixel text-lg leading-[1.3] text-ink">Respuestas de usuarios</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Registros", users.length],
          ["Con rubro", industries.reduce((s, [, c]) => s + c, 0)],
          ["Vieron la encuesta", seenSurvey],
          ["Respondieron", answered],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border-soft bg-paper p-4">
            <p className="font-display text-2xl font-semibold text-ink">{value}</p>
            <p className="text-xs text-ink-soft">{label}</p>
          </div>
        ))}
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

      <div className="rounded-2xl border border-border-soft bg-paper p-5">
        <p className="font-display text-lg font-semibold text-ink">
          Registros <span className="text-sm font-normal text-ink-soft">({users.length})</span>
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-soft text-xs text-ink-soft">
                <th className="pb-2 pr-3 font-medium">Email</th>
                <th className="pb-2 pr-3 font-medium">Empresa</th>
                <th className="pb-2 pr-3 font-medium">Rubro</th>
                <th className="pb-2 pr-3 font-medium">Respuesta</th>
                <th className="pb-2 font-medium">Alta</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b border-border-soft/60 align-top">
                  <td className="py-2 pr-3 text-ink">{u.email}</td>
                  <td className="py-2 pr-3 text-ink-soft">{u.companyName || "—"}</td>
                  <td className="py-2 pr-3 text-ink-soft">{u.industry ?? "—"}</td>
                  <td className="py-2 pr-3 text-ink-soft">{u.surveyAnswer ?? (u.surveyDismissedAt ? "(cerró)" : "—")}</td>
                  <td className="py-2 whitespace-nowrap text-ink-soft">{u.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mt-auto flex flex-col items-center gap-1 pt-6 text-center">
        <p className="text-xs text-ink-soft">© {new Date().getFullYear()} Bóveda KF-1</p>
        <KitificaCredit />
      </footer>
    </div>
  );
}
