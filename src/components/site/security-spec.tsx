type SpecGroup = { label: string; items: { claim: string; plain: string }[] };

export function SecuritySpec({
  groups,
  compact = false,
}: {
  groups: SpecGroup[];
  compact?: boolean;
}) {
  return (
    <div
      data-reveal
      className={
        compact
          ? "flex flex-col gap-6"
          : "grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2"
      }
    >
      {groups.map((g) => (
        <div key={g.label}>
          <p className="t-kicker">{g.label}</p>
          <ul className="mt-3 flex flex-col gap-3">
            {g.items.map((it) => (
              <li key={it.claim}>
                <p className="text-sm font-semibold text-ink">{it.claim}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{it.plain}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
