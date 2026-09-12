"use client";

import { useEffect, useRef } from "react";

type Props = {
  starterPlanId: string;
  teamPlanId: string;
  clientId: string;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: unknown) => { render: (el: string | HTMLElement) => void };
    };
  }
}

function PayPalButton({ planId, containerId }: { planId: string; containerId: string }) {
  const rendered = useRef(false);

  useEffect(() => {
    if (rendered.current || !window.paypal || !planId) return;
    rendered.current = true;
    window.paypal
      .Buttons({
        style: { shape: "pill", color: "blue", layout: "vertical", label: "subscribe" },
        createSubscription: (_data: unknown, actions: { subscription: { create: (o: unknown) => unknown } }) =>
          actions.subscription.create({ plan_id: planId }),
        onApprove: async (data: { subscriptionID: string }) => {
          await fetch("/api/paypal/activated", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscriptionId: data.subscriptionID }),
          });
          window.location.href = "/dashboard/billing?activated=1";
        },
      })
      .render(`#${containerId}`);
  }, [planId, containerId]);

  return <div id={containerId} className="mt-6" />;
}

export function PricingCards({ starterPlanId, teamPlanId, clientId }: Props) {
  useEffect(() => {
    if (!clientId || document.querySelector("#paypal-sdk")) return;
    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.setAttribute("data-sdk-integration-source", "button-factory");
    document.body.appendChild(script);
  }, [clientId]);

  const plans = [
    {
      key: "starter",
      name: "Starter",
      price: "$9",
      period: "/mes",
      seats: "Hasta 5 usuarios",
      features: ["Bóvedas ilimitadas", "Credenciales ilimitadas", "Share links con expiración", "Audit log completo"],
      planId: starterPlanId,
      containerId: "paypal-starter",
      featured: false,
    },
    {
      key: "team",
      name: "Equipo",
      price: "$29",
      period: "/mes",
      seats: "Hasta 25 usuarios",
      features: ["Todo lo de Starter", "25 asientos de equipo", "SSO corporativo", "Soporte prioritario"],
      planId: teamPlanId,
      containerId: "paypal-team",
      featured: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {plans.map((p) => (
        <div
          key={p.key}
          className={`relative rounded-2xl border p-8 ${
            p.featured
              ? "border-blue bg-paper shadow-lg"
              : "border-border-soft bg-paper"
          }`}
        >
          {p.featured && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue px-4 py-0.5 text-xs font-semibold text-white">
              Más popular
            </span>
          )}
          <p className="text-sm font-semibold uppercase tracking-widest text-blue">{p.name}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-4xl font-bold text-ink">{p.price}</span>
            <span className="text-ink-soft">{p.period}</span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">{p.seats}</p>
          <ul className="mt-6 flex flex-col gap-2">
            {p.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-ink">
                <svg className="h-4 w-4 shrink-0 text-blue" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <PayPalButton planId={p.planId} containerId={p.containerId} />
        </div>
      ))}
    </div>
  );
}
