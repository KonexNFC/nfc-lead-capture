import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Nfc, Users, BarChart2, Smartphone, Share2, ShieldCheck, Building2,
  ChevronRight, Star, Quote, Menu, ArrowRight, TrendingUp, Zap,
  UserCheck, Target, Globe, Layers, CheckCircle2, UserPlus, X, Check,
  Phone, Mail, Linkedin, Activity, Bell, Wifi
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Testimonial } from "@shared/schema";
import { KonexLogo } from "@/components/konex/KonexLogo";
import cardInHand from "@assets/IMG_7743_1771669634221.jpeg";

const cardBasic = "/img/card-basic.webp";
const cardPremium = "/img/card-premium.webp";
const cardElite = "/img/card-elite.webp";
const cardThreeTiers = "/img/card-three-tiers.webp";

// ── Data ─────────────────────────────────────────────────────────────────────

const fallbackTestimonials = [
  {
    name: "Sarah Mitchell",
    title: "Head of Sales",
    company: "TechScale",
    quote: "Our sales team taps an average of 12 new leads per event. With KONEX, every one of them is captured instantly. We've completely removed paper cards from our process.",
    rating: 5,
  },
  {
    name: "James Okafor",
    title: "Real Estate Agent",
    company: "Independent",
    quote: "Every showing used to end with a stack of cards I'd forget to follow up on. Now every tap auto-captures the contact. My conversion rate jumped 40% in three months.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    title: "Founder",
    company: "Studio Bloom",
    quote: "I manage a team of 8 creatives. KONEX lets me see who's tapping, who's capturing leads, and where we're losing connections. It's analytics I actually act on.",
    rating: 5,
  },
];

const trustStats = [
  { value: 10000, display: "10,000+", label: "Active Profiles" },
  { value: 500, display: "500K+", label: "NFC Taps Tracked" },
  { value: 3, display: "3×", label: "More Leads vs Paper" },
  { value: 500, display: "500+", label: "Teams Using KONEX" },
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
    color: "text-blue-400",
    bg: "bg-blue-900/30",
    border: "border-blue-800/40",
    title: "Sales Teams",
    headline: "Every rep, every tap, fully tracked.",
    desc: "Issue cards to your whole team, track tap rates by rep, and ensure no handshake goes unrecorded.",
    bullets: ["Per-rep tap analytics", "Lead capture by team member", "Card assignment dashboard"],
  },
  {
    icon: Building2,
    color: "text-amber-400",
    bg: "bg-amber-900/30",
    border: "border-amber-800/40",
    title: "Real Estate",
    headline: "Turn every showing into a captured lead.",
    desc: "Every interested buyer instantly becomes a lead in your dashboard. No paper, no follow-up guesswork.",
    bullets: ["Instant contact capture", "Lead follow-up reminders", "Portfolio & listing links"],
  },
  {
    icon: Globe,
    color: "text-purple-400",
    bg: "bg-purple-900/30",
    border: "border-purple-800/40",
    title: "Founders & Creators",
    headline: "First impressions that close deals.",
    desc: "Bio, portfolio, links, booking page — all in one tap. Always live, always current.",
    bullets: ["Live profile, always current", "Booking & payment links", "Social proof & testimonials"],
  },
];

const featureBlocks = [
  { icon: UserCheck, color: "text-green-400", bg: "bg-green-900/30", title: "Instant Lead Capture", desc: "Visitors can share their contact details directly from your profile with a single tap. No app, no friction, no lost leads." },
  { icon: Nfc, color: "text-blue-400", bg: "bg-blue-900/30", title: "NFC + QR Sharing", desc: "Works with a tap or a scan. Every modern smartphone supports it — no app required for the recipient." },
  { icon: Users, color: "text-amber-400", bg: "bg-amber-900/30", title: "Team Management", desc: "Assign NFC cards to team members, manage roles, track individual performance, and view your whole team's analytics in one dashboard." },
  { icon: BarChart2, color: "text-purple-400", bg: "bg-purple-900/30", title: "ROI Analytics", desc: "Track every tap, click, and lead capture. Know exactly which cards perform best and which events deliver the highest return." },
  { icon: Layers, color: "text-rose-400", bg: "bg-rose-900/30", title: "Custom Branding", desc: "Set team-wide brand colors and profile themes. Every member's card stays on-brand — no design team required." },
  { icon: ShieldCheck, color: "text-cyan-400", bg: "bg-cyan-900/30", title: "Enterprise Ready", desc: "Role-based permissions, org-level card control, invitation management, and activation tracking — built for teams at scale." },
];

const comparisonRows = [
  { feature: "Update info without reprinting", konex: true, paper: false },
  { feature: "Capture leads automatically", konex: true, paper: false },
  { feature: "Track tap & click analytics", konex: true, paper: false },
  { feature: "Works without a recipient app", konex: true, paper: true },
  { feature: "Sustainable — no reprints ever", konex: true, paper: false },
  { feature: "Team management dashboard", konex: true, paper: false },
];

// ── CSS Animations (injected once) ───────────────────────────────────────────

