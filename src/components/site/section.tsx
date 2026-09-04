type Variant = "plain" | "card" | "emphasis" | "glass";

const SURFACE: Record<Variant, string> = {
  plain: "",
  card: "rounded-2xl border border-border-soft bg-paper p-8 sm:p-12",
  emphasis: "rounded-2xl border border-blue/25 bg-blue/[0.07] p-8 backdrop-blur-md sm:p-12",
  glass: "glass rounded-2xl p-8 sm:p-12",
};

export function Section({
  id,
  variant = "plain",
  wide = false,
  className = "",
  children,
  "aria-labelledby": ariaLabelledby,
}: {
  id?: string;
  variant?: Variant;
  wide?: boolean;
  className?: string;
  children: React.ReactNode;
  "aria-labelledby"?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={`w-full ${wide ? "max-w-6xl" : "max-w-5xl"} ${SURFACE[variant]} ${className}`}
    >
      {children}
    </section>
  );
}
