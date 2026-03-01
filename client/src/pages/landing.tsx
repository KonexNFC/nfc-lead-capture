import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { QrCode, Share2, Smartphone, Linkedin, Globe, Palette, Nfc, Eye, Users, Menu, Zap, ChevronRight, Star, Quote } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1770323201397.jpeg";
import cardBasic from "@assets/IMG_7774_1771669634221.png";
import cardPremium from "@assets/IMG_7776_1771669634221.png";
import cardElite from "@assets/IMG_7775_1771669634221.png";
import cardThreeTiers from "@assets/41A7CAD6-1759-450E-83FE-47CF37A2B9D8_1771669634221.png";
import cardInHand from "@assets/IMG_7743_1771669634221.jpeg";
import cardPersonalized from "@assets/IMG_7777_1771669634221.png";

export default function LandingPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="w-full border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={konexLogo} alt="KONEX Logo" className="h-8 w-auto rounded" />
            <div className="hidden md:flex items-center gap-1 ml-4">
              <Link href="/konex-cards">
                <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" data-testid="nav-konex-cards">
                  KONEX Cards
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" onClick={() => scrollTo("how-it-works")} data-testid="nav-how-it-works">
                How It Works
              </Button>
              <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" onClick={() => scrollTo("features")} data-testid="nav-features">
                Features
              </Button>
              <Link href="/what-is-nfc">
                <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" data-testid="nav-what-is-nfc">
                  What is NFC
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
                  <DropdownMenuItem data-testid="menu-konex-cards">
                    <Nfc className="h-4 w-4 mr-2" />
                    KONEX Cards
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => scrollTo("how-it-works")} data-testid="menu-how-it-works">
                  <Eye className="h-4 w-4 mr-2" />
                  How It Works
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollTo("features")} data-testid="menu-features">
                  <Zap className="h-4 w-4 mr-2" />
                  Features
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href="/what-is-nfc">
                  <DropdownMenuItem data-testid="menu-what-is-nfc">
                    <Nfc className="h-4 w-4 mr-2" />
                    What is NFC
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/auth">
              <Button variant="ghost" className="font-medium" data-testid="button-login">Log in</Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button className="font-semibold shadow-lg shadow-primary/20" data-testid="button-get-started">Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-4 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center md:text-left space-y-8">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                The Future of Networking
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
                Share your world with a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">single tap.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto md:mx-0">
                Create your free digital business card, share it instantly via NFC or QR, and capture leads effortlessly. No app required.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <Link href="/auth?tab=register">
                  <Button size="lg" className="h-14 px-8 rounded-full text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                    Sign Up Free
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 rounded-full text-lg" 
                  data-testid="button-how-it-works"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  How it Works
                </Button>
              </div>
            </div>
            
            <div className="flex-1 relative w-full max-w-lg md:max-w-full">
              <div className="relative z-10">
                <img 
                  src={cardInHand} 
                  alt="Hand holding a KONEX NFC Business Card" 
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl shadow-primary/20" 
                  data-testid="img-hero-card"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { img: cardBasic, label: "Basic", price: "£19.99" },
                  { img: cardPremium, label: "Premium", price: "£49.99" },
                  { img: cardElite, label: "Elite", price: "£79.99" },
                ].map((card, i) => (
                  <Link key={i} href={`/konex-cards/${card.label.toLowerCase()}`}>
                    <div className="group cursor-pointer" data-testid={`hero-card-${card.label.toLowerCase()}`}>
                      <img 
                        src={card.img} 
                        alt={`KONEX ${card.label}`} 
                        className="w-full rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300" 
                        data-testid={`img-hero-tier-${card.label.toLowerCase()}`}
                      />
                      <div className="text-center mt-2">
                        <p className="text-sm font-semibold text-foreground">{card.label}</p>
                        <p className="text-xs text-muted-foreground">{card.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="absolute -top-10 -right-10 h-64 w-64 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
              <div className="absolute -bottom-10 -left-10 h-64 w-64 bg-accent/20 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-background border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-how-it-works-title">How It Works</h2>
              <p className="text-muted-foreground text-lg">Three simple steps to revolutionize your networking</p>
            </div>
            
            <div className="mb-12 max-w-3xl mx-auto">
              <div className="relative rounded-md overflow-hidden shadow-2xl shadow-primary/10">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full"
                  data-testid="video-how-it-works"
                >
                  <source src="/videos/nfc-demo.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary via-accent to-purple-500" />
              
              {[
                {
                  step: 1,
                  icon: Nfc,
                  title: "Tap Your KONEX Card",
                  desc: "Simply tap your NFC-enabled KONEX card on any modern smartphone. No app required for the recipient."
                },
                {
                  step: 2,
                  icon: Eye,
                  title: "View Your Profile",
                  desc: "Your stunning digital profile instantly appears. Showcase your bio, links, and contact details beautifully."
                },
                {
                  step: 3,
                  icon: Users,
                  title: "Exchange Contact",
                  desc: "Visitors share their info directly with you. Capture leads effortlessly and never lose a connection."
                }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center" data-testid={`how-it-works-step-${item.step}`}>
                  <span className="text-sm font-bold text-muted-foreground mb-3">Step {item.step}</span>
                  <div className="relative z-10 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KONEX Card Showcase */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 mb-16">
              <div className="flex-1">
                <img 
                  src={cardThreeTiers} 
                  alt="KONEX NFC Cards — Black, Gold, and Silver" 
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-xl" 
                  data-testid="img-konex-card"
                />
              </div>
              <div className="flex-1 text-center md:text-left space-y-6">
                <h2 className="text-3xl md:text-4xl font-display font-bold" data-testid="text-card-showcase-title">
                  One card. Unlimited connections.
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  The KONEX NFC card is your all-in-one networking tool. Sleek, professional, and always ready. Just tap it on any smartphone to instantly share your digital profile — no app needed.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 justify-center md:justify-start">
                  <Link href="/auth?tab=register">
                    <Button size="lg" className="h-14 px-8 rounded-full text-lg font-semibold shadow-xl shadow-primary/20" data-testid="button-create-free-profile">
                      Create Free Profile
                    </Button>
                  </Link>
                  <Link href="/konex-cards">
                    <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg" data-testid="button-get-your-card">
                      View NFC Cards
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 mb-16">
              <div className="flex-1 text-center md:text-left space-y-6 order-2 md:order-1">
                <h2 className="text-3xl md:text-4xl font-display font-bold" data-testid="text-personalized-title">
                  Make it yours.
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Add your name, title, photo, and social links to create a card that's uniquely you. Every tap shares your complete professional identity instantly.
                </p>
              </div>
              <div className="flex-1 order-1 md:order-2">
                <img 
                  src={cardPersonalized} 
                  alt="Personalized KONEX card with photo, name, and social links" 
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-xl" 
                  data-testid="img-personalized-card"
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-display font-bold mb-2">Available in three tiers</h3>
              <p className="text-muted-foreground">Choose the KONEX card that matches your style.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { img: cardBasic, name: "Basic", price: "£19.99", desc: "Matte finish. Clean & professional.", href: "/konex-cards/basic" },
                { img: cardPremium, name: "Premium", price: "£49.99", desc: "Brushed metal. Stand out.", href: "/konex-cards/premium" },
                { img: cardElite, name: "Elite", price: "£79.99", desc: "Luxury finish. Executive grade.", href: "/konex-cards/elite" },
              ].map((card, i) => (
                <Link key={i} href={card.href}>
                  <div className="group bg-card border border-border/50 rounded-2xl p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer" data-testid={`showcase-card-${card.name.toLowerCase()}`}>
                    <img 
                      src={card.img} 
                      alt={`KONEX ${card.name}`} 
                      className="w-full rounded-xl mb-4"
                      data-testid={`img-showcase-${card.name.toLowerCase()}`}
                    />
                    <h4 className="font-bold text-lg text-foreground">{card.name}</h4>
                    <p className="text-sm text-muted-foreground mb-1">{card.desc}</p>
                    <p className="text-primary font-semibold">{card.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything you need to grow your network</h2>
              <p className="text-muted-foreground text-lg">Leave the paper cards behind. KONEX gives you the tools to make lasting impressions.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Smartphone,
                  title: "NFC & QR Sharing",
                  desc: "Share your profile instantly with a tap or a scan. Works on all modern smartphones without an app."
                },
                {
                  icon: Share2,
                  title: "Lead Capture",
                  desc: "Don't just share—connect. Visitors can easily share their contact info directly back to you."
                },
                {
                  icon: Palette,
                  title: "Fully Customizable",
                  desc: "Make it yours. Custom colors, links, photos, and branding to match your professional identity."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-background border border-border/50 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">What our users say</h2>
              <p className="text-muted-foreground text-lg">Professionals around the world trust KONEX to make meaningful connections.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Mitchell",
                  title: "Marketing Director",
                  quote: "KONEX completely changed how I network at events. One tap and my new contacts have everything they need. I've tripled my follow-up rate since switching.",
                  rating: 5
                },
                {
                  name: "James Okafor",
                  title: "Real Estate Agent",
                  quote: "My clients love it. I hand them my KONEX card and they instantly have my listings, contact info, and social links. It's the best investment I've made for my business.",
                  rating: 5
                },
                {
                  name: "Priya Sharma",
                  title: "Freelance Designer",
                  quote: "As a creative, first impressions matter. KONEX lets me showcase my portfolio, links, and brand all in one place. It's sleek, modern, and always up to date.",
                  rating: 5
                }
              ].map((testimonial, i) => (
                <div key={i} className="bg-background border border-border/50 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col" data-testid={`testimonial-card-${i}`}>
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-muted-foreground leading-relaxed mb-6 flex-1" data-testid={`testimonial-quote-${i}`}>"{testimonial.quote}"</p>
                  <div className="flex items-center gap-1 mb-4" data-testid={`testimonial-rating-${i}`}>
                    {Array.from({ length: testimonial.rating }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold" data-testid={`testimonial-name-${i}`}>{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground" data-testid={`testimonial-title-${i}`}>{testimonial.title}</p>
                  </div>
                </div>
              ))}
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
