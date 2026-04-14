import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { CheckCircle, ShoppingCart, Star, Shield, Zap, ArrowRight, Smartphone } from "lucide-react";
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
  variants?: ProductVariant[];
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
  },
  {
    sku: "KONEX-PREMIUM",
    name: "Premium NFC Card",
    price: "£49.99",
    priceNote: "One-time",
    description: "Brushed metal finish with laser engraving — make a lasting impression.",
    features: ["Brushed metal finish", "Laser-engraved logo", "Advanced analytics", "Priority support"],
    highlight: true,
    badge: "Most Popular",
    image: cardPremiumSilver,
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
    priceNote: "One-time",
    description: "Luxury materials, white-glove onboarding, and exclusive executive features.",
    features: ["Luxury materials", "Custom domain", "White-glove setup", "Dedicated manager"],
    highlight: false,
    badge: "Premium",
    image: cardEliteCarbon,
    variants: [
      { label: "Carbon",      image: cardEliteCarbon,     swatch: "#2a2a2a", sku: "KONEX-ELITE" },
      { label: "Gold",        image: cardEliteGold,       swatch: "#D4AF37", sku: "KONEX-ELITE-GOLD" },
      { label: "Carbon Gold", image: cardEliteCarbonGold, swatch: "#8B6914", sku: "KONEX-ELITE-CARBON-GOLD" },
    ],
  },
];

