// Base has no size utilities, so a variant's sizes never fight the defaults (no class merging here).
export const pillBase = "inline-flex items-center justify-center rounded-full py-3 text-center font-extrabold no-underline transition hover:opacity-90";
export const pill = `${pillBase} min-h-14 px-7 text-[13px] tracking-[0.14em] sm:min-h-16 sm:px-9 sm:text-[15px]`;
export const pillSm = `${pillBase} min-h-12 px-4 text-[12px] tracking-[0.1em] sm:min-h-13 sm:px-7 sm:text-[14px] sm:tracking-[0.14em]`;
export const pillCard = `${pillBase} min-h-13 px-6 text-[13px] tracking-[0.12em]`;
export const display = "font-brand font-extrabold uppercase";

// Platform (dashboard) building blocks.
export const appCard = "rounded-[32px] border-2 border-kf-borde bg-white p-6 sm:p-8";
export const appH2 = "m-0 font-brand text-[28px] leading-[1.04] font-extrabold text-kf-azul-hondo uppercase";
export const kicker = "m-0 text-xs font-extrabold tracking-[0.18em] text-kf-tinta-suave uppercase";
const appPill = "inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full px-5 text-xs font-extrabold tracking-[0.12em] no-underline transition disabled:cursor-not-allowed disabled:opacity-50";
export const pillFill = `${appPill} bg-kf-azul text-white hover:opacity-90`;
export const pillLine = `${appPill} border-2 border-kf-azul bg-white text-kf-azul hover:bg-kf-azul hover:text-white`;
export const fieldCls =
  "h-12 w-full rounded-full border-2 border-kf-borde bg-white px-5 text-base font-semibold text-kf-tinta outline-none transition placeholder:font-medium placeholder:text-kf-tinta-suave focus:border-kf-azul sm:text-sm";
