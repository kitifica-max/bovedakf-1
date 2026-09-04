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
  center = false,
  light = false,
}: {
  kicker: string;
  title: string;
  lead?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div
      data-reveal
      className={`mb-10 max-w-2xl sm:mb-14 ${center ? "mx-auto text-center" : ""}`}
    >
      <p className="t-kicker">{kicker}</p>
      <h2
        id={slug(title)}
        className={`t-h2 mt-2 ${light ? "text-ink-reverse" : "text-ink"}`}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={`mt-4 leading-relaxed ${light ? "text-ink-reverse/70" : "text-ink-soft"}`}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
