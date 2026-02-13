import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function KonexHero() {
  return (
    <section className="relative pt-20 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1]" data-testid="text-hero-headline">
          Tap once. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Share everything.</span>
        </h1>

        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto" data-testid="text-hero-subheadline">
          KONEX NFC cards replace paper business cards with instant digital
          profiles. One tap connects people to your contact details, social
          links, portfolio, and payment links — no app required.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link href="/konex-cards">
            <Button
              size="lg"
              className="h-14 px-8 rounded-full text-lg font-semibold shadow-xl shadow-primary/20"
              data-testid="button-hero-get-card"
            >
              Get your KONEX card
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/waitlist">
            <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg" data-testid="button-hero-waitlist">
              Join the waitlist
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
