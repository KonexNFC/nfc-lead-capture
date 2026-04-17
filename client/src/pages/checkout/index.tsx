import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import {
  CheckCircle, ShoppingCart, Star, Shield, Zap, ArrowRight,
  Smartphone, Cpu, PenLine, Bell,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import KonexNav from "@/components/konex/KonexNav";
import KonexFooter from "@/components/konex/KonexFooter";
import { PayPalButton } from "@/components/PayPalButton";
import cardBasicImg      from "@assets/Konex_Basic_Card_1776031961806.png";
import cardPremiumSilver from "@assets/Konex_Premium_Card_1776031961806.png";
import cardPremiumBlack  from "@assets/Konex_Premium_Black_Card_1776031961806.png";
import cardPremiumCopper from "@assets/Konex_Premium_Card_Cooper_1776031961807.png";
import cardEliteCarbon   from "@assets/Konex_Elite_Card_1776031961806.png";
import cardEliteGold     from "@assets/Konex_Elite_Gold_Card_1776031961805.png";
import cardEliteCarbonGold from "@assets/ChatGPT_Image_Apr_12,_2026,_11_10_59_PM_1776031961801.png";
import cardEcoBamboo     from "@assets/Konex_Eco_Bamboo_1776450550750.png";
import cardRecycledSteel from "@assets/Konex_Recycled_Steel_1776450550748.png";

interface ProductVariant { label: string; image: string; swatch: string; sku: string }
interface Product {
  sku: string;
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  highlight: boolean;
  badge: string | null;
  image: string | null;
  comingSoon?: boolean;
  comingSoonLabel?: string;
  preOrder?: boolean;
  variants?: ProductVariant[];
  allowEngraving?: boolean;
}

const PRODUCTS: Product[] = [
  {
    sku: "KONEX-DIGITAL",
    name: "Digital Profile",
    price: "£9.99",
    priceNote: "One-time",
    description: "Your professional digital identity online, shareable via link or QR code.",
    features: ["Custom profile URL", "Lead capture form", "Analytics dashboard", "Unlimited updates"],
    highlight: false,
    badge: null,
    image: null,
    allowEngraving: false,
  },
  {
    sku: "KONEX-BASIC",
    name: "Basic NFC Card",
    price: "£19.99",
    priceNote: "One-time",
    description: "A clean, professional NFC card that shares your profile with a single tap.",
    features: ["NFC + QR code", "Matte black finish", "Custom profile URL", "Works on iPhone & Android"],
    highlight: false,
    badge: null,
    image: cardBasicImg,
    allowEngraving: true,
  },
  {
    sku: "KONEX-PREMIUM",
    name: "Premium NFC Card",
    price: "£49.99",
    priceNote: "Pre-order",
    description: "Brushed metal finish with laser engraving — make a lasting impression.",
    features: ["Brushed metal finish", "Laser-engraved logo", "Advanced analytics", "Priority support"],
    highlight: true,
    badge: "Most Popular",
    image: cardPremiumSilver,
    allowEngraving: true,
    preOrder: true,
    variants: [
      { label: "Silver",  image: cardPremiumSilver, swatch: "#C0C0C0", sku: "KONEX-PREMIUM" },
      { label: "Black",   image: cardPremiumBlack,  swatch: "#1a1a1a", sku: "KONEX-PREMIUM-BLACK" },
      { label: "Copper",  image: cardPremiumCopper, swatch: "#B87333", sku: "KONEX-PREMIUM-COPPER" },
    ],
  },
  {
    sku: "KONEX-ELITE",
    name: "Elite NFC Card",
    price: "£79.99",
    priceNote: "Pre-order",
    description: "Luxury materials, white-glove onboarding, and exclusive executive features.",
    features: ["Luxury materials", "Custom domain", "White-glove setup", "Dedicated manager"],
    highlight: false,
    badge: "Premium",
    image: cardEliteCarbon,
    allowEngraving: true,
    preOrder: true,
    variants: [
      { label: "Carbon",      image: cardEliteCarbon,     swatch: "#2a2a2a", sku: "KONEX-ELITE" },
      { label: "Gold",        image: cardEliteGold,       swatch: "#D4AF37", sku: "KONEX-ELITE-GOLD" },
      { label: "Carbon Gold", image: cardEliteCarbonGold, swatch: "#8B6914", sku: "KONEX-ELITE-CARBON-GOLD" },
    ],
  },
];

const COMING_SOON: Product[] = [
  {
    sku: "KONEX-ECO-BAMBOO",
    name: "Eco Bamboo Card",
    price: "£34.99",
    priceNote: "Pre-order",
    description: "Crafted from sustainable bamboo. Same NFC power, zero guilt — for the conscious professional.",
    features: ["100% sustainable bamboo", "NFC + QR code", "Laser-engraved finish", "Carbon-neutral delivery"],
    highlight: false,
    badge: "Coming Soon",
    image: null,
    comingSoon: true,
    comingSoonLabel: "Eco Bamboo",
    allowEngraving: false,
  },
  {
    sku: "KONEX-ECO-STEEL",
    name: "Recycled Steel Card",
    price: "£44.99",
    priceNote: "Pre-order",
    description: "Premium recycled stainless steel with full NFC capability. Durable, sustainable, and built to last.",
    features: ["Recycled stainless steel", "NFC + QR code", "Brushed matte finish", "10-year durability guarantee"],
    highlight: false,
    badge: "Coming Soon",
    image: null,
    comingSoon: true,
    comingSoonLabel: "Recycled Steel",
    allowEngraving: false,
  },
  {
    sku: "KONEX-EINК",
    name: "Next-Gen E-ink Card",
    price: "£149.99",
    priceNote: "Pre-order",
    description: "A world-first: an NFC card with a dynamic e-ink display that updates your details in real time.",
    features: ["Dynamic e-ink display", "NFC + QR code", "Wireless charging", "App-controlled content"],
    highlight: true,
    badge: "Next Gen",
    image: null,
    comingSoon: true,
    comingSoonLabel: "E-ink",
    allowEngraving: false,
  },
];

function ComingSoonCardVisual({ product }: { product: Product }) {
  if (product.sku === "KONEX-ECO-BAMBOO") {
    return (
      <div style={{ width: "100%", height: 160, background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 20px" }}>
        <img src={cardEcoBamboo} alt="Eco Bamboo Card" style={{ maxHeight: 140, width: "100%", objectFit: "contain" }} />
      </div>
    );
  }

  if (product.sku === "KONEX-ECO-STEEL") {
    return (
      <div style={{ width: "100%", height: 160, background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 20px" }}>
        <img src={cardRecycledSteel} alt="Recycled Steel Card" style={{ maxHeight: 140, width: "100%", objectFit: "contain" }} />
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", height: 160,
      background: "linear-gradient(135deg, #0a0a0f 0%, #12121f 50%, #0a0a18 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 90, height: 56, borderRadius: 6, background: "#e8e8e8",
        border: "1px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 30px rgba(100,180,255,0.3), inset 0 0 12px rgba(0,0,0,0.05)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 8, color: "#333", fontWeight: 700, letterSpacing: 0.5 }}>KONEX</div>
          <div style={{ fontSize: 6, color: "#666", marginTop: 2 }}>Dynamic Display</div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center", zIndex: 1 }}>
        <Cpu size={14} style={{ color: "#60a5fa", display: "inline-block" }} />
        <div style={{ color: "#60a5fa", fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>E-ink Display</div>
      </div>
    </div>
  );
}

function WaitlistForm({ product, onDone }: { product: Product; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product: product.name }),
      });
      setSubmitted(true);
      toast({ title: "You're on the list!", description: `We'll notify you when ${product.name} launches.` });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <CheckCircle size={32} className="mx-auto mb-3" style={{ color: "#22c55e" }} />
        <p className="font-semibold text-white mb-1">You're on the waitlist!</p>
        <p className="text-sm" style={{ color: "#9ca3af" }}>We'll email you the moment {product.name} launches.</p>
        <button onClick={onDone} className="mt-4 text-sm underline" style={{ color: "#60a5fa" }}>Back to products</button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <Bell size={20} style={{ color: "#f59e0b", flexShrink: 0 }} />
        <div>
          <p className="text-sm font-semibold text-white">{product.name}</p>
          <p className="text-xs" style={{ color: "#9ca3af" }}>Join the waitlist — be first to know when it launches</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="input-waitlist-email"
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.1)" }}
        />
        <button
          type="submit"
          disabled={submitting}
          data-testid="button-waitlist-submit"
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
          style={{ background: "#3B82F6", color: "#fff", opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? "Joining…" : "Notify Me When Available"}
        </button>
      </form>
      <p className="text-center text-xs mt-3" style={{ color: "#4b5563" }}>No spam. Unsubscribe anytime.</p>
    </div>
  );
}

export default function CheckoutPage() {
  const preselect = new URLSearchParams(window.location.search).get("sku");
  const allProducts = [...PRODUCTS, ...COMING_SOON];

  const defaultProduct = preselect
    ? allProducts.find((p) => p.sku === preselect || p.variants?.some((v) => v.sku === preselect))
    : null;

  const [selectedSku, setSelectedSku] = useState<string | null>(
    preselect && allProducts.some((p) => p.sku === preselect || p.variants?.some((v) => v.sku === preselect))
      ? (defaultProduct?.sku ?? null)
      : null
  );
  const [variantSkus, setVariantSkus] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    PRODUCTS.forEach((p) => {
      if (p.variants) {
        const match = preselect && p.variants.find((v) => v.sku === preselect);
        init[p.sku] = match ? match.sku : p.variants[0].sku;
      }
    });
    return init;
  });

  const [engravingName, setEngravingName] = useState("");
  const [engravingTitle, setEngravingTitle] = useState("");
  const [waitlistProduct, setWaitlistProduct] = useState<Product | null>(null);

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: paypalConfig } = useQuery({ queryKey: ["/api/config/paypal"] });
  const config = paypalConfig as any;
  const configured: boolean = config?.configured ?? false;
  const clientId: string = config?.clientId ?? "";

  function handlePayPalSuccess(activationToken: string) {
    setLocation(`/checkout/activate?token=${activationToken}`);
  }

  function handlePayPalCancel() {
    toast({
      title: "Payment cancelled",
      description: "No charge was made. Choose a product and try again whenever you're ready.",
    });
  }

  const selectedProduct = allProducts.find((p) => p.sku === selectedSku);
  const effectiveSku = selectedSku ? (variantSkus[selectedSku] ?? selectedSku) : null;
  const selectedVariantImage = selectedProduct?.variants?.find((v) => v.sku === effectiveSku)?.image ?? selectedProduct?.image;
  const isPhysicalCard = selectedProduct?.allowEngraving === true;
  const engravingText = [engravingName.trim(), engravingTitle.trim()].filter(Boolean).join(" | ");

  const isComingSoon = selectedProduct?.comingSoon === true;
  const isPreOrder = selectedProduct?.preOrder === true;

  return (
    <div className="min-h-screen" style={{ background: "#13131A", color: "#fff" }}>
      <KonexNav variant="overview" />

      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}
          >
            <ShoppingCart size={12} /> Secure Checkout
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Choose your KONEX</h1>
          <p style={{ color: "#9ca3af" }}>One-time purchase. No subscription. Delivered to your door.</p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {PRODUCTS.map((p) => {
            const isSelected = selectedSku === p.sku;
            const activeVariantSku = variantSkus[p.sku] ?? p.sku;
            const activeVariant = p.variants?.find((v) => v.sku === activeVariantSku);
            const displayImage = activeVariant?.image ?? p.image;

            return (
              <div
                key={p.sku}
                data-testid={`card-product-${p.sku}`}
                onClick={() => { setSelectedSku(p.sku); setWaitlistProduct(null); }}
                className="relative rounded-2xl cursor-pointer transition-all overflow-hidden"
                style={{
                  background: isSelected ? "rgba(59,130,246,0.08)" : "#1E1E28",
                  border: isSelected ? "2px solid #3B82F6" : p.highlight ? "2px solid rgba(59,130,246,0.4)" : "2px solid rgba(255,255,255,0.06)",
                  boxShadow: isSelected ? "0 0 0 3px rgba(59,130,246,0.15)" : undefined,
                }}
              >
                {p.badge && (
                  <span
                    className="absolute top-3 left-4 text-xs font-semibold px-3 py-1 rounded-full z-10"
                    style={{ background: p.highlight ? "#3B82F6" : "#6366f1", color: "#fff" }}
                    data-testid={`badge-${p.sku}`}
                  >
                    {p.badge}
                  </span>
                )}

                {/* Card image */}
                {displayImage ? (
                  <div className="w-full flex items-center justify-center overflow-hidden" style={{ background: "#f8f8f8", minHeight: 160, padding: "16px 24px 12px" }}>
                    <img
                      src={displayImage}
                      alt={`${p.name}${activeVariant ? ` — ${activeVariant.label}` : ""}`}
                      style={{ maxHeight: 170, width: "100%", objectFit: "contain", transition: "opacity 0.2s" }}
                      data-testid={`img-product-${p.sku}`}
                    />
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center" style={{ height: 160, background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.08))" }}>
                    <Smartphone size={48} style={{ color: "#6366f1", opacity: 0.6 }} />
                  </div>
                )}

                {/* Variant swatches */}
                {p.variants && p.variants.length > 1 && (
                  <div className="flex items-center gap-2 px-5 pt-3" onClick={(e) => e.stopPropagation()}>
                    {p.variants.map((v) => (
                      <button
                        key={v.sku}
                        title={v.label}
                        data-testid={`swatch-${v.sku}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSku(p.sku);
                          setVariantSkus((s) => ({ ...s, [p.sku]: v.sku }));
                          setWaitlistProduct(null);
                        }}
                        style={{
                          width: 18, height: 18, borderRadius: "50%", background: v.swatch,
                          border: (variantSkus[p.sku] ?? p.sku) === v.sku ? "2px solid #fff" : "2px solid rgba(255,255,255,0.2)",
                          outline: (variantSkus[p.sku] ?? p.sku) === v.sku ? "2px solid rgba(255,255,255,0.4)" : "none",
                          cursor: "pointer", padding: 0, flexShrink: 0, transition: "all 0.15s",
                        }}
                      />
                    ))}
                    <span className="text-xs ml-1" style={{ color: "#9ca3af" }}>{activeVariant?.label}</span>
                  </div>
                )}

                {/* Card body */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold" data-testid={`text-product-name-${p.sku}`}>{p.name}</h3>
                      <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>{p.description}</p>
                    </div>
                    <div
                      className="ml-4 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: isSelected ? "#3B82F6" : "#374151", background: isSelected ? "#3B82F6" : "transparent" }}
                      data-testid={`radio-${p.sku}`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#d1d5db" }}>
                        <CheckCircle size={13} style={{ color: "#3B82F6", flexShrink: 0 }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center flex-wrap gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold" data-testid={`text-price-${p.sku}`}>{p.price}</span>
                      <span className="text-sm" style={{ color: "#6b7280" }}>{p.priceNote}</span>
                    </div>
                    {p.preOrder && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}
                        data-testid={`badge-preorder-${p.sku}`}
                      >
                        Pre-order
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming soon row */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6b7280" }}>Coming Soon</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COMING_SOON.map((p) => {
              const isSelected = selectedSku === p.sku;
              return (
                <div
                  key={p.sku}
                  data-testid={`card-product-${p.sku}`}
                  onClick={() => { setSelectedSku(p.sku); setWaitlistProduct(null); }}
                  className="relative rounded-2xl cursor-pointer transition-all overflow-hidden"
                  style={{
                    background: isSelected ? "rgba(245,158,11,0.06)" : "#1A1A22",
                    border: isSelected ? "2px solid rgba(245,158,11,0.6)" : "2px solid rgba(255,255,255,0.05)",
                    boxShadow: isSelected ? "0 0 0 3px rgba(245,158,11,0.1)" : undefined,
                  }}
                >
                  <span
                    className="absolute top-2 left-3 text-xs font-semibold px-2.5 py-0.5 rounded-full z-10"
                    style={{ background: p.highlight ? "rgba(245,158,11,0.2)" : "rgba(107,114,128,0.3)", color: p.highlight ? "#f59e0b" : "#9ca3af", border: `1px solid ${p.highlight ? "rgba(245,158,11,0.3)" : "rgba(107,114,128,0.3)"}` }}
                    data-testid={`badge-${p.sku}`}
                  >
                    {p.badge}
                  </span>
                  <ComingSoonCardVisual product={p} />
                  <div className="p-4">
                    <h3 className="text-base font-bold mb-1" data-testid={`text-product-name-${p.sku}`}>{p.name}</h3>
                    <p className="text-xs mb-3" style={{ color: "#6b7280" }}>{p.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold" data-testid={`text-price-${p.sku}`}>{p.price}</span>
                      <span className="text-xs" style={{ color: "#6b7280" }}>{p.priceNote}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Engraving field for physical cards */}
        {isPhysicalCard && selectedSku && !isComingSoon && (
          <div
            className="mb-6 p-5 rounded-2xl"
            style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.08)" }}
            data-testid="section-engraving"
          >
            <div className="flex items-center gap-2 mb-4">
              <PenLine size={16} style={{ color: "#a78bfa" }} />
              <span className="text-sm font-semibold text-white">Custom Engraving</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>Optional</span>
            </div>
            <p className="text-xs mb-4" style={{ color: "#6b7280" }}>
              Add your name and/or title to be laser-engraved on your card. Leave blank to skip.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#9ca3af" }}>Name to engrave</label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="e.g. Alex Rivera"
                  value={engravingName}
                  onChange={(e) => setEngravingName(e.target.value)}
                  data-testid="input-engraving-name"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-purple-500/50"
                  style={{ background: "#13131A", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <p className="text-right text-xs mt-1" style={{ color: "#374151" }}>{engravingName.length}/30</p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#9ca3af" }}>Title / Position</label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="e.g. Product Designer"
                  value={engravingTitle}
                  onChange={(e) => setEngravingTitle(e.target.value)}
                  data-testid="input-engraving-title"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-purple-500/50"
                  style={{ background: "#13131A", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <p className="text-right text-xs mt-1" style={{ color: "#374151" }}>{engravingTitle.length}/30</p>
              </div>
            </div>
            {engravingText && (
              <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)", color: "#c4b5fd" }}>
                Preview: <strong>{engravingText}</strong>
              </div>
            )}
          </div>
        )}

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm" style={{ color: "#6b7280" }}>
          <span className="flex items-center gap-2"><Shield size={14} style={{ color: "#3B82F6" }} /> Secure PayPal Checkout</span>
          <span className="flex items-center gap-2"><Star size={14} style={{ color: "#f59e0b" }} /> 5-Star Rated</span>
          <span className="flex items-center gap-2"><Zap size={14} style={{ color: "#a78bfa" }} /> Instant Digital Delivery</span>
        </div>

        {/* Payment area */}
        {!selectedSku ? (
          <div className="text-center py-8">
            <p className="text-base mb-4" style={{ color: "#6b7280" }}>Select a product above to continue</p>
            <ArrowRight size={20} className="mx-auto" style={{ color: "#374151" }} />
          </div>
        ) : isComingSoon ? (
          waitlistProduct?.sku === selectedSku ? (
            <WaitlistForm product={selectedProduct!} onDone={() => { setWaitlistProduct(null); setSelectedSku(null); }} />
          ) : (
            <div className="max-w-sm mx-auto text-center">
              <div className="mb-4 p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <p className="text-sm font-semibold" style={{ color: "#f59e0b" }}>{selectedProduct?.name}</p>
                <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>This product is not yet available for purchase.</p>
              </div>
              <button
                onClick={() => setWaitlistProduct(selectedProduct!)}
                data-testid="button-join-waitlist"
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}
              >
                <Bell size={14} className="inline mr-2" />
                Join Waitlist — Be First to Know
              </button>
            </div>
          )
        ) : !configured ? (
          <div className="text-center py-6 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <p style={{ color: "#fca5a5" }}>Payment system is not yet configured. Please contact us to complete your order.</p>
          </div>
        ) : (
          <div className="max-w-sm mx-auto">
            {selectedVariantImage && (
              <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <img src={selectedVariantImage} alt={selectedProduct?.name} className="rounded-lg" style={{ width: 72, height: 46, objectFit: "cover", flexShrink: 0 }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{selectedProduct?.name}</p>
                  {selectedProduct?.variants && (
                    <p className="text-xs" style={{ color: "#9ca3af" }}>
                      {selectedProduct.variants.find((v) => v.sku === effectiveSku)?.label} finish
                    </p>
                  )}
                  {engravingText && <p className="text-xs mt-0.5" style={{ color: "#a78bfa" }}>Engraving: {engravingText}</p>}
                  <p className="text-sm font-bold" style={{ color: "#60a5fa" }}>{selectedProduct?.price}</p>
                </div>
              </div>
            )}
            <p className="text-center text-sm mb-4" style={{ color: "#9ca3af" }}>
              Paying for: <strong style={{ color: "#fff" }}>{selectedProduct?.name}</strong>
            </p>
            {isPreOrder && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm flex items-start gap-2"
                style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}
                data-testid="notice-preorder"
              >
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>⏳</span>
                <span>
                  <strong>Pre-order:</strong> Pay securely today — your card ships within <strong>4–6 weeks</strong> once production is complete.
                </span>
              </div>
            )}
            <PayPalButton
              sku={effectiveSku ?? selectedSku}
              clientId={clientId}
              onSuccess={handlePayPalSuccess}
              onCancel={handlePayPalCancel}
              engravingText={engravingText || undefined}
            />
          </div>
        )}

        {selectedSku && !isComingSoon && (
          <p className="text-center text-xs mt-4" style={{ color: "#6b7280" }} data-testid="text-refund-acknowledgement">
            By completing your purchase, you agree to our{" "}
            <Link href="/refund-policy" className="underline hover:text-white transition-colors" data-testid="link-refund-policy">
              Refund &amp; Return Policy
            </Link>.
          </p>
        )}

        <p className="text-center text-xs mt-3" style={{ color: "#4b5563" }}>
          By purchasing you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link>{" "}
          and <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </main>

      <KonexFooter />
    </div>
  );
}
