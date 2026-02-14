export default function KonexFinalCTA() {
  return (
    <section className="konex-final-cta">
      <div className="container">
        <h2 data-testid="text-final-cta-heading">The last business card you'll ever need.</h2>
        <div className="cta-row">
          <a href="/auth?tab=register" className="btn btn-primary" data-testid="button-final-signup">
            Sign Up Free
          </a>
          <a href="/konex-cards" className="btn btn-outline" data-testid="button-final-get-card">
            Get your KONEX card
          </a>
        </div>
      </div>
    </section>
  );
}
