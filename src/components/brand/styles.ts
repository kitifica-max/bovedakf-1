// Base has no size utilities, so a variant's sizes never fight the defaults (no class merging here).
export const pillBase = "inline-flex items-center justify-center rounded-full py-3 text-center font-extrabold no-underline transition hover:opacity-90";
export const pill = `${pillBase} min-h-14 px-7 text-[13px] tracking-[0.14em] sm:min-h-16 sm:px-9 sm:text-[15px]`;
export const pillSm = `${pillBase} min-h-12 px-4 text-[12px] tracking-[0.1em] sm:min-h-13 sm:px-7 sm:text-[14px] sm:tracking-[0.14em]`;
export const pillCard = `${pillBase} min-h-13 px-6 text-[13px] tracking-[0.12em]`;
export const display = "font-brand font-extrabold uppercase";
