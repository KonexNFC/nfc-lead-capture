import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Nfc, Users, BarChart2, Smartphone, Share2, ShieldCheck, Building2,
  ChevronRight, Star, Quote, Menu, ArrowRight, TrendingUp, Zap,
  UserCheck, Target, Globe, Layers, CheckCircle2
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Testimonial } from "@shared/schema";
import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1770323201397.jpeg";
import cardBasic from "@assets/IMG_7774_1771669634221.png";
import cardPremium from "@assets/IMG_7776_1771669634221.png";
import cardElite from "@assets/IMG_7775_1771669634221.png";
import cardInHand from "@assets/IMG_7743_1771669634221.jpeg";
import cardThreeTiers from "@assets/41A7CAD6-1759-450E-83FE-47CF37A2B9D8_1771669634221.png";
import forestBg from "@assets/IMG_8384_1773318780793.jpeg";

const fallbackTestimonials = [
  {
    name: "Sarah Mitchell",
    title: "Head of Sales, TechScale",
    quote: "Our sales team taps an average of 12 new leads per event. With KONEX, every one of them is captured instantly. We've completely removed paper cards from our process.",
    rating: 5,
  },
  {
    name: "James Okafor",
    title: "Real Estate Agent",
    quote: "Every showing used to end with a stack of cards I'd forget to follow up on. Now every tap auto-captures the contact. My conversion rate jumped 40% in three months.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    title: "Founder, Studio Bloom",
    quote: "I manage a team of 8 creatives. KONEX lets me see who's tapping, who's capturing leads, and where we're losing connections. It's analytics I actually act on.",
    rating: 5,
  },
];

const trustStats = [
  { value: "10,000+", label: "Active Profiles" },
  { value: "500K+", label: "NFC Taps Tracked" },
  { value: "3×", label: "More Leads vs Paper" },
  { value: "500+", label: "Teams Using KONEX" },
];

const useCases = [
  {
    icon: TrendingUp,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    title: "Sales Teams",
    headline: "Every rep, every tap, fully tracked.",
    desc: "Issue NFC cards to your whole team, track who's tapping most, see lead capture rates per rep, and ensure no handshake goes unrecorded.",
    bullets: ["Per-rep tap analytics", "Lead capture by team member", "Card assignment dashboard"],
  },
  {
    icon: Building2,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    title: "Real Estate",
    headline: "Turn every showing into a captured lead.",
    desc: "Never lose a prospect again. Tap your KONEX card at a showing, and every interested buyer instantly becomes a lead in your dashboard.",
    bullets: ["Instant contact capture", "Lead follow-up reminders", "Portfolio & listing links"],
  },
  {
    icon: Globe,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Founders & Creators",
    headline: "First impressions that close deals.",
    desc: "Share your entire professional story in a single tap. Bio, portfolio, links, booking page — all live, always updated, always impressive.",
    bullets: ["Live profile, always current", "Booking & payment links", "Social proof & testimonials"],
  },
];

