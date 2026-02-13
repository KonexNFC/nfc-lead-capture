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
        <KonexTierGrid />
        <KonexBenefits />
        <KonexComparisonMini />
        <KonexFinalCTA />
      </main>
      <KonexFooter />
    </div>
  );
}
