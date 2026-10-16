import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { STAR_POINTS } from "@/components/brand/shapes";

// Social-preview cards in the brand look (flat color grounds, starbursts, Barlow Condensed + Montserrat).
// Satori can't read woff2/variable fonts, hence the static TTFs in src/assets/fonts.
export const OG_SIZE = { width: 1200, height: 630 };

const font = (file: string) => readFileSync(join(process.cwd(), "src/assets/fonts", file));

export function Star({ size, fill, children, style }: { size: number; fill: string; children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", position: "absolute", width: size, height: size, alignItems: "center", justifyContent: "center", ...style }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute", left: 0, top: 0 }}>
        <polygon points={STAR_POINTS} fill={fill} />
      </svg>
      {children}
    </div>
  );
}

export const display = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "flex",
  fontFamily: "Barlow",
  fontWeight: 800,
  textTransform: "uppercase",
  fontSize: size,
  lineHeight: 1,
  whiteSpace: "nowrap",
  color,
  ...extra,
});

export const label = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "flex",
  fontFamily: "Montserrat",
  fontWeight: 800,
  fontSize: size,
  letterSpacing: size * 0.14,
  color,
  ...extra,
});

export function ogImage(node: React.ReactElement) {
  return new ImageResponse(node, {
    ...OG_SIZE,
    fonts: [
      { name: "Barlow", data: font("BarlowCondensed-800.ttf"), weight: 800, style: "normal" },
      { name: "Montserrat", data: font("Montserrat-800.ttf"), weight: 800, style: "normal" },
    ],
  });
}
