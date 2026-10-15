// Circular seal: ring text + "KF-1". `id` must be unique per page (it names the SVG text path).
export function LogoBadge({
  id,
  size = 112,
  ink = "var(--kf-azul)",
  center = ink,
  fill,
  title,
  className,
}: {
  id: string;
  size?: number;
  ink?: string;
  center?: string;
  fill?: string;
  title?: string;
  className?: string;
}) {
  return (
    <svg width={className ? undefined : size} height={className ? undefined : size} className={className} viewBox="0 0 200 200" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <path id={id} d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
      </defs>
      {fill && <circle cx="100" cy="100" r="98" fill={fill} />}
      <text fontFamily="var(--font-montserrat), sans-serif" fontWeight={700} fontSize={15} fill={ink}>
        <textPath href={`#${id}`} textLength={472} lengthAdjust="spacing">
          · BÓVEDA KF-1 · PARA CREATIVOS · SIN CAOS{" "}
        </textPath>
      </text>
      <text x="100" y="119" textAnchor="middle" fontFamily="var(--font-barlow), sans-serif" fontWeight={800} fontSize={58} fill={center}>
        KF-1
      </text>
    </svg>
  );
}
