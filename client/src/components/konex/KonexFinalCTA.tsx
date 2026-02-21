import konexCard from "@assets/FD0746A1-9C5E-4D81-A4DC-743ECFD7C4F5_1770810117183.png";

export default function KonexFinalCTA() {
  return (
    <section className="konex-final-cta">
      <div className="container">
        <img
          src={konexCard}
          alt="KONEX NFC Business Cards"
          style={{ width: "100%", maxWidth: "400px", margin: "0 auto 2rem", display: "block", borderRadius: "1rem", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
          data-testid="img-final-cta-card"
        />
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
