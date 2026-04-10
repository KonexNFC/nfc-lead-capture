import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, Users, UserCheck, Zap, CreditCard, Key, AlertTriangle, Wifi, XCircle, Mail } from "lucide-react";
import KonexNav from "@/components/konex/KonexNav";
import KonexFooter from "@/components/konex/KonexFooter";

const sections = [
  {
    id: "service-overview",
    icon: Zap,
    iconColor: "#60a5fa",
    title: "1. Service Overview",
    body: "KONEX NFC provides digital profiles accessible via NFC-enabled cards or QR codes. Our platform enables users to share contact information and content instantly with anyone they meet.",
  },
  {
    id: "eligibility",
    icon: Users,
    iconColor: "#34d399",
    title: "2. Eligibility",
    body: "You must be at least 18 years old or have the legal consent of a parent or guardian to use our services.",
  },
  {
    id: "digital-nature",
    icon: Zap,
    iconColor: "#a78bfa",
    title: "4. Digital Nature of Service",
    body: "All KONEX NFC services are digital products. Access is granted immediately upon activation of your account or NFC card.",
  },
  {
    id: "service-availability",
    icon: Wifi,
    iconColor: "#60a5fa",
    title: "8. Service Availability",
    body: "We aim for high uptime and reliable performance but do not guarantee uninterrupted service. Scheduled maintenance or unforeseen issues may occasionally affect availability.",
  },
  {
    id: "termination",
    icon: XCircle,
    iconColor: "#f87171",
    title: "9. Termination",
    body: "We may suspend or terminate accounts that violate these Terms of Service. In such cases, access to your profile and associated data may be removed.",
  },
];

const bulletSections = [
  {
    id: "user-responsibilities",
    icon: UserCheck,
    iconColor: "#34d399",
    title: "3. User Responsibilities",
    body: "By using KONEX NFC, you agree to the following:",
    items: [
      "Provide accurate and truthful information",
      "Not use the platform for illegal, harmful, or misleading activities",
      "Not upload offensive, fraudulent, or infringing content",
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    iconColor: "#f59e0b",
    title: "5. Payments",
    body: "The following payment terms apply to all purchases:",
    items: [
      "Payments are processed securely via Stripe",
      "Prices are displayed clearly before purchase",
      "We reserve the right to update pricing at any time",
    ],
  },
  {
    id: "account-access",
    icon: Key,
    iconColor: "#a78bfa",
    title: "6. Account & Access",
    body: "Regarding your account and profile access:",
    items: [
      "Users are responsible for maintaining access to their profiles",
      "We may suspend accounts for misuse or policy violations",
    ],
  },
  {
    id: "limitation-of-liability",
    icon: AlertTriangle,
    iconColor: "#f87171",
    title: "7. Limitation of Liability",
    body: "KONEX NFC is not liable for:",
    items: [
      "Loss of business, data, or revenue",
      "Third-party misuse of shared profile links",
      "Connectivity or device compatibility issues",
    ],
  },
];

export default function TermsPage() {
  useEffect(() => {
    document.title = "Terms of Service | KONEX NFC";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Read the KONEX NFC Terms of Service to understand your rights and responsibilities when using our platform.");
    } else {
      const tag = document.createElement("meta");
      tag.name = "description";
      tag.content = "Read the KONEX NFC Terms of Service to understand your rights and responsibilities when using our platform.";
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-terms">
            Terms of Service
          </h1>
          <p className="text-sm leading-relaxed mb-1" style={{ color: "#9ca3af" }}>
            Effective Date: April 2025
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
            Company: Konex Digital Ltd (trading as KONEX NFC)
          </p>
        </div>

        {/* Intro block */}
        <div
          className="rounded-2xl p-6 mb-10"
          style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.07)" }}
          data-testid="block-overview"
        >
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#fff" }}>Agreement to Terms</h2>
          <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
            By accessing or using KONEX NFC services, you agree to be bound by these Terms of Service.
            Please read them carefully before using our platform. If you do not agree to these terms,
            you may not use our services.
          </p>
        </div>

        {/* Prose sections (first batch) */}
        <div className="space-y-6 mb-6">
          {sections.slice(0, 2).map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="rounded-2xl p-6"
                style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.07)" }}
                data-testid={`section-${s.id}`}
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
                <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>{s.body}</p>
              </div>
            );
          })}
        </div>

        {/* Bullet sections */}
        <div className="space-y-6 mb-6">
          {bulletSections.map((s) => {
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
                <p className="text-sm mb-3" style={{ color: "#9ca3af" }}>{s.body}</p>
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

        {/* Remaining prose sections */}
        <div className="space-y-6 mb-12">
          {sections.slice(2).map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="rounded-2xl p-6"
                style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.07)" }}
                data-testid={`section-${s.id}`}
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
                <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>{s.body}</p>
              </div>
            );
          })}
        </div>

        {/* Contact callout */}
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
            <p className="font-semibold text-sm mb-1">Questions about these terms?</p>
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              Reach our team at{" "}
              <a
                href="mailto:support@konexnfc.com"
                className="underline"
                style={{ color: "#60a5fa" }}
                data-testid="link-support-email"
              >
                support@konexnfc.com
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
