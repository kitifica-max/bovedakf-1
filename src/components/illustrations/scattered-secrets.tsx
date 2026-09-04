// "Dispersas, sin control" — password-shaped fragments strewn across a chat bubble,
// a doc corner and an envelope, deliberately unaligned and rotated. One fragment
// escapes the envelope in the danger tone.
export function ScatteredSecretsIllustration() {
  return (
    <svg
      viewBox="0 0 400 225"
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
        {/* chat bubble, tilted */}
        <g transform="rotate(-5 92 62)">
          <path d="M24 30 H160 V88 H66 L44 108 V88 H24 Z" fill="#1d5f8f" fillOpacity="0.06" />
          <g fill="#1d5f8f" stroke="none">
            <rect x="40" y="52" width="9" height="9" />
            <rect x="54" y="52" width="9" height="9" />
            <rect x="68" y="52" width="9" height="9" />
            <rect x="82" y="52" width="9" height="9" />
          </g>
          <rect x="40" y="68" width="70" height="8" fill="#cfe6ee" stroke="none" />
        </g>

        {/* doc corner, tilted — a key=value scrap */}
        <g transform="rotate(6 312 66)">
          <path d="M258 18 H338 L362 42 V120 H258 Z" fill="#edf0f4" />
          <path d="M338 18 V42 H362" />
          <rect x="272" y="44" width="26" height="9" fill="#1d5f8f" stroke="none" />
          <path d="M304 44 H310 M304 52 H310" />
          <rect x="316" y="44" width="32" height="9" fill="#cfe6ee" stroke="none" />
          <g fill="#1d5f8f" stroke="none">
            <rect x="272" y="66" width="8" height="8" />
            <rect x="285" y="66" width="8" height="8" />
            <rect x="298" y="66" width="8" height="8" />
          </g>
        </g>

        {/* envelope, tilted */}
        <g transform="rotate(-4 196 176)">
          <rect x="120" y="140" width="152" height="66" fill="#1d5f8f" fillOpacity="0.05" />
          <path d="M120 140 L196 184 L272 140" />
        </g>

        {/* exposed fragment escaping the envelope — danger tone */}
        <g transform="rotate(9 208 126)">
          <rect x="168" y="116" width="80" height="20" fill="#f87171" fillOpacity="0.14" stroke="#f87171" />
          <g fill="#f87171" stroke="none">
            <rect x="178" y="122" width="8" height="8" />
            <rect x="192" y="122" width="8" height="8" />
            <rect x="206" y="122" width="8" height="8" />
            <rect x="220" y="122" width="8" height="8" />
            <rect x="234" y="122" width="8" height="8" />
          </g>
        </g>

        {/* loose fragments, unaligned */}
        <g transform="rotate(13 330 170)">
          <rect x="300" y="158" width="64" height="18" fill="#cfe6ee" fillOpacity="0.3" />
          <g fill="#1d5f8f" stroke="none">
            <rect x="308" y="164" width="7" height="7" />
            <rect x="320" y="164" width="7" height="7" />
            <rect x="332" y="164" width="7" height="7" />
          </g>
        </g>
        <g transform="rotate(-11 60 150)">
          <rect x="28" y="140" width="60" height="18" fill="#e0e4eb" />
          <g fill="#1d5f8f" stroke="none">
            <rect x="36" y="146" width="7" height="7" />
            <rect x="48" y="146" width="7" height="7" />
            <rect x="60" y="146" width="7" height="7" />
          </g>
        </g>
      </g>
    </svg>
  );
}
