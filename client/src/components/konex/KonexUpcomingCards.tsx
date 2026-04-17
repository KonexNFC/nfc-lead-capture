import { Cpu } from "lucide-react";
import ecoBambooImg     from "@assets/Konex_Eco_Bamboo_1776450550750.png";
import recycledSteelImg from "@assets/Konex_Recycled_Steel_1776450550748.png";

interface UpcomingCard {
  id: string;
  name: string;
  tagline: string;
  price: string;
  features: string[];
  label: string;
  labelColor: string;
  visual: React.ReactNode;
  ctaSku: string;
}

function BambooVisual() {
  return (
    <div style={{ height: 160, background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 20px" }}>
      <img src={ecoBambooImg} alt="Eco Bamboo Card" style={{ maxHeight: 140, width: "100%", objectFit: "contain" }} />
    </div>
  );
}

function RecycledSteelVisual() {
  return (
    <div style={{ height: 160, background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 20px" }}>
      <img src={recycledSteelImg} alt="Recycled Steel Card" style={{ maxHeight: 140, width: "100%", objectFit: "contain" }} />
    </div>
  );
}

function EinkVisual() {
  return (
    <div style={{
      height: 160, borderRadius: "0.75rem", overflow: "hidden",
      background: "linear-gradient(135deg, #08080f 0%, #10101e 50%, #080818 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
    }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -60%)",
        width: 80, height: 50, borderRadius: 5,
        background: "#e8e8e8",
        boxShadow: "0 0 30px rgba(100,180,255,0.4), inset 0 0 10px rgba(0,0,0,0.05)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 8, color: "#111", fontWeight: 800, letterSpacing: 0.5 }}>KONEX</div>
        <div style={{ width: 40, height: 1, background: "#ccc", margin: "3px 0" }} />
        <div style={{ fontSize: 5.5, color: "#555" }}>Dynamic Display</div>
      </div>
      <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center" }}>
        <Cpu size={12} style={{ color: "#60a5fa", display: "inline-block" }} />
        <div style={{ color: "#60a5fa", fontSize: 8.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>E-ink Display</div>
      </div>
    </div>
  );
}

const UPCOMING: UpcomingCard[] = [
  {
    id: "eco-bamboo",
    name: "Eco Bamboo",
    tagline: "Sustainable networking, without compromise.",
    price: "£34.99",
    features: ["100% sustainable bamboo", "NFC + QR code", "Laser-engraved finish", "Carbon-neutral delivery"],
    label: "Coming Soon",
    labelColor: "#4ade80",
    visual: <BambooVisual />,
    ctaSku: "KONEX-ECO-BAMBOO",
  },
  {
    id: "eco-steel",
    name: "Recycled Steel",
    tagline: "Premium recycled metal with full NFC power.",
    price: "£44.99",
    features: ["Recycled stainless steel", "NFC + QR code", "Brushed matte finish", "10-year guarantee"],
    label: "Coming Soon",
    labelColor: "#60a5fa",
    visual: <RecycledSteelVisual />,
    ctaSku: "KONEX-ECO-STEEL",
  },
  {
    id: "einк",
    name: "Next-Gen E-ink",
    tagline: "A dynamic display that updates in real time.",
    price: "£149.99",
    features: ["Dynamic e-ink display", "NFC + QR code", "Wireless charging", "App-controlled content"],
    label: "Next Gen",
    labelColor: "#f59e0b",
    visual: <EinkVisual />,
    ctaSku: "KONEX-EINК",
  },
];

export default function KonexUpcomingCards() {
  return (
    <section style={{ padding: "4rem 0", background: "rgba(255,255,255,0.01)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 999, padding: "4px 14px", marginBottom: 16,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#818cf8" }}>Coming Next</span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>The future of KONEX</h2>
          <p style={{ color: "#6b7280", maxWidth: 480, margin: "0 auto" }}>
            We're building the next generation of connected cards. Join the waitlist and be first.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
          {UPCOMING.map((card) => (
            <div
              key={card.id}
              data-testid={`card-upcoming-${card.id}`}
              style={{
                background: "#16161f",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "1.25rem",
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              {card.visual}
              <div style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0 }}>{card.name}</h3>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                    padding: "2px 8px", borderRadius: 999,
                    background: `${card.labelColor}18`,
                    color: card.labelColor,
                    border: `1px solid ${card.labelColor}40`,
                  }}>
                    {card.label}
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.75rem" }}>{card.tagline}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem", display: "flex", flexDirection: "column", gap: 6 }}>
                  {card.features.map((f) => (
                    <li key={f} style={{ fontSize: "0.75rem", color: "#9ca3af", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 14, height: 14, borderRadius: "50%", background: `${card.labelColor}20`, border: `1px solid ${card.labelColor}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: card.labelColor, display: "block" }} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>{card.price}</span>
                  <a
                    href={`/checkout?sku=${card.ctaSku}`}
                    data-testid={`button-upcoming-waitlist-${card.id}`}
                    style={{
                      fontSize: "0.75rem", fontWeight: 600, padding: "6px 14px",
                      borderRadius: 999, background: `${card.labelColor}15`,
                      color: card.labelColor, border: `1px solid ${card.labelColor}35`,
                      textDecoration: "none", transition: "all 0.15s",
                    }}
                  >
                    Join Waitlist
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
