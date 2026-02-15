import { Nfc, Smartphone, RefreshCw, Leaf, Users, Zap, Shield, BarChart3 } from "lucide-react";

const benefits = [
  {
    icon: Nfc,
    title: "One-Tap Sharing",
    desc: "Tap your KONEX card on any smartphone to instantly share your full digital profile. No fumbling with paper cards.",
  },
  {
    icon: Smartphone,
    title: "No App Required",
    desc: "Recipients don't need to download anything. Your profile opens directly in their browser on iPhone or Android.",
  },
  {
    icon: RefreshCw,
    title: "Always Up to Date",
    desc: "Changed jobs? New number? Update your profile anytime and your card stays current. No reprints needed.",
  },
  {
    icon: Users,
    title: "Lead Capture Built In",
    desc: "Every visitor can share their contact details back to you. Capture leads effortlessly at events and meetings.",
  },
  {
    icon: BarChart3,
    title: "Track Every Connection",
    desc: "See who viewed your profile, where your leads come from, and how your network is growing with built-in analytics.",
  },
  {
    icon: Shield,
    title: "Professional & Secure",
    desc: "Your data stays safe with secure hosting. Present yourself with a polished, branded digital presence.",
  },
  {
    icon: Zap,
    title: "Works Instantly",
    desc: "No setup for recipients. One tap and they see your full profile with contact info, social links, and more.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    desc: "Replace hundreds of paper business cards with one reusable NFC card. Better for your wallet and the planet.",
  },
];

export default function KonexBenefits() {
  return (
    <section id="benefits" className="konex-benefits">
      <div className="container">
        <div className="section-header">
          <h2 data-testid="text-benefits-heading">Why choose KONEX?</h2>
          <p className="section-subheading" data-testid="text-benefits-subheading">
            Everything you need to network smarter, faster, and more professionally.
          </p>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit, i) => (
            <div key={i} className="benefit-item" data-testid={`benefit-${i}`}>
              <div className="benefit-icon-wrap">
                <benefit.icon className="benefit-icon-svg" />
              </div>
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-desc">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
