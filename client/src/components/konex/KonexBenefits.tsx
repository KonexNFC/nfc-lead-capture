import { benefits } from "./konex-data";

export default function KonexBenefits() {
  return (
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
  );
}
