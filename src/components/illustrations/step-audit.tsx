// Step: Audit — a short list with checkmarks and an eye glyph.
export function StepAuditIllustration() {
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
        {/* row 1 */}
        <rect x="20" y="26" width="12" height="12" />
        <path d="M22 32 L26 36 L34 26" />
        <rect x="40" y="27" width="52" height="10" fill="#cfe6ee" stroke="none" />
        {/* row 2 */}
        <rect x="20" y="48" width="12" height="12" />
        <path d="M22 54 L26 58 L34 48" />
        <rect x="40" y="49" width="40" height="10" fill="#cfe6ee" stroke="none" />
        {/* row 3 */}
        <rect x="20" y="70" width="12" height="12" />
        <path d="M22 76 L26 80 L34 70" />
        <rect x="40" y="71" width="48" height="10" fill="#cfe6ee" stroke="none" />

        {/* eye glyph — who looked */}
        <path d="M60 100 L78 88 L96 100 L78 112 Z" />
        <rect x="73" y="95" width="10" height="10" fill="#1d5f8f" stroke="none" />

        {/* pixel accent */}
        <rect x="100" y="30" width="6" height="6" fill="#cfe6ee" stroke="none" />
      </g>
    </svg>
  );
}
