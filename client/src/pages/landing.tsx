import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Nfc, Users, BarChart2, Smartphone, Share2, ShieldCheck, Building2,
  ChevronRight, Star, Quote, Menu, ArrowRight, TrendingUp, Zap,
  UserCheck, Target, Globe, Layers, CheckCircle2, UserPlus, X, Check,
  Phone, Mail, Linkedin
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Testimonial } from "@shared/schema";
import { KonexLogo } from "@/components/konex/KonexLogo";
import cardBasic from "@assets/Konex_Basic_Card_1776031961806.png";
import cardPremium from "@assets/Konex_Premium_Card_1776031961806.png";
import cardElite from "@assets/Konex_Elite_Card_1776031961806.png";
import cardInHand from "@assets/IMG_7743_1771669634221.jpeg";
import cardThreeTiers from "@assets/41A7CAD6-1759-450E-83FE-47CF37A2B9D8_1771669634221.png";

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

const trustPills = [
  "No app required",
  "Works on all smartphones",
  "NFC + QR enabled",
  "Instant contact sharing",
];

const useCases = [
  {
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Sales Teams",
    headline: "Every rep, every tap, fully tracked.",
    desc: "Issue cards to your whole team, track tap rates by rep, and ensure no handshake goes unrecorded.",
    bullets: ["Per-rep tap analytics", "Lead capture by team member", "Card assignment dashboard"],
  },
  {
    icon: Building2,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Real Estate",
    headline: "Turn every showing into a captured lead.",
    desc: "Every interested buyer instantly becomes a lead in your dashboard. No paper, no follow-up guesswork.",
    bullets: ["Instant contact capture", "Lead follow-up reminders", "Portfolio & listing links"],
  },
  {
    icon: Globe,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Founders & Creators",
    headline: "First impressions that close deals.",
    desc: "Bio, portfolio, links, booking page — all in one tap. Always live, always current.",
    bullets: ["Live profile, always current", "Booking & payment links", "Social proof & testimonials"],
  },
];

const featureBlocks = [
  {
    icon: UserCheck,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "Instant Lead Capture",
    desc: "Visitors can share their contact details directly from your profile with a single tap. No app, no friction, no lost leads.",
  },
  {
    icon: Nfc,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "NFC + QR Sharing",
    desc: "Works with a tap or a scan. Every modern smartphone supports it — no app required for the recipient.",
  },
  {
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Team Management",
    desc: "Assign NFC cards to team members, manage roles, track individual performance, and view your whole team's analytics in one dashboard.",
  },
  {
    icon: BarChart2,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "ROI Analytics",
    desc: "Track every tap, click, and lead capture. Know exactly which cards perform best and which events deliver the highest return.",
  },
  {
    icon: Layers,
    color: "text-rose-600",
    bg: "bg-rose-50",
    title: "Custom Branding",
    desc: "Set team-wide brand colors and profile themes. Every member's card stays on-brand — no design team required.",
  },
  {
    icon: ShieldCheck,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    title: "Enterprise Ready",
    desc: "Role-based permissions, org-level card control, invitation management, and activation tracking — built for teams at scale.",
  },
];

