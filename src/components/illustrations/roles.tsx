// Roles — an invite envelope feeding two badge shapes: "Editor" (more filled dots
// + a pencil) and "Lector" (fewer dots + an eye). Blue palette only, no danger tone.
// Animated by IllustrationLoop: the invite pushes toward the badges, each lights in turn.
export function RolesIllustration() {
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
        {/* invite envelope */}
        <g data-envelope>
          <rect x="24" y="86" width="104" height="60" fill="#1d5f8f" fillOpacity="0.06" />
          <path d="M24 86 L76 122 L128 86" />
        </g>

        {/* feed arrows into the two badges */}
        <path data-arrow d="M132 104 H196 M188 96 L200 104 L188 112" />
        <path data-arrow d="M132 128 H196 M188 120 L200 128 L188 136" />

        {/* Editor badge — more filled dots + a pencil */}
        <g data-badge-editor>
          <path d="M212 24 H360 V78 L286 100 L212 78 Z" fill="#cfe6ee" fillOpacity="0.28" />
          <rect x="228" y="34" width="52" height="9" fill="#1d5f8f" stroke="none" />
          <g fill="#1d5f8f" stroke="none">
            <rect x="228" y="52" width="10" height="10" />
            <rect x="244" y="52" width="10" height="10" />
            <rect x="260" y="52" width="10" height="10" />
            <rect x="276" y="52" width="10" height="10" />
            <rect x="292" y="52" width="10" height="10" />
            <rect x="308" y="52" width="10" height="10" />
          </g>
          {/* upright blocky pencil */}
          <rect x="334" y="40" width="12" height="7" fill="#1d5f8f" stroke="none" />
          <rect x="334" y="47" width="12" height="16" />
          <path d="M334 63 L340 72 L346 63" />
        </g>

        {/* Lector badge — fewer filled dots + an eye */}
        <g data-badge-lector>
          <path d="M212 128 H360 V182 L286 204 L212 182 Z" fill="#1d5f8f" fillOpacity="0.05" />
          <rect x="228" y="138" width="36" height="9" fill="#1d5f8f" stroke="none" />
          <g stroke="#1d5f8f">
            <rect x="228" y="156" width="10" height="10" fill="#1d5f8f" />
            <rect x="244" y="156" width="10" height="10" fill="#1d5f8f" />
            <rect x="260" y="156" width="10" height="10" fill="none" />
            <rect x="276" y="156" width="10" height="10" fill="none" />
            <rect x="292" y="156" width="10" height="10" fill="none" />
            <rect x="308" y="156" width="10" height="10" fill="none" />
          </g>
          {/* blocky eye */}
          <path d="M320 150 L336 140 L352 150 L336 160 Z" />
          <rect x="331" y="145" width="10" height="10" fill="#1d5f8f" stroke="none" />
        </g>
      </g>
    </svg>
  );
}
