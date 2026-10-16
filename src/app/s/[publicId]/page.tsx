import type { Metadata } from "next";
import { SharedCredentialView } from "./shared-view";

// Share links carry live secrets — never index, cache, or preview-crawl them.
export const metadata: Metadata = {
  title: "Credencial compartida",
  robots: { index: false, follow: false, nocache: true },
  // Generic preview card: the link itself must never leak what it opens.
  openGraph: {
    title: "Te compartieron una credencial",
    description: "Abrila de forma segura con Bóveda KF-1. El link expira y se puede revocar.",
  },
  twitter: { card: "summary_large_image", title: "Te compartieron una credencial", description: "Abrila de forma segura con Bóveda KF-1." },
};

export default function SharedCredentialPage() {
  return <SharedCredentialView />;
}
