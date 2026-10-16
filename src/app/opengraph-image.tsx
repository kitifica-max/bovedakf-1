import { OG_SIZE, Star, display, label, ogImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Bóveda KF-1 — Chau Excel de contraseñas. La bóveda de las agencias.";

export default function OpengraphImage() {
  return ogImage(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#b31f47" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 26, padding: "0 0 0 72px", width: 740 }}>
        <div style={label(22, "#ffd27a")}>BÓVEDA KF-1</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={display(100, "#ffffff")}>Chau Excel</div>
          <div style={display(100, "#ffd27a")}>de contraseñas</div>
        </div>
        <div style={label(21, "#ffffff", { lineHeight: 1.5, maxWidth: 560, fontSize: 19 })}>CONTRASEÑAS Y CÓDIGOS 2FA DE CADA RED, ORDENADOS POR CLIENTE.</div>
        <div style={{ display: "flex", gap: 14 }}>
          <div style={label(17, "#a81b42", { background: "#ffd27a", borderRadius: 999, padding: "14px 26px" })}>SIN SUSCRIPCIÓN</div>
          <div style={label(17, "#ffd27a", { border: "3px solid #ffd27a", borderRadius: 999, padding: "11px 26px" })}>CÓDIGOS 2FA</div>
        </div>
      </div>

      <div style={{ display: "flex", position: "absolute", left: 760, top: 0, width: 440, height: 630, background: "#ffd27a" }} />
      <Star size={330} fill="#f1d3e3" style={{ left: 820, top: 36 }}>
        <div style={display(132, "#1b5a93")}>PA</div>
      </Star>
      <Star size={250} fill="#b9e35a" style={{ left: 790, top: 360 }}>
        <div style={display(100, "#0b4a31")}>CA</div>
      </Star>
      <Star size={210} fill="#b31f47" style={{ left: 985, top: 375 }}>
        <div style={display(80, "#ffd27a")}>2FA</div>
      </Star>
    </div>,
  );
}
