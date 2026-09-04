export function FeatureCard({
  Icon,
  title,
  body,
  wide = false,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  wide?: boolean;
}) {
  return (
    <div
      data-reveal
      className={`rounded-2xl border border-blue/30 bg-blue/[0.08] p-6 backdrop-blur-md ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 place-items-center rounded-full bg-blue-soft text-blue"
      >
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="t-h3 mt-4 text-ink">{title}</h3>
      <p className="mt-1 max-w-xl text-sm text-ink-soft">{body}</p>
    </div>
  );
}
