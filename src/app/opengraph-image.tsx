import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bóveda KF-1 — Tu IA accede a tus credenciales sin exponer contraseñas";

export default function OpengraphImage() {
  const logoSvg = readFileSync(join(process.cwd(), "public/logo-on-dark.svg"), "utf-8");
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "76px 88px",
          background: "#0a1f33",
          backgroundImage:
            "radial-gradient(760px circle at 86% 14%, rgba(29,95,143,0.5), transparent 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <img src={logoDataUri} width={360} height={51} alt="" />

        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            color: "#f2f5f8",
            marginTop: 40,
            maxWidth: 960,
            lineHeight: 1.14,
            letterSpacing: -1,
          }}
        >
          Tu IA accede a tus credenciales. Sin exponer tus contraseñas.
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "#9fbdd2", marginTop: 26, maxWidth: 900 }}>
          Conectá la Skill KF-1 a Claude Code — la contraseña nunca llega al modelo.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 42,
            fontSize: 22,
            color: "#6f97b0",
            letterSpacing: 1,
          }}
        >
          <div style={{ display: "flex", width: 9, height: 9, borderRadius: 999, background: "#6f97b0" }} />
          Skill · Zero-Knowledge · Auditoría
        </div>
      </div>
    ),
    size
  );
}
