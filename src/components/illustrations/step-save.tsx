// Step: Save — a lock closing over a small block (the credential going in encrypted).
// Palette tuned for the light "Cómo funciona" surface. Animated by IllustrationLoop.
export function StepSaveIllustration() {
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
        {/* credential dropping in */}
        <g data-block>
          <path d="M60 16 V34" />
          <path d="M52 28 L60 38 L68 28" />
          <rect x="49" y="38" width="22" height="30" fill="#1d5f8f" fillOpacity="0.16" />
        </g>

        <g data-lock>
          {/* lock body over the block */}
          <rect x="34" y="62" width="52" height="44" fill="#1d5f8f" fillOpacity="0.1" />
          {/* squared shackle — closed */}
          <path data-shackle d="M44 62 V50 H76 V62" />
          {/* keyhole */}
          <g data-keyhole>
            <circle cx="60" cy="82" r="5" fill="#1d5f8f" stroke="none" />
            <rect x="57" y="82" width="6" height="14" fill="#1d5f8f" stroke="none" />
          </g>
        </g>

        {/* pixel accents */}
        <rect x="90" y="66" width="6" height="6" fill="#1d5f8f" fillOpacity="0.45" stroke="none" />
        <rect x="24" y="92" width="6" height="6" fill="#1d5f8f" fillOpacity="0.45" stroke="none" />
      </g>
    </svg>
  );
}
