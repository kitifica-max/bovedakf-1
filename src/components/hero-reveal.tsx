"use client";

import { useEffect, useRef } from "react";

/**
 * One deliberate entrance moment for the hero, staggered top to bottom.
 * Everything else on the page is still — motion is spent here, once.
 */
export function HeroReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    // A hidden/backgrounded tab throttles rAF and can freeze the tween
    // mid-flight — skip the animation there rather than risk stuck opacity.
    if (reduceMotion || document.hidden || !el) return;

    let cancelled = false;
    import("gsap").then(({ default: gsap }) => {
      if (cancelled || !el) return;
      const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
      gsap.fromTo(
        targets,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08 }
      );

      // Once settled, a barely-there drift on the badge cluster so the hero
      // panel keeps breathing next to the looping video.
      const float = el.querySelector<HTMLElement>("[data-float]");
      if (float) {
        // Slow enough (~9s/cycle) to sit outside the ~0.2 Hz band that reads
        // as distracting/vestibular; small amplitude so it's a breath, not a bob.
        gsap.to(float, {
          y: -4,
          duration: 4.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1,
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div ref={ref} data-hero>
      {children}
    </div>
  );
}
