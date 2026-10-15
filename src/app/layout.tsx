import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { IBM_Plex_Sans, Geist_Mono, Archivo, Silkscreen, Barlow_Condensed, Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { auth } from "@/lib/auth";
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

// Agencies brand: condensed display + geometric sans.
const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const title = "Bóveda KF-1 — Las contraseñas y códigos 2FA de tus clientes, ordenados";
const description =
  "La bóveda para agencias: contraseñas y códigos de verificación de las redes de cada cliente, ordenados y cifrados con AES-256. Compartí accesos con links que expiran y revocalos cuando termines.";

const ogTitle = "Chau Excel de contraseñas. La bóveda de las agencias.";
const ogDescription =
  "Contraseñas y códigos 2FA de Instagram, TikTok y más, ordenados por cliente. Cuenta gratis para tu equipo, sin suscripción: pagás solo los links que compartís.";

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
    "gestor de contraseñas para agencias",
    "contraseñas de redes sociales de clientes",
    "compartir códigos 2FA con el equipo",
    "social media password manager",
    "contraseñas para community managers",
    "compartir contraseñas de forma segura",
    "links temporales para compartir contraseñas",
    "alternativa a 1Password para agencias",
    "AES-256 compartir contraseñas",
    "auditoría de accesos a cuentas",
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
  const session = await auth();
  return (
    <html
      lang="es"
      className={`${bodySans.variable} ${geistMono.variable} ${archivo.variable} ${silkscreen.variable} ${barlow.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-kf-tinta text-sm font-bold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:inline-flex focus:min-h-11 focus:items-center focus:px-5"
        >
          Saltar al contenido
        </a>
        <Providers session={session}>{children}</Providers>
        {/* Kitifica "App Directa" install prompt — marketing pages only; the
            overlay has no dismiss control, so it must never cover auth, the
            dashboard, the shared-link viewer, or an email-link landing. */}
        <InstallPrompt />
      </body>
    </html>
  );
}
