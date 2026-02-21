import { tierDetails } from "./konex-data";

const tiers = [
  { ...tierDetails.basic, ctaLabel: "Order Basic" },
  { ...tierDetails.premium, ctaLabel: "Order Premium", popular: true },
  { ...tierDetails.elite, ctaLabel: "Order Elite" },
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
              
              <div className="tier-card-image" style={{ marginBottom: "1.25rem" }}>
                <img
                  src={tier.image}
                  alt={tier.name}
                  style={{ width: "100%", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}
                  data-testid={`img-tier-${tier.id}`}
                />
              </div>

              <h3 data-testid={`text-tier-name-${tier.id}`}>{tier.name}</h3>
              <p className="tier-tagline">{tier.tagline}</p>

              <div className="tier-price" data-testid={`text-tier-price-${tier.id}`}>
                <span className="price-amount">{tier.price}</span>
                <span className="price-note">{tier.priceNote}</span>
              </div>

              <ul>
                {tier.specs.slice(0, 3).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>

              <a href={`/konex-cards/${tier.id}`} className={`btn ${tier.popular ? 'btn-primary' : 'btn-outline'}`} data-testid={`button-tier-cta-${tier.id}`}>
                {tier.ctaLabel}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