const featureBlocks = [
  {
    icon: UserCheck,
    color: "text-green-400",
    bg: "bg-green-500/10",
    title: "Instant Lead Capture",
    desc: "Visitors can share their contact details directly from your profile with a single tap. No app, no friction, no lost leads.",
  },
  {
    icon: Nfc,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    title: "NFC + QR Sharing",
    desc: "Works with a tap or a scan. Every modern smartphone supports it — no app required for the recipient.",
  },
  {
    icon: Users,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    title: "Team Management",
    desc: "Assign NFC cards to team members, manage roles, track individual performance, and view your whole team's analytics in one dashboard.",
  },
  {
    icon: BarChart2,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    title: "ROI Analytics",
    desc: "Track every tap, click, and lead capture. Know exactly which cards perform best and which events deliver the highest return.",
  },
  {
    icon: Layers,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    title: "Custom Branding",
    desc: "Set team-wide brand colors and profile themes. Every member's card stays on-brand — no design team required.",
  },
  {
    icon: ShieldCheck,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    title: "Enterprise Ready",
    desc: "Role-based permissions, org-level card control, invitation management, and activation tracking — built for teams at scale.",
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const { data: approvedTestimonials } = useQuery<Testimonial[]>({
    queryKey: ["/api/public/testimonials"],
  });

  const displayTestimonials =
    approvedTestimonials && approvedTestimonials.length > 0
      ? approvedTestimonials.map(t => ({ name: t.name, title: t.title, quote: t.quote, rating: t.rating }))
      : fallbackTestimonials;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#13131A", color: "#fff" }}>

      {/* ── Navbar ── */}
      <nav
        className={`w-full fixed top-0 z-50 transition-all duration-300 ease-in-out border-b ${
          scrolled
            ? "bg-[#13131A]/96 backdrop-blur-xl border-white/8 shadow-[0_1px_20px_rgba(0,0,0,0.6)]"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={konexLogo} alt="KONEX Logo" className="h-8 w-auto rounded" />
            <div className="hidden md:flex items-center gap-1 ml-4">
              <Link href="/konex-cards">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white" data-testid="nav-konex-cards">
                  NFC Cards
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white" onClick={() => scrollTo("how-it-works")} data-testid="nav-how-it-works">
                How It Works
              </Button>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white" onClick={() => scrollTo("use-cases")} data-testid="nav-use-cases">
                Use Cases
              </Button>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white" onClick={() => scrollTo("features")} data-testid="nav-features">
                Features
              </Button>
              <Link href="/what-is-nfc">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white" data-testid="nav-what-is-nfc">
                  What is NFC?
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white/70" data-testid="button-nav-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <Link href="/konex-cards">
                  <DropdownMenuItem data-testid="menu-konex-cards">
                    <Nfc className="h-4 w-4 mr-2" /> NFC Cards <ChevronRight className="h-4 w-4 ml-auto" />
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => scrollTo("how-it-works")} data-testid="menu-how-it-works">How It Works</DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollTo("use-cases")} data-testid="menu-use-cases">Use Cases</DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollTo("features")} data-testid="menu-features">Features</DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href="/what-is-nfc">
                  <DropdownMenuItem data-testid="menu-what-is-nfc">
                    <Nfc className="h-4 w-4 mr-2" /> What is NFC? <ChevronRight className="h-4 w-4 ml-auto" />
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/auth">
              <Button variant="ghost" className="text-white/70 hover:text-white font-medium" data-testid="button-login">Log in</Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button
                className="font-semibold shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                data-testid="button-get-started"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">

        {/* ── Hero ── */}
        <section className="relative pt-24 pb-32 px-4 overflow-hidden">
          {/* Background gradients */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-indigo-600/8 rounded-full blur-[80px]" />
          </div>

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">

            {/* Left — copy */}
            <div className="flex-1 text-center md:text-left space-y-8">
              <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/8 px-4 py-1.5 text-sm font-semibold text-blue-400 gap-2">
                <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                NFC-Powered Connection & Conversion
              </div>

              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.04]"
                data-testid="text-hero-headline"
              >
                Turn every tap into a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400">
                  business opportunity.
                </span>
              </h1>

              <p className="text-xl text-white/55 leading-relaxed max-w-xl mx-auto md:mx-0">
                KONEX NFC cards capture leads instantly, track ROI in real time, and give your team one dashboard to manage it all — no app required.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <Link href="/konex-cards">
                  <Button
                    size="lg"
                    className="h-14 px-8 rounded-full text-lg font-bold shadow-[0_0_28px_rgba(59,130,246,0.45)] hover:shadow-[0_0_40px_rgba(59,130,246,0.65)] hover:-translate-y-1 transition-all duration-250"
                    data-testid="button-get-card-hero"
                  >
                    <Nfc className="h-5 w-5 mr-2" />
                    Get Your NFC Card
                  </Button>
                </Link>
                <Link href="/u/arivera">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 rounded-full text-lg text-white border-white/15 hover:border-white/30 hover:-translate-y-1 transition-all duration-250"
                    data-testid="button-view-demo"
                  >
                    See a Live Profile
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-2 text-sm text-white/40 justify-center md:justify-start">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Works with iPhone &amp; Android — no app needed for the recipient</span>
              </div>
            </div>

            {/* Right — floating card hero */}
            <div className="flex-1 relative w-full max-w-lg md:max-w-full">
              {/* Glow behind card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px] -z-10 animate-[pulseGlow_3s_ease-in-out_infinite]" />

              <div className="relative z-10 animate-[floatSlow_4s_ease-in-out_infinite]">
                <img
                  src={cardInHand}
                  alt="Hand holding a KONEX NFC Business Card"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(59,130,246,0.2)]"
                  data-testid="img-hero-card"
                />
                {/* Shine overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/4 to-transparent pointer-events-none" />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { img: cardBasic, label: "Basic", price: "£19.99" },
                  { img: cardPremium, label: "Premium", price: "£49.99" },
                  { img: cardElite, label: "Elite", price: "£79.99" },
                ].map((card, i) => (
                  <Link key={i} href={`/konex-cards/${card.label.toLowerCase()}`}>
                    <div
                      className="group cursor-pointer rounded-2xl p-2 border border-white/6 hover:border-blue-500/30 transition-all duration-250 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      data-testid={`hero-card-${card.label.toLowerCase()}`}
                      style={{ background: "#1E1E28" }}
                    >
                      <img
                        src={card.img}
                        alt={`KONEX ${card.label}`}
                        className="w-full rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                        data-testid={`img-hero-tier-${card.label.toLowerCase()}`}
                      />
                      <div className="text-center mt-2 pb-1">
                        <p className="text-sm font-bold text-white">{card.label}</p>
                        <p className="text-xs text-white/40">{card.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Strip ── */}
        <section className="py-12 border-y border-white/6" style={{ background: "#111" }} data-testid="section-trust-strip">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {trustStats.map((stat, i) => (
                <div key={i} data-testid={`trust-stat-${i}`}>
                  <div className="text-3xl md:text-4xl font-display font-black text-blue-400">{stat.value}</div>
                  <div className="text-sm text-white/45 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-28" style={{ background: "#13131A" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15">How It Works</Badge>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-white" data-testid="text-how-it-works-title">
                From tap to tracked lead in seconds
              </h2>
              <p className="text-white/50 text-lg">
                KONEX removes every step between meeting someone and capturing them as a lead.
              </p>
            </div>

            {/* Video */}
            <div className="mb-16 max-w-3xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.15)] border border-white/8">
                <video autoPlay loop muted playsInline className="w-full" data-testid="video-how-it-works">
                  <source src="/videos/nfc-demo.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
              {[
                { step: 1, icon: Nfc, title: "Tap Your Card", desc: "One tap on any modern phone opens your profile instantly. No app download, no friction." },
                { step: 2, icon: Target, title: "Profile Opens", desc: "Your digital profile loads with your bio, links, social handles, booking page — everything." },
                { step: 3, icon: UserCheck, title: "Lead Captured", desc: "Visitors share their contact info directly. It lands in your leads dashboard automatically." },
                { step: 4, icon: BarChart2, title: "ROI Tracked", desc: "See every tap, click and lead in your analytics. Know exactly where your best leads come from." },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center" data-testid={`how-it-works-step-${item.step}`}>
                  <span className="text-xs font-bold text-blue-500/60 tracking-widest mb-3">STEP {item.step}</span>
                  <div className="relative z-10 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 shadow-[0_0_24px_rgba(59,130,246,0.4)]">
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed max-w-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Use Cases ── */}
        <section id="use-cases" className="py-28 border-y border-white/6" style={{ background: "#181820" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">Use Cases</Badge>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-white">
                Built for people who close deals
              </h2>
              <p className="text-white/50 text-lg">
                Whether you're a solo founder or running a team of 50, KONEX scales with you.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  className={`rounded-3xl border ${uc.border} p-8 transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]`}
                  style={{ background: "#1E1E28" }}
                  data-testid={`use-case-${i}`}
                >
                  <div className={`h-12 w-12 rounded-2xl ${uc.bg} flex items-center justify-center mb-6`}>
                    <uc.icon className={`h-6 w-6 ${uc.color}`} />
                  </div>
                  <Badge className="mb-3 text-xs bg-white/6 text-white/60 border-white/10">{uc.title}</Badge>
                  <h3 className="text-xl font-bold mb-3 text-white">{uc.headline}</h3>
                  <p className="text-white/50 leading-relaxed mb-6">{uc.desc}</p>
                  <ul className="space-y-2">
                    {uc.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-center gap-2 text-sm text-white/45">
                        <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature Blocks ── */}
        <section id="features" className="py-28" style={{ background: "#13131A" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">Features</Badge>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-white">
                Everything you need to grow and track
              </h2>
              <p className="text-white/50 text-lg">
                KONEX combines lead capture, team management, and analytics in one platform.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {featureBlocks.map((f, i) => (
                <div
                  key={i}
                  className="p-7 rounded-2xl border border-white/6 transition-all duration-250 hover:-translate-y-1 hover:border-white/12 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                  style={{ background: "#1E1E28" }}
                  data-testid={`feature-block-${i}`}
                >
                  <div className={`h-12 w-12 rounded-2xl ${f.bg} flex items-center justify-center mb-5`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{f.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Card Showcase ── */}
        <section className="py-28 border-y border-white/6" style={{ background: "#181820" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 mb-16">
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
                <img
                  src={cardThreeTiers}
                  alt="KONEX NFC Cards — Basic, Premium, Elite"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
                  data-testid="img-konex-card"
                />
              </div>
              <div className="flex-1 text-center md:text-left space-y-6">
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">The Physical Card</Badge>
                <h2 className="text-3xl md:text-5xl font-display font-black text-white" data-testid="text-card-showcase-title">
                  One card. Every connection. Forever tracked.
                </h2>
                <p className="text-white/50 text-lg leading-relaxed">
                  A premium NFC business card that shares your full digital profile in one tap. No app for the recipient. Always up to date — even after you change roles.
                </p>
                <ul className="space-y-3">
                  {["Tap works on any modern iPhone or Android", "Update your profile anytime — card never needs replacing", "Tap, click, and lead data tracked automatically"].map((point, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/50">
                      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                  <Link href="/auth?tab=register">
                    <Button
                      size="lg"
                      className="h-14 px-8 rounded-full text-base font-bold shadow-[0_0_28px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:-translate-y-1"
                      data-testid="button-create-free-profile"
                    >
                      Create Free Profile
                    </Button>
                  </Link>
                  <Link href="/konex-cards">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 px-8 rounded-full text-base text-white border-white/15 hover:border-white/30 hover:-translate-y-1"
                      data-testid="button-get-your-card"
                    >
                      View NFC Cards
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-display font-bold text-white mb-2">Three tiers. One mission.</h3>
              <p className="text-white/45">Every tier captures leads, tracks taps, and integrates with your team dashboard.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {[
                { img: cardBasic, name: "Basic", price: "£19.99", desc: "Matte finish. Clean & professional.", href: "/konex-cards/basic" },
                { img: cardPremium, name: "Premium", price: "£49.99", desc: "Brushed metal. Stand out.", href: "/konex-cards/premium" },
                { img: cardElite, name: "Elite", price: "£79.99", desc: "Luxury finish. Executive grade.", href: "/konex-cards/elite" },
              ].map((card, i) => (
                <Link key={i} href={card.href}>
                  <div
                    className="group rounded-2xl p-4 border border-white/6 hover:border-blue-500/25 transition-all duration-250 cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]"
                    style={{ background: "#22222E" }}
                    data-testid={`showcase-card-${card.name.toLowerCase()}`}
                  >
                    <img src={card.img} alt={`KONEX ${card.name}`} className="w-full rounded-xl mb-4" data-testid={`img-showcase-${card.name.toLowerCase()}`} />
                    <h4 className="font-bold text-lg text-white">{card.name}</h4>
                    <p className="text-sm text-white/40 mb-1">{card.desc}</p>
                    <p className="text-blue-400 font-semibold">{card.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROI Section ── */}
        <section className="py-28" style={{ background: "#13131A" }} data-testid="section-roi">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">Why It Pays Off</Badge>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-white">
                The ROI case for NFC cards is clear
              </h2>
              <p className="text-white/50 text-lg">
                Paper cards cost more per lead and generate zero data. KONEX gives you every interaction, measured.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                { stat: "88%", label: "of paper business cards are thrown away within a week", icon: Zap, accent: "text-white/50", bg: "#22222E", border: "border-white/8" },
                { stat: "3×", label: "more leads captured per event with KONEX vs paper cards", icon: TrendingUp, accent: "text-green-400", bg: "#0f1a11", border: "border-green-500/20" },
                { stat: "£0", label: "extra cost when you update your profile — card works forever", icon: ShieldCheck, accent: "text-green-400", bg: "#0f1a11", border: "border-green-500/20" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`rounded-3xl border ${item.border} p-8 text-center`}
                  style={{ background: item.bg }}
                  data-testid={`roi-stat-${i}`}
                >
                  <div className={`text-6xl font-display font-black mb-3 ${item.accent}`}>
                    {item.stat}
                  </div>
                  <p className="text-white/45 leading-relaxed">{item.label}</p>
                </div>
              ))}
            </div>

            {/* CTA Banner */}
            <div
              className="rounded-3xl p-8 md:p-14 text-center relative overflow-hidden border border-blue-500/15"
              style={{ background: "linear-gradient(135deg, #0e1929 0%, #0a1220 50%, #0d0f1e 100%)" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-blue-500/10 rounded-full blur-[80px] -z-10" />
              <h3 className="text-2xl md:text-4xl font-display font-black mb-4 text-white">
                Ready to stop losing leads at events?
              </h3>
              <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">
                Set up your KONEX profile in minutes. Start capturing leads the same day you tap your first card.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth?tab=register">
                  <Button
                    size="lg"
                    className="h-14 px-10 rounded-full text-base font-bold shadow-[0_0_28px_rgba(59,130,246,0.45)] hover:shadow-[0_0_42px_rgba(59,130,246,0.65)] hover:-translate-y-1 transition-all"
                    data-testid="button-roi-cta"
                  >
                    Start Free Today
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/konex-cards">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-10 rounded-full text-base text-white border-white/15 hover:border-white/30 hover:-translate-y-1 transition-all"
                    data-testid="button-roi-cards"
                  >
                    <Nfc className="h-4 w-4 mr-2" />
                    Browse NFC Cards
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" className="py-28 border-t border-white/6" style={{ background: "#181820" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">Testimonials</Badge>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-white">Professionals trust KONEX to grow</h2>
              <p className="text-white/50 text-lg">Real results from sales teams, agents, and founders.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {displayTestimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="p-8 rounded-3xl border border-white/6 flex flex-col transition-all duration-250 hover:-translate-y-1 hover:border-white/12 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                  style={{ background: "#1E1E28" }}
                  data-testid={`testimonial-card-${i}`}
                >
                  <Quote className="h-8 w-8 text-blue-500/30 mb-4" />
                  <p className="text-white/50 leading-relaxed mb-6 flex-1" data-testid={`testimonial-quote-${i}`}>"{testimonial.quote}"</p>
                  <div className="flex items-center gap-1 mb-4" data-testid={`testimonial-rating-${i}`}>
                    {Array.from({ length: testimonial.rating }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-blue-500 text-blue-500" />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-white" data-testid={`testimonial-name-${i}`}>{testimonial.name}</p>
                    <p className="text-sm text-white/40" data-testid={`testimonial-title-${i}`}>{testimonial.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Final CTA — sustainability footer ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={forestBg} alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/72" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center px-6 py-24 space-y-6">
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#b6f542]">
            Make the sustainable switch
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-black text-white leading-[1.1] tracking-tight">
            A smarter, greener way to network
          </h2>
          <p className="text-base text-white/60 leading-relaxed max-w-lg mx-auto">
            Over 27 million paper business cards are printed every day.<br className="hidden md:block" />
            Most are discarded within a week. Replace them with one tap.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
              <Star className="h-3 w-3 fill-[#b6f542] text-[#b6f542]" />
              Trusted by founders, sales teams and creators
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
              <Nfc className="h-3 w-3 text-[#b6f542]" />
              Replace thousands of paper cards with one tap
            </span>
          </div>
          <div className="pt-2 space-y-4">
            <p className="text-lg md:text-xl font-bold text-[#b6f542]">Choose your solution</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/konex-cards">
                <Button
                  size="lg"
                  className="h-14 px-8 rounded-full text-base font-bold bg-[#b6f542] text-black hover:bg-[#c8f96a] shadow-[0_0_28px_rgba(182,245,66,0.35)] hover:shadow-[0_0_40px_rgba(182,245,66,0.5)] hover:-translate-y-1 transition-all w-full sm:w-auto"
                  data-testid="button-footer-nfc"
                >
                  <Nfc className="h-4 w-4 mr-2" /> NFC Business Card
                </Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 rounded-full text-base font-bold border-[#b6f542]/40 text-[#b6f542] hover:bg-[#b6f542]/8 hover:border-[#b6f542]/60 hover:-translate-y-1 transition-all w-full sm:w-auto"
                  data-testid="button-footer-digital"
                >
                  <Smartphone className="h-4 w-4 mr-2" /> Digital Profile
                </Button>
              </Link>
            </div>
            <p className="text-xs text-white/40 pt-1">Works with iPhone &amp; Android — no app required.</p>
          </div>
        </div>
      </section>

      <footer className="py-6 border-t border-white/6 text-center text-white/30 text-sm" style={{ background: "#13131A" }}>
        <p className="mb-2">&copy; {new Date().getFullYear()} KONEX. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs" style={{ color: "#374151" }}>
          <Link href="/terms" className="hover:text-white/50 transition-colors" data-testid="link-landing-footer-terms">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white/50 transition-colors" data-testid="link-landing-footer-privacy">Privacy Policy</Link>
          <Link href="/refund-policy" className="hover:text-white/50 transition-colors" data-testid="link-landing-footer-refund">Refund &amp; Return Policy</Link>
        </div>
      </footer>
    </div>
  );
}
