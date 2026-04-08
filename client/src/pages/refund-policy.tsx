import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, Mail, AlertCircle, CheckCircle2, Clock, CreditCard } from "lucide-react";
import KonexNav from "@/components/konex/KonexNav";
import KonexFooter from "@/components/konex/KonexFooter";

const sections = [
  {
    id: "non-refundable",
    icon: AlertCircle,
    iconColor: "#f87171",
    title: "Non-Refundable Situations",
    intro: "Refunds will not be provided in the following cases:",
    items: [
      "The eSIM has been activated, installed, or scanned",
      "Any data usage has occurred, whether partial or full",
      "The customer selected the wrong destination, duration, or plan",
      "The customer's device is not eSIM-compatible",
      "The purchase was made by mistake or the customer changed their mind after delivery",
    ],
  },
  {
    id: "eligible",
    icon: CheckCircle2,
    iconColor: "#34d399",
    title: "Eligible Refund Situations",
    intro: "A refund may be considered only if:",
    items: [
      "The eSIM has not been activated, installed, or used",
      "The QR code or activation details were not successfully delivered",
      "There is a verified technical issue that prevents activation or normal use",
      "The service delivered was materially different from what was purchased",
    ],
  },
];

const prose: { icon: typeof Shield; iconColor: string; title: string; body: string }[] = [
  {
    icon: Shield,
    iconColor: "#60a5fa",
    title: "Technical Support Before Refund",
    body: "If a customer experiences an activation or connectivity issue, KONEX eSIM support will first investigate and attempt to resolve the issue. Customers should contact support as soon as possible with their order details and device information. If the issue cannot be resolved and the service was not successfully delivered, a partial or full refund may be issued at our discretion.",
  },
  {
    icon: Clock,
    iconColor: "#a78bfa",
    title: "Refund Request Window",
    body: "All refund requests must be submitted within 7 days of purchase. Requests made after this period may not be eligible for review.",
  },
  {
    icon: CreditCard,
    iconColor: "#34d399",
    title: "How Refunds Are Processed",
    body: "Approved refunds will be issued to the original payment method only. Refund processing times may vary depending on the payment provider and bank, but typically take 5 to 10 business days.",
  },
  {
    icon: AlertCircle,
    iconColor: "#f87171",
    title: "Fraud, Abuse, and Misuse",
    body: "KONEX eSIM reserves the right to refuse refunds where there is evidence of misuse, repeated abuse of the refund process, or fraudulent activity.",
  },
];

export default function RefundPolicyPage() {
  useEffect(() => {
    document.title = "Refund & Return Policy | KONEX eSIM";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Learn about KONEX eSIM's refund and return policy for digital prepaid eSIM data plans.");
    } else {
      const tag = document.createElement("meta");
      tag.name = "description";
      tag.content = "Learn about KONEX eSIM's refund and return policy for digital prepaid eSIM data plans.";
      document.head.appendChild(tag);
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#13131A", color: "#fff" }}>
      <KonexNav variant="overview" />

      <main className="max-w-3xl mx-auto px-4 py-16">

        {/* Page header */}
        <div className="mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-5"
            style={{
              background: "rgba(59,130,246,0.12)",
              color: "#60a5fa",
              border: "1px solid rgba(59,130,246,0.25)",
            }}
          >
            <Shield size={12} /> Legal Policy
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-refund-policy">
            Refund &amp; Return Policy
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#9ca3af" }}>
            Last updated: {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Trust intro block */}
        <div
          className="rounded-2xl p-6 mb-10"
          style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.07)" }}
          data-testid="block-overview"
        >
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#fff" }}>Overview</h2>
          <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
            KONEX eSIM provides digital, prepaid eSIM data plans delivered electronically upon successful
            purchase. Because our products are digital services that are fulfilled instantly, refund
            eligibility is limited. Please read this policy carefully before completing your purchase.
          </p>
        </div>

        {/* Bullet sections */}
        <div className="space-y-8 mb-10">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="rounded-2xl p-6"
                style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.07)" }}
                data-testid={`section-${s.id}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${s.iconColor}18` }}
                  >
                    <Icon size={18} style={{ color: s.iconColor }} />
                  </div>
                  <h2 className="text-lg font-semibold">{s.title}</h2>
                </div>
                <p className="text-sm mb-3" style={{ color: "#9ca3af" }}>{s.intro}</p>
                <ul className="space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "#d1d5db" }}>
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: s.iconColor }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Prose sections */}
        <div className="space-y-6 mb-12">
          {prose.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="rounded-2xl p-6"
                style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.07)" }}
                data-testid={`section-${s.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${s.iconColor}18` }}
                  >
                    <Icon size={18} style={{ color: s.iconColor }} />
                  </div>
                  <h2 className="text-lg font-semibold">{s.title}</h2>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Support callout */}
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{
            background: "rgba(59,130,246,0.07)",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
          data-testid="block-contact"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(59,130,246,0.15)" }}
          >
            <Mail size={20} style={{ color: "#60a5fa" }} />
          </div>
          <div>
            <p className="font-semibold text-sm mb-1">Need help?</p>
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              For support or refund enquiries, reach our team at{" "}
              <a
                href="mailto:support@konexesim.com"
                className="underline"
                style={{ color: "#60a5fa" }}
                data-testid="link-support-email"
              >
                support@konexesim.com
              </a>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-sm underline"
            style={{ color: "#6b7280" }}
            data-testid="link-back-home"
          >
            ← Back to home
          </Link>
        </div>
      </main>

      <KonexFooter />
    </div>
  );
}
