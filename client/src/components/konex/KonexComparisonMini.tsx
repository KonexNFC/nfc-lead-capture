export default function KonexComparisonMini() {
  return (
    <section className="konex-comparison">
      <div className="container comparison-grid">
        <div className="comparison-col" data-testid="card-compare-basic">
          <h4>Basic</h4>
          <span className="comparison-price">£9.99</span>
          <ul>
            <li>Matte finish</li>
            <li>Everyday use</li>
            <li>Best for teams & events</li>
          </ul>
          <a href="/konex-cards/basic" data-testid="link-compare-basic">View Basic</a>
        </div>

        <div className="comparison-col" data-testid="card-compare-premium">
          <h4>Premium</h4>
          <span className="comparison-price">£24.99</span>
          <ul>
            <li>Brushed metal / matte black</li>
            <li>Premium feel</li>
            <li>Best for founders & consultants</li>
          </ul>
          <a href="/konex-cards/premium" data-testid="link-compare-premium">View Premium</a>
        </div>

        <div className="comparison-col" data-testid="card-compare-elite">
          <h4>Elite</h4>
          <span className="comparison-price">£49.99</span>
          <ul>
            <li>Ultra-premium finishes</li>
            <li>Luxury positioning</li>
            <li>Best for executives & VIPs</li>
          </ul>
          <a href="/konex-cards/elite" data-testid="link-compare-elite">View Elite</a>
        </div>
      </div>
    </section>
  );
}
