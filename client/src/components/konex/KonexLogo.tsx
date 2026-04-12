import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1776024184690.jpeg";

interface KonexLogoProps {
  height?: number;
  className?: string;
}

export function KonexLogo({ height = 32, className = "" }: KonexLogoProps) {
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
        mixBlendMode: "screen",
      }}
    />
  );
}
