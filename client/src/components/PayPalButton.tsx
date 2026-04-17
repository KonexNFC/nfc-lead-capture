import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    paypal: any;
  }
}

interface PayPalButtonProps {
  sku: string;
  clientId: string;
  onSuccess: (activationToken: string) => void;
  onCancel?: () => void;
  engravingText?: string;
}

export function PayPalButton({ sku, clientId, onSuccess, onCancel, engravingText }: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load the PayPal JS SDK once
  useEffect(() => {
    if (window.paypal) {
      setSdkReady(true);
      setLoading(false);
      return;
    }

    const existingScript = document.getElementById("paypal-sdk");
    if (existingScript) {
      existingScript.addEventListener("load", () => { setSdkReady(true); setLoading(false); });
      existingScript.addEventListener("error", () => { setSdkError("Failed to load PayPal SDK"); setLoading(false); });
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=GBP&components=buttons&intent=capture`;
    script.async = true;
    script.onload = () => { setSdkReady(true); setLoading(false); };
    script.onerror = () => { setSdkError("Could not load PayPal. Check your connection and try again."); setLoading(false); };
    document.body.appendChild(script);
  }, [clientId]);

  // Render PayPal Buttons once SDK is ready
  useEffect(() => {
    if (!sdkReady || !containerRef.current || !window.paypal) return;

    containerRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
          height: 48,
        },

        async createOrder() {
          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sku, ...(engravingText ? { engravingText } : {}) }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Could not create order");
          return data.paypalOrderId;
        },

        async onApprove(data: { orderID: string }) {
          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paypalOrderId: data.orderID }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message || "Payment capture failed");
          if (result.activationToken) {
            onSuccess(result.activationToken);
          }
        },

        onCancel() {
          onCancel?.();
        },

        onError(err: unknown) {
          console.error("[paypal] button error", err);
          setSdkError("Payment was not completed. Please try again.");
        },
      })
      .render(containerRef.current);
  }, [sdkReady, sku, onSuccess, onCancel]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-4" style={{ color: "#6b7280" }}>
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Loading PayPal…</span>
      </div>
    );
  }

  if (sdkError) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
        style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
        <AlertCircle size={14} className="shrink-0" />
        {sdkError}
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" data-testid="paypal-button-container" />;
}
