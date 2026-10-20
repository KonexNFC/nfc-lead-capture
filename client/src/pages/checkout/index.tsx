import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import {
  CheckCircle, ShoppingCart, Shield, ArrowRight,
  Smartphone, Cpu, PenLine, Bell, Menu, Nfc, LockKeyhole,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { KonexLogo } from "@/components/konex/KonexLogo";
import { PayPalButton } from "@/components/PayPalButton";
import "./checkout.css";
import cardBasicImg      from "@assets/Konex_Basic_Card_1776031961806.png";
import cardPremiumSilver from "@assets/Konex_Premium_Card_1776031961806.png";
import cardPremiumBlack  from "@assets/Konex_Premium_Black_Card_1776031961806.png";
import cardPremiumCopper from "@assets/Konex_Premium_Card_Cooper_1776031961807.png";
import cardEliteCarbon   from "@assets/Konex_Elite_Card_1776031961806.png";
import cardEliteGold     from "@assets/Konex_Elite_Gold_Card_1776031961805.png";
import cardEliteCarbonGold from "@assets/ChatGPT_Image_Apr_12,_2026,_11_10_59_PM_1776031961801.png";
import cardEcoBamboo     from "@assets/Konex_Eco_Bamboo_1776450550750.png";
import cardRecycledSteel from "@assets/Konex_Recycled_Steel_1776450550748.png";

interface ProductVariant { label: string; image: string; swatch: string; sku: string }
interface Product {
  sku: string;
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  highlight: boolean;
  badge: string | null;
  image: string | null;
  comingSoon?: boolean;
  comingSoonLabel?: string;
  preOrder?: boolean;
  variants?: ProductVariant[];
  allowEngraving?: boolean;
}

const PRODUCTS: Product[] = [
  {
    sku: "KONEX-DIGITAL",
    name: "Digital Profile",
    price: "£9.99",
    priceNote: "One-time",
    description: "Your professional digital identity online, shareable via link or QR code.",
    features: ["Custom profile URL", "Lead capture form", "Analytics dashboard", "Unlimited updates"],
    highlight: false,
    badge: null,
    image: null,
    allowEngraving: false,
  },
  {
    sku: "KONEX-BASIC",
    name: "Basic NFC Card",
    price: "£19.99",
    priceNote: "One-time",
    description: "A clean, professional NFC card that shares your profile with a single tap.",
    features: ["NFC + QR code", "Matte black finish", "Custom profile URL", "Works on iPhone & Android"],
    highlight: false,
    badge: null,
    image: cardBasicImg,
    allowEngraving: true,
  },
  {
    sku: "KONEX-PREMIUM",
    name: "Premium NFC Card",
    price: "£49.99",
    priceNote: "Pre-order",
    description: "Brushed metal finish with laser engraving — make a lasting impression.",
    features: ["Brushed metal finish", "Laser-engraved logo", "Advanced analytics", "Priority support"],
    highlight: true,
    badge: "Most Popular",
    image: cardPremiumSilver,
    allowEngraving: true,
    preOrder: true,
    variants: [
      { label: "Silver",  image: cardPremiumSilver, swatch: "#C0C0C0", sku: "KONEX-PREMIUM" },
      { label: "Black",   image: cardPremiumBlack,  swatch: "#1a1a1a", sku: "KONEX-PREMIUM-BLACK" },
      { label: "Copper",  image: cardPremiumCopper, swatch: "#B87333", sku: "KONEX-PREMIUM-COPPER" },
    ],
  },
  {
    sku: "KONEX-ELITE",
    name: "Elite NFC Card",
    price: "£79.99",
    priceNote: "Pre-order",
    description: "Luxury materials, white-glove onboarding, and exclusive executive features.",
    features: ["Luxury materials", "Custom domain", "White-glove setup", "Dedicated manager"],
    highlight: false,
    badge: "Premium",
    image: cardEliteCarbon,
    allowEngraving: true,
    preOrder: true,
    variants: [
      { label: "Carbon",      image: cardEliteCarbon,     swatch: "#2a2a2a", sku: "KONEX-ELITE" },
      { label: "Gold",        image: cardEliteGold,       swatch: "#D4AF37", sku: "KONEX-ELITE-GOLD" },
      { label: "Carbon Gold", image: cardEliteCarbonGold, swatch: "#8B6914", sku: "KONEX-ELITE-CARBON-GOLD" },
    ],
  },
];

const COMING_SOON: Product[] = [
  {
    sku: "KONEX-ECO-BAMBOO",
    name: "Eco Bamboo Card",
    price: "£34.99",
    priceNote: "Pre-order",
    description: "Crafted from sustainable bamboo. Same NFC power, zero guilt — for the conscious professional.",
    features: ["100% sustainable bamboo", "NFC + QR code", "Laser-engraved finish", "Carbon-neutral delivery"],
    highlight: false,
    badge: "Coming Soon",
    image: null,
    comingSoon: true,
    comingSoonLabel: "Eco Bamboo",
    allowEngraving: false,
  },
  {
    sku: "KONEX-ECO-STEEL",
    name: "Recycled Steel Card",
    price: "£44.99",
    priceNote: "Pre-order",
    description: "Premium recycled stainless steel with full NFC capability. Durable, sustainable, and built to last.",
    features: ["Recycled stainless steel", "NFC + QR code", "Brushed matte finish", "10-year durability guarantee"],
    highlight: false,
    badge: "Coming Soon",
    image: null,
    comingSoon: true,
    comingSoonLabel: "Recycled Steel",
    allowEngraving: false,
  },
  {
    sku: "KONEX-EINК",
    name: "Next-Gen E-ink Card",
    price: "£149.99",
    priceNote: "Pre-order",
    description: "An NFC card with a dynamic e-ink display that updates your details in real time.",
    features: ["Dynamic e-ink display", "NFC + QR code", "Wireless charging", "App-controlled content"],
    highlight: true,
    badge: "Next Gen",
    image: null,
    comingSoon: true,
    comingSoonLabel: "E-ink",
    allowEngraving: false,
  },
];

function ComingSoonCardVisual({ product }: { product: Product }) {
  const image = product.sku === "KONEX-ECO-BAMBOO" ? cardEcoBamboo
    : product.sku === "KONEX-ECO-STEEL" ? cardRecycledSteel : null;
  return <div className="co-soon-visual">
    {image ? <img src={image} alt={product.name} loading="lazy" /> : (
      <div className="co-eink">
        <div className="co-eink-display"><strong>KONEX</strong><small>Dynamic display</small></div>
        <small><Cpu size={14} aria-hidden="true" /> E-ink concept</small>
      </div>
    )}
  </div>;
}

function WaitlistForm({ product, onDone }: { product: Product; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product: product.name }),
      });
      if (!response.ok) throw new Error("Unable to join waitlist");
      setSubmitted(true);
      toast({ title: "You're on the list!", description: `We'll notify you when ${product.name} launches.` });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="co-waitlist" role="status">
        <CheckCircle size={32} aria-hidden="true" />
        <h3>You're on the list.</h3>
        <p>We'll email you when {product.name} launches.</p>
        <button onClick={onDone} className="co-link-button">Back to products</button>
      </div>
    );
  }

  return (
    <div className="co-waitlist">
      <Bell size={24} aria-hidden="true" />
      <h3>Be first to hear.</h3>
      <p>Leave your email and we'll let you know when {product.name} is available.</p>
      <form onSubmit={handleSubmit}>
        <label className="co-field" htmlFor="waitlist-email">Email address</label>
        <input
          id="waitlist-email"
          type="email"
          required
          autoComplete="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="input-waitlist-email"
          className="co-input"
        />
        <button
          type="submit"
          disabled={submitting}
          data-testid="button-waitlist-submit"
          className="co-button"
        >
          {submitting ? "Joining…" : "Notify Me When Available"}
        </button>
      </form>
      <p className="co-fine">Product updates only. No payment required.</p>
    </div>
  );
}

