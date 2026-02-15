import { Check, X } from "lucide-react";

const features = [
  { name: "NFC one-tap sharing", basic: true, premium: true, elite: true },
  { name: "Digital profile page", basic: true, premium: true, elite: true },
  { name: "Lead capture form", basic: true, premium: true, elite: true },
  { name: "QR code backup", basic: true, premium: true, elite: true },
  { name: "Unlimited profile updates", basic: true, premium: true, elite: true },
  { name: "Premium card finish", basic: false, premium: true, elite: true },
  { name: "Logo engraving", basic: false, premium: true, elite: true },
  { name: "Advanced analytics", basic: false, premium: true, elite: true },
  { name: "Priority support", basic: false, premium: true, elite: true },
  { name: "Custom domain", basic: false, premium: false, elite: true },
  { name: "White-glove onboarding", basic: false, premium: false, elite: true },
  { name: "Dedicated account manager", basic: false, premium: false, elite: true },
];

const tiers = [
  { key: "basic" as const, name: "Basic", price: "£9.99", href: "/konex-cards/basic" },
  { key: "premium" as const, name: "Premium", price: "£24.99", href: "/konex-cards/premium", popular: true },
  { key: "elite" as const, name: "Elite", price: "£49.99", href: "/konex-cards/elite" },
];

export default function KonexComparisonMini() {
  return (
    <section id="compare" className="konex-comparison">
      <div className="container">
        <div className="section-header">
          <h2 data-testid="text-compare-heading">Compare KONEX cards</h2>
          <p className="section-subheading" data-testid="text-compare-subheading">
            Find the perfect card for your networking style.
          </p>
        </div>

        <div className="compare-table-wrap">
          <table className="compare-table" data-testid="table-comparison">
            <thead>
              <tr>
                <th className="compare-feature-col">Feature</th>
                {tiers.map((tier) => (
                  <th key={tier.key} className="compare-tier-col" data-testid={`th-${tier.key}`}>
                    <span className="compare-tier-name">{tier.name}</span>
                    <span className="compare-tier-price">{tier.price}</span>
                    {tier.popular && <span className="compare-popular-badge">Most Popular</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr key={i}>
                  <td className="compare-feature-name" data-testid={`feature-name-${i}`}>{feature.name}</td>
                  {tiers.map((tier) => (
                    <td key={tier.key} className="compare-check-cell" data-testid={`feature-${tier.key}-${i}`}>
                      {feature[tier.key] ? (
                        <Check className="compare-check-icon" />
                      ) : (
                        <X className="compare-x-icon" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="compare-cta-row">
          {tiers.map((tier) => (
            <a key={tier.key} href={tier.href} className="btn btn-outline compare-cta-link" data-testid={`link-compare-${tier.key}`}>
              View {tier.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
