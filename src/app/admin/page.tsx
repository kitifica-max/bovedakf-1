import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

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

function TallyCard({ title, rows, total }: { title: string; rows: [string, number][]; total: number }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-paper p-5">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Sin respuestas todavía.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {rows.map(([label, count]) => (
            <li key={label} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-ink">{label}</span>
                <span className="shrink-0 text-ink-soft">
                  {count} · {Math.round((count / total) * 100)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray/60">
                <div className="h-full rounded-full bg-blue" style={{ width: `${(count / total) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?from=/admin");
  if (!isAdmin(session.user.email)) notFound();

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      email: true,
      companyName: true,
      industry: true,
      bottleneck: true,
      surveyAnswer: true,
      surveyDismissedAt: true,
      createdAt: true,
    },
  });

  const industries = tally(users.map((u) => u.industry));
  const answers = tally(users.map((u) => u.surveyAnswer));
  const bottlenecks = users.filter((u) => u.bottleneck?.trim());
  const answered = users.filter((u) => u.surveyAnswer).length;
  const seenSurvey = users.filter((u) => u.surveyAnswer || u.surveyDismissedAt).length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 rounded-full bg-ink px-5 py-3 text-gray">
        <p className="font-display text-lg font-semibold">Respuestas de usuarios</p>
        <Link
          href="/dashboard"
          className="shrink-0 rounded-full border border-gray/25 px-3 py-1.5 text-sm transition hover:bg-gray/10"
        >
          ← Volver a la bóveda
        </Link>
      </header>

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

      <div className="grid gap-3 sm:grid-cols-2">
        <TallyCard title="Rubro de la empresa" rows={industries} total={users.length || 1} />
        <TallyCard
          title="¿Qué resolver después?"
          rows={answers}
          total={answered || 1}
        />
      </div>

      <div className="rounded-2xl border border-border-soft bg-paper p-5">
        <p className="font-display text-lg font-semibold text-ink">
          Cuellos de botella <span className="text-sm font-normal text-ink-soft">({bottlenecks.length})</span>
        </p>
        {bottlenecks.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">Nadie escribió uno todavía.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3 text-sm">
            {bottlenecks.map((u) => (
              <li key={u.email} className="border-t border-border-soft pt-3 first:border-0 first:pt-0">
                <p className="text-ink">{u.bottleneck}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {u.companyName || u.email} · {u.industry ?? "sin rubro"} · {u.createdAt.toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

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
    </div>
  );
}
