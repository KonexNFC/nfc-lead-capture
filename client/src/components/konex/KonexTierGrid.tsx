import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { konexTiers } from "./konex-data";

export default function KonexTierGrid() {
  return (
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
  );
}
