import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Nfc,
  Smartphone,
  RefreshCw,
  Leaf,
  UserCheck,
  ArrowRight,
  Sparkles,
  Crown,
  Gem,
  Check,
  ChevronRight,
  Menu,
  Eye,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1770323201397.jpeg";

type KonexTier = {
  id: "basic" | "premium" | "elite";
  name: string;
  tagline: string;
  shortDescription: string;
  benefits: string[];
  ctaLabel: string;
  ctaHref: string;
  icon: typeof Sparkles;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
};

const konexTiers: KonexTier[] = [
  {
    id: "basic",
    name: "KONEX Basic",
    tagline: "Simple. Smart. Always connected.",
    shortDescription: "Clean, everyday digital business card.",
    benefits: ["One-tap sharing", "Matte finish", "No app required", "Custom profile link", "Lead capture"],
    ctaLabel: "Order KONEX Basic",
    ctaHref: "/konex-cards/basic",
    icon: Sparkles,
    accent: "text-primary",
    gradientFrom: "from-primary/20",
    gradientTo: "to-primary/5",
  },
  {
    id: "premium",
    name: "KONEX Premium",
    tagline: "Elevated presence. Premium impression.",
    shortDescription: "Premium metal and matte finishes.",
    benefits: ["Brushed metal finish", "Micro-logo engraving", "Ultra-slim feel", "Priority support", "Advanced analytics"],
    ctaLabel: "Upgrade to Premium",
    ctaHref: "/konex-cards/premium",
    icon: Crown,
    accent: "text-accent",
    gradientFrom: "from-accent/20",
    gradientTo: "to-accent/5",
  },
  {
    id: "elite",
    name: "KONEX Elite",
    tagline: "For those who move differently.",
    shortDescription: "Ultra-premium status card.",
    benefits: ["Luxury finishes", "Discreet branding", "Executive-grade NFC", "White-glove onboarding", "Custom domain support"],
    ctaLabel: "Access Elite",
    ctaHref: "/konex-cards/elite",
    icon: Gem,
    accent: "text-purple-400",
    gradientFrom: "from-purple-500/20",
    gradientTo: "to-purple-500/5",
  },
];

const benefits = [
  { icon: Nfc, text: "One-tap instant contact sharing" },
  { icon: Smartphone, text: "Works on iPhone & Android" },
  { icon: UserCheck, text: "No app required for recipients" },
  { icon: RefreshCw, text: "Update your profile anytime" },
  { icon: Leaf, text: "Eco-friendly alternative to paper cards" },
];

const comparisonSnapshot = [
  {
    id: "basic" as const,
    name: "Basic",
    bullets: ["NFC tap sharing", "Matte finish", "Lead capture"],
    href: "/konex-cards/basic",
    accent: "text-primary",
    icon: Sparkles,
  },
  {
    id: "premium" as const,
    name: "Premium",
    bullets: ["Brushed metal finish", "Logo engraving", "Advanced analytics"],
    href: "/konex-cards/premium",
    accent: "text-accent",
    icon: Crown,
  },
  {
    id: "elite" as const,
    name: "Elite",
    bullets: ["Luxury finishes", "Custom domain", "White-glove onboarding"],
    href: "/konex-cards/elite",
    accent: "text-purple-400",
    icon: Gem,
  },
];

