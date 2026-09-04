// Roles — an invite envelope feeding two badge shapes: "Editor" (more filled dots)
// and "Lector" (fewer). Blue palette only, no danger tone.
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
        <rect x="24" y="86" width="104" height="60" fill="#1d5f8f" fillOpacity="0.06" />
        <path d="M24 86 L76 122 L128 86" />

        {/* feed arrows into the two badges */}
        <path d="M132 104 H196 M188 96 L200 104 L188 112" />
        <path d="M132 128 H196 M188 120 L200 128 L188 136" />

        {/* Editor badge — more filled dots */}
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
        {/* blocky pencil */}
        <path d="M330 34 L342 46 L322 66 L310 54 Z" />
        <path d="M310 54 L316 60" />

        {/* Lector badge — fewer filled dots */}
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
    </svg>
  );
}
