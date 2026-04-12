import konexLogo from "@assets/IMG_9139_1775995278347.png";

// PNG is 1536×1024. Exact content bounds from pixel analysis:
//   top=374px (36.5%), bottom=584px, left=314px (20.4%), right=1142px
//   Content: 828×210px — aspect ratio 3.94:1
const PNG_W = 1536, PNG_H = 1024;
const CONTENT_TOP = 374, CONTENT_LEFT = 314;
const CONTENT_H = 210, CONTENT_W = 828;

interface KonexLogoProps {
  height?: number;
  className?: string;
}

export function KonexLogo({ height = 32, className = "" }: KonexLogoProps) {
  const scale = height / CONTENT_H;
  const imgH = PNG_H * scale;
  const imgW = PNG_W * scale;
  const containerW = CONTENT_W * scale;
  const mTop = -(CONTENT_TOP * scale);
  const mLeft = -(CONTENT_LEFT * scale);

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        flexShrink: 0,
        mixBlendMode: "screen",
      }}
    >
      <div
        style={{
          height,
          width: containerW,
          overflow: "hidden",
          background: "#000",
          isolation: "isolate",
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
          }}
        />
      </div>
    </div>
  );
}