export default function CheckoutPage() {
  const preselect = new URLSearchParams(window.location.search).get("sku");
  const allProducts = [...PRODUCTS, ...COMING_SOON];

  const defaultProduct = preselect
    ? allProducts.find((p) => p.sku === preselect || p.variants?.some((v) => v.sku === preselect))
    : null;

  const [selectedSku, setSelectedSku] = useState<string | null>(
    preselect && allProducts.some((p) => p.sku === preselect || p.variants?.some((v) => v.sku === preselect))
      ? (defaultProduct?.sku ?? null)
      : null
  );
  const [variantSkus, setVariantSkus] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    PRODUCTS.forEach((p) => {
      if (p.variants) {
        const match = preselect && p.variants.find((v) => v.sku === preselect);
        init[p.sku] = match ? match.sku : p.variants[0].sku;
      }
    });
    return init;
  });

  const [engravingName, setEngravingName] = useState("");
  const [engravingTitle, setEngravingTitle] = useState("");
  const [waitlistProduct, setWaitlistProduct] = useState<Product | null>(null);

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: paypalConfig, isLoading: configLoading, isError: configError, refetch: retryConfig } = useQuery({ queryKey: ["/api/config/paypal"] });
  const config = paypalConfig as any;
  const configured: boolean = config?.configured ?? false;
  const clientId: string = config?.clientId ?? "";

  function handlePayPalSuccess(activationToken: string) {
    setLocation(`/checkout/activate?token=${activationToken}`);
  }

  function handlePayPalCancel() {
    toast({
      title: "Payment cancelled",
      description: "No charge was made. Choose a product and try again whenever you're ready.",
    });
  }

  const selectedProduct = allProducts.find((p) => p.sku === selectedSku);
  const effectiveSku = selectedSku ? (variantSkus[selectedSku] ?? selectedSku) : null;
  const selectedVariantImage = selectedProduct?.variants?.find((v) => v.sku === effectiveSku)?.image ?? selectedProduct?.image;
  const isPhysicalCard = selectedProduct?.allowEngraving === true;
  const engravingText = [engravingName.trim(), engravingTitle.trim()].filter(Boolean).join(" | ");

  const isComingSoon = selectedProduct?.comingSoon === true;
  const isPreOrder = selectedProduct?.preOrder === true;

  function chooseProduct(product: Product) {
    setSelectedSku(product.sku);
    setWaitlistProduct(null);
  }

  return (
    <div className="kx-checkout">
      <a href="#checkout-main" className="co-skip">Skip to checkout</a>
      <header className="co-header">
        <div className="co-shell co-header-inner">
          <Link href="/" className="co-logo" aria-label="KONEX home" data-testid="link-logo"><KonexLogo height={36} /></Link>
          <nav className="co-nav" aria-label="Main navigation">
            <Link href="/konex-cards#tiers">Cards</Link>
            <Link href="/konex-cards#benefits">Benefits</Link>
            <Link href="/konex-cards#compare">Compare</Link>
            <Link href="/what-is-nfc">What is NFC</Link>
            <Link href="/auth" data-testid="button-login">Log in</Link>
            <Link href="/auth?tab=register" className="co-register" data-testid="button-get-started">Sign up free</Link>
          </nav>
          <details className="co-mobile-menu">
            <summary aria-label="Open navigation"><Menu size={22} aria-hidden="true" /></summary>
            <nav aria-label="Mobile navigation">
              <Link href="/konex-cards#tiers">Cards</Link>
              <Link href="/konex-cards#benefits">Benefits</Link>
              <Link href="/konex-cards#compare">Compare</Link>
              <Link href="/what-is-nfc">What is NFC</Link>
              <Link href="/auth">Log in</Link>
              <Link href="/auth?tab=register">Sign up free</Link>
            </nav>
          </details>
        </div>
      </header>

      <main id="checkout-main" className="co-shell">
        <section className="co-intro" aria-labelledby="checkout-title">
          <div className="co-eyebrow"><LockKeyhole size={15} aria-hidden="true" /> The next introduction starts here</div>
          <div className="co-intro-row">
            <h1 id="checkout-title">Choose your KONEX.</h1>
            <p>A simple tap. A lasting connection. Find the card that feels like you.</p>
          </div>
          <div className="co-progress" aria-label="Checkout steps">
            <strong>01 Choose your card</strong><ArrowRight aria-hidden="true" />
            <span>02 Make it yours</span><ArrowRight aria-hidden="true" /><span>03 Secure payment</span>
          </div>
        </section>

        <div className="co-layout">
          <div className="co-catalog">
            <section id="checkout-products" aria-labelledby="products-title">
              <div className="co-section-heading"><h2 id="products-title">Your introduction, upgraded.</h2><span>One-time purchase</span></div>
              <div className="co-products">
                {PRODUCTS.map((p) => {
                  const isSelected = selectedSku === p.sku;
                  const activeVariantSku = variantSkus[p.sku] ?? p.sku;
                  const activeVariant = p.variants?.find((v) => v.sku === activeVariantSku);
                  const displayImage = activeVariant?.image ?? p.image;
                  return (
                    <article key={p.sku} className={`co-product${isSelected ? " is-selected" : ""}`} data-testid={`card-product-${p.sku}`}>
                      <div className="co-product-visual">
                        {p.badge && <span className="co-badge" data-testid={`badge-${p.sku}`}>{p.badge}</span>}
                        {displayImage ? <img src={displayImage} alt={`${p.name}${activeVariant ? ` — ${activeVariant.label}` : ""}`} data-testid={`img-product-${p.sku}`} /> : (
                          <div className="co-digital">
                            <div className="co-digital-icon"><span>KONEX</span><Smartphone size={33} aria-hidden="true" /></div>
                            <div className="co-digital-copy">Always ready to connect.<small>Your profile. One link.</small></div>
                          </div>
                        )}
                      </div>
                      <div className="co-product-body">
                        <h3 data-testid={`text-product-name-${p.sku}`}>{p.name}</h3>
                        <p className="co-product-description">{p.description}</p>
                        {p.variants && <div className="co-swatches" role="group" aria-label={`${p.name} finish`}>
                          {p.variants.map((v) => (
                            <button key={v.sku} type="button" className="co-swatch" aria-pressed={activeVariantSku === v.sku} data-testid={`swatch-${v.sku}`} onClick={() => {
                              chooseProduct(p);
                              setVariantSkus((s) => ({ ...s, [p.sku]: v.sku }));
                            }}>
                              <span className="co-swatch-dot" style={{ background: v.swatch }} aria-hidden="true" />{v.label}
                            </button>
                          ))}
                        </div>}
                        <ul className="co-features">{p.features.map((f) => <li key={f}><CheckCircle size={14} aria-hidden="true" />{f}</li>)}</ul>
                        <div className="co-price-row">
                          <span className="co-price" data-testid={`text-price-${p.sku}`}>{p.price}</span>
                          <span className="co-price-note" data-testid={p.preOrder ? `badge-preorder-${p.sku}` : undefined}>{p.priceNote}</span>
                        </div>
                        <button type="button" className="co-button co-select" aria-pressed={isSelected} aria-label={`${isSelected ? "Selected" : "Choose"} ${p.name}`} data-testid={`radio-${p.sku}`} onClick={() => chooseProduct(p)}>
                          {isSelected ? <><CheckCircle size={17} aria-hidden="true" /> Selected</> : <>Choose {p.name === "Digital Profile" ? "profile" : "card"}<ArrowRight size={17} aria-hidden="true" /></>}
                        </button>
                        {isSelected && <a href="#checkout-order" className="co-review-link">Personalise &amp; review order <ArrowRight size={15} aria-hidden="true" /></a>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="co-soon" aria-labelledby="coming-soon-title">
              <div className="co-eyebrow">In the works</div>
              <h2 id="coming-soon-title">New ways to make your mark.</h2>
              <p>Our next chapter of cards. Join a waitlist to hear when they arrive.</p>
              <div className="co-soon-list">
                {COMING_SOON.map((p) => (
                  <article key={p.sku} className={`co-product co-soon-product${selectedSku === p.sku ? " is-selected" : ""}`} data-testid={`card-product-${p.sku}`}>
                    <ComingSoonCardVisual product={p} />
                    <div className="co-product-body">
                      <div className="co-eyebrow" data-testid={`badge-${p.sku}`}>Coming soon</div>
                      <h3 data-testid={`text-product-name-${p.sku}`}>{p.name}</h3>
                      <p className="co-product-description">{p.description}</p>
                      <div className="co-price-row"><span className="co-price" data-testid={`text-price-${p.sku}`}>{p.price}</span><span className="co-price-note">{p.priceNote} · Not yet available</span></div>
                      <button type="button" className="co-button co-select" aria-pressed={selectedSku === p.sku} onClick={() => {
                        chooseProduct(p);
                        document.getElementById("checkout-order")?.scrollIntoView({ block: "start" });
                      }} aria-label={`View waitlist for ${p.name}`}><Bell size={15} aria-hidden="true" />{selectedSku === p.sku ? "Selected for waitlist" : "View waitlist"}</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside id="checkout-order" className="co-order" aria-labelledby="order-title">
            <div className="co-order-heading"><h2 id="order-title">{isComingSoon ? "Stay in the loop." : "Make it yours."}</h2><ShoppingCart size={21} aria-hidden="true" /></div>
            {!selectedSku ? (
              <div className="co-order-empty">
                <Nfc size={36} aria-hidden="true" />
                <h3>One card. More possibilities.</h3>
                <p>Select a profile or card to review your order and add your personal touch.</p>
                <a href="#checkout-products" className="co-button">Explore the collection <ArrowRight size={17} aria-hidden="true" /></a>
              </div>
            ) : (
              <>
                <div className="co-order-item" aria-live="polite">
                  {selectedVariantImage ? <img src={selectedVariantImage} alt={selectedProduct?.name} /> : isComingSoon ? <Bell size={30} aria-hidden="true" /> : <Smartphone size={30} aria-hidden="true" />}
                  <div><h3>{selectedProduct?.name}</h3>
                    <p>{selectedProduct?.variants ? `${selectedProduct.variants.find((v) => v.sku === effectiveSku)?.label} finish` : isComingSoon ? "Coming soon" : "One-time purchase"}</p>
                  </div>
                </div>
                {isPhysicalCard && !isComingSoon && (
                  <fieldset className="co-engraving" data-testid="section-engraving">
                    <legend><PenLine size={15} aria-hidden="true" />Custom engraving <span className="co-optional">Optional</span></legend>
                    <p className="co-help">Your name. Your title. Your card. Leave blank if you prefer no engraving.</p>
                    <div className="co-field">
                      <label htmlFor="engraving-name">Name to engrave</label>
                      <input id="engraving-name" type="text" maxLength={30} autoComplete="name" placeholder="e.g. Alex Rivera" value={engravingName} onChange={(e) => setEngravingName(e.target.value)} data-testid="input-engraving-name" className="co-input" aria-describedby="engraving-name-count" />
                      <span id="engraving-name-count" className="co-counter">{engravingName.length}/30</span>
                    </div>
                    <div className="co-field">
                      <label htmlFor="engraving-title">Title / Position</label>
                      <input id="engraving-title" type="text" maxLength={30} autoComplete="organization-title" placeholder="e.g. Product Designer" value={engravingTitle} onChange={(e) => setEngravingTitle(e.target.value)} data-testid="input-engraving-title" className="co-input" aria-describedby="engraving-title-count" />
                      <span id="engraving-title-count" className="co-counter">{engravingTitle.length}/30</span>
                    </div>
                    {engravingText && <div className="co-preview">Engraving preview<br /><strong>{engravingText}</strong></div>}
                  </fieldset>
                )}
                {isComingSoon ? (
                  waitlistProduct?.sku === selectedSku ? (
                    <WaitlistForm key={selectedSku} product={selectedProduct!} onDone={() => { setWaitlistProduct(null); setSelectedSku(null); }} />
                  ) : (
                    <div className="co-waitlist">
                      <p>This product is not yet available for purchase. Be first to hear when it launches.</p>
                      <button className="co-button" onClick={() => setWaitlistProduct(selectedProduct!)} data-testid="button-join-waitlist"><Bell size={16} aria-hidden="true" />Join the waitlist</button>
                      <p className="co-fine">No payment required.</p>
                    </div>
                  )
                ) : (
                  <>
                    <div className="co-total"><span>Product total</span><strong>{selectedProduct?.price}</strong></div>
                    {isPreOrder && <div className="co-notice" data-testid="notice-preorder"><strong>Pre-order</strong><br />Pay securely today — your card ships within <strong>4–6 weeks</strong> once production is complete.</div>}
                    {configLoading ? <div className="co-loading" role="status" aria-label="Loading payment options" /> : configError ? (
                      <div className="co-notice co-error" role="alert">We couldn't load payment options. Your selection is saved here.<br /><button className="co-link-button" onClick={() => void retryConfig()}>Try again</button></div>
                    ) : !configured ? (
                      <div className="co-notice co-error" role="status">Payment system is not yet configured. Please contact us to complete your order.</div>
                    ) : (
                      <PayPalButton
                        sku={effectiveSku ?? selectedSku}
                        clientId={clientId}
                        onSuccess={handlePayPalSuccess}
                        onCancel={handlePayPalCancel}
                        engravingText={engravingText || undefined}
                      />
                    )}
                    <div className="co-legal">
                      <p className="co-fine" data-testid="text-refund-acknowledgement">By completing your purchase, you agree to our <Link href="/refund-policy" data-testid="link-refund-policy">Refund &amp; Return Policy</Link>.</p>
                      <p className="co-fine">By purchasing you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
                    </div>
                  </>
                )}
              </>
            )}
            <ul className="co-assurances">
              <li><Shield size={15} aria-hidden="true" />Secure PayPal checkout</li>
              <li><CheckCircle size={15} aria-hidden="true" />One-time purchase. No subscription.</li>
              <li><Nfc size={15} aria-hidden="true" />Built for your next introduction.</li>
            </ul>
          </aside>
        </div>
      </main>
      <footer className="co-footer">
        <div className="co-shell co-footer-inner">
          <p>&copy; {new Date().getFullYear()} KONEX. All rights reserved.</p>
          <nav aria-label="Legal">
            <Link href="/terms" data-testid="link-footer-terms">Terms of Service</Link>
            <Link href="/privacy" data-testid="link-footer-privacy">Privacy Policy</Link>
            <Link href="/refund-policy" data-testid="link-footer-refund">Refund &amp; Return Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
