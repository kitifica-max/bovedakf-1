import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { IBM_Plex_Sans, Geist_Mono, Archivo, Silkscreen } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { InstallPrompt } from "@/components/install-prompt";

const bodySans = IBM_Plex_Sans({
  variable: "--font-body-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const title = "Bóveda KF-1 — Credenciales seguras para tu equipo y su agente IA";
const description =
  "La Skill KF-1 conecta Claude Code a tu bóveda. Pedile una credencial en lenguaje natural, recibís un link temporal zero-knowledge. Las contraseñas nunca salen de la bóveda.";

// Social preview leads with the team + AI agent positioning.
const ogTitle = "Credenciales seguras para tu equipo y su agente IA.";
const ogDescription =
  "La Skill KF-1 conecta Claude Code a tu bóveda sin exponer contraseñas. Tu equipo accede, audita y revoca desde el mismo lugar.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s · Bóveda KF-1" },
  description,
  applicationName: "Bóveda KF-1",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  keywords: [
    "skill claude code credenciales",
    "AI accede a contraseñas sin verlas",
    "gestor de credenciales para agentes IA",
    "zero-knowledge credential vault",
    "compartir contraseñas de forma segura",
    "encriptación AES-256",
    "links temporales de credenciales",
    "vault de contraseñas para equipos",
    "KF-1 skill",
  ],
  authors: [{ name: "Kitifica", url: "https://www.kitifica.com" }],
  category: "technology",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: "Bóveda KF-1",
    title: ogTitle,
    description: ogDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#1d5f8f",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Reading headers() opts the whole tree into dynamic rendering and is what
  // lets Next.js stamp its own inline hydration/RSC scripts with the nonce
  // middleware.ts minted for this request — required for the strict,
  // 'unsafe-inline'-free script-src in that middleware's CSP.
  await headers();
  return (
    <html
      lang="es"
      className={`${bodySans.variable} ${geistMono.variable} ${archivo.variable} ${silkscreen.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        {/* Kitifica "App Directa" install prompt — marketing pages only; the
            overlay has no dismiss control, so it must never cover auth, the
            dashboard, the shared-link viewer, or an email-link landing. */}
        <InstallPrompt />
      </body>
    </html>
  );
}
