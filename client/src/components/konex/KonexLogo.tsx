import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1776024184690.jpeg";

interface KonexLogoProps {
  height?: number;
  className?: string;
  onLight?: boolean;
}

export function KonexLogo({ height = 32, className = "", onLight = false }: KonexLogoProps) {
  return (
    <img
      src={konexLogo}
      alt="KONEX"
      className={className}
      style={{
        height,
        width: "auto",
        display: "inline-block",
        flexShrink: 0,
        mixBlendMode: onLight ? "multiply" : "screen",
        filter: onLight ? "invert(1)" : undefined,
      }}
    />
  );
}
