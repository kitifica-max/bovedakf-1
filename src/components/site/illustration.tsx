export function Illustration({
  children,
  caption,
  align = "center",
}: {
  children: React.ReactNode;
  caption?: string;
  align?: "center" | "start";
}) {
  return (
    <div
      data-reveal
      className={`w-full ${align === "center" ? "mx-auto" : ""} [&>svg]:h-auto [&>svg]:w-full`}
    >
      {children}
      {caption ? (
        <p className="mt-3 text-center text-xs text-ink-soft">{caption}</p>
      ) : null}
    </div>
  );
}
