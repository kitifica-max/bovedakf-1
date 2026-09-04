import Link from "next/link";

const BASE =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition active:scale-[0.98]";
const VARIANT = {
  primary: "bg-ink text-gray hover:bg-ink/90",
  secondary: "border border-border-soft text-ink hover:bg-paper",
  dark: "bg-ink-reverse text-ink hover:bg-ink-reverse/90",
} as const;

type Common = {
  variant?: "primary" | "secondary" | "dark";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export function CTAButton(
  props: Common & ({ href: string } | { type: "submit" | "button"; disabled?: boolean })
) {
  const { variant = "primary", className = "", children } = props;
  const cls = `${BASE} ${VARIANT[variant]} ${className}`;
  if ("href" in props) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={props.type}
      disabled={props.disabled}
      onClick={"onClick" in props ? props.onClick : undefined}
      className={`${cls} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}
