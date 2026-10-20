import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, CreditCard, Lock } from "lucide-react";
import "./paypal-fields.css";

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

const CARD_FIELD_STYLE = {
  input: {
    "font-size": "16px",
    "font-family": "system-ui, sans-serif",
    color: "#10254a",
    padding: "12px",
    border: "none",
    "box-shadow": "none",
  },
  ".invalid": { color: "#b91c1c" },
};

export function PayPalButton({ sku, clientId, onSuccess, onCancel, engravingText }: PayPalButtonProps) {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const cardNameRef = useRef<HTMLDivElement>(null);
  const cardNumberRef = useRef<HTMLDivElement>(null);
  const cardExpiryRef = useRef<HTMLDivElement>(null);
  const cardCvvRef = useRef<HTMLDivElement>(null);
  const cardFieldsRef = useRef<any>(null);
  const callbacksRef = useRef({ onSuccess, onCancel });
  callbacksRef.current = { onSuccess, onCancel };

  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cardEligible, setCardEligible] = useState(false);
  const [cardSubmitting, setCardSubmitting] = useState(false);
  const [cardError, setCardError] = useState("");

  // ── 1. Load the PayPal JS SDK (buttons + card-fields) ────────────────────
  useEffect(() => {
    if (window.paypal) {
      setSdkReady(true);
      setLoading(false);
      return;
    }

    const existingScript = document.getElementById("paypal-sdk");
    if (existingScript) {
      const onLoad = () => { setSdkReady(true); setLoading(false); };
      const onErr  = () => { setSdkError("Failed to load PayPal SDK"); setLoading(false); };
      existingScript.addEventListener("load", onLoad);
      existingScript.addEventListener("error", onErr);
      return () => {
        existingScript.removeEventListener("load", onLoad);
        existingScript.removeEventListener("error", onErr);
      };
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    // Include both buttons and card-fields components for expanded checkout
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=GBP&components=buttons,card-fields&intent=capture`;
    script.async = true;
    script.onload  = () => { setSdkReady(true); setLoading(false); };
    script.onerror = () => { setSdkError("Could not load PayPal. Check your connection and try again."); setLoading(false); };
    document.body.appendChild(script);
  }, [clientId]);

  // ── 2. Render PayPal Buttons + Card Fields once SDK is ready ──────────────
  useEffect(() => {
    if (!sdkReady || !window.paypal) return;
    if (!paypalContainerRef.current) return;

    // Shared order helpers
    const createOrderFn = async () => {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, ...(engravingText ? { engravingText } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not create order");
      return data.paypalOrderId;
    };

    const onApproveFn = async (data: { orderID: string }) => {
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paypalOrderId: data.orderID }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Payment capture failed");
      if (result.activationToken) callbacksRef.current.onSuccess(result.activationToken);
    };

    // ── PayPal / Pay Later buttons ──────────────────────────────────────────
    paypalContainerRef.current.innerHTML = "";
    const buttons = window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 48 },
        createOrder: createOrderFn,
        onApprove: onApproveFn,
        onCancel() { callbacksRef.current.onCancel?.(); },
        onError(err: unknown) {
          console.error("[paypal] button error", err);
          setSdkError("Payment was not completed. Please try again.");
        },
      });
    buttons.render(paypalContainerRef.current).catch(() => {
      setSdkError("Could not display PayPal. Please refresh and try again.");
    });

    // ── Card Fields (Debit / Credit Card) ──────────────────────────────────
    setCardEligible(false);
    setCardError("");
    const fieldContainers = [cardNameRef.current, cardNumberRef.current, cardExpiryRef.current, cardCvvRef.current];
    fieldContainers.forEach(container => container?.replaceChildren());
    if (!window.paypal.CardFields) return () => { void buttons.close?.(); };

    const cardFields = window.paypal.CardFields({
      style: CARD_FIELD_STYLE,
      createOrder: createOrderFn,
      onApprove: onApproveFn,
      onError(err: unknown) {
        console.error("[paypal] card field error", err);
        setCardError("Card payment failed. Please check your details and try again.");
        setCardSubmitting(false);
      },
    });
    cardFieldsRef.current = cardFields;

    if (cardFields.isEligible()) {
      setCardEligible(true);
      Promise.all([
        cardFields.NameField({ placeholder: "Name on card" }).render(cardNameRef.current),
        cardFields.NumberField({ placeholder: "Card number" }).render(cardNumberRef.current),
        cardFields.ExpiryField({ placeholder: "MM / YY" }).render(cardExpiryRef.current),
        cardFields.CVVField({ placeholder: "CVV" }).render(cardCvvRef.current),
      ]).catch(() => setCardError("Could not load the card fields. Please refresh or use PayPal."));
    }
    return () => {
      void buttons.close?.();
      cardFieldsRef.current = null;
      fieldContainers.forEach(container => container?.replaceChildren());
    };
  }, [sdkReady, sku, engravingText]);

  async function handleCardSubmit() {
    if (!cardFieldsRef.current || cardSubmitting) return;
    setCardError("");
    setCardSubmitting(true);
    try {
      await cardFieldsRef.current.submit();
    } catch (err: any) {
      setCardError(err?.message || "Card payment failed. Please check your details and try again.");
    } finally {
      setCardSubmitting(false);
    }
  }

  // ── Loading / Error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-4" style={{ color: "#6b7280" }}>
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Loading payment options…</span>
      </div>
    );
  }

  if (sdkError) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
        style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}
      >
        <AlertCircle size={14} className="shrink-0" />
        {sdkError}
      </div>
    );
  }

  const fieldBoxStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #b9c6da",
    borderRadius: 10,
    padding: 0,
    height: 60,
    minWidth: 0,
    overflow: "hidden",
  };

  return (
    <div className="konex-payment w-full space-y-3" data-testid="paypal-button-container">
      {/* PayPal / Pay Later buttons */}
      <div ref={paypalContainerRef} className="w-full" />

      {/* Card fields — only shown when eligible */}
      <div hidden={!cardEligible}>
          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span className="text-xs font-medium" style={{ color: "#6b7280" }}>or pay by card</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Card form */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "#f4f6fa", border: "1px solid #d4dce4" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={14} style={{ color: "#9ca3af" }} />
              <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>Debit or Credit Card</span>
            </div>

            {/* Name on card */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6b7280" }}>Name on card</label>
              <div ref={cardNameRef} style={fieldBoxStyle} data-testid="card-field-name" />
            </div>

            {/* Card number */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6b7280" }}>Card number</label>
              <div ref={cardNumberRef} style={fieldBoxStyle} data-testid="card-field-number" />
            </div>

            {/* Expiry + CVV side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#6b7280" }}>Expiry</label>
                <div ref={cardExpiryRef} style={fieldBoxStyle} data-testid="card-field-expiry" />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#6b7280" }}>CVV</label>
                <div ref={cardCvvRef} style={fieldBoxStyle} data-testid="card-field-cvv" />
              </div>
            </div>

            {/* Card error */}
            {cardError && (
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs"
                style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}
                data-testid="text-card-error"
              >
                <AlertCircle size={12} className="shrink-0" />
                {cardError}
              </div>
            )}

            {/* Pay with Card button */}
            <button
              onClick={handleCardSubmit}
              disabled={cardSubmitting}
              data-testid="button-pay-with-card"
              className="w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all"
              style={{
                height: 48,
                background: cardSubmitting ? "rgba(59,130,246,0.5)" : "#1c3a6b",
                color: "#fff",
                border: "1px solid rgba(59,130,246,0.4)",
                cursor: cardSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {cardSubmitting ? (
                <><Loader2 size={15} className="animate-spin" /> Processing…</>
              ) : (
                <><Lock size={13} /> Pay with Card</>
              )}
            </button>

            <p className="text-center text-xs" style={{ color: "#374151" }}>
              <Lock size={10} className="inline mr-1" style={{ color: "#6b7280" }} />
              Card details are handled securely by PayPal
            </p>
          </div>
      </div>
    </div>
  );
}
