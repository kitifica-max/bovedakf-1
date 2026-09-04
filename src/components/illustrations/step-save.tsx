// Step: Save — a lock closing over a small block (the credential going in encrypted).
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
        <path d="M60 16 V34" />
        <path d="M52 28 L60 38 L68 28" />
        <rect x="49" y="38" width="22" height="30" fill="#1d5f8f" fillOpacity="0.14" />

        {/* lock body over the block */}
        <rect x="34" y="62" width="52" height="44" fill="#cfe6ee" fillOpacity="0.28" />
        {/* squared shackle — closed */}
        <path d="M44 62 V50 H76 V62" />
        {/* keyhole */}
        <circle cx="60" cy="82" r="5" fill="#1d5f8f" stroke="none" />
        <rect x="57" y="82" width="6" height="14" fill="#1d5f8f" stroke="none" />

        {/* pixel accents */}
        <rect x="90" y="66" width="6" height="6" fill="#cfe6ee" stroke="none" />
        <rect x="24" y="92" width="6" height="6" fill="#cfe6ee" stroke="none" />
      </g>
    </svg>
  );
}
