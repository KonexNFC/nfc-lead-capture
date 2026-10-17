import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Check, ChevronDown, Layers, Menu, Nfc, Plus, QrCode, RefreshCw, Share2, Smartphone, Users, X } from "lucide-react";
import { KonexLogo } from "@/components/konex/KonexLogo";
import { HomepageTestimonials } from "@/components/homepage/HomepageTestimonials";
import cardInHand from "@assets/IMG_7743_1771669634221.jpeg";
import "./homepage.css";

const navigation = [
  { href: "/konex-cards", label: "NFC Cards", id: "konex-cards" },
  { href: "#how-it-works", label: "How it works", id: "how-it-works" },
  { href: "#use-cases", label: "Use cases", id: "use-cases" },
  { href: "#features", label: "Features", id: "features" },
  { href: "/what-is-nfc", label: "What is NFC?", id: "what-is-nfc" },
];

const products = [
  { name: "Basic", price: "£19.99", image: "/img/card-basic.webp", description: "Matte black. Clean & professional.", href: "/konex-cards/basic" },
  { name: "Premium", price: "£49.99", image: "/img/card-premium.webp", description: "Brushed metal. Silver, Black or Copper.", href: "/konex-cards/premium" },
  { name: "Elite", price: "£79.99", image: "/img/card-elite.webp", description: "Carbon, Gold or Carbon-Gold edition.", href: "/konex-cards/elite" },
];

