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
          <a href="/auth?tab=register" className="btn btn-primary" data-testid="button-hero-signup-free">
            Create Free Profile
          </a>
          <a href="#pricing" className="btn btn-secondary" data-testid="button-hero-view-pricing">
            View Card Pricing
          </a>
        </div>

        <p className="konex-free-note" data-testid="text-free-note">
          Your digital profile is always free. NFC cards sold separately.
        </p>
      </div>
    </section>
  );
}
