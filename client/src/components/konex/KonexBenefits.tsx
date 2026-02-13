const benefits = [
  "One-tap instant contact sharing",
  "Works on iPhone & Android",
  "No app required for recipients",
  "Update your profile anytime",
  "Eco-friendly alternative to paper cards",
];

export default function KonexBenefits() {
  return (
    <section className="konex-benefits">
      <div className="container benefits-grid">
        {benefits.map((benefit, i) => (
          <div key={i} className="benefit-item" data-testid={`benefit-${i}`}>
            <span className="benefit-icon">●</span>
            <p>{benefit}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
