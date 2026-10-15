import Link from "next/link";

// Agencies brand pills (auth forms are the only users).
const BASE =
  "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-xs font-extrabold tracking-[0.14em] uppercase transition active:scale-[0.98]";
const VARIANT = {
  primary: "bg-kf-azul text-white hover:opacity-90",
  secondary: "border-2 border-kf-azul bg-white text-kf-azul hover:bg-kf-azul hover:text-white",
  dark: "bg-kf-tinta text-white hover:opacity-90",
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
