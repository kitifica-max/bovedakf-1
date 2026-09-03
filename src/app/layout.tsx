import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Archivo, Silkscreen } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
const title = "Bóveda KF-1 — Gestor de credenciales compartidas seguro";
const description =
  "Guarda credenciales de equipo encriptadas y compártelas con links que expiran solos. Auditoría completa de accesos, sin spreadsheets ni contraseñas por chat.";

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
    "gestor de credenciales",
    "compartir contraseñas de forma segura",
    "vault de contraseñas para equipos",
    "encriptación AES-256",
    "links temporales de credenciales",
    "zero-knowledge",
  ],
  authors: [{ name: "Kitifica", url: "https://www.kitifica.com" }],
  category: "technology",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: "Bóveda KF-1",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#1d5f8f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${silkscreen.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        {/* Kitifica "App Directa" install prompt — detects the device and
            suggests installing this PWA. Suppressed automatically once
            already installed (see public/kap/kitifica-install-popup.js). */}
        <Script src="/kap/kitifica-install-popup.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
