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
  ArrowLeft,
  Sparkles,
  Crown,
  Gem,
  Check,
  Menu,
  ChevronRight,
  Eye,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Headphones,
  CreditCard,
  Paintbrush,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1770323201397.jpeg";

interface TierDetail {
  id: "basic" | "premium" | "elite";
  name: string;
  tagline: string;
  heroDescription: string;
  icon: typeof Sparkles;
  accent: string;
  accentBg: string;
  gradientFrom: string;
  gradientTo: string;
  features: { icon: typeof Nfc; title: string; description: string }[];
  specs: string[];
}

const tierDetails: Record<string, TierDetail> = {
  basic: {
    id: "basic",
    name: "KONEX Basic",
    tagline: "Simple. Smart. Always connected.",
    heroDescription:
      "The KONEX Basic is your entry into modern networking. A clean, professional NFC card that lets you share your digital profile with a single tap. No frills, just results.",
    icon: Sparkles,
    accent: "text-primary",
    accentBg: "bg-primary/10",
    gradientFrom: "from-primary/15",
    gradientTo: "to-primary/5",
    features: [
      { icon: Nfc, title: "One-tap NFC sharing", description: "Instantly share your profile by tapping your card on any modern smartphone." },
      { icon: UserCheck, title: "No app required", description: "Recipients don't need to download anything. Your profile opens in their browser." },
      { icon: CreditCard, title: "Matte finish", description: "Clean, professional matte finish that makes a great first impression." },
      { icon: RefreshCw, title: "Update anytime", description: "Change your profile info, links, and photos whenever you want. The card stays the same." },
      { icon: Smartphone, title: "iPhone & Android", description: "Works seamlessly with both iPhone and Android devices." },
      { icon: Leaf, title: "Eco-friendly", description: "Replace hundreds of paper business cards with one reusable NFC card." },
    ],
    specs: ["PVC matte finish", "NFC Type A chip", "Standard credit card size", "Custom profile link", "Lead capture form", "QR code backup"],
  },
  premium: {
    id: "premium",
    name: "KONEX Premium",
    tagline: "Elevated presence. Premium impression.",
    heroDescription:
      "The KONEX Premium is for professionals who want to stand out. Brushed metal finish, micro-logo engraving, and advanced features that elevate every interaction.",
    icon: Crown,
    accent: "text-accent",
    accentBg: "bg-accent/10",
    gradientFrom: "from-accent/15",
    gradientTo: "to-accent/5",
    features: [
      { icon: Shield, title: "Brushed metal finish", description: "Premium brushed metal construction that commands attention and feels substantial." },
      { icon: Paintbrush, title: "Micro-logo engraving", description: "Your logo or initials laser-engraved on the card for a personal touch." },
      { icon: CreditCard, title: "Ultra-slim feel", description: "Thinner than a credit card yet incredibly durable. Fits perfectly in any wallet." },
      { icon: BarChart3, title: "Advanced analytics", description: "Track profile views, lead conversions, and engagement metrics in your dashboard." },
      { icon: Headphones, title: "Priority support", description: "Direct access to our support team with faster response times." },
      { icon: RefreshCw, title: "Unlimited updates", description: "Change your profile as often as you like. Your card is always current." },
    ],
    specs: ["Brushed metal finish", "NFC Type A chip", "Laser-engraved logo", "Ultra-slim profile", "Advanced analytics dashboard", "Priority support channel"],
  },
  elite: {
    id: "elite",
    name: "KONEX Elite",
    tagline: "For those who move differently.",
    heroDescription:
      "The KONEX Elite is the ultimate networking statement. Luxury finishes, white-glove onboarding, and exclusive features for executives and founders who demand the best.",
    icon: Gem,
    accent: "text-purple-400",
    accentBg: "bg-purple-500/10",
    gradientFrom: "from-purple-500/15",
    gradientTo: "to-purple-500/5",
    features: [
      { icon: Gem, title: "Luxury finishes", description: "Choose from premium materials including brushed gold, matte black, and carbon fiber." },
      { icon: Shield, title: "Discreet branding", description: "Subtle, elegant branding that speaks volumes without saying too much." },
      { icon: Globe, title: "Custom domain support", description: "Use your own domain for your profile link. Full brand control." },
      { icon: Headphones, title: "White-glove onboarding", description: "Personal setup assistance to ensure your profile is perfect from day one." },
      { icon: BarChart3, title: "Executive analytics", description: "Comprehensive analytics with export capabilities and team management features." },
      { icon: Crown, title: "Executive-grade NFC", description: "Extended range NFC chip for faster, more reliable connections every time." },
    ],
    specs: ["Luxury material options", "Extended-range NFC chip", "Custom domain support", "White-glove onboarding", "Executive analytics suite", "Dedicated account manager"],
  },
};

