import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function KonexFinalCTA() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
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
  );
}
