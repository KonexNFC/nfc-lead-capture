export default function KonexHero() {
  return (
    <section className="konex-hero">
      <div className="container">
        <h1 data-testid="text-hero-headline">Tap once. Share everything.</h1>
        <p data-testid="text-hero-subheadline">
          KONEX NFC cards replace paper business cards with instant digital
          profiles. One tap connects people to your contact details, social
          links, portfolio, and payment links — no app required.
        </p>

        <div className="cta-row">
          <a href="/konex-cards" className="btn btn-primary" data-testid="button-hero-get-card">
            Get your KONEX card
          </a>
          <a href="/waitlist" className="btn btn-secondary" data-testid="button-hero-waitlist">
            Join the waitlist
          </a>
        </div>
      </div>
    </section>
  );
}