const ANIMATIONS_CSS = `
@keyframes konex-float {
  0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
  50% { transform: translateY(-12px) rotate(0.5deg); }
}
@keyframes konex-glow-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.85; }
}
@keyframes konex-glow-pulse-slow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
@keyframes konex-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes konex-draw-line {
  from { stroke-dashoffset: 300; }
  to   { stroke-dashoffset: 0;   }
}
@keyframes konex-step-in {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
@keyframes konex-bar-grow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@media (prefers-reduced-motion: reduce) {
  [style*="konex-float"], [style*="konex-glow-pulse"],
  [style*="konex-fade-up"], [style*="konex-step-in"],
  [style*="konex-draw-line"], [style*="konex-bar-grow"] {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target: number, enabled: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, enabled, duration]);
  return val;
}

// ── AnimatedSection wrapper ───────────────────────────────────────────────────

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        animation: visible ? `konex-fade-up 0.6s ease ${delay}ms both` : "none",
        opacity: visible ? undefined : 0,
      }}
    >
      {children}
    </div>
  );
}

// ── Stat counter ──────────────────────────────────────────────────────────────

function StatCounter({ target, display, label, enabled }: { target: number; display: string; label: string; enabled: boolean }) {
  const val = useCountUp(target, enabled);
  const isRaw = !isNaN(Number(display.replace(/[^0-9]/g, "")));
  const showCount = enabled && isRaw;

  const rendered = display.endsWith("+")
    ? `${val.toLocaleString()}+`
    : display.endsWith("×")
    ? `${val}×`
    : display.startsWith("£") || display === "£0"
    ? display
    : display;

  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-black text-white tracking-tight tabular-nums">
        {showCount ? rendered : display}
      </div>
      <div className="text-sm text-slate-500 mt-1.5">{label}</div>
    </div>
  );
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────

function Sparkline({ animated }: { animated: boolean }) {
  const pts = "0,52 28,44 56,40 84,30 112,26 140,18 168,12 196,6";
  return (
    <svg viewBox="0 0 200 60" className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,52 ${pts} 196,60 0,60`}
        fill="url(#spark-fill)"
      />
      <polyline
        points={pts}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animated ? {
          strokeDasharray: 300,
          strokeDashoffset: 0,
          animation: "konex-draw-line 1.4s ease forwards",
        } : { strokeDasharray: 300, strokeDashoffset: 0 }}
      />
    </svg>
  );
}

// ── Dashboard Preview ─────────────────────────────────────────────────────────

