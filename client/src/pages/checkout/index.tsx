import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { CheckCircle, ShoppingCart, Star, Shield, Zap, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import KonexNav from "@/components/konex/KonexNav";
import KonexFooter from "@/components/konex/KonexFooter";
import { PayPalButton } from "@/components/PayPalButton";

const PRODUCTS = [
  {
    sku: "KONEX-DIGITAL",
    name: "Digital Profile",
    price: "£9.99",
    priceNote: "One-time",
    description: "Your professional digital identity online, shareable via link or QR code.",
    features: ["Custom profile URL", "Lead capture form", "Analytics dashboard", "Unlimited updates"],
    highlight: false,
    badge: null,
  },
  {
    sku: "KONEX-BASIC",
    name: "Basic NFC Card",
    price: "£19.99",
    priceNote: "One-time",
    description: "A clean, professional NFC card that shares your profile with a single tap.",
    features: ["NFC + QR code", "Matte finish", "Custom profile URL", "Works on iPhone & Android"],
    highlight: false,
    badge: null,
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
  },
];

export default function CheckoutPage() {
  const preselect = new URLSearchParams(window.location.search).get("sku");
  const [selectedSku, setSelectedSku] = useState<string | null>(
    preselect && PRODUCTS.some((p) => p.sku === preselect) ? preselect : null,
  );
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: paypalConfig } = useQuery({
    queryKey: ["/api/config/paypal"],
  });

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

  return (
    <div className="min-h-screen" style={{ background: "#13131A", color: "#fff" }}>
      <KonexNav variant="overview" />

      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{
              background: "rgba(59,130,246,0.15)",
              color: "#60a5fa",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
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
            return (
              <div
                key={p.sku}
                data-testid={`card-product-${p.sku}`}
                onClick={() => setSelectedSku(p.sku)}
                className="relative rounded-2xl p-6 cursor-pointer transition-all"
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
                    className="absolute -top-3 left-4 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: p.highlight ? "#3B82F6" : "#6366f1", color: "#fff" }}
                    data-testid={`badge-${p.sku}`}
                  >
                    {p.badge}
                  </span>
                )}

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
            <p className="text-center text-sm mb-4" style={{ color: "#9ca3af" }}>
              Paying for:{" "}
              <strong style={{ color: "#fff" }}>
                {PRODUCTS.find((p) => p.sku === selectedSku)?.name}
              </strong>
            </p>
            <PayPalButton
              sku={selectedSku}
              clientId={clientId}
              onSuccess={handlePayPalSuccess}
              onCancel={handlePayPalCancel}
            />
          </div>
        )}

        <p className="text-center text-xs mt-8" style={{ color: "#4b5563" }}>
          By purchasing you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </main>

      <KonexFooter />
    </div>
  );
}
