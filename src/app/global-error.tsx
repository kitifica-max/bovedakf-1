"use client";

// Last-resort boundary for errors in the root layout itself: it replaces <html>, so no app CSS or
// fonts are guaranteed here — inline styles only, in the brand colors.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#ffffff", fontFamily: "Montserrat, Helvetica, Arial, sans-serif", color: "#1b2340" }}>
        <main style={{ maxWidth: 480, padding: 24 }}>
          <div style={{ background: "#b31f47", color: "#ffd27a", borderRadius: 40, padding: "32px 28px" }}>
            <p style={{ margin: 0, fontSize: 56, fontWeight: 800, lineHeight: 1 }}>500</p>
            <h1 style={{ margin: "12px 0 8px", fontSize: 36, lineHeight: 1.04, fontWeight: 800, textTransform: "uppercase" }}>Algo salió mal</h1>
            <p style={{ margin: 0, fontWeight: 600 }}>No pudimos cargar Bóveda KF-1. Tus datos están a salvo.</p>
          </div>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 20, minHeight: 44, padding: "0 22px", border: 0, borderRadius: 999, background: "#1f6fb2", color: "#fff", fontWeight: 800, letterSpacing: "0.12em", cursor: "pointer" }}
          >
            REINTENTAR
          </button>
        </main>
      </body>
    </html>
  );
}
