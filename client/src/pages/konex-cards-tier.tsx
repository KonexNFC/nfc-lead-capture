import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import KonexNav from "@/components/konex/KonexNav";
import KonexFooter from "@/components/konex/KonexFooter";
import { tierDetails } from "@/components/konex/konex-data";

export default function KonexCardsTierPage({ tierId }: { tierId: string }) {
  const tier = tierDetails[tierId];

  if (!tier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold" data-testid="text-tier-not-found">Tier not found</h1>
          <Link href="/konex-cards">
            <Button variant="outline" data-testid="button-back-all-cards">Back to all cards</Button>
          </Link>
        </div>
      </div>
    );
  }

  const TierIcon = tier.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <KonexNav variant="tier" />

      <main className="flex-1">
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

      <KonexFooter />
    </div>
  );
}
