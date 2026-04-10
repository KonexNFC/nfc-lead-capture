import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, Database, Share2, Lock, UserCheck, Cookie, RefreshCw, Mail } from "lucide-react";
import KonexNav from "@/components/konex/KonexNav";
import KonexFooter from "@/components/konex/KonexFooter";

const sections = [
  {
    id: "information-we-collect",
    icon: Database,
    iconColor: "#60a5fa",
    title: "1. Information We Collect",
    body: "We collect the following types of information to provide and improve our services:",
    items: [
      "Personal details (name, email address, phone number)",
      "Profile content (links, social media handles, business information)",
      "Device and browser data (IP address, cookies, analytics)",
      "Payment data (processed securely via Stripe — we do not store card details)",
    ],
  },
  {
    id: "how-we-use",
    icon: UserCheck,
    iconColor: "#34d399",
    title: "2. How We Use Your Information",
    body: "Your data is used to:",
    items: [
      "Deliver and manage your digital profile",
      "Enable NFC and QR sharing functionality",
      "Process payments and subscriptions",
      "Improve platform performance and user experience",
      "Communicate service updates and support responses",
    ],
  },
  {
    id: "data-sharing",
    icon: Share2,
    iconColor: "#a78bfa",
    title: "3. Data Sharing",
    body: "We do not sell your data. We only share data with:",
    items: [
      "Payment processors (e.g. Stripe)",
      "Hosting and infrastructure providers",
      "Legal authorities if required by law",
    ],
  },
  {
    id: "your-rights",
    icon: UserCheck,
    iconColor: "#f59e0b",
    title: "5. Your Rights (UK GDPR)",
    body: "Under UK GDPR, you have the right to:",
    items: [
      "Access your personal data",
      "Correct inaccurate data",
      "Request deletion of your data",
      "Object to processing",
    ],
    footer: "Requests can be sent to: privacy@konexnfc.com",
  },
];

const prose = [
  {
    icon: Lock,
    iconColor: "#f87171",
    title: "4. Data Storage & Security",
    body: "Data is stored on secure servers with encryption protocols in place. We implement industry-standard security measures to protect your information. However, no system is 100% secure and we cannot guarantee absolute security of your data.",
  },
  {
    icon: Cookie,
    iconColor: "#fb923c",
    title: "6. Cookies",
    body: "We use cookies for analytics and performance tracking. You can disable cookies at any time via your browser settings, though this may affect some functionality of the platform.",
  },
  {
    icon: RefreshCw,
    iconColor: "#60a5fa",
    title: "7. Updates to This Policy",
    body: "We may update this policy periodically to reflect changes in our practices or legal requirements. Continued use of the service after any update constitutes acceptance of the revised policy.",
  },
];

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = "Privacy Policy | KONEX NFC";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Read the KONEX NFC privacy policy to understand how we collect, use, and protect your personal data.");
    } else {
      const tag = document.createElement("meta");
      tag.name = "description";
      tag.content = "Read the KONEX NFC privacy policy to understand how we collect, use, and protect your personal data.";
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-privacy-policy">
            Privacy Policy
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
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#fff" }}>Overview</h2>
          <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
            KONEX NFC ("we", "our", "us") provides NFC-enabled digital profile services that allow users
            to share contact information and content via NFC or QR technology. This policy explains how
            we collect, use, and protect your personal information.
          </p>
        </div>

        {/* Bullet sections */}
        <div className="space-y-6 mb-6">
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
                {s.footer && (
                  <p className="text-sm mt-4" style={{ color: "#9ca3af" }}>
                    {s.footer.replace("privacy@konexnfc.com", "")}
                    <a
                      href="mailto:privacy@konexnfc.com"
                      className="underline"
                      style={{ color: "#60a5fa" }}
                      data-testid="link-privacy-email"
                    >
                      privacy@konexnfc.com
                    </a>
                  </p>
                )}
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
                data-testid={`section-${s.title.toLowerCase().replace(/[\s&]+/g, "-")}`}
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
            <p className="font-semibold text-sm mb-1">Data & Privacy Enquiries</p>
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              To exercise your rights or for any privacy-related questions, contact us at{" "}
              <a
                href="mailto:privacy@konexnfc.com"
                className="underline"
                style={{ color: "#60a5fa" }}
                data-testid="link-contact-email"
              >
                privacy@konexnfc.com
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
