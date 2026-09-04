export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function SectionHead({
  kicker,
  title,
  lead,
}: {
  kicker: string;
  title: string;
  lead?: string;
}) {
  return (
    <div data-reveal className="mb-10 max-w-2xl sm:mb-14">
      <p className="t-kicker">{kicker}</p>
      <h2 id={slug(title)} className="t-h2 mt-2 text-ink">
        {title}
      </h2>
      {lead ? <p className="mt-4 leading-relaxed text-ink-soft">{lead}</p> : null}
    </div>
  );
}
