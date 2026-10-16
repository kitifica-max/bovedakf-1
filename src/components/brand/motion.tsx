"use client";

import { useEffect, useSyncExternalStore } from "react";

// GSAP layer driven by data attributes — server components just tag elements:
//   data-reveal[="pop|bar"] [data-delay=".2"]  fade/slide in when it enters the viewport
//   data-stagger                               its children reveal one after another
//   data-spin[="seconds"]                      endless slow rotation (starbursts)
//   data-float                                 endless gentle bob (stickers, seals)
//   data-countdown                             endless draining ring (SVG circle, r=52)
//   (no attribute)                             every rounded-full <a>/<button> leans toward the pointer
// CSS hides the targets only under prefers-reduced-motion: no-preference; if gsap fails to load
// we set <html data-motion="off"> and they simply show.

const KEY = "kf1-loops-paused";
const EVENT = "kf1-loops";

type Tween = { pause: () => unknown; resume: () => unknown };
const loops = new Set<Tween>();

const readPaused = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
const syncLoops = () => loops.forEach((t) => (readPaused() ? t.pause() : t.resume()));

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

export function Motion() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let off = false;
    let stop = () => {};
    const failsafe = setTimeout(() => {
      document.documentElement.dataset.motion = "off";
    }, 4000);

    import("gsap").then(({ gsap }) => {
      if (off) return;
      clearTimeout(failsafe);
      const done = new WeakSet<Element>();

      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const el = e.target as HTMLElement;
            if (!e.isIntersecting) {
              // scrolled/jumped past it (anchor link, fast scroll): show it, no animation to watch
              if (e.boundingClientRect.top < 0) {
                io.unobserve(el);
                gsap.set("stagger" in el.dataset ? el.children : el, { autoAlpha: 1 });
                el.dataset.shown = "";
              }
              continue;
            }
            io.unobserve(el);
            const delay = Number(el.dataset.delay ?? 0);
            if ("stagger" in el.dataset) {
              gsap.fromTo(el.children, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.09, delay, clearProps: "transform", onComplete: () => { el.dataset.shown = ""; } });
              continue;
            }
            const kind = el.dataset.reveal;
            if (kind === "pop") gsap.fromTo(el, { autoAlpha: 0, scale: 0.4, rotate: -14 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.9, ease: "back.out(1.8)", delay, clearProps: "transform" });
            else if (kind === "bar") gsap.fromTo(el, { autoAlpha: 1, scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: 1, ease: "power2.out", delay: delay + 0.2, clearProps: "transform" });
            else gsap.fromTo(el, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", delay, clearProps: "transform" });
          }
        },
        { rootMargin: "0px 0px -8% 0px" },
      );

      const scan = () => {
        document.querySelectorAll("[data-reveal], [data-stagger], [data-spin], [data-float], [data-countdown]").forEach((node) => {
          if (done.has(node)) return;
          done.add(node);
          const el = node as HTMLElement;
          if ("reveal" in el.dataset || "stagger" in el.dataset) io.observe(el);
          if ("spin" in el.dataset) {
            const t = gsap.to(el, { rotate: "+=360", duration: Number(el.dataset.spin) || 40, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
            loops.add(t);
          }
          if ("countdown" in el.dataset) {
            // ring drains over a "30 s" window then refills, like the real TOTP chip
            loops.add(gsap.fromTo(el, { strokeDashoffset: 0 }, { strokeDashoffset: 326.7, duration: 12, ease: "none", repeat: -1 }));
          }
          if ("float" in el.dataset) {
            const t = gsap.to(el, { y: -9, rotate: "+=3", duration: 2.4 + Math.random() * 0.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
            loops.add(t);
          }
        });
        syncLoops();
      };

      let raf = 0;
      const mo = new MutationObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(scan);
      });
      mo.observe(document.body, { childList: true, subtree: true });
      scan();

      stop = () => {
        mo.disconnect();
        io.disconnect();
        cancelAnimationFrame(raf);
        gsap.globalTimeline.clear();
        loops.clear();
      };
    }, () => {
      document.documentElement.dataset.motion = "off";
    });

    // Magnet: pills lean toward a fine pointer. Delegated, so every rounded-full button/link gets it.
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    let cur: HTMLElement | null = null;
    const release = () => {
      const el = cur;
      cur = null;
      if (!el) return;
      import("gsap").then(({ gsap }) =>
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)", onComplete: () => { el.style.transition = ""; gsap.set(el, { clearProps: "transform" }); } }),
      );
    };
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element).closest<HTMLElement>("a.rounded-full, button.rounded-full");
      if (el !== cur) release();
      if (!el || (el as HTMLButtonElement).disabled) return;
      const r = el.getBoundingClientRect();
      if (r.height < 40) return;
      cur = el;
      el.style.transition = "none"; // tailwind's transition would lag behind the tween
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.32;
      import("gsap").then(({ gsap }) => gsap.to(el, { x: dx, y: dy, duration: 0.35, ease: "power3.out", overwrite: "auto" }));
    };
    if (fine) {
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerleave", release);
    }

    window.addEventListener(EVENT, syncLoops);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", release);
      off = true;
      clearTimeout(failsafe);
      window.removeEventListener(EVENT, syncLoops);
      stop();
    };
  }, []);
  return null;
}

// WCAG 2.2.2: anything moving on its own for >5s needs a pause control.
export function MotionToggle({ className = "" }: { className?: string }) {
  const paused = useSyncExternalStore(subscribe, readPaused, () => false);
  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={() => {
        try {
          localStorage.setItem(KEY, paused ? "0" : "1");
        } catch {
          /* not remembered */
        }
        window.dispatchEvent(new Event(EVENT));
      }}
      className={className}
    >
      {paused ? "Animaciones: pausadas" : "Animaciones: activas"}
    </button>
  );
}
