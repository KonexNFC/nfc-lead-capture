import konexLogo from "@assets/IMG_9139_1775997952970.png";

// PNG is 1536×1024. Content measured from pixel analysis:
//   Logo mark spans: top=374, bottom=584, left=314, right=1142
//   Crop is tight to exact content bounds for maximum sharpness at small sizes.
//   CROP_LEFT=200 gives a 114px safety buffer left of the K icon (starts at 314).
//   mix-blend-mode: screen removes the black background, so no vertical padding needed.
const PNG_W = 1536, PNG_H = 1024;
const CROP_TOP = 374;
const CROP_H = 210;  // exact content height → tighter scale → sharper rendering
const CROP_LEFT = 200;
const CROP_W = 942; // 200 → 1142

interface KonexLogoProps {
  height?: number;
  className?: string;
}

export function KonexLogo({ height = 32, className = "" }: KonexLogoProps) {
  const scale = height / CROP_H;
  const imgH = Math.round(PNG_H * scale);
  const imgW = Math.round(PNG_W * scale);
  const containerW = Math.round(CROP_W * scale);
  const mTop = Math.round(-(CROP_TOP * scale));
  const mLeft = Math.round(-(CROP_LEFT * scale));

  return (
    <div
      className={className}
      style={{
        height,
        width: containerW,
        overflow: "hidden",
        flexShrink: 0,
        display: "inline-block",
        lineHeight: 0,
      }}
    >
      <img
        src={konexLogo}
        alt="KONEX"
        style={{
          height: imgH,
          width: imgW,
          marginTop: mTop,
          marginLeft: mLeft,
          display: "block",
          mixBlendMode: "screen",
          flexShrink: 0,
        }}
      />
    </div>
  );
}
