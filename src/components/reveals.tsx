"use client";

import { useEffect } from "react";

/**
 * Scroll-in reveal for every [data-reveal] element on the page — one setup,
 * no wrapper divs. Content is fully visible without JS; this only adds the
 * entrance. Mirrors HeroReveal's guards (reduced-motion, hidden tab).
 */
export function Reveals() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // No document.hidden guard here (unlike HeroReveal): ScrollTrigger only
    // fires on scroll, by which point the tab is visible.

    let cancelled = false;
    const kills: Array<() => void> = [];

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        // The hero runs its own entrance (HeroReveal) — don't double-animate it.
        const els = gsap.utils
          .toArray<HTMLElement>("[data-reveal]")
          .filter((el) => !el.closest("[data-hero]"));

        els.forEach((el) => {
          const tween = gsap.fromTo(
            el,
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 86%", once: true },
            }
          );
          kills.push(() => tween.scrollTrigger?.kill());
        });

        ScrollTrigger.refresh();
      }
    );

    return () => {
      cancelled = true;
      kills.forEach((k) => k());
    };
  }, []);

  return null;
}
