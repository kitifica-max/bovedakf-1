import { platformOf } from "@/lib/platforms";

// Monoline platform marks (stroke 1.8, like the canvas). Generic shapes, not the brands' logos.
const PATHS: Record<string, React.ReactNode> = {
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" /></>,
  tiktok: <><path d="M14 3v11a4 4 0 1 1-4-4" /><path d="M14 3c.5 2.5 2.5 4.5 5 5" /></>,
  facebook: <><circle cx="12" cy="12" r="9" /><path d="M13.5 21v-8h2.5M13.5 13h-3M13.5 13v-2.5a2 2 0 0 1 2-2h1.5" /></>,
  meta_business: <path d="M3 15c0-4 2-8 4.5-8S12 12 12 12s2 5 4.5 5S21 14 21 11s-1.5-4-3-4c-2.5 0-6 5-6 5s-2.5 5-5 5S3 17 3 15z" />,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></>,
  x: <path d="M4 4l16 16M20 4L4 20" />,
  youtube: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.5v5l4.5-2.5z" /></>,
  google_ads: <><path d="M9 4l-6 11a3 3 0 0 0 5.2 3L14 7.5" /><path d="M9 4a3 3 0 0 1 5 0l6.6 11.5a3 3 0 0 1-5.2 3L9 7.5" /></>,
  email: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 8l9 6 9-6" /></>,
  other: <><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
};

export function PlatformIcon({ id, className = "h-9 w-9" }: { id: string; className?: string }) {
  const p = platformOf(id);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      style={{ color: p.color }}
      role="img"
      aria-label={p.label}
    >
      {PATHS[p.id] ?? PATHS.other}
    </svg>
  );
}
