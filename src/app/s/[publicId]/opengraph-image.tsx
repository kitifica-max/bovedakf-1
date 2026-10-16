import { OG_SIZE, Star, display, label, ogImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Te compartieron una credencial con Bóveda KF-1";

// Generic on purpose: a share link's preview must never reveal what it unlocks.
export default function SharedOpengraphImage() {
  return ogImage(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0b6845" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 26, padding: "0 0 0 72px", width: 760 }}>
        <div style={label(22, "#b9e35a")}>BÓVEDA KF-1</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={display(84, "#ffffff")}>Te compartieron</div>
          <div style={display(84, "#b9e35a")}>una credencial</div>
        </div>
        <div style={label(21, "#ffffff", { lineHeight: 1.5, maxWidth: 580, fontSize: 19 })}>ABRILA DE FORMA SEGURA. EL LINK EXPIRA Y SE PUEDE REVOCAR.</div>
        <div style={{ display: "flex", gap: 14 }}>
          <div style={label(17, "#0b4a31", { background: "#b9e35a", borderRadius: 999, padding: "14px 26px" })}>CIFRADO AES-256</div>
          <div style={label(17, "#b9e35a", { border: "3px solid #b9e35a", borderRadius: 999, padding: "11px 26px" })}>SIN CUENTA</div>
        </div>
      </div>

      <Star size={380} fill="#b9e35a" style={{ left: 770, top: 130 }}>
        <svg width="190" height="190" viewBox="0 0 24 24" fill="none" stroke="#0b4a31" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="11" width="14" height="10" rx="2.5" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </Star>
      <Star size={150} fill="#ffd27a" style={{ left: 1040, top: 50 }} />
      <Star size={110} fill="#f1d3e3" style={{ left: 760, top: 470 }} />
    </div>,
  );
}
