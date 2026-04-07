import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paypalOrderId = params.get("token") || params.get("paypalOrderId");

    if (!paypalOrderId) {
      setStatus("error");
      setErrorMsg("No payment reference found. Please contact support.");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paypalOrderId }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Capture failed");
        }

        if (data.activationToken) {
          setLocation(`/checkout/activate?token=${data.activationToken}`);
        } else if (data.alreadyCaptured) {
          setStatus("error");
          setErrorMsg("This order has already been processed. Please check your email or contact support.");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Something went wrong. Please contact support.");
      }
    })();
  }, [setLocation]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#13131A", color: "#fff" }}
    >
      <div
        className="max-w-md w-full rounded-2xl p-10 text-center"
        style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {status === "loading" ? (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 size={48} className="animate-spin" style={{ color: "#3B82F6" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Confirming your payment…</h1>
            <p style={{ color: "#9ca3af" }}>
              Please wait while we securely confirm your PayPal payment.
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <XCircle size={48} style={{ color: "#ef4444" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="mb-6" style={{ color: "#9ca3af" }}>
              {errorMsg}
            </p>
            <a
              href="/checkout"
              className="inline-block px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: "#3B82F6", color: "#fff" }}
            >
              Try Again
            </a>
          </>
        )}
      </div>
    </div>
  );
}
