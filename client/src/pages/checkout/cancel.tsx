import { Link } from "wouter";
import { XCircle, ArrowLeft } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#13131A", color: "#fff" }}
    >
      <div
        className="max-w-md w-full rounded-2xl p-10 text-center"
        style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex justify-center mb-6">
          <XCircle size={48} style={{ color: "#f59e0b" }} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="mb-8" style={{ color: "#9ca3af" }}>
          No worries — your payment was cancelled and you haven't been charged.
          Come back whenever you're ready.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/checkout"
            data-testid="link-try-again"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: "#3B82F6", color: "#fff" }}
          >
            Try Again
          </Link>
          <Link
            href="/"
            data-testid="link-home"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: "rgba(255,255,255,0.06)", color: "#d1d5db" }}
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