const faqs = [
  { question: "Does the other person need an app?", answer: "No. A tap with a compatible NFC-enabled phone opens your digital profile in their browser. They can also scan your card’s QR code." },
  { question: "What if their phone doesn’t support NFC?", answer: "They can scan the QR code instead. You can also share your digital profile link by message or email." },
  { question: "Can I change my details later?", answer: "Yes. Update your digital profile from your dashboard. Your card points to the same profile, so there’s no need to reprint it when your details change." },
  { question: "Can I use KONEX for my team?", answer: "Yes. KONEX includes team card assignment and management. Explore the card collection to choose the right starting point for your business." },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.getElementById("kx-menu-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <div className="kx-home">
      <a href="#kx-main" className="kx-skip">Skip to content</a>
      <header className="kx-header">
        <div className="kx-shell kx-header-inner">
          <Link href="/" className="kx-brand" aria-label="KONEX home"><KonexLogo height={35} /></Link>
          <nav className="kx-desktop-nav" aria-label="Main navigation">
            {navigation.map(item => item.href.startsWith("#")
              ? <a key={item.id} href={item.href} data-testid={`nav-${item.id}`}>{item.label}</a>
              : <Link key={item.id} href={item.href} data-testid={`nav-${item.id}`}>{item.label}</Link>)}
          </nav>
          <div className="kx-account">
            <Link href="/auth" data-testid="button-login">Log in</Link>
            <Link href="/konex-cards" className="kx-button kx-header-cta" data-testid="button-nav-get-card">Get your card <ArrowRight aria-hidden="true" /></Link>
            <button id="kx-menu-toggle" className="kx-menu-button" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="kx-mobile-menu" onClick={() => setMenuOpen(!menuOpen)} data-testid="button-nav-menu">
              {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {menuOpen && <nav id="kx-mobile-menu" className="kx-mobile-nav" aria-label="Mobile navigation">
          {navigation.map(item => item.href.startsWith("#")
            ? <a key={item.id} href={item.href} onClick={() => setMenuOpen(false)} data-testid={`menu-${item.id}`}>{item.label}</a>
            : <Link key={item.id} href={item.href} onClick={() => setMenuOpen(false)} data-testid={`menu-${item.id}`}>{item.label}</Link>)}
          <Link href="/auth?tab=register" onClick={() => setMenuOpen(false)}>Create your digital profile</Link>
          <Link href="/auth" onClick={() => setMenuOpen(false)} data-testid="menu-login">Log in</Link>
        </nav>}
      </header>

      <main id="kx-main">
        <section className="kx-hero" aria-labelledby="kx-hero-title">
          <div className="kx-shell kx-hero-grid">
            <div className="kx-hero-copy">
              <p className="kx-eyebrow"><Nfc aria-hidden="true" /> The business card, reconnected.</p>
              <h1 id="kx-hero-title">Make an<br />introduction.<br /><span>Leave an<br />impression.</span></h1>
              <p className="kx-hero-description">One card. A simple tap. Share your contact details, work and links — without breaking the conversation.</p>
              <div className="kx-hero-actions">
                <Link href="/konex-cards" className="kx-button kx-button-light" data-testid="button-hero-get-card">Find your card <ArrowRight aria-hidden="true" /></Link>
                <a href="#how-it-works" className="kx-text-link">See how it works <ChevronDown aria-hidden="true" /></a>
              </div>
              <p className="kx-hero-note">NFC business cards for people with something to share.</p>
            </div>
            <div className="kx-hero-visual">
              <img src={cardInHand} alt="A real KONEX business card held in hand" className="kx-hero-photo" loading="eager" />
              <span className="kx-photo-label">A better way to say hello</span>
              <div className="kx-photo-caption"><Nfc aria-hidden="true" /><div><strong>Your next connection starts here.</strong><span>Tap your card. Share your world.</span></div></div>
            </div>
          </div>
        </section>

        <div className="kx-essentials" aria-label="Sharing essentials">
          <div className="kx-shell kx-essentials-inner">
            <span><Check aria-hidden="true" /> No recipient app needed</span>
            <span><Nfc aria-hidden="true" /> Tap with NFC</span>
            <span><QrCode aria-hidden="true" /> Scan with QR</span>
            <span><RefreshCw aria-hidden="true" /> Update without reprinting</span>
          </div>
        </div>

        <section id="how-it-works" className="kx-section" aria-labelledby="kx-how-title">
          <div className="kx-shell kx-how-grid">
            <div>
              <p className="kx-eyebrow">01 / The connection</p>
              <h2 id="kx-how-title" className="kx-section-title">Less exchanging details.<br />More making connections.</h2>
              <p className="kx-section-intro">Your KONEX card opens your digital profile. Everything you want to share, together in one place.</p>
            </div>
            <ol className="kx-steps">
              <li className="kx-step"><span className="kx-step-number">01</span><div><h3>Make it yours.</h3><p>Add your contact details, social links and work to your digital profile.</p></div><Layers aria-hidden="true" /></li>
              <li className="kx-step"><span className="kx-step-number">02</span><div><h3>Tap. Or scan.</h3><p>Tap your card on a compatible phone, or let them scan the QR code. Your profile opens in their browser.</p></div><Smartphone aria-hidden="true" /></li>
              <li className="kx-step"><span className="kx-step-number">03</span><div><h3>Keep the conversation going.</h3><p>They can save your details and explore your links. No app download. No typing everything in.</p></div><Share2 aria-hidden="true" /></li>
            </ol>
          </div>
        </section>

        <section id="features" className="kx-section kx-features" aria-labelledby="kx-features-title">
          <div className="kx-shell kx-feature-grid">
            <figure className="kx-feature-image">
              <img src="/img/card-three-tiers.webp" alt="KONEX Basic, Premium and Elite NFC business cards" loading="lazy" width={600} height={520} />
              <figcaption>One connection. Your choice of finish.</figcaption>
            </figure>
            <div className="kx-feature-copy">
              <p className="kx-eyebrow">02 / More than a card</p>
              <h2 id="kx-features-title" className="kx-section-title">Your details change.<br />Your card keeps up.</h2>
              <div id="use-cases" className="kx-feature-list">
                <div><RefreshCw aria-hidden="true" /><div><h3>For your next chapter.</h3><p>New role, new number, new project? Update your profile, not your stack of cards.</p></div></div>
                <div><Share2 aria-hidden="true" /><div><h3>For the work you’re proud of.</h3><p>Give clients a direct path to your portfolio, business links and social profiles.</p></div></div>
                <div><Users aria-hidden="true" /><div><h3>For you. And your team.</h3><p>Introduce yourself as an independent professional, or manage cards for the people behind your business.</p></div></div>
              </div>
              <Link href="/auth?tab=register" className="kx-text-link" data-testid="button-create-profile">Create your digital profile <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section id="cards" className="kx-section" aria-labelledby="kx-cards-title">
          <div className="kx-shell">
            <div className="kx-section-heading">
              <div><p className="kx-eyebrow">03 / Find your signature</p><h2 id="kx-cards-title" className="kx-section-title">A card you’ll want to hand over.</h2></div>
              <p>From understated to unmistakable. Choose the finish that feels like you.</p>
            </div>
            <div className="kx-product-list">
              {products.map(product => <article key={product.name} className="kx-product" data-testid={`card-tier-${product.name.toLowerCase()}`}>
                <Link href={product.href} className="kx-product-image" aria-label={`Explore KONEX ${product.name}`}>
                  <img src={product.image} alt={`KONEX ${product.name} NFC business card`} loading="lazy" width={330} height={220} />
                </Link>
                <div><div className="kx-product-heading"><h3>{product.name}</h3>{product.name === "Premium" && <span className="kx-product-tag">Metal collection</span>}</div><p>{product.description}</p></div>
                <div className="kx-product-buy"><div className="kx-product-price">{product.price}<small>Card price</small></div><Link href={product.href} className="kx-button kx-button-outline" aria-label={`Explore ${product.name} card at ${product.price}`}>Explore <ArrowRight aria-hidden="true" /></Link></div>
              </article>)}
            </div>
          </div>
        </section>

        <HomepageTestimonials />

        <section className="kx-section kx-faq" aria-labelledby="kx-faq-title">
          <div className="kx-shell kx-faq-grid">
            <div><p className="kx-eyebrow">A few things worth knowing</p><h2 id="kx-faq-title" className="kx-section-title">Good questions.<br />Straight answers.</h2></div>
            <div>{faqs.map(faq => <details key={faq.question}><summary>{faq.question}<Plus aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div>
          </div>
        </section>

        <section className="kx-finale" aria-labelledby="kx-finale-title">
          <div className="kx-shell kx-finale-inner">
            <div><h2 id="kx-finale-title">Be ready for your<br />next introduction.</h2><p>The right connection can start with a single tap.</p></div>
            <div className="kx-finale-actions">
              <Link href="/konex-cards" className="kx-button kx-button-light" data-testid="button-footer-nfc">Choose your KONEX card <ArrowRight aria-hidden="true" /></Link>
              <Link href="/auth?tab=register" className="kx-text-link" data-testid="button-footer-digital">Start with a digital profile <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="kx-footer">
        <div className="kx-shell">
          <div className="kx-footer-top">
            <Link href="/" className="kx-brand" aria-label="KONEX home"><KonexLogo height={32} /></Link>
            <p>Real conversations.<br />Better-connected people.</p>
            <nav aria-label="Footer navigation" className="kx-footer-links"><Link href="/konex-cards">NFC Cards</Link><Link href="/what-is-nfc">What is NFC?</Link><Link href="/auth">Log in</Link></nav>
          </div>
          <div className="kx-footer-bottom">
            <span>© {new Date().getFullYear()} KONEX. All rights reserved.</span>
            <nav aria-label="Legal" className="kx-footer-links">
              <Link href="/terms" data-testid="link-landing-footer-terms">Terms of Service</Link>
              <Link href="/privacy" data-testid="link-landing-footer-privacy">Privacy Policy</Link>
              <Link href="/refund-policy" data-testid="link-landing-footer-refund">Refund &amp; Return Policy</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
