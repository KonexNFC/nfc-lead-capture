import konexCard from "@assets/FD0746A1-9C5E-4D81-A4DC-743ECFD7C4F5_1770810117183.png";

export default function KonexHero() {
  return (
    <section className="konex-hero">
      <div className="container">
        <div className="konex-hero-inner" style={{ display: "flex", alignItems: "center", gap: "3rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 400px", minWidth: 0 }}>
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

          <div style={{ flex: "1 1 350px", minWidth: 0 }}>
            <img
              src={konexCard}
              alt="KONEX NFC Business Cards"
              style={{ width: "100%", maxWidth: "500px", borderRadius: "1rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
              data-testid="img-konex-hero-card"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
