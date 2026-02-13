import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { comparisonSnapshot } from "./konex-data";

export default function KonexComparisonMini() {
  return (
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
  );
}
