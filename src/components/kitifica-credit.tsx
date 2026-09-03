export function KitificaCredit({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://www.kitifica.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-xs text-ink-soft transition hover:text-ink ${className}`}
    >
      Un producto de
      {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, not photographic content */}
      <img src="/logo_kitifica_2.svg" alt="Kitifica" className="h-3.5 w-auto" />
    </a>
  );
}