export default function KonexCardsTierPage({ tierId }: { tierId: string }) {
  const tier = tierDetails[tierId];

  if (!tier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Tier not found</h1>
          <Link href="/konex-cards">
            <Button variant="outline">Back to all cards</Button>
          </Link>
        </div>
      </div>
    );
  }

  const TierIcon = tier.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="w-full border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src={konexLogo} alt="KONEX Logo" className="h-8 w-auto rounded cursor-pointer" />
            </Link>
            <div className="hidden md:flex items-center gap-1 ml-4">
              <Link href="/konex-cards">
                <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" data-testid="nav-all-cards">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  All Cards
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
                <Link href="/konex-cards">
                  <DropdownMenuItem>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    All Cards
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href="/konex-cards/basic">
                  <DropdownMenuItem>
                    <Sparkles className="h-4 w-4 mr-2" />
                    KONEX Basic
                  </DropdownMenuItem>
                </Link>
                <Link href="/konex-cards/premium">
                  <DropdownMenuItem>
                    <Crown className="h-4 w-4 mr-2" />
                    KONEX Premium
                  </DropdownMenuItem>
                </Link>
                <Link href="/konex-cards/elite">
                  <DropdownMenuItem>
                    <Gem className="h-4 w-4 mr-2" />
                    KONEX Elite
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
        {/* Hero */}
        <section className="relative pt-20 pb-24 px-4 overflow-hidden">
          <div className={`absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${tier.gradientFrom} via-background to-background`} />

          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Link href="/konex-cards">
              <Button variant="ghost" size="sm" className="text-muted-foreground mb-4" data-testid="link-back-all-cards">
                <ArrowLeft className="h-4 w-4 mr-1" />
                All KONEX Cards
              </Button>
            </Link>

            <div className={`inline-flex h-20 w-20 rounded-3xl ${tier.accentBg} items-center justify-center mx-auto`}>
              <TierIcon className={`h-10 w-10 ${tier.accent}`} />
            </div>

            <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight" data-testid="text-tier-hero-name">
              {tier.name}
            </h1>
            <p className={`text-xl font-medium ${tier.accent}`} data-testid="text-tier-tagline">{tier.tagline}</p>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto" data-testid="text-tier-description">
              {tier.heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link href="/auth?tab=register">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg font-semibold shadow-xl shadow-primary/20" data-testid="button-tier-order">
                  Order {tier.name}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg" data-testid="button-tier-waitlist">
                  Join the waitlist
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-4 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-features-heading">
                What's included
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything that comes with your {tier.name}.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tier.features.map((feature, i) => {
                const FIcon = feature.icon;
                return (
                  <Card key={i} className="border-border/50" data-testid={`card-feature-${i}`}>
                    <CardContent className="p-6 space-y-3">
                      <div className={`h-10 w-10 rounded-xl ${tier.accentBg} flex items-center justify-center`}>
                        <FIcon className={`h-5 w-5 ${tier.accent}`} />
                      </div>
                      <h3 className="text-lg font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Specs */}
        <section className="py-24 px-4 bg-background">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-specs-heading">
                Specifications
              </h2>
            </div>
            <div className="space-y-3">
              {tier.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50" data-testid={`spec-${i}`}>
                  <Check className={`h-5 w-5 ${tier.accent} shrink-0`} />
                  <span className="text-sm font-medium">{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-32 px-4 overflow-hidden">
          <div className={`absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${tier.gradientFrom} via-background to-background`} />

          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight" data-testid="text-tier-final-cta">
              Ready for {tier.name}?
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Start making unforgettable first impressions today.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link href="/auth?tab=register">
                <Button size="lg" className="h-14 px-10 rounded-full text-lg font-semibold shadow-xl shadow-primary/20" data-testid="button-tier-final-order">
                  Order {tier.name}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/konex-cards">
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg" data-testid="button-compare-tiers">
                  Compare all tiers
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
