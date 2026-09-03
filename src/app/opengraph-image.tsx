import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 90,
          background: "#0a1f33",
          backgroundImage:
            "radial-gradient(720px circle at 88% 12%, rgba(29,95,143,0.45), transparent 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <img src={logoDataUri} width={520} height={74} alt="" />
        <div style={{ display: "flex", fontSize: 34, color: "#e0e4eb", marginTop: 36, maxWidth: 920, lineHeight: 1.4 }}>
          Credenciales de equipo encriptadas, compartidas con links que expiran solos.
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 48,
            fontSize: 24,
            color: "#7fa8c2",
          }}
        >
          <div style={{ display: "flex", width: 10, height: 10, borderRadius: 999, background: "#7fa8c2" }} />
          Encriptación AES-256-GCM · Zero-knowledge
        </div>
      </div>
    ),
    size
  );
}
