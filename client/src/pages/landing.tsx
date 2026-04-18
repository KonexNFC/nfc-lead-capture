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
    border: "border-blue-100",
    title: "Sales Teams",
    headline: "Every rep, every tap, fully tracked.",
    desc: "Issue NFC cards to your whole team, track who's tapping most, see lead capture rates per rep, and ensure no handshake goes unrecorded.",
    bullets: ["Per-rep tap analytics", "Lead capture by team member", "Card assignment dashboard"],
  },
  {
    icon: Building2,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "Real Estate",
    headline: "Turn every showing into a captured lead.",
    desc: "Never lose a prospect again. Tap your KONEX card at a showing, and every interested buyer instantly becomes a lead in your dashboard.",
    bullets: ["Instant contact capture", "Lead follow-up reminders", "Portfolio & listing links"],
  },
  {
    icon: Globe,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    title: "Founders & Creators",
    headline: "First impressions that close deals.",
    desc: "Share your entire professional story in a single tap. Bio, portfolio, links, booking page — all live, always updated, always impressive.",
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
                  <div className="text-3xl md:text-4xl font-display font-black text-blue-600">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
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
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Use Cases</Badge>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-gray-900">
                Built for people who close deals
              </h2>
              <p className="text-gray-500 text-lg">
                Whether you're a solo founder or running a team of 50, KONEX scales with you.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  className={`rounded-3xl border ${uc.border} bg-white p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
                  data-testid={`use-case-${i}`}
                >
                  <div className={`h-12 w-12 rounded-2xl ${uc.bg} flex items-center justify-center mb-6`}>
                    <uc.icon className={`h-6 w-6 ${uc.color}`} />
                  </div>
                  <Badge className="mb-3 text-xs bg-gray-100 text-gray-600 border-gray-200">{uc.title}</Badge>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{uc.headline}</h3>
                  <p className="text-gray-500 leading-relaxed mb-6">{uc.desc}</p>
                  <ul className="space-y-2">
                    {uc.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
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

            <div className="text-center mb-8">
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Three tiers. One mission.</h3>
              <p className="text-gray-500">Every tier captures leads, tracks taps, and integrates with your team dashboard.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {[
                { img: cardBasic, name: "Basic", price: "£19.99", desc: "Matte black. Clean & professional.", href: "/konex-cards/basic" },
                { img: cardPremium, name: "Premium", price: "£49.99", desc: "Brushed metal — Silver, Black or Copper.", href: "/konex-cards/premium" },
                { img: cardElite, name: "Elite", price: "£79.99", desc: "Carbon, Gold or Carbon-Gold edition.", href: "/konex-cards/elite" },
              ].map((card, i) => (
                <Link key={i} href={card.href}>
                  <div
                    className="group rounded-2xl p-4 border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-1"
                    data-testid={`showcase-card-${card.name.toLowerCase()}`}
                  >
                    <img src={card.img} alt={`KONEX ${card.name}`} className="w-full rounded-xl mb-4 shadow-sm" data-testid={`img-showcase-${card.name.toLowerCase()}`} />
                    <h4 className="font-bold text-lg text-gray-900">{card.name}</h4>
                    <p className="text-sm text-gray-500 mb-1">{card.desc}</p>
                    <p className="text-blue-600 font-semibold">{card.price}</p>
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

            {/* Stats row */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                { stat: "88%", label: "of paper cards thrown away within a week", highlight: false },
                { stat: "3×", label: "more leads captured per event with KONEX", highlight: true },
                { stat: "£0", label: "extra cost when you update your profile", highlight: true },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`rounded-3xl border p-8 text-center ${item.highlight ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"}`}
                  data-testid={`roi-stat-${i}`}
                >
                  <div className={`text-6xl font-display font-black mb-3 ${item.highlight ? "text-blue-600" : "text-gray-400"}`}>
                    {item.stat}
                  </div>
                  <p className="text-gray-500 leading-relaxed">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
                <div className="px-6 py-4 text-sm font-semibold text-gray-500">Feature</div>
                <div className="px-6 py-4 text-sm font-bold text-blue-700 text-center bg-blue-50 border-x border-blue-100">KONEX</div>
                <div className="px-6 py-4 text-sm font-semibold text-gray-500 text-center">Paper Cards</div>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 border-b last:border-b-0 border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                  data-testid={`comparison-row-${i}`}
                >
                  <div className="px-6 py-4 text-sm text-gray-700 font-medium">{row.feature}</div>
                  <div className="px-6 py-4 flex justify-center items-center bg-blue-50/30 border-x border-blue-100/50">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="px-6 py-4 flex justify-center items-center">
                    {row.paper ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Banner */}
            <div className="mt-12 rounded-3xl p-8 md:p-14 text-center bg-blue-600 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[60px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[40px]" />
              <h3 className="text-2xl md:text-4xl font-display font-black mb-4 text-white relative z-10">
                Ready to stop losing leads at events?
              </h3>
              <p className="text-blue-100 text-lg mb-10 max-w-lg mx-auto relative z-10">
                Set up your KONEX profile in minutes. Start capturing leads the same day you tap your first card.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <Link href="/auth?tab=register">
                  <Button
                    size="lg"
                    className="h-14 px-10 rounded-xl text-base font-bold bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:-translate-y-0.5 transition-all"
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
                    className="h-14 px-10 rounded-xl text-base font-semibold border-white/30 text-white hover:bg-white/10 hover:border-white/50 hover:-translate-y-0.5 transition-all"
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
        <section id="testimonials" className="py-24" style={{ background: "#F8F9FB" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Testimonials</Badge>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-gray-900">Professionals trust KONEX to grow</h2>
              <p className="text-gray-500 text-lg">Real results from sales teams, agents, and founders.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {displayTestimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="p-8 rounded-3xl border border-gray-200 bg-white flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  data-testid={`testimonial-card-${i}`}
                >
                  <Quote className="h-8 w-8 text-blue-200 mb-4" />
                  <p className="text-gray-500 leading-relaxed mb-6 flex-1" data-testid={`testimonial-quote-${i}`}>"{testimonial.quote}"</p>
                  <div className="flex items-center gap-1 mb-4" data-testid={`testimonial-rating-${i}`}>
                    {Array.from({ length: testimonial.rating }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-blue-600 text-blue-600" />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900" data-testid={`testimonial-name-${i}`}>{testimonial.name}</p>
                    <p className="text-sm text-gray-400" data-testid={`testimonial-title-${i}`}>{testimonial.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── Final CTA — sustainability (forest photo kept) ── */}
      <section className="relative overflow-hidden">
        <img src={forestBg} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 max-w-2xl mx-auto text-center px-6 py-24 space-y-6">
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#b6f542]">
            Make the sustainable switch
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-black text-white leading-[1.1] tracking-tight">
            Upgrade the Way You Connect
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
          <div className="pt-2">
            <p className="text-lg md:text-xl font-bold text-white mb-4">Get Started</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/konex-cards">
                <Button
                  size="lg"
                  className="h-14 px-8 rounded-xl text-base font-bold bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                  data-testid="button-footer-nfc"
                >
                  <Nfc className="h-4 w-4 mr-2" /> NFC Business Card
                </Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 rounded-xl text-base font-bold border-[#b6f542]/50 text-[#b6f542] hover:bg-[#b6f542]/10 hover:border-[#b6f542]/70 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                  data-testid="button-footer-digital"
                >
                  <Smartphone className="h-4 w-4 mr-2" /> Digital Profile
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-xs text-white/40 pt-1">Works with iPhone &amp; Android — no app required.</p>
        </div>
      </section>

      <footer className="py-6 border-t border-gray-800 text-center text-sm" style={{ background: "#0F172A" }}>
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
