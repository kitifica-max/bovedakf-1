// Hero illustration: the share flow in three beats — stored credential -> share link -> opened.
// Geometric / pixel-art-adjacent: right-angle joints, stroke-width 2, square caps, no gradients.
// The `kf-*` classes drive a slow infinite loop (globals.css); disabled under prefers-reduced-motion.
export function KeyFlowIllustration() {
  return (
    <svg
      viewBox="0 0 480 300"
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
        {/* baseline */}
        <path d="M44 236 H452" stroke="#e0e4eb" strokeDasharray="2 8" />

        {/* Beat 1 — #credential: closed box with keyhole */}
        <g className="kf-beat kf-beat--1">
          <rect x="46" y="96" width="104" height="104" fill="#1d5f8f" fillOpacity="0.10" />
          <path d="M46 124 H150" />
          <rect x="56" y="104" width="12" height="12" fill="#cfe6ee" stroke="none" />
          <circle cx="98" cy="158" r="8" fill="#1d5f8f" stroke="none" />
          <path d="M98 160 L93 182 H103 Z" fill="#1d5f8f" stroke="none" />
        </g>

        {/* arrow 1 */}
        <g className="kf-arrow kf-arrow--1">
          <path d="M158 150 H190" />
          <path d="M182 142 L192 150 L182 158" />
        </g>

        {/* Beat 2 — #link: chip carrying a key glyph */}
        <g className="kf-beat kf-beat--2">
          <rect x="200" y="110" width="92" height="80" fill="#cfe6ee" fillOpacity="0.22" />
          <rect x="206" y="118" width="14" height="9" fill="#cfe6ee" />
          <rect x="215" y="123" width="14" height="9" fill="#cfe6ee" />
          <g className="kf-key">
            <circle cx="228" cy="156" r="11" />
            <circle cx="228" cy="156" r="3" fill="#1d5f8f" stroke="none" />
            <path d="M239 156 H276 M264 156 V168 M276 156 V166" />
          </g>
        </g>

        {/* arrow 2 */}
        <g className="kf-arrow kf-arrow--2">
          <path d="M300 150 H332" />
          <path d="M324 142 L334 150 L324 158" />
        </g>

        {/* Beat 3 — #open: device with the secret revealed as bars, open padlock above */}
        <g className="kf-beat kf-beat--3">
          <path d="M398 82 V76 a10 10 0 0 1 19 -3" />
          <rect x="392" y="82" width="22" height="15" fill="#cfe6ee" />
          <rect x="342" y="104" width="114" height="90" fill="#1d5f8f" fillOpacity="0.06" />
          <path d="M399 194 V210 M380 210 H418" />
          <rect x="358" y="122" width="82" height="11" fill="#1d5f8f" stroke="none" />
          <rect x="358" y="141" width="60" height="9" fill="#cfe6ee" stroke="none" />
          <rect x="358" y="157" width="72" height="9" fill="#cfe6ee" stroke="none" />
          <rect x="358" y="173" width="42" height="9" fill="#e0e4eb" stroke="none" />
        </g>

        {/* pixel accents */}
        <rect className="kf-dot kf-dot--1" x="168" y="196" width="6" height="6" fill="#cfe6ee" stroke="none" />
        <rect className="kf-dot kf-dot--2" x="312" y="196" width="6" height="6" fill="#cfe6ee" stroke="none" />
      </g>
    </svg>
  );
}
