const tiers = [
  {
    id: "basic",
    name: "KONEX Basic",
    tagline: "Simple. Smart. Always connected.",
    benefits: ["Matte finish", "Everyday networking", "No app required"],
    ctaLabel: "Order KONEX Basic",
    href: "/konex-cards/basic",
  },
  {
    id: "premium",
    name: "KONEX Premium",
    tagline: "Elevated presence. Premium impression.",
    benefits: ["Brushed metal options", "Micro-logo detail", "Ultra-slim feel"],
    ctaLabel: "Upgrade to Premium",
    href: "/konex-cards/premium",
  },
  {
    id: "elite",
    name: "KONEX Elite",
    tagline: "For those who move differently.",
    benefits: ["Luxury finishes", "Discreet branding", "Executive-grade"],
    ctaLabel: "Access Elite",
    href: "/konex-cards/elite",
  },
];

export default function KonexTierGrid() {
  return (
    <section className="konex-tiers">
      <div className="container tier-grid">
        {tiers.map((tier) => (
          <div key={tier.id} className={`tier-card tier-${tier.id}`} data-testid={`card-tier-${tier.id}`}>
            <h3 data-testid={`text-tier-name-${tier.id}`}>{tier.name}</h3>
            <p className="tier-tagline">{tier.tagline}</p>

            <ul>
              {tier.benefits.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            <a href={tier.href} className="btn btn-outline" data-testid={`button-tier-cta-${tier.id}`}>
              {tier.ctaLabel}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