export default function CheckoutPage() {
  const preselect = new URLSearchParams(window.location.search).get("sku");

  const defaultProduct = preselect
    ? PRODUCTS.find((p) => p.sku === preselect || p.variants?.some((v) => v.sku === preselect))
    : null;

  const [selectedSku, setSelectedSku] = useState<string | null>(
    preselect && (PRODUCTS.some((p) => p.sku === preselect) || PRODUCTS.some((p) => p.variants?.some((v) => v.sku === preselect)))
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

  const selectedProduct = PRODUCTS.find((p) => p.sku === selectedSku);
  const effectiveSku = selectedSku
    ? (variantSkus[selectedSku] ?? selectedSku)
    : null;
  const selectedVariantImage = selectedProduct?.variants?.find((v) => v.sku === effectiveSku)?.image
    ?? selectedProduct?.image;

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {PRODUCTS.map((p) => {
            const isSelected = selectedSku === p.sku;
            const activeVariantSku = variantSkus[p.sku] ?? p.sku;
            const activeVariant = p.variants?.find((v) => v.sku === activeVariantSku);
            const displayImage = activeVariant?.image ?? p.image;

            return (
              <div
                key={p.sku}
                data-testid={`card-product-${p.sku}`}
                onClick={() => setSelectedSku(p.sku)}
                className="relative rounded-2xl cursor-pointer transition-all overflow-hidden"
                style={{
                  background: isSelected ? "rgba(59,130,246,0.08)" : "#1E1E28",
                  border: isSelected
                    ? "2px solid #3B82F6"
                    : p.highlight
                      ? "2px solid rgba(59,130,246,0.4)"
                      : "2px solid rgba(255,255,255,0.06)",
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
                  <div
                    className="w-full flex items-center justify-center overflow-hidden"
                    style={{
                      background: "#f8f8f8",
                      minHeight: 160,
                      padding: "16px 24px 12px",
                    }}
                  >
                    <img
                      src={displayImage}
                      alt={`${p.name}${activeVariant ? ` — ${activeVariant.label}` : ""}`}
                      style={{
                        maxHeight: 170,
                        width: "100%",
                        objectFit: "contain",
                        transition: "opacity 0.2s",
                      }}
                      data-testid={`img-product-${p.sku}`}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full flex items-center justify-center"
                    style={{ height: 160, background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.08))" }}
                  >
                    <Smartphone size={48} style={{ color: "#6366f1", opacity: 0.6 }} />
                  </div>
                )}

                {/* Variant swatches */}
                {p.variants && p.variants.length > 1 && (
                  <div
                    className="flex items-center gap-2 px-5 pt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.variants.map((v) => (
                      <button
                        key={v.sku}
                        title={v.label}
                        data-testid={`swatch-${v.sku}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSku(p.sku);
                          setVariantSkus((s) => ({ ...s, [p.sku]: v.sku }));
                        }}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: v.swatch,
                          border: activeVariantSku === v.sku ? "2px solid #fff" : "2px solid rgba(255,255,255,0.2)",
                          outline: activeVariantSku === v.sku ? "2px solid rgba(255,255,255,0.4)" : "none",
                          cursor: "pointer",
                          padding: 0,
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                      />
                    ))}
                    <span className="text-xs ml-1" style={{ color: "#9ca3af" }}>
                      {activeVariant?.label}
                    </span>
                  </div>
                )}

                {/* Card body */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold" data-testid={`text-product-name-${p.sku}`}>
                        {p.name}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
                        {p.description}
                      </p>
                    </div>
                    <div
                      className="ml-4 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: isSelected ? "#3B82F6" : "#374151",
                        background: isSelected ? "#3B82F6" : "transparent",
                      }}
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

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold" data-testid={`text-price-${p.sku}`}>
                      {p.price}
                    </span>
                    <span className="text-sm" style={{ color: "#6b7280" }}>
                      {p.priceNote}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm" style={{ color: "#6b7280" }}>
          <span className="flex items-center gap-2">
            <Shield size={14} style={{ color: "#3B82F6" }} /> Secure PayPal Checkout
          </span>
          <span className="flex items-center gap-2">
            <Star size={14} style={{ color: "#f59e0b" }} /> 5-Star Rated
          </span>
          <span className="flex items-center gap-2">
            <Zap size={14} style={{ color: "#a78bfa" }} /> Instant Digital Delivery
          </span>
        </div>

        {/* Payment area */}
        {!configured ? (
          <div
            className="text-center py-6 rounded-xl"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <p style={{ color: "#fca5a5" }}>
              Payment system is not yet configured. Please contact us to complete your order.
            </p>
          </div>
        ) : !selectedSku ? (
          <div className="text-center py-8">
            <p className="text-base mb-4" style={{ color: "#6b7280" }}>
              Select a product above to pay with PayPal
            </p>
            <ArrowRight size={20} className="mx-auto" style={{ color: "#374151" }} />
          </div>
        ) : (
          <div className="max-w-sm mx-auto">
            {/* Selected card preview */}
            {selectedVariantImage && (
              <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <img
                  src={selectedVariantImage}
                  alt={selectedProduct?.name}
                  className="rounded-lg"
                  style={{ width: 72, height: 46, objectFit: "cover", flexShrink: 0 }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{selectedProduct?.name}</p>
                  {selectedProduct?.variants && (
                    <p className="text-xs" style={{ color: "#9ca3af" }}>
                      {selectedProduct.variants.find((v) => v.sku === effectiveSku)?.label} finish
                    </p>
                  )}
                  <p className="text-sm font-bold" style={{ color: "#60a5fa" }}>{selectedProduct?.price}</p>
                </div>
              </div>
            )}

            <p className="text-center text-sm mb-4" style={{ color: "#9ca3af" }}>
              Paying for:{" "}
              <strong style={{ color: "#fff" }}>
                {selectedProduct?.name}
              </strong>
            </p>
            <PayPalButton
              sku={effectiveSku ?? selectedSku}
              clientId={clientId}
              onSuccess={handlePayPalSuccess}
              onCancel={handlePayPalCancel}
            />
          </div>
        )}

        {/* Refund policy */}
        {selectedSku && (
          <p className="text-center text-xs mt-4" style={{ color: "#6b7280" }} data-testid="text-refund-acknowledgement">
            By completing your purchase, you agree to our{" "}
            <Link href="/refund-policy" className="underline hover:text-white transition-colors" data-testid="link-refund-policy">
              Refund &amp; Return Policy
            </Link>
            .
          </p>
        )}

        <p className="text-center text-xs mt-3" style={{ color: "#4b5563" }}>
          By purchasing you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </main>

      <KonexFooter />
    </div>
  );
}