export default function KonexCardsPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="w-full border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src={konexLogo} alt="KONEX Logo" className="h-8 w-auto rounded cursor-pointer" data-testid="link-logo" />
            </Link>
            <div className="hidden md:flex items-center gap-1 ml-4">
              <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" onClick={() => scrollTo("tiers")} data-testid="nav-tiers">
                Cards
              </Button>
              <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" onClick={() => scrollTo("benefits")} data-testid="nav-benefits">
                Benefits
              </Button>
              <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" onClick={() => scrollTo("compare")} data-testid="nav-compare">
                Compare
              </Button>
              <Link href="/what-is-nfc">
                <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" data-testid="nav-what-is-nfc">
                  What is NFC
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-nav-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => scrollTo("tiers")} data-testid="menu-tiers">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Cards
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollTo("benefits")} data-testid="menu-benefits">
                  <Zap className="h-4 w-4 mr-2" />
                  Benefits
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollTo("compare")} data-testid="menu-compare">
                  <Eye className="h-4 w-4 mr-2" />
                  Compare
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href="/what-is-nfc">
                  <DropdownMenuItem data-testid="menu-what-is-nfc">
                    <Nfc className="h-4 w-4 mr-2" />
                    What is NFC
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/auth">
              <Button variant="ghost" className="font-medium" data-testid="button-login">Log in</Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button className="font-semibold shadow-lg shadow-primary/20" data-testid="button-get-started">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 px-4 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="absolute -top-20 -right-20 h-96 w-96 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-20 -left-20 h-96 w-96 bg-accent/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Nfc className="h-4 w-4 mr-2" />
              KONEX NFC Cards
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1]" data-testid="text-hero-headline">
              Tap once. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Share everything.</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto" data-testid="text-hero-subheadline">
              KONEX NFC cards replace paper business cards with instant digital profiles. Choose the tier that matches your ambition.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Button
                size="lg"
                className="h-14 px-8 rounded-full text-lg font-semibold shadow-xl shadow-primary/20"
                onClick={() => scrollTo("tiers")}
                data-testid="button-hero-get-card"
              >
                Get your KONEX card
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/auth?tab=register">
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg" data-testid="button-hero-waitlist">
                  Join the waitlist
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Product Tier Cards */}
        <section id="tiers" className="py-24 px-4 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-tiers-heading">
                Choose your KONEX card
              </h2>
              <p className="text-muted-foreground text-lg">
                Three tiers designed for every level of professional networking.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {konexTiers.map((tier) => {
                const TierIcon = tier.icon;
                return (
                  <Card
                    key={tier.id}
                    className={`relative overflow-visible border-border/50 flex flex-col hover-elevate transition-all duration-300 ${tier.id === "premium" ? "md:-translate-y-2 border-accent/30" : ""}`}
                    data-testid={`card-tier-${tier.id}`}
                  >
                    {tier.id === "premium" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-accent-foreground" data-testid="badge-popular">
                        Most Popular
                      </div>
                    )}
                    <CardContent className="flex flex-col flex-1 p-6 md:p-8">
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${tier.gradientFrom} ${tier.gradientTo} flex items-center justify-center mb-6`}>
                        <TierIcon className={`h-6 w-6 ${tier.accent}`} />
                      </div>
                      <h3 className="text-2xl font-display font-bold mb-1" data-testid={`text-tier-name-${tier.id}`}>
                        {tier.name}
                      </h3>
                      <p className={`text-sm font-medium ${tier.accent} mb-2`}>{tier.tagline}</p>
                      <p className="text-muted-foreground text-sm mb-6">{tier.shortDescription}</p>

                      <ul className="space-y-3 mb-8 flex-1">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className={`h-4 w-4 mt-0.5 shrink-0 ${tier.accent}`} />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>

                      <Link href={tier.ctaHref}>
                        <Button
                          className="w-full font-semibold shadow-lg"
                          variant={tier.id === "premium" ? "default" : "outline"}
                          data-testid={`button-tier-cta-${tier.id}`}
                        >
                          {tier.ctaLabel}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Key Benefits Strip */}
        <section id="benefits" className="py-24 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-benefits-heading">
                Why KONEX?
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything you need for modern professional networking.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {benefits.map((b, i) => {
                const BIcon = b.icon;
                return (
                  <div key={i} className="flex flex-col items-center text-center gap-3" data-testid={`benefit-${i}`}>
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <BIcon className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-sm font-medium leading-snug">{b.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison Snapshot */}
        <section id="compare" className="py-24 px-4 bg-muted/30 border-y border-border/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-compare-heading">
                Compare at a glance
              </h2>
              <p className="text-muted-foreground text-lg">
                See which tier is right for you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {comparisonSnapshot.map((col) => {
                const ColIcon = col.icon;
                return (
                  <Link key={col.id} href={col.href}>
                    <Card className="h-full border-border/50 hover-elevate transition-all cursor-pointer" data-testid={`card-compare-${col.id}`}>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <ColIcon className={`h-5 w-5 ${col.accent}`} />
                          <h3 className={`text-lg font-display font-bold ${col.accent}`} data-testid={`text-compare-name-${col.id}`}>
                            {col.name}
                          </h3>
                        </div>
                        <ul className="space-y-2">
                          {col.bullets.map((bullet, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className={`h-4 w-4 mt-0.5 shrink-0 ${col.accent}`} />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center gap-1 text-sm font-medium pt-2">
                          <span className={col.accent}>Learn more</span>
                          <ChevronRight className={`h-4 w-4 ${col.accent}`} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-96 w-96 bg-primary/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight" data-testid="text-final-cta-heading">
              The last business card you'll ever need.
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Join thousands of professionals who have upgraded their networking with KONEX.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Button
                size="lg"
                className="h-14 px-10 rounded-full text-lg font-semibold shadow-xl shadow-primary/20"
                onClick={() => scrollTo("tiers")}
                data-testid="button-final-get-card"
              >
                Get your KONEX card
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/auth?tab=register">
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg" data-testid="button-final-waitlist">
                  Join the waitlist
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border/50 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} KONEX. All rights reserved.</p>
      </footer>
    </div>
  );
}
