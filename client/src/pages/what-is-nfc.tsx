import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Smartphone, CreditCard, Trees, Recycle, Tag, Users, ShoppingCart, Building2, CalendarCheck, Nfc } from "lucide-react";
import konexLogo from "@assets/IMG_9139_1775995278347.png";

const materials = [
  {
    icon: CreditCard,
    title: "PVC (Plastic)",
    desc: "The most common material, offering durability, water resistance, and a smooth professional finish. Ideal for daily use and large-scale distribution.",
  },
  {
    icon: CreditCard,
    title: "Metal",
    desc: "Premium and heavy-duty, metal NFC cards provide a luxurious feel and high-end brand image. Available in stainless steel, brushed metal, or matte black finishes.",
  },
  {
    icon: Trees,
    title: "Wood",
    desc: "Eco-friendly and elegant, wooden NFC cards are perfect for brands that value sustainability and a natural aesthetic. Common wood types include bamboo, walnut, and maple.",
  },
  {
    icon: Recycle,
    title: "Paperboard or Recycled Cardboard",
    desc: "An eco-conscious choice that combines functionality with minimal environmental impact \u2014 ideal for green business branding.",
  },
];

const cardTypes = [
  {
    icon: CreditCard,
    title: "Standard NFC Business Cards",
    desc: "Single-profile cards programmed with contact info or a vCard.",
  },
  {
    icon: Users,
    title: "Multi-profile NFC Cards",
    desc: "Cards with dynamic links that can be updated online without changing the physical card \u2014 ideal for professionals with multiple brands or services.",
  },
  {
    icon: CreditCard,
    title: "Custom-Shaped or Branded NFC Cards",
    desc: "Cards designed in custom sizes or with logo cutouts, unique designs, and personalized printing.",
  },
  {
    icon: Tag,
    title: "NFC Smart Tags / Sticker Cards",
    desc: "Smaller in size and highly flexible for adding to existing items like phone cases or brochures.",
  },
];

const applications = [
  {
    icon: Users,
    title: "Professional Networking",
    desc: "Instantly share your contact info, LinkedIn, or digital resume at events and meetings.",
  },
  {
    icon: ShoppingCart,
    title: "Sales & Marketing",
    desc: "Showcase your product catalog, website, or promotional videos in one tap.",
  },
  {
    icon: Building2,
    title: "Corporate Identity",
    desc: "Issue branded NFC cards to employees, partners, or VIP clients to enhance professional image.",
  },
  {
    icon: CalendarCheck,
    title: "Event Access & Lead Collection",
    desc: "Use NFC-enabled cards for access control, check-in, or lead tracking at exhibitions and trade shows.",
  },
];

export default function WhatIsNfcPage() {
  useEffect(() => {
    document.title = "What is NFC? - NFC Business Cards | KONEX";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Learn about NFC business cards: materials, types, and modern applications. Discover how KONEX NFC cards revolutionize professional networking.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = "Learn about NFC business cards: materials, types, and modern applications. Discover how KONEX NFC cards revolutionize professional networking.";
      document.head.appendChild(newMeta);
    }
    return () => { document.title = "KONEX - Digital Business Cards"; };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="w-full border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo-home">
              <img src={konexLogo} alt="KONEX Logo" className="h-16 w-auto" style={{ mixBlendMode: "screen" }} />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button className="font-semibold shadow-lg shadow-primary/20" data-testid="button-get-started-nfc">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="relative pt-16 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
              <Nfc className="h-3 w-3 mr-2" />
              Learn About NFC
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight" data-testid="text-nfc-title">
              NFC Business Cards
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Materials, Types, and Modern Applications
            </p>
          </div>
        </section>

        <section className="py-16 border-t border-border/50">
          <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4" data-testid="text-what-is-nfc">
                What is an NFC Business Card?
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                An NFC business card contains a small embedded chip that can wirelessly transmit data to a smartphone when tapped. Unlike traditional paper cards, NFC cards allow for dynamic content &mdash; including contact info, websites, social media profiles, portfolios, reviews and more &mdash; all accessible with just one tap.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30 border-y border-border/50">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-8 text-center" data-testid="text-materials-title">
              Materials of NFC Business Cards
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {materials.map((mat, i) => (
                <Card key={i} className="border-border/50" data-testid={`card-material-${i}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <mat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">{mat.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{mat.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-8 text-center" data-testid="text-types-title">
              Types of NFC Business Cards
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {cardTypes.map((type, i) => (
                <Card key={i} className="border-border/50" data-testid={`card-type-${i}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-accent/10 text-accent flex items-center justify-center">
                        <type.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">{type.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{type.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30 border-y border-border/50">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-8 text-center" data-testid="text-applications-title">
              Applications of NFC Business Cards
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {applications.map((app, i) => (
                <Card key={i} className="border-border/50" data-testid={`card-application-${i}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <app.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">{app.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{app.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 md:px-6 text-center space-y-6">
            <p className="text-muted-foreground text-lg leading-relaxed">
              NFC business cards are not only a smart, eco-friendly alternative to traditional cards but also a powerful tool for digital engagement. At KONEX we provide high-quality NFC card solutions to suit your branding, function, and budget needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/auth?tab=register">
                <Button size="lg" className="rounded-full font-semibold shadow-xl shadow-primary/20" data-testid="button-create-card-nfc">
                  Create Your Card
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg" className="rounded-full" data-testid="button-learn-more-nfc">
                  Learn More
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
