import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { QrCode, Share2, Smartphone, Linkedin, Globe, Palette, Nfc, Eye, Users } from "lucide-react";
import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1770323201397.jpeg";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="w-full border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={konexLogo} alt="KONEX Logo" className="h-8 w-auto rounded" />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="ghost" className="font-medium" data-testid="button-login">Log in</Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button className="font-semibold shadow-lg shadow-primary/20" data-testid="button-get-started">Get Started</Button>
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
                Create a stunning digital business card, share it instantly via NFC or QR, and capture leads effortlessly. No app required.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <Link href="/auth?tab=register">
                  <Button size="lg" className="h-14 px-8 rounded-full text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                    Create Your Card
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
            
            <div className="flex-1 relative w-full max-w-md md:max-w-full perspective-1000">
              <div className="relative z-10 transform rotate-y-12 rotate-x-6 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
                {/* Mock Phone UI */}
                <div className="bg-foreground text-background rounded-[2.5rem] p-3 shadow-2xl border-4 border-border/50">
                  <div className="bg-background rounded-[2rem] overflow-hidden h-[600px] border border-border">
                    {/* Header */}
                    <div className="h-32 bg-gradient-to-br from-primary via-purple-600 to-accent relative">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <div className="h-24 w-24 rounded-full bg-background p-1 shadow-xl">
                          <div className="h-full w-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" alt="Profile" className="object-cover h-full w-full" />
                             {/* stock image of professional male */}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="pt-14 pb-8 px-6 text-center space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">Alex Morgan</h3>
                        <p className="text-muted-foreground font-medium">Product Designer @ Stripe</p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Building digital experiences that matter. Passionate about UX, clean code, and coffee.
                      </p>
                      <div className="grid grid-cols-4 gap-3 pt-4">
                        {[Linkedin, Share2, Globe, QrCode].map((Icon, i) => (
                          <div key={i} className="aspect-square rounded-2xl bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors cursor-pointer">
                            <Icon className="h-5 w-5" />
                          </div>
                        ))}
                      </div>
                      <Button className="w-full h-12 rounded-xl mt-6 font-semibold shadow-lg shadow-primary/20">
                        Save Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
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
      </main>

      <footer className="py-8 border-t border-border/50 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} KONEX. All rights reserved.</p>
      </footer>
    </div>
  );
}
