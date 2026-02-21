import KonexNav from "@/components/konex/KonexNav";
import KonexHero from "@/components/konex/KonexHero";
import KonexTierGrid from "@/components/konex/KonexTierGrid";
import KonexBenefits from "@/components/konex/KonexBenefits";
import KonexComparisonMini from "@/components/konex/KonexComparisonMini";
import KonexFinalCTA from "@/components/konex/KonexFinalCTA";
import KonexFooter from "@/components/konex/KonexFooter";

export default function KonexCardsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <KonexNav variant="overview" />
      <main className="flex-1">
        <KonexHero />

        <section className="py-16 bg-muted/20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4" data-testid="text-video-heading">See it in action</h2>
            <p className="text-muted-foreground mb-8">Watch how KONEX NFC cards create instant connections.</p>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full"
                data-testid="video-konex-product"
              >
                <source src="/videos/konex-product.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        <KonexTierGrid />
        <KonexBenefits />
        <KonexComparisonMini />
        <KonexFinalCTA />
      </main>
      <KonexFooter />
    </div>
  );
}