function DashboardPreview() {
  const { ref, visible } = useInView(0.1);
  const taps     = useCountUp(247, visible, 1200);
  const leads    = useCountUp(43,  visible, 1000);
  const rate     = useCountUp(17,  visible, 1100);

  const activity = [
    { name: "Jordan Lee",   company: "Acme Corp",       time: "2 min ago",  color: "bg-blue-500" },
    { name: "Maya Chen",    company: "Design Studio",   time: "14 min ago", color: "bg-violet-500" },
    { name: "Tom Ellis",    company: "Venture Partners",time: "31 min ago", color: "bg-emerald-500" },
    { name: "Priya Nair",   company: "FinTech Inc",     time: "1 hr ago",   color: "bg-amber-500" },
  ];

  return (
    <div ref={ref} className="relative">
      {/* Ambient glow behind panel */}
      <div
        className="absolute inset-0 -z-10 rounded-3xl"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)",
          animation: "konex-glow-pulse-slow 4s ease-in-out infinite",
        }}
      />

      <div
        className="rounded-2xl overflow-hidden border"
        style={{ background: "#0d1526", borderColor: "rgba(255,255,255,0.07)" }}
      >
        {/* Window bar */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ background: "#0a1020", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="h-3 w-3 rounded-full bg-red-500/60" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
          <div className="h-3 w-3 rounded-full bg-green-500/60" />
          <span className="ml-3 text-xs text-slate-600 font-mono">konex.app / dashboard / analytics</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Stat row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Taps Today", value: visible ? taps : 0, suffix: "", accent: "#3b82f6" },
              { label: "Leads Captured", value: visible ? leads : 0, suffix: "", accent: "#8b5cf6" },
              { label: "Conversion", value: visible ? rate : 0, suffix: "%", accent: "#10b981" },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{
                  background: "#0f1a2e",
                  border: "1px solid rgba(255,255,255,0.06)",
                  animation: visible ? `konex-step-in 0.5s ease both` : "none",
                  animationDelay: `${i * 120}ms`,
                  opacity: visible ? undefined : 0,
                }}
              >
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className="text-2xl font-black tabular-nums" style={{ color: s.accent }}>
                  {s.value.toLocaleString()}{s.suffix}
                </p>
              </div>
            ))}
          </div>

          {/* Sparkline section */}
          <div
            className="rounded-xl p-4"
            style={{ background: "#0f1a2e", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400">Tap Activity — Last 7 Days</p>
              <span className="text-xs font-semibold text-emerald-400">↑ 28% vs last week</span>
            </div>
            <Sparkline animated={visible} />
          </div>

          {/* Activity feed */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Leads</p>
            <div className="space-y-2.5">
              {activity.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                  style={{
                    background: "#0f1a2e",
                    border: "1px solid rgba(255,255,255,0.04)",
                    animation: visible ? `konex-step-in 0.5s ease both` : "none",
                    animationDelay: `${300 + i * 100}ms`,
                    opacity: visible ? undefined : 0,
                  }}
                >
                  <div className={`h-7 w-7 rounded-full ${a.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {a.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{a.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{a.company}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] text-slate-600">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tap-to-Lead Flow ──────────────────────────────────────────────────────────

function TapToLeadFlow() {
  const { ref, visible } = useInView(0.15);

  const steps = [
    { icon: Wifi, label: "Card Tap", sub: "NFC or QR scan", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
    { icon: Smartphone, label: "Profile Opens", sub: "Instantly in browser", color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
    { icon: UserCheck, label: "Lead Captured", sub: "Contact shared", color: "#10b981", bg: "rgba(16,185,129,0.15)" },
    { icon: BarChart2, label: "Analytics Updated", sub: "Dashboard synced", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  ];

  return (
    <div ref={ref}>
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-0">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col md:flex-row items-center">
            {/* Step bubble */}
            <div
              className="flex flex-col items-center text-center w-40"
              style={{
                animation: visible ? `konex-step-in 0.55s ease both` : "none",
                animationDelay: `${i * 150}ms`,
                opacity: visible ? undefined : 0,
              }}
            >
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
                style={{ background: s.bg, border: `1px solid ${s.color}30` }}
              >
                <s.icon className="h-6 w-6" style={{ color: s.color }} />
              </div>
              <p className="text-sm font-bold text-white leading-tight">{s.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
            </div>

            {/* Connector arrow (between steps) */}
            {i < steps.length - 1 && (
              <div className="flex flex-col items-center mx-1 my-4 md:my-0">
                {/* Desktop horizontal arrow */}
                <div className="hidden md:flex items-center">
                  <svg width="56" height="16" viewBox="0 0 56 16">
                    <line
                      x1="2" y1="8" x2="46" y2="8"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      style={visible ? {
                        strokeDashoffset: 0,
                        animation: `konex-draw-line 0.8s ease both`,
                        animationDelay: `${i * 150 + 100}ms`,
                      } : { strokeDashoffset: 100 }}
                    />
                    <polygon points="46,5 54,8 46,11" fill="rgba(255,255,255,0.2)" />
                  </svg>
                </div>
                {/* Mobile vertical arrow */}
                <div className="md:hidden flex flex-col items-center">
                  <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <div className="w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "6px solid rgba(255,255,255,0.15)" }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Lifestyle Strip ───────────────────────────────────────────────────────────

function LifestyleStrip() {
  const panels = [
    {
      label: "Events",
      sub: "Capture every handshake",
      gradient: "linear-gradient(135deg, #1e3a5f 0%, #0d1f3c 100%)",
      accent: "#3b82f6",
      icon: Users,
      img: cardInHand,
    },
    {
      label: "Sales Teams",
      sub: "Every rep, fully tracked",
      gradient: "linear-gradient(135deg, #1a1f3a 0%, #0d1020 100%)",
      accent: "#8b5cf6",
      icon: TrendingUp,
      img: null,
    },
    {
      label: "Creators & Founders",
      sub: "Links, bookings, socials — one tap",
      gradient: "linear-gradient(135deg, #1a2a1a 0%, #0d1a10 100%)",
      accent: "#10b981",
      icon: Globe,
      img: null,
    },
  ];

  const { ref, visible } = useInView(0.1);

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {panels.map((p, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl group"
          style={{
            background: p.gradient,
            border: `1px solid ${p.accent}20`,
            height: 220,
            animation: visible ? `konex-step-in 0.55s ease both` : "none",
            animationDelay: `${i * 120}ms`,
            opacity: visible ? undefined : 0,
          }}
        >
          {/* Background image for first panel */}
          {p.img && (
            <img
              src={p.img}
              alt={p.label}
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500"
            />
          )}

          {/* CSS icon pattern for non-image panels */}
          {!p.img && (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <p.icon className="h-32 w-32" style={{ color: p.accent }} />
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, ${p.gradient.split("0%,")[0].replace("linear-gradient(135deg, ", "")}ee 0%, transparent 60%)` }}
          />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold mb-2"
              style={{ background: `${p.accent}22`, color: p.accent, border: `1px solid ${p.accent}30` }}
            >
              <p.icon className="h-3 w-3" />
              {p.label}
            </div>
            <p className="text-sm font-semibold text-white">{p.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main LandingPage ──────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  // Inject CSS keyframes once
  useEffect(() => {
    const id = "konex-animations";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = ANIMATIONS_CSS;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const { data: approvedTestimonials } = useQuery<Testimonial[]>({
    queryKey: ["/api/public/testimonials"],
  });

  const displayTestimonials =
    approvedTestimonials && approvedTestimonials.length > 0
      ? approvedTestimonials.map(t => ({ name: t.name, title: t.title, company: "", quote: t.quote, rating: t.rating }))
      : fallbackTestimonials;

  // Stats section scroll visibility
  const statsSection = useInView(0.2);

  return (
    <div className="min-h-screen flex flex-col text-white" style={{ background: "#070B18" }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        className={`w-full fixed top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "backdrop-blur-xl border-white/8 shadow-lg shadow-black/30"
            : "backdrop-blur-sm border-transparent"
        }`}
        style={{ background: scrolled ? "rgba(7,11,24,0.96)" : "rgba(7,11,24,0.7)" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KonexLogo height={36} />
            <div className="hidden md:flex items-center gap-1 ml-4">
              <Link href="/konex-cards">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/8" data-testid="nav-konex-cards">NFC Cards</Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/8" onClick={() => scrollTo("how-it-works")} data-testid="nav-how-it-works">How It Works</Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/8" onClick={() => scrollTo("use-cases")} data-testid="nav-use-cases">Use Cases</Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/8" onClick={() => scrollTo("features")} data-testid="nav-features">Features</Button>
              <Link href="/what-is-nfc">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/8" data-testid="nav-what-is-nfc">What is NFC?</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth">
              <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/8 font-medium" data-testid="button-login">Log in</Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-white hover:bg-white/8" data-testid="button-nav-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1E293B] border-slate-700 [&_*]:text-slate-200 [&_svg]:text-slate-400">
                <Link href="/konex-cards">
                  <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-white" data-testid="menu-konex-cards">
                    <Nfc className="h-4 w-4 mr-2 text-slate-400" /> NFC Cards <ChevronRight className="h-4 w-4 ml-auto text-slate-500" />
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-white" onClick={() => scrollTo("how-it-works")} data-testid="menu-how-it-works">How It Works</DropdownMenuItem>
                <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-white" onClick={() => scrollTo("use-cases")} data-testid="menu-use-cases">Use Cases</DropdownMenuItem>
                <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-white" onClick={() => scrollTo("features")} data-testid="menu-features">Features</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <Link href="/what-is-nfc">
                  <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-white" data-testid="menu-what-is-nfc">
                    <Nfc className="h-4 w-4 mr-2 text-slate-400" /> What is NFC?
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-slate-700" />
                <Link href="/auth">
                  <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-white" data-testid="menu-login">Log in</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/konex-cards">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 hidden md:inline-flex shadow-md shadow-blue-900/40"
                data-testid="button-nav-get-card"
              >
                Get Your Card
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative pt-20 pb-28 px-4 overflow-hidden">

          {/* Deep ambient background glows */}
          <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
            {/* Top-right blue nebula */}
            <div
              className="absolute top-[-80px] right-[-100px] w-[800px] h-[600px] rounded-full"
              style={{
                background: "radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)",
                animation: "konex-glow-pulse 6s ease-in-out infinite",
              }}
            />
            {/* Bottom-left indigo accent */}
            <div
              className="absolute bottom-0 left-[-60px] w-[500px] h-[400px] rounded-full"
              style={{
                background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)",
                animation: "konex-glow-pulse-slow 8s ease-in-out infinite",
              }}
            />
            {/* Centre subtle grid */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }}
            />
          </div>

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">

            {/* Left — copy */}
            <div className="flex-1 text-center md:text-left space-y-8">
              <FadeUp>
                <div className="inline-flex items-center rounded-full border border-blue-800/60 bg-blue-950/50 px-4 py-1.5 text-sm font-semibold text-blue-400 gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  NFC-Powered Connection & Conversion
                </div>
              </FadeUp>

              <FadeUp delay={80}>
                <h1
                  className="text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.04] text-white"
                  data-testid="text-hero-headline"
                >
                  Turn Every{" "}
                  <br className="hidden lg:block" />
                  Introduction Into a{" "}
                  <span
                    className="text-transparent bg-clip-text"
                    style={{ backgroundImage: "linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #38bdf8 100%)" }}
                  >
                    Contact, Lead,<br className="hidden sm:block" /> or Opportunity
                  </span>
                </h1>
              </FadeUp>

              <FadeUp delay={160}>
                <p className="text-xl text-slate-400 leading-relaxed max-w-xl mx-auto md:mx-0">
                  One tap. No app. Share your details, capture leads, and convert instantly with KONEX.
                </p>
              </FadeUp>

              <FadeUp delay={240}>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                  <Link href="/konex-cards">
                    <Button
                      size="lg"
                      className="h-14 px-8 rounded-xl text-base font-bold text-white shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                      style={{ background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)", boxShadow: "0 8px 32px rgba(37,99,235,0.35)" }}
                      data-testid="button-get-card-hero"
                    >
                      <Nfc className="h-5 w-5 mr-2" />
                      Get Your KONEX Card
                    </Button>
                  </Link>
                  <Link href="/auth?tab=register">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 px-8 rounded-xl text-base font-semibold hover:-translate-y-0.5 transition-all duration-200"
                      style={{ borderColor: "rgba(255,255,255,0.12)", color: "#cbd5e1", background: "rgba(255,255,255,0.04)" }}
                      data-testid="button-signup-free"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Free Profile
                    </Button>
                  </Link>
                </div>
              </FadeUp>

              <FadeUp delay={300}>
                <Button
                  variant="ghost"
                  className="group h-11 px-0 text-sm font-semibold text-blue-400 hover:text-blue-300 hover:bg-transparent"
                  onClick={() => scrollTo("how-it-works")}
                  data-testid="button-view-demo"
                >
                  See How It Works
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </FadeUp>

              <FadeUp delay={340}>
                <div className="flex items-center gap-2 text-sm text-slate-500 justify-center md:justify-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span>No app required. Works with iPhone &amp; Android.</span>
                </div>
              </FadeUp>
            </div>

            {/* Right — floating card hero */}
            <div className="flex-1 relative w-full max-w-lg md:max-w-full">
              <FadeUp delay={200}>
                {/* Soft spotlight behind card */}
                <div
                  className="absolute inset-0 -z-10 scale-75"
                  style={{
                    background: "radial-gradient(ellipse, rgba(59,130,246,0.2) 0%, transparent 65%)",
                    animation: "konex-glow-pulse-slow 5s ease-in-out infinite",
                  }}
                />

                {/* Floating hero image */}
                <div style={{ animation: "konex-float 5s ease-in-out infinite" }}>
                  <img
                    src={cardInHand}
                    alt="Hand holding a KONEX NFC Business Card"
                    className="w-full max-w-lg mx-auto rounded-3xl"
                    style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(37,99,235,0.2)" }}
                    decoding="async"
                    data-testid="img-hero-card"
                  />
                </div>

                {/* Card tier thumbnails */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    { img: cardBasic, label: "Basic", price: "£19.99" },
                    { img: cardPremium, label: "Premium", price: "£49.99" },
                    { img: cardElite, label: "Elite", price: "£79.99" },
                  ].map((card, i) => (
                    <Link key={i} href={`/konex-cards/${card.label.toLowerCase()}`}>
                      <div
                        className="group cursor-pointer rounded-xl p-3 transition-all duration-200 hover:-translate-y-1"
                        style={{
                          border: "1px solid rgba(255,255,255,0.07)",
                          background: "rgba(15,22,46,0.7)",
                          backdropFilter: "blur(8px)",
                        }}
                        data-testid={`hero-card-${card.label.toLowerCase()}`}
                      >
                        <img
                          src={card.img}
                          alt={`KONEX ${card.label}`}
                          className="w-full rounded-lg"
                          loading="lazy"
                          decoding="async"
                          data-testid={`img-hero-tier-${card.label.toLowerCase()}`}
                        />
                        <div className="text-center mt-2 pb-1">
                          <p className="text-sm font-bold text-white">{card.label}</p>
                          <p className="text-xs text-slate-500">{card.price}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ── Lifestyle Strip ──────────────────────────────────────────────── */}
        <section className="pb-10 px-4">
          <div className="max-w-7xl mx-auto">
            <LifestyleStrip />
          </div>
        </section>

        {/* ── Trust Pills ──────────────────────────────────────────────────── */}
        <section
          className="py-5 border-y"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          data-testid="section-trust-strip"
        >
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {trustPills.map((pill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-300"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  data-testid={`trust-pill-${i}`}
                >
                  <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Band ───────────────────────────────────────────────────── */}
        <section className="py-16">
          <div ref={statsSection.ref} className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {trustStats.map((stat, i) => (
                <StatCounter
                  key={i}
                  target={stat.value}
                  display={stat.display}
                  label={stat.label}
                  enabled={statsSection.visible}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Dashboard Preview ────────────────────────────────────────────── */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <FadeUp>
              <div className="text-center max-w-2xl mx-auto mb-14">
                <Badge className="mb-4 bg-blue-950/60 text-blue-400 border-blue-800/60">Live Dashboard</Badge>
                <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-white">
                  More than a card. It's a{" "}
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #60a5fa, #818cf8)" }}>
                    lead machine.
                  </span>
                </h2>
                <p className="text-slate-400 text-lg">
                  Every tap, click, and form submission tracked in real time. Know exactly where your leads come from.
                </p>
              </div>
            </FadeUp>

            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Dashboard visual */}
              <div className="flex-1 w-full max-w-xl lg:max-w-none">
                <DashboardPreview />
              </div>

              {/* Copy */}
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <FadeUp delay={100}>
                  <div className="space-y-4">
                    {[
                      { icon: Activity, title: "Real-time tap analytics", desc: "See every tap the moment it happens, with device, location, and time data.", color: "text-blue-400" },
                      { icon: UserCheck, title: "Automatic lead capture", desc: "When visitors submit your form, their contact lands directly in your leads dashboard.", color: "text-emerald-400" },
                      { icon: BarChart2, title: "Conversion tracking", desc: "Know your tap-to-lead conversion rate and optimise your profile for maximum impact.", color: "text-violet-400" },
                    ].map((item, i) => (
                      <FadeUp key={i} delay={i * 120}>
                        <div
                          className="flex items-start gap-4 p-4 rounded-xl text-left"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: "rgba(59,130,246,0.12)" }}
                          >
                            <item.icon className={`h-5 w-5 ${item.color}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm mb-0.5">{item.title}</p>
                            <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </FadeUp>
                    ))}
                  </div>
                </FadeUp>

                <FadeUp delay={400}>
                  <Link href="/auth?tab=register">
                    <Button
                      size="lg"
                      className="h-12 px-8 rounded-xl font-bold text-white hover:-translate-y-0.5 transition-all"
                      style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: "0 6px 24px rgba(37,99,235,0.3)" }}
                      data-testid="button-dashboard-cta"
                    >
                      Start Capturing Leads
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </FadeUp>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="py-24 px-4"
          style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="max-w-7xl mx-auto">
            <FadeUp>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <Badge className="mb-4 bg-blue-950/60 text-blue-400 border-blue-800/60">How It Works</Badge>
                <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-white" data-testid="text-how-it-works-title">
                  From tap to tracked lead in seconds
                </h2>
                <p className="text-slate-400 text-lg">
                  KONEX removes every step between meeting someone and capturing them as a lead.
                </p>
              </div>
            </FadeUp>

            {/* Video */}
            <FadeUp delay={100}>
              <div className="mb-16 max-w-3xl mx-auto">
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}
                >
                  <video autoPlay loop muted playsInline preload="none" className="w-full" data-testid="video-how-it-works">
                    <source src="/videos/nfc-demo.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </FadeUp>

            {/* 4 steps */}
            <FadeUp delay={150}>
              <TapToLeadFlow />
            </FadeUp>

            {/* Step details grid */}
            <div className="grid md:grid-cols-4 gap-6 mt-14">
              {[
                { step: 1, icon: Nfc, title: "Tap Your Card", desc: "One tap on any modern phone opens your profile instantly. No app download, no friction.", color: "#3b82f6" },
                { step: 2, icon: Target, title: "Profile Opens", desc: "Your digital profile loads with your bio, links, social handles, booking page — everything.", color: "#8b5cf6" },
                { step: 3, icon: UserCheck, title: "Lead Captured", desc: "Visitors share their contact info directly. It lands in your leads dashboard automatically.", color: "#10b981" },
                { step: 4, icon: BarChart2, title: "ROI Tracked", desc: "See every tap, click and lead in your analytics. Know exactly where your best leads come from.", color: "#f59e0b" },
              ].map((item, i) => (
                <FadeUp key={item.step} delay={i * 100}>
                  <div
                    className="flex flex-col items-center text-center p-5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    data-testid={`how-it-works-step-${item.step}`}
                  >
                    <span className="text-xs font-bold tracking-widest mb-3" style={{ color: item.color }}>STEP {item.step}</span>
                    <div
                      className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                      style={{ background: `${item.color}20`, border: `1px solid ${item.color}30` }}
                    >
                      <item.icon className="h-6 w-6" style={{ color: item.color }} />
                    </div>
                    <h3 className="text-base font-bold mb-2 text-white">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature Grid ─────────────────────────────────────────────────── */}
        <section id="features" className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <FadeUp>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <Badge className="mb-4 bg-blue-950/60 text-blue-400 border-blue-800/60">Features</Badge>
                <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-white">
                  Everything you need to grow and track
                </h2>
                <p className="text-slate-400 text-lg">
                  KONEX combines lead capture, team management, and analytics in one platform.
                </p>
              </div>
            </FadeUp>
            <div className="grid md:grid-cols-3 gap-5">
              {featureBlocks.map((f, i) => (
                <FadeUp key={i} delay={i * 80}>
                  <div
                    className="p-7 rounded-xl transition-all duration-200 group hover:-translate-y-1 cursor-default"
                    style={{
                      border: "1px solid rgba(255,255,255,0.07)",
                      background: "rgba(255,255,255,0.025)",
                    }}
                    data-testid={`feature-block-${i}`}
                  >
                    <div className={`h-12 w-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                      <f.icon className={`h-6 w-6 ${f.color}`} />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-white">{f.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── Live Profile Preview ──────────────────────────────────────────── */}
        <section
          className="py-24 px-4"
          style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">

              {/* Phone frame mockup */}
              <FadeUp className="flex-1 flex justify-center">
                <div className="relative">
                  <div
                    className="absolute inset-0 scale-75 -z-10"
                    style={{
                      background: "radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)",
                      animation: "konex-glow-pulse-slow 5s ease-in-out infinite",
                    }}
                  />
                  <div
                    className="relative w-72 rounded-[3rem] overflow-hidden"
                    style={{ border: "10px solid #1e293b", boxShadow: "0 32px 80px rgba(0,0,0,0.55)", background: "#0f172a" }}
                  >
                    <div className="bg-white h-8 flex items-center justify-between px-5">
                      <span className="text-[10px] font-semibold text-gray-900">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-1.5 rounded-sm bg-gray-900" />
                        <div className="w-1 h-1 rounded-full bg-gray-900" />
                      </div>
                    </div>
                    <div className="bg-white">
                      <div className="h-24 relative" style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)" }}>
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:8px_8px]" />
                      </div>
                      <div className="flex justify-center -mt-8 relative z-10">
                        <div className="h-16 w-16 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-blue-600 font-black text-2xl">A</div>
                      </div>
                      <div className="text-center px-4 pt-2 pb-3">
                        <p className="font-bold text-gray-900 text-sm">Alex Rivera</p>
                        <p className="text-[11px] text-gray-500">Head of Business Development</p>
                        <p className="text-[11px] font-semibold text-blue-600 mt-0.5">KONEX Technologies</p>
                      </div>
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
                      <div className="mx-3 mb-3 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-700 mb-1.5">Share your contact</p>
                        <div className="h-6 rounded-lg bg-white border border-gray-200 flex items-center px-2">
                          <span className="text-[10px] text-gray-400">Your email address...</span>
                        </div>
                        <button className="w-full mt-1.5 h-6 rounded-lg bg-blue-600 text-white text-[10px] font-bold">Send</button>
                      </div>
                    </div>
                    <div className="bg-white h-5 flex items-center justify-center pb-1">
                      <div className="w-20 h-1 bg-gray-300 rounded-full" />
                    </div>
                  </div>
                  <div
                    className="absolute -right-8 top-24 rounded-xl shadow-xl px-3 py-2 text-xs font-semibold whitespace-nowrap"
                    style={{ background: "#0f1629", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                  >
                    ✅ Contact saved
                  </div>
                  <div
                    className="absolute -left-10 bottom-28 rounded-xl shadow-xl px-3 py-2 text-xs font-semibold whitespace-nowrap"
                    style={{ background: "#0f1629", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                  >
                    📊 Lead captured
                  </div>
                </div>
              </FadeUp>

              {/* Copy */}
              <div className="flex-1 text-center lg:text-left space-y-6">
                <FadeUp>
                  <Badge className="bg-blue-950/60 text-blue-400 border-blue-800/60">Live Profile Preview</Badge>
                </FadeUp>
                <FadeUp delay={80}>
                  <h2 className="text-3xl md:text-5xl font-display font-black text-white">
                    This is what happens the second they tap your card
                  </h2>
                </FadeUp>
                <FadeUp delay={140}>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Your contact details, social links, booking page, and lead capture form — all in one beautiful profile. No app needed. Always up to date.
                  </p>
                </FadeUp>
                <FadeUp delay={200}>
                  <ul className="space-y-3 text-left">
                    {[
                      "Save contact directly to their phone",
                      "Share your socials, portfolio, and booking links",
                      "Capture their email with one tap",
                      "Every action tracked in your dashboard",
                    ].map((point, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-300">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </FadeUp>
                <FadeUp delay={280}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link href="/u/arivera">
                      <Button
                        size="lg"
                        className="h-13 px-8 rounded-xl font-bold text-white hover:-translate-y-0.5 transition-all"
                        style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: "0 6px 24px rgba(37,99,235,0.3)" }}
                        data-testid="button-see-live-profile"
                      >
                        See a Live Profile
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </FadeUp>
              </div>
            </div>
          </div>
        </section>

        {/* ── Use Cases ────────────────────────────────────────────────────── */}
        <section id="use-cases" className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <FadeUp>
              <div className="text-center max-w-2xl mx-auto mb-14">
                <Badge className="mb-4 bg-blue-950/60 text-blue-400 border-blue-800/60">Use Cases</Badge>
                <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-white leading-tight">
                  Built for people who close deals
                </h2>
                <p className="text-slate-400 text-lg">Solo founder or team of 50 — KONEX scales with you.</p>
              </div>
            </FadeUp>
            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((uc, i) => (
                <FadeUp key={i} delay={i * 120}>
                  <div
                    className="rounded-xl p-6 transition-all duration-200 hover:-translate-y-1 h-full"
                    style={{ border: `1px solid ${uc.border.replace("border-", "").replace("/40", "")}` || "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
                    data-testid={`use-case-${i}`}
                  >
                    <div className={`h-10 w-10 rounded-lg ${uc.bg} flex items-center justify-center mb-5`}>
                      <uc.icon className={`h-5 w-5 ${uc.color}`} />
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{uc.title}</p>
                    <h3 className="text-lg font-bold mb-2 text-white leading-tight">{uc.headline}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-5">{uc.desc}</p>
                    <ul className="space-y-1.5">
                      {uc.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-center gap-2 text-sm text-slate-400">
                          <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── Card Showcase ─────────────────────────────────────────────────── */}
        <section
          className="py-24 px-4"
          style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 mb-16">
              <FadeUp className="flex-1 relative">
                <div
                  className="absolute inset-0 -z-10 scale-90"
                  style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)" }}
                />
                <img
                  src={cardThreeTiers}
                  alt="KONEX NFC Cards — Basic, Premium, Elite"
                  className="w-full max-w-lg mx-auto rounded-3xl"
                  style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.45)" }}
                  loading="lazy"
                  decoding="async"
                  data-testid="img-konex-card"
                />
              </FadeUp>
              <div className="flex-1 text-center md:text-left space-y-6">
                <FadeUp>
                  <Badge className="bg-blue-950/60 text-blue-400 border-blue-800/60">The Physical Card</Badge>
                </FadeUp>
                <FadeUp delay={80}>
                  <h2 className="text-3xl md:text-5xl font-display font-black text-white" data-testid="text-card-showcase-title">
                    One card. Every connection. Forever tracked.
                  </h2>
                </FadeUp>
                <FadeUp delay={140}>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    A premium NFC business card that shares your full digital profile in one tap. No app for the recipient. Always up to date — even after you change roles.
                  </p>
                </FadeUp>
                <FadeUp delay={200}>
                  <ul className="space-y-3">
                    {["Tap works on any modern iPhone or Android", "Update your profile anytime — card never needs replacing", "Tap, click, and lead data tracked automatically"].map((point, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-400">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </FadeUp>
                <FadeUp delay={260}>
                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                    <Link href="/auth?tab=register">
                      <Button
                        size="lg"
                        className="h-14 px-8 rounded-xl text-base font-bold text-white hover:-translate-y-0.5 transition-all"
                        style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: "0 6px 24px rgba(37,99,235,0.3)" }}
                        data-testid="button-create-free-profile"
                      >
                        Create Free Profile
                      </Button>
                    </Link>
                    <Link href="/konex-cards">
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-14 px-8 rounded-xl text-base font-semibold hover:-translate-y-0.5 transition-all"
                        style={{ borderColor: "rgba(255,255,255,0.1)", color: "#cbd5e1", background: "rgba(255,255,255,0.03)" }}
                        data-testid="button-get-your-card"
                      >
                        Explore Cards
                      </Button>
                    </Link>
                  </div>
                </FadeUp>
              </div>
            </div>

            {/* Card tier grid */}
            <FadeUp>
              <div className="text-center mb-10">
                <h3 className="text-2xl font-display font-bold text-white mb-2">Three tiers. One mission.</h3>
                <p className="text-slate-500 text-sm">Every tier captures leads, tracks taps, and connects to your dashboard.</p>
              </div>
            </FadeUp>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto items-end">
              {[
                { img: cardBasic, name: "Basic", price: "£19.99", desc: "Matte black. Clean & professional.", href: "/konex-cards/basic", popular: false },
                { img: cardPremium, name: "Premium", price: "£49.99", desc: "Brushed metal — Silver, Black or Copper.", href: "/konex-cards/premium", popular: true },
                { img: cardElite, name: "Elite", price: "£79.99", desc: "Carbon, Gold or Carbon-Gold edition.", href: "/konex-cards/elite", popular: false },
              ].map((card, i) => (
                <FadeUp key={i} delay={i * 100}>
                  <Link href={card.href}>
                    <div
                      className="group rounded-xl transition-all duration-200 cursor-pointer hover:-translate-y-1.5 overflow-hidden"
                      style={card.popular ? {
                        border: "1px solid rgba(59,130,246,0.5)",
                        transform: "scale(1.04)",
                        background: "rgba(15,22,46,0.8)",
                        boxShadow: "0 8px 32px rgba(37,99,235,0.2)",
                      } : {
                        border: "1px solid rgba(255,255,255,0.07)",
                        background: "rgba(255,255,255,0.025)",
                      }}
                      data-testid={`showcase-card-${card.name.toLowerCase()}`}
                    >
                      {card.popular && (
                        <div
                          className="text-white text-xs font-bold text-center py-1.5 tracking-wide"
                          style={{ background: "linear-gradient(90deg, #2563eb, #3b82f6)" }}
                        >
                          Most Popular
                        </div>
                      )}
                      <div className="p-4">
                        <img
                          src={card.img}
                          alt={`KONEX ${card.name}`}
                          className="w-full rounded-lg mb-4 group-hover:scale-[1.02] transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                          data-testid={`img-showcase-${card.name.toLowerCase()}`}
                        />
                        <h4 className="font-bold text-base text-white mb-0.5">{card.name}</h4>
                        <p className="text-xs text-slate-500 mb-3">{card.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-white">{card.price}</span>
                          <span
                            className="text-xs font-semibold rounded-md px-2 py-1 transition-colors"
                            style={{ color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)", background: "rgba(59,130,246,0.08)" }}
                          >
                            View →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── KONEX vs Paper ───────────────────────────────────────────────── */}
        <section className="py-24 px-4" data-testid="section-roi">
          <div className="max-w-4xl mx-auto">
            <FadeUp>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <Badge className="mb-4 bg-blue-950/60 text-blue-400 border-blue-800/60">Why KONEX</Badge>
                <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-white">KONEX vs Paper Cards</h2>
                <p className="text-slate-400 text-lg">
                  Paper cards cost more per lead and generate zero data. Every tap with KONEX is an insight.
                </p>
              </div>
            </FadeUp>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                { stat: "88%", label: "of paper cards discarded within a week", muted: true },
                { stat: "3×", label: "more leads captured per event", muted: false },
                { stat: "£0", label: "extra cost when you update your profile", muted: false },
              ].map((item, i) => (
                <FadeUp key={i} delay={i * 80}>
                  <div
                    className="rounded-xl p-8 text-center"
                    style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
                    data-testid={`roi-stat-${i}`}
                  >
                    <div className={`text-7xl md:text-8xl font-display font-black mb-3 leading-none tracking-tight ${item.muted ? "text-slate-600" : "text-white"}`}>
                      {item.stat}
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.label}</p>
                  </div>
                </FadeUp>
              ))}
            </div>

            {/* Comparison table */}
            <FadeUp>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="grid grid-cols-3" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="px-6 py-5 text-sm font-semibold text-slate-500">Feature</div>
                  <div className="px-6 py-5 text-sm font-bold text-blue-400 text-center">KONEX</div>
                  <div className="px-6 py-5 text-sm font-semibold text-slate-500 text-center">Paper Cards</div>
                </div>
                {comparisonRows.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3"
                    style={{ borderBottom: i < comparisonRows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: "rgba(255,255,255,0.015)" }}
                    data-testid={`comparison-row-${i}`}
                  >
                    <div className="px-6 py-5 text-base text-slate-300">{row.feature}</div>
                    <div className="px-6 py-5 flex justify-center items-center">
                      <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
                        <Check className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                    </div>
                    <div className="px-6 py-5 flex justify-center items-center">
                      {row.paper ? (
                        <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <X className="h-3.5 w-3.5 text-slate-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={100}>
              <div className="mt-16 text-center">
                <h3 className="text-2xl md:text-4xl font-display font-black mb-4 text-white leading-tight" data-testid="button-roi-cta">
                  Start capturing leads from your next interaction
                </h3>
                <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                  Set up your KONEX profile in minutes. No app. No friction.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link href="/auth?tab=register">
                    <Button
                      size="lg"
                      className="h-12 px-8 rounded-xl text-base font-semibold text-white transition-all hover:-translate-y-0.5"
                      style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: "0 6px 20px rgba(37,99,235,0.3)" }}
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
                      className="h-12 px-8 rounded-xl text-base font-semibold hover:-translate-y-0.5 transition-all"
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "#cbd5e1", background: "rgba(255,255,255,0.03)" }}
                      data-testid="button-roi-cards"
                    >
                      Browse NFC Cards
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────────────── */}
        <section
          id="testimonials"
          className="py-24 px-4"
          style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="max-w-7xl mx-auto">
            <FadeUp>
              <div className="text-center max-w-2xl mx-auto mb-14">
                <Badge className="mb-4 bg-blue-950/60 text-blue-400 border-blue-800/60">Testimonials</Badge>
                <h2 className="text-3xl md:text-5xl font-display font-black mb-4 text-white leading-tight">
                  Professionals trust KONEX to grow
                </h2>
                <p className="text-slate-500">Real results from sales teams, agents, and founders.</p>
              </div>
            </FadeUp>
            <div className="grid md:grid-cols-3 gap-6">
              {displayTestimonials.map((testimonial, i) => (
                <FadeUp key={i} delay={i * 100}>
                  <div
                    className="p-6 rounded-xl flex flex-col transition-all duration-200 hover:-translate-y-1 h-full"
                    style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
                    data-testid={`testimonial-card-${i}`}
                  >
                    <div className="flex items-center gap-1 mb-4" data-testid={`testimonial-rating-${i}`}>
                      {Array.from({ length: testimonial.rating }).map((_, s) => (
                        <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-300 text-base leading-relaxed mb-6 flex-1" data-testid={`testimonial-quote-${i}`}>
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm" data-testid={`testimonial-name-${i}`}>{testimonial.name}</p>
                        <p className="text-xs text-slate-500" data-testid={`testimonial-title-${i}`}>
                          {testimonial.title}{(testimonial as any).company ? ` · ${(testimonial as any).company}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="py-28 px-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <FadeUp>
          <div className="max-w-2xl mx-auto text-center relative">
            {/* Background glow */}
            <div
              className="absolute inset-0 -z-10"
              style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.1) 0%, transparent 70%)" }}
            />
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-blue-500 mb-5">Make the switch</p>
            <h2 className="text-3xl md:text-5xl font-display font-black text-white leading-tight mb-5">
              Upgrade the way you connect
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
              Over 27 million paper cards are printed every day. Most are thrown away within a week. Replace them with one tap.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
              <Link href="/konex-cards">
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-xl text-base font-semibold text-white transition-all hover:-translate-y-0.5 w-full sm:w-auto"
                  style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: "0 6px 24px rgba(37,99,235,0.35)" }}
                  data-testid="button-footer-nfc"
                >
                  <Nfc className="h-4 w-4 mr-2" /> Get Your NFC Card
                </Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 rounded-xl text-base font-semibold hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "#cbd5e1", background: "rgba(255,255,255,0.03)" }}
                  data-testid="button-footer-digital"
                >
                  <Smartphone className="h-4 w-4 mr-2" /> Create Free Profile
                </Button>
              </Link>
            </div>
            <p className="text-xs text-slate-600">Works with iPhone &amp; Android — no app required for the recipient.</p>
          </div>
        </FadeUp>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="py-6 text-center text-sm"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}
      >
        <p className="mb-2 text-slate-500">&copy; {new Date().getFullYear()} KONEX. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-slate-600">
          <Link href="/terms" className="hover:text-slate-400 transition-colors" data-testid="link-landing-footer-terms">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-slate-400 transition-colors" data-testid="link-landing-footer-privacy">Privacy Policy</Link>
          <Link href="/refund-policy" className="hover:text-slate-400 transition-colors" data-testid="link-landing-footer-refund">Refund &amp; Return Policy</Link>
        </div>
      </footer>
    </div>
  );
}
