export const PAID_PLANS = {
  personal: {
    name: "Personal",
    price: 3,
    seats: 1,
    tagline: "Para uso individual",
    features: ["1 usuario", "Credenciales ilimitadas", "Share links ilimitados", "Audit log completo"],
  },
  team: {
    name: "Equipo",
    price: 20,
    seats: 10,
    tagline: "Hasta 10 usuarios",
    features: ["10 usuarios", "Todo lo de Personal", "Email corporativo (SSO)", "Soporte prioritario"],
  },
} as const;

export type PaidPlan = keyof typeof PAID_PLANS;

export const FREE_PLAN = {
  name: "Gratis",
  tagline: "Para explorar",
  features: ["1 usuario", "10 credenciales", "5 share links/mes", "Audit log básico"],
};

// "starter" is a legacy plan id still present on old subscriptions.
export const PLAN_DISPLAY: Record<string, string> = { personal: "Personal", starter: "Personal", team: "Equipo" };
