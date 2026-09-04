"use client";

import { useEffect, useRef } from "react";

type Name = "step-save" | "step-share" | "step-audit" | "roles";

/**
 * Wraps an inline-SVG illustration and runs a slow, meaning-driven GSAP loop on it.
 * Selectors resolve inside this wrapper via gsap.context. Rotations pivot on a
 * viewBox point via `svgOrigin`. No-ops under prefers-reduced-motion; cleans up
 * on unmount.
 */
export function IllustrationLoop({
  name,
  children,
  className = "",
}: {
  name: Name;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    import("gsap").then(({ default: gsap }) => {
      if (cancelled || !el) return;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power2.inOut" } });

        if (name === "step-save") {
          // the block sinks in, the shackle drops shut, the keyhole locks
          tl.fromTo("[data-block]", { y: -10, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.7 })
            .fromTo("[data-shackle]", { y: -12 }, { y: 0, duration: 0.5 }, "-=0.2")
            .fromTo("[data-keyhole]", { opacity: 0.3 }, { opacity: 1, duration: 0.35 })
            .to({}, { duration: 1.8 })
            .to("[data-lock]", { opacity: 0.25, duration: 0.5 })
            .set("[data-lock]", { opacity: 1 });
        }

        if (name === "step-share") {
          // the expiry ring spins on its own centre; the key ticks with it
          gsap.set("[data-arc]", { svgOrigin: "60 62" });
          gsap.set("[data-key]", { svgOrigin: "52 62" });
          tl.fromTo(
            "[data-arc]",
            { rotation: 0 },
            { rotation: 360, duration: 3.6, ease: "none" }
          ).fromTo("[data-key]", { rotation: -10 }, { rotation: 0, duration: 0.5 }, 0);
        }

        if (name === "step-audit") {
          // rows check in one by one, the eye scans across, then it resets
          tl.fromTo(
            "[data-check]",
            { opacity: 0, y: -6 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.4 }
          )
            .fromTo("[data-eye]", { x: -7 }, { x: 7, duration: 0.9, yoyo: true, repeat: 1 }, "-=0.3")
            .to({}, { duration: 1.2 })
            .to("[data-check]", { opacity: 0.15, duration: 0.4 })
            .set("[data-check]", { opacity: 1 });
        }

        if (name === "roles") {
          // the invite pushes toward the two badges; arrows carry it; each badge lights in turn
          tl.fromTo("[data-envelope]", { x: 0 }, { x: 7, duration: 0.7, yoyo: true, repeat: 1 })
            .fromTo(
              "[data-arrow]",
              { opacity: 0.25, x: -5 },
              { opacity: 1, x: 0, duration: 0.45, stagger: 0.18 },
              0.15
            )
            .fromTo("[data-badge-editor]", { opacity: 0.5 }, { opacity: 1, duration: 0.4 }, "-=0.1")
            .fromTo("[data-badge-lector]", { opacity: 0.5 }, { opacity: 1, duration: 0.4 })
            .to({}, { duration: 1.5 })
            .to(["[data-badge-editor]", "[data-badge-lector]"], { opacity: 0.5, duration: 0.6 });
        }
      }, el);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [name]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
