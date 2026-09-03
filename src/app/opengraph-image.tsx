import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#dfdfdf",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 32,
            background: "#1d5f8f",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              background: "#fffdf8",
              transform: "rotate(45deg)",
              borderRadius: 3,
            }}
          />
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#16130e" }}>
          Bóveda KF-1
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#57503f", marginTop: 20, maxWidth: 900 }}>
          Credenciales de equipo encriptadas, compartidas con links que expiran solos.
        </div>
      </div>
    ),
    size
  );
}
