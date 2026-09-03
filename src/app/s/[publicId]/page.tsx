import type { Metadata } from "next";
import { SharedCredentialView } from "./shared-view";

// Share links carry live secrets — never index, cache, or preview-crawl them.
export const metadata: Metadata = {
  title: "Credencial compartida",
  robots: { index: false, follow: false, nocache: true },
};

export default function SharedCredentialPage() {
  return <SharedCredentialView />;
}
