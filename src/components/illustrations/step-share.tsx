// Step: Share — a link chip with a timer ring around it (expiry).
// Palette tuned for the light "Cómo funciona" surface. Animated by IllustrationLoop.
export function StepShareIllustration() {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-hidden="true"
      className="w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="none"
        stroke="#1d5f8f"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        {/* full ring = total time */}
        <circle cx="60" cy="62" r="36" stroke="#1d5f8f" strokeOpacity="0.25" />
        {/* elapsed arc ~270deg = time spent */}
        <path data-arc d="M60 26 A36 36 0 1 1 24 62" stroke="#1d5f8f" />
        {/* tick marks */}
        <path d="M60 26 V32" stroke="#1d5f8f" strokeOpacity="0.4" />
        <path d="M96 62 H90" stroke="#1d5f8f" strokeOpacity="0.4" />
        <path d="M60 98 V92" stroke="#1d5f8f" strokeOpacity="0.4" />
        <path d="M24 62 H30" stroke="#1d5f8f" strokeOpacity="0.4" />

        {/* link chip */}
        <rect x="40" y="50" width="40" height="24" fill="#1d5f8f" fillOpacity="0.12" />
        {/* key glyph */}
        <g data-key>
          <circle cx="52" cy="62" r="5" />
          <path d="M57 62 H74 M66 62 V69 M74 62 V68" />
        </g>

        {/* pixel accent */}
        <rect x="86" y="30" width="6" height="6" fill="#1d5f8f" fillOpacity="0.45" stroke="none" />
      </g>
    </svg>
  );
}