const comparisonRows = [
  { feature: "Update info without reprinting", konex: true, paper: false },
  { feature: "Capture leads automatically", konex: true, paper: false },
  { feature: "Track tap & click analytics", konex: true, paper: false },
  { feature: "Works without a recipient app", konex: true, paper: true },
  { feature: "Sustainable — no reprints ever", konex: true, paper: false },
  { feature: "Team management dashboard", konex: true, paper: false },
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
    <div className="min-h-screen flex flex-col bg-white text-gray-900">

      {/* ── Navbar ── */}
      <nav
        className={`w-full fixed top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-gray-200 shadow-sm"
            : "bg-white/80 backdrop-blur-sm border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KonexLogo height={36} onLight />
            <div className="hidden md:flex items-center gap-1 ml-4">
              <Link href="/konex-cards">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100" data-testid="nav-konex-cards">
                  NFC Cards
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100" onClick={() => scrollTo("how-it-works")} data-testid="nav-how-it-works">
                How It Works
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100" onClick={() => scrollTo("use-cases")} data-testid="nav-use-cases">
                Use Cases
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100" onClick={() => scrollTo("features")} data-testid="nav-features">
                Features
              </Button>
              <Link href="/what-is-nfc">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100" data-testid="nav-what-is-nfc">
                  What is NFC?
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-gray-700" data-testid="button-nav-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 [&_*]:text-gray-900 [&_svg]:text-gray-500">
                <Link href="/konex-cards">
                  <DropdownMenuItem className="text-gray-900 focus:bg-gray-100 focus:text-gray-900" data-testid="menu-konex-cards">
                    <Nfc className="h-4 w-4 mr-2 text-gray-500" /> NFC Cards <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem className="text-gray-900 focus:bg-gray-100 focus:text-gray-900" onClick={() => scrollTo("how-it-works")} data-testid="menu-how-it-works">How It Works</DropdownMenuItem>
                <DropdownMenuItem className="text-gray-900 focus:bg-gray-100 focus:text-gray-900" onClick={() => scrollTo("use-cases")} data-testid="menu-use-cases">Use Cases</DropdownMenuItem>
                <DropdownMenuItem className="text-gray-900 focus:bg-gray-100 focus:text-gray-900" onClick={() => scrollTo("features")} data-testid="menu-features">Features</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />
                <Link href="/what-is-nfc">
                  <DropdownMenuItem className="text-gray-900 focus:bg-gray-100 focus:text-gray-900" data-testid="menu-what-is-nfc">
                    <Nfc className="h-4 w-4 mr-2 text-gray-500" /> What is NFC?
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-gray-200" />
                <Link href="/auth">
                  <DropdownMenuItem className="text-gray-900 focus:bg-gray-100 focus:text-gray-900" data-testid="menu-login">Log in</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/auth">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium hidden md:inline-flex" data-testid="button-login">Log in</Button>
            </Link>
            <Link href="/konex-cards">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 shadow-sm hidden md:inline-flex"
                data-testid="button-nav-get-card"
              >
                Get Your Card
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">

        {/* ── Hero ── */}
        <section className="relative pt-20 pb-24 px-4 overflow-hidden bg-white">
          {/* Soft background accent */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-70" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-indigo-50 rounded-full blur-[80px] opacity-60" />
          </div>

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">

            {/* Left — copy */}
            <div className="flex-1 text-center md:text-left space-y-8">
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 gap-2">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                NFC-Powered Connection & Conversion
              </div>

              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.04] text-gray-900"
                data-testid="text-hero-headline"
              >
                Turn Every Introduction Into a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Contact, Lead, or Opportunity
                </span>
              </h1>

              <p className="text-xl text-gray-500 leading-relaxed max-w-xl mx-auto md:mx-0">
                One tap. No app. Share your details, capture leads, and convert instantly with KONEX.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <Link href="/konex-cards">
                  <Button
                    size="lg"
                    className="h-14 px-8 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200"
                    data-testid="button-get-card-hero"
                  >
                    <Nfc className="h-5 w-5 mr-2" />
                    Get Your KONEX Card
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 rounded-xl text-base font-semibold border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200"
                  onClick={() => scrollTo("how-it-works")}
                  data-testid="button-view-demo"
                >
                  See How It Works
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="flex items-center justify-center md:justify-start">
                <Link href="/auth?tab=register">
                  <Button
                    variant="ghost"
                    className="group h-11 px-5 rounded-xl text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-200"
                    data-testid="button-signup-free"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up for a Free Profile
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400 justify-center md:justify-start">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Works with iPhone &amp; Android — no app needed for the recipient</span>
              </div>
            </div>

            {/* Right — card hero image */}
            <div className="flex-1 relative w-full max-w-lg md:max-w-full">
              <div className="relative z-10">
                <img
                  src={cardInHand}
                  alt="Hand holding a KONEX NFC Business Card"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.15),0_8px_24px_rgba(37,99,235,0.08)]"
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
                    <div
                      className="group cursor-pointer rounded-2xl p-3 border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-250"
                      data-testid={`hero-card-${card.label.toLowerCase()}`}
                    >
                      <img
                        src={card.img}
                        alt={`KONEX ${card.label}`}
                        className="w-full rounded-xl shadow-sm"
                        data-testid={`img-hero-tier-${card.label.toLowerCase()}`}
                      />
                      <div className="text-center mt-2 pb-1">
                        <p className="text-sm font-bold text-gray-900">{card.label}</p>
                        <p className="text-xs text-gray-400">{card.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Pills Strip ── */}
        <section className="py-6 border-y border-gray-200" style={{ background: "#F8F9FB" }} data-testid="section-trust-strip">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {trustPills.map((pill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
                  data-testid={`trust-pill-${i}`}
                >
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Band ── */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {trustStats.map((stat, i) => (
                <div key={i} data-testid={`trust-stat-${i}`}>
                  <div className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight">{stat.value}</div>
                  <div className="text-sm text-gray-400 mt-1.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-24" style={{ background: "#F8F9FB" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">How It Works</Badge>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-gray-900" data-testid="text-how-it-works-title">
                From tap to tracked lead in seconds
              </h2>
              <p className="text-gray-500 text-lg">
                KONEX removes every step between meeting someone and capturing them as a lead.
              </p>
            </div>

            {/* Video */}
            <div className="mb-16 max-w-3xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <video autoPlay loop muted playsInline className="w-full" data-testid="video-how-it-works">
                  <source src="/videos/nfc-demo.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
              {[
                { step: 1, icon: Nfc, title: "Tap Your Card", desc: "One tap on any modern phone opens your profile instantly. No app download, no friction." },
                { step: 2, icon: Target, title: "Profile Opens", desc: "Your digital profile loads with your bio, links, social handles, booking page — everything." },
                { step: 3, icon: UserCheck, title: "Lead Captured", desc: "Visitors share their contact info directly. It lands in your leads dashboard automatically." },
                { step: 4, icon: BarChart2, title: "ROI Tracked", desc: "See every tap, click and lead in your analytics. Know exactly where your best leads come from." },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center" data-testid={`how-it-works-step-${item.step}`}>
                  <span className="text-xs font-bold text-blue-500 tracking-widest mb-3">STEP {item.step}</span>
                  <div className="relative z-10 h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature Grid ── */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Features</Badge>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-gray-900">
                Everything you need to grow and track
              </h2>
              <p className="text-gray-500 text-lg">
                KONEX combines lead capture, team management, and analytics in one platform.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {featureBlocks.map((f, i) => (
                <div
                  key={i}
                  className="p-7 rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
                  data-testid={`feature-block-${i}`}
                >
                  <div className={`h-12 w-12 rounded-2xl ${f.bg} flex items-center justify-center mb-5`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Live Profile Preview ── */}
        <section className="py-24" style={{ background: "#F8F9FB" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">

              {/* Phone frame mockup */}
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  {/* Soft glow */}
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-[60px] scale-75 -z-10" />
                  {/* Phone bezel */}
                  <div className="relative w-72 rounded-[3rem] border-[10px] border-gray-900 shadow-[0_32px_80px_rgba(0,0,0,0.20)] bg-gray-900 overflow-hidden">
                    {/* Status bar */}
                    <div className="bg-white h-8 flex items-center justify-between px-5">
                      <span className="text-[10px] font-semibold text-gray-900">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-1.5 rounded-sm bg-gray-900" />
                        <div className="w-1 h-1 rounded-full bg-gray-900" />
                      </div>
                    </div>
                    {/* Profile card preview */}
                    <div className="bg-white">
                      {/* Cover banner */}
                      <div className="h-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:8px_8px]" />
                      </div>
                      {/* Avatar */}
                      <div className="flex justify-center -mt-8 relative z-10">
                        <div className="h-16 w-16 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-blue-600 font-black text-2xl">
                          A
                        </div>
                      </div>
                      {/* Name & title */}
                      <div className="text-center px-4 pt-2 pb-3">
                        <p className="font-bold text-gray-900 text-sm">Alex Rivera</p>
                        <p className="text-[11px] text-gray-500">Head of Business Development</p>
                        <p className="text-[11px] font-semibold text-blue-600 mt-0.5">KONEX Technologies</p>
                      </div>
                      {/* Action buttons */}
                      <div className="px-3 pb-3 flex flex-col gap-2">
                        <button className="w-full h-8 rounded-lg bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5">
                          <Phone className="h-3 w-3" /> Save Contact
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button className="h-7 rounded-lg border border-gray-200 text-[10px] font-semibold text-gray-700 flex items-center justify-center gap-1">
                            <Mail className="h-2.5 w-2.5" /> Email
                          </button>
                          <button className="h-7 rounded-lg border border-gray-200 text-[10px] font-semibold text-gray-700 flex items-center justify-center gap-1">
                            <Linkedin className="h-2.5 w-2.5" /> LinkedIn
                          </button>
                        </div>
                      </div>
                      {/* Lead capture */}
                      <div className="mx-3 mb-3 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-700 mb-1.5">Share your contact</p>
                        <div className="h-6 rounded-lg bg-white border border-gray-200 flex items-center px-2">
                          <span className="text-[10px] text-gray-400">Your email address...</span>
                        </div>
                        <button className="w-full mt-1.5 h-6 rounded-lg bg-blue-600 text-white text-[10px] font-bold">Send</button>
                      </div>
                    </div>
                    {/* Home indicator */}
                    <div className="bg-white h-5 flex items-center justify-center pb-1">
                      <div className="w-20 h-1 bg-gray-300 rounded-full" />
                    </div>
                  </div>
                  {/* Floating badges */}
                  <div className="absolute -right-8 top-24 bg-white rounded-xl shadow-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    ✅ Contact saved
                  </div>
                  <div className="absolute -left-10 bottom-28 bg-white rounded-xl shadow-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    📊 Lead captured
                  </div>
                </div>
              </div>

              {/* Copy */}
              <div className="flex-1 text-center lg:text-left space-y-6">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Live Profile Preview</Badge>
                <h2 className="text-3xl md:text-5xl font-display font-black text-gray-900">
                  This is what happens the second they tap your card
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed">
                  Your contact details, social links, booking page, and lead capture form — all in one beautiful profile. No app needed. Always up to date.
                </p>
                <ul className="space-y-3 text-left">
                  {[
                    "Save contact directly to their phone",
                    "Share your socials, portfolio, and booking links",
                    "Capture their email with one tap",
                    "Every action tracked in your dashboard",
                  ].map((point, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/u/arivera">
                    <Button
                      size="lg"
                      className="h-13 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all"
                      data-testid="button-see-live-profile"
                    >
                      See a Live Profile
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Use Cases ── */}
        <section id="use-cases" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Use Cases</Badge>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-gray-900 leading-tight">
                Built for people who close deals
              </h2>
              <p className="text-gray-500 text-lg">
                Solo founder or team of 50 — KONEX scales with you.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#E5E7EB] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  data-testid={`use-case-${i}`}
                >
                  <div className={`h-10 w-10 rounded-lg ${uc.bg} flex items-center justify-center mb-5`}>
                    <uc.icon className={`h-5 w-5 ${uc.color}`} />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{uc.title}</p>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 leading-tight">{uc.headline}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{uc.desc}</p>
                  <ul className="space-y-1.5">
                    {uc.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-center gap-2 text-sm text-gray-500">
                        <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Card Showcase ── */}
        <section className="py-24" style={{ background: "#F8F9FB" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 mb-16">
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-blue-100/60 rounded-full blur-[80px] -z-10" />
                <img
                  src={cardThreeTiers}
                  alt="KONEX NFC Cards — Basic, Premium, Elite"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.12)]"
                  data-testid="img-konex-card"
                />
              </div>
              <div className="flex-1 text-center md:text-left space-y-6">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">The Physical Card</Badge>
                <h2 className="text-3xl md:text-5xl font-display font-black text-gray-900" data-testid="text-card-showcase-title">
                  One card. Every connection. Forever tracked.
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed">
                  A premium NFC business card that shares your full digital profile in one tap. No app for the recipient. Always up to date — even after you change roles.
                </p>
                <ul className="space-y-3">
                  {["Tap works on any modern iPhone or Android", "Update your profile anytime — card never needs replacing", "Tap, click, and lead data tracked automatically"].map((point, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-500">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                  <Link href="/auth?tab=register">
                    <Button
                      size="lg"
                      className="h-14 px-8 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all"
                      data-testid="button-create-free-profile"
                    >
                      Create Free Profile
                    </Button>
                  </Link>
                  <Link href="/konex-cards">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 px-8 rounded-xl text-base font-semibold border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:-translate-y-0.5 transition-all"
                      data-testid="button-get-your-card"
                    >
                      Explore Cards
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mb-10">
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-2 leading-tight">Three tiers. One mission.</h3>
              <p className="text-gray-400 text-sm">Every tier captures leads, tracks taps, and connects to your dashboard.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto items-end">
              {[
                { img: cardBasic, name: "Basic", price: "£19.99", desc: "Matte black. Clean & professional.", href: "/konex-cards/basic", popular: false },
                { img: cardPremium, name: "Premium", price: "£49.99", desc: "Brushed metal — Silver, Black or Copper.", href: "/konex-cards/premium", popular: true },
                { img: cardElite, name: "Elite", price: "£79.99", desc: "Carbon, Gold or Carbon-Gold edition.", href: "/konex-cards/elite", popular: false },
              ].map((card, i) => (
                <Link key={i} href={card.href}>
                  <div
                    className={`group rounded-xl bg-white transition-all duration-200 cursor-pointer hover:shadow-md overflow-hidden ${
                      card.popular
                        ? "border border-blue-200 scale-[1.03] shadow-sm"
                        : "border border-[#E5E7EB] hover:-translate-y-0.5"
                    }`}
                    data-testid={`showcase-card-${card.name.toLowerCase()}`}
                  >
                    {card.popular && (
                      <div className="bg-blue-600 text-white text-xs font-bold text-center py-1.5 tracking-wide">
                        Most Popular
                      </div>
                    )}
                    <div className="p-4">
                      <img src={card.img} alt={`KONEX ${card.name}`} className="w-full rounded-lg mb-4" data-testid={`img-showcase-${card.name.toLowerCase()}`} />
                      <h4 className="font-bold text-base text-gray-900 mb-0.5">{card.name}</h4>
                      <p className="text-xs text-gray-400 mb-3">{card.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-gray-900">{card.price}</span>
                        <span className="text-xs font-semibold text-blue-600 border border-blue-200 rounded-md px-2 py-1 hover:bg-blue-50 transition-colors">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── KONEX vs Paper Comparison ── */}
        <section className="py-24 bg-white" data-testid="section-roi">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Why KONEX</Badge>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-gray-900">
                KONEX vs Paper Cards
              </h2>
              <p className="text-gray-500 text-lg">
                Paper cards cost more per lead and generate zero data. Every tap with KONEX is an insight.
              </p>
            </div>

            {/* Stats row — dominant typography, no heavy containers */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                { stat: "88%", label: "of paper cards discarded within a week", muted: true },
                { stat: "3×", label: "more leads captured per event", muted: false },
                { stat: "£0", label: "extra cost when you update your profile", muted: false },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center"
                  data-testid={`roi-stat-${i}`}
                >
                  <div className={`text-7xl md:text-8xl font-display font-black mb-3 leading-none tracking-tight ${item.muted ? "text-gray-300" : "text-gray-900"}`}>
                    {item.stat}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <div className="px-6 py-5 text-sm font-semibold text-gray-500">Feature</div>
                <div className="px-6 py-5 text-sm font-bold text-blue-700 text-center">KONEX</div>
                <div className="px-6 py-5 text-sm font-semibold text-gray-400 text-center">Paper Cards</div>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 border-b last:border-b-0 border-[#F1F5F9] bg-white"
                  data-testid={`comparison-row-${i}`}
                >
                  <div className="px-6 py-5 text-base text-gray-700">{row.feature}</div>
                  <div className="px-6 py-5 flex justify-center items-center">
                    <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                  </div>
                  <div className="px-6 py-5 flex justify-center items-center">
                    {row.paper ? (
                      <div className="h-6 w-6 rounded-full bg-green-50 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-50 flex items-center justify-center">
                        <X className="h-3.5 w-3.5 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Clean white CTA — replacing the heavy blue gradient block */}
            <div className="mt-16 text-center">
              <h3 className="text-2xl md:text-4xl font-display font-black mb-4 text-gray-900 leading-tight" data-testid="button-roi-cta">
                Start capturing leads from your next interaction
              </h3>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                Set up your KONEX profile in minutes. No app. No friction.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/auth?tab=register">
                  <Button
                    size="lg"
                    className="h-12 px-8 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all"
                    data-testid="button-roi-cta-primary"
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/konex-cards">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-8 rounded-xl text-base font-semibold border-[#E5E7EB] text-gray-700 hover:bg-gray-50 transition-all"
                    data-testid="button-roi-cards"
                  >
                    Browse NFC Cards
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" className="py-24" style={{ background: "#F8FAFC" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Testimonials</Badge>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-gray-900 leading-tight">Professionals trust KONEX to grow</h2>
              <p className="text-gray-400">Real results from sales teams, agents, and founders.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {displayTestimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl border border-[#E5E7EB] bg-white flex flex-col transition-all duration-200 hover:shadow-sm"
                  data-testid={`testimonial-card-${i}`}
                >
                  <div className="flex items-center gap-1 mb-4" data-testid={`testimonial-rating-${i}`}>
                    {Array.from({ length: testimonial.rating }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed mb-6 flex-1" data-testid={`testimonial-quote-${i}`}>"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#F1F5F9]">
                    <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm" data-testid={`testimonial-name-${i}`}>{testimonial.name}</p>
                      <p className="text-xs text-gray-400" data-testid={`testimonial-title-${i}`}>{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── Final CTA — clean white, consistent with design system ── */}
      <section className="py-28 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-2xl mx-auto text-center px-6">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-blue-500 mb-5">
            Make the switch
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-black text-gray-900 leading-tight mb-5">
            Upgrade the way you connect
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Over 27 million paper cards are printed every day. Most are thrown away within a week. Replace them with one tap.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
            <Link href="/konex-cards">
              <Button
                size="lg"
                className="h-12 px-8 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all w-full sm:w-auto"
                data-testid="button-footer-nfc"
              >
                <Nfc className="h-4 w-4 mr-2" /> Get Your NFC Card
              </Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-xl text-base font-semibold border-[#E5E7EB] text-gray-700 hover:bg-gray-50 transition-all w-full sm:w-auto"
                data-testid="button-footer-digital"
              >
                <Smartphone className="h-4 w-4 mr-2" /> Create Free Profile
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-400">Works with iPhone &amp; Android — no app required for the recipient.</p>
        </div>
      </section>

      <footer className="py-6 border-t border-[#E5E7EB] text-center text-sm bg-white">
        <p className="mb-2 text-gray-500">&copy; {new Date().getFullYear()} KONEX. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-gray-600">
          <Link href="/terms" className="hover:text-gray-400 transition-colors" data-testid="link-landing-footer-terms">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-gray-400 transition-colors" data-testid="link-landing-footer-privacy">Privacy Policy</Link>
          <Link href="/refund-policy" className="hover:text-gray-400 transition-colors" data-testid="link-landing-footer-refund">Refund &amp; Return Policy</Link>
        </div>
      </footer>
    </div>
  );
}
