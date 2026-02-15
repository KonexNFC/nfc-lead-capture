const tiers = [
  {
    id: "basic",
    name: "KONEX Basic",
    tagline: "Simple. Smart. Always connected.",
    price: "£19.99",
    benefits: ["Matte finish", "Everyday networking", "No app required"],
    ctaLabel: "Order Basic",
    href: "/konex-cards/basic",
  },
  {
    id: "premium",
    name: "KONEX Premium",
    tagline: "Elevated presence. Premium impression.",
    price: "£49.99",
    popular: true,
    benefits: ["Brushed metal options", "Micro-logo detail", "Ultra-slim feel"],
    ctaLabel: "Order Premium",
    href: "/konex-cards/premium",
  },
  {
    id: "elite",
    name: "KONEX Elite",
    tagline: "For those who move differently.",
    price: "£79.99",
    benefits: ["Luxury finishes", "Discreet branding", "Executive-grade"],
    ctaLabel: "Order Elite",
    href: "/konex-cards/elite",
  },
];

export default function KonexTierGrid() {
  return (
    <section className="konex-tiers" id="pricing">
      <div className="container">
        <div className="tiers-header">
          <h2 data-testid="text-tiers-heading">Choose your KONEX card</h2>
          <p className="tiers-subheading">
            Your digital profile is always free. Pick the NFC card that matches your style.
          </p>
        </div>

        <div className="tier-grid">
          {tiers.map((tier) => (
            <div key={tier.id} className={`tier-card tier-${tier.id} ${tier.popular ? 'tier-popular' : ''}`} data-testid={`card-tier-${tier.id}`}>
              {tier.popular && <span className="tier-badge" data-testid="badge-popular">Most Popular</span>}
              <h3 data-testid={`text-tier-name-${tier.id}`}>{tier.name}</h3>
              <p className="tier-tagline">{tier.tagline}</p>

              <div className="tier-price" data-testid={`text-tier-price-${tier.id}`}>
                <span className="price-amount">{tier.price}</span>
                <span className="price-note">One-time purchase</span>
              </div>

              <ul>
                {tier.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>

              <a href={tier.href} className={`btn ${tier.popular ? 'btn-primary' : 'btn-outline'}`} data-testid={`button-tier-cta-${tier.id}`}>
                {tier.ctaLabel}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
