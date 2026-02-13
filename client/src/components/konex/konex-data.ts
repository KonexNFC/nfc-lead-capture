import {
  Nfc,
  Smartphone,
  RefreshCw,
  Leaf,
  UserCheck,
  Sparkles,
  Crown,
  Gem,
  Shield,
  BarChart3,
  Globe,
  Headphones,
  CreditCard,
  Paintbrush,
} from "lucide-react";

export type KonexTierId = "basic" | "premium" | "elite";

export type KonexTier = {
  id: KonexTierId;
  name: string;
  tagline: string;
  shortDescription: string;
  benefits: string[];
  ctaLabel: string;
  ctaHref: string;
  icon: typeof Sparkles;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
};

export const konexTiers: KonexTier[] = [
  {
    id: "basic",
    name: "KONEX Basic",
    tagline: "Simple. Smart. Always connected.",
    shortDescription: "Clean, everyday digital business card.",
    benefits: ["One-tap sharing", "Matte finish", "No app required", "Custom profile link", "Lead capture"],
    ctaLabel: "Order KONEX Basic",
    ctaHref: "/konex-cards/basic",
    icon: Sparkles,
    accent: "text-primary",
    gradientFrom: "from-primary/20",
    gradientTo: "to-primary/5",
  },
  {
    id: "premium",
    name: "KONEX Premium",
    tagline: "Elevated presence. Premium impression.",
    shortDescription: "Premium metal and matte finishes.",
    benefits: ["Brushed metal finish", "Micro-logo engraving", "Ultra-slim feel", "Priority support", "Advanced analytics"],
    ctaLabel: "Upgrade to Premium",
    ctaHref: "/konex-cards/premium",
    icon: Crown,
    accent: "text-accent",
    gradientFrom: "from-accent/20",
    gradientTo: "to-accent/5",
  },
  {
    id: "elite",
    name: "KONEX Elite",
    tagline: "For those who move differently.",
    shortDescription: "Ultra-premium status card.",
    benefits: ["Luxury finishes", "Discreet branding", "Executive-grade NFC", "White-glove onboarding", "Custom domain support"],
    ctaLabel: "Access Elite",
    ctaHref: "/konex-cards/elite",
    icon: Gem,
    accent: "text-purple-400",
    gradientFrom: "from-purple-500/20",
    gradientTo: "to-purple-500/5",
  },
];

export const benefits = [
  { icon: Nfc, text: "One-tap instant contact sharing" },
  { icon: Smartphone, text: "Works on iPhone & Android" },
  { icon: UserCheck, text: "No app required for recipients" },
  { icon: RefreshCw, text: "Update your profile anytime" },
  { icon: Leaf, text: "Eco-friendly alternative to paper cards" },
];

export const comparisonSnapshot = [
  {
    id: "basic" as const,
    name: "Basic",
    bullets: ["NFC tap sharing", "Matte finish", "Lead capture"],
    href: "/konex-cards/basic",
    accent: "text-primary",
    icon: Sparkles,
  },
  {
    id: "premium" as const,
    name: "Premium",
    bullets: ["Brushed metal finish", "Logo engraving", "Advanced analytics"],
    href: "/konex-cards/premium",
    accent: "text-accent",
    icon: Crown,
  },
  {
    id: "elite" as const,
    name: "Elite",
    bullets: ["Luxury finishes", "Custom domain", "White-glove onboarding"],
    href: "/konex-cards/elite",
    accent: "text-purple-400",
    icon: Gem,
  },
];

export interface TierDetail {
  id: KonexTierId;
  name: string;
  tagline: string;
  heroDescription: string;
  icon: typeof Sparkles;
  accent: string;
  accentBg: string;
  gradientFrom: string;
  gradientTo: string;
  features: { icon: typeof Nfc; title: string; description: string }[];
  specs: string[];
}

export const tierDetails: Record<string, TierDetail> = {
  basic: {
    id: "basic",
    name: "KONEX Basic",
    tagline: "Simple. Smart. Always connected.",
    heroDescription:
      "The KONEX Basic is your entry into modern networking. A clean, professional NFC card that lets you share your digital profile with a single tap. No frills, just results.",
    icon: Sparkles,
    accent: "text-primary",
    accentBg: "bg-primary/10",
    gradientFrom: "from-primary/15",
    gradientTo: "to-primary/5",
    features: [
      { icon: Nfc, title: "One-tap NFC sharing", description: "Instantly share your profile by tapping your card on any modern smartphone." },
      { icon: UserCheck, title: "No app required", description: "Recipients don't need to download anything. Your profile opens in their browser." },
      { icon: CreditCard, title: "Matte finish", description: "Clean, professional matte finish that makes a great first impression." },
      { icon: RefreshCw, title: "Update anytime", description: "Change your profile info, links, and photos whenever you want. The card stays the same." },
      { icon: Smartphone, title: "iPhone & Android", description: "Works seamlessly with both iPhone and Android devices." },
      { icon: Leaf, title: "Eco-friendly", description: "Replace hundreds of paper business cards with one reusable NFC card." },
    ],
    specs: ["PVC matte finish", "NFC Type A chip", "Standard credit card size", "Custom profile link", "Lead capture form", "QR code backup"],
  },
  premium: {
    id: "premium",
    name: "KONEX Premium",
    tagline: "Elevated presence. Premium impression.",
    heroDescription:
      "The KONEX Premium is for professionals who want to stand out. Brushed metal finish, micro-logo engraving, and advanced features that elevate every interaction.",
    icon: Crown,
    accent: "text-accent",
    accentBg: "bg-accent/10",
    gradientFrom: "from-accent/15",
    gradientTo: "to-accent/5",
    features: [
      { icon: Shield, title: "Brushed metal finish", description: "Premium brushed metal construction that commands attention and feels substantial." },
      { icon: Paintbrush, title: "Micro-logo engraving", description: "Your logo or initials laser-engraved on the card for a personal touch." },
      { icon: CreditCard, title: "Ultra-slim feel", description: "Thinner than a credit card yet incredibly durable. Fits perfectly in any wallet." },
      { icon: BarChart3, title: "Advanced analytics", description: "Track profile views, lead conversions, and engagement metrics in your dashboard." },
      { icon: Headphones, title: "Priority support", description: "Direct access to our support team with faster response times." },
      { icon: RefreshCw, title: "Unlimited updates", description: "Change your profile as often as you like. Your card is always current." },
    ],
    specs: ["Brushed metal finish", "NFC Type A chip", "Laser-engraved logo", "Ultra-slim profile", "Advanced analytics dashboard", "Priority support channel"],
  },
  elite: {
    id: "elite",
    name: "KONEX Elite",
    tagline: "For those who move differently.",
    heroDescription:
      "The KONEX Elite is the ultimate networking statement. Luxury finishes, white-glove onboarding, and exclusive features for executives and founders who demand the best.",
    icon: Gem,
    accent: "text-purple-400",
    accentBg: "bg-purple-500/10",
    gradientFrom: "from-purple-500/15",
    gradientTo: "to-purple-500/5",
    features: [
      { icon: Gem, title: "Luxury finishes", description: "Choose from premium materials including brushed gold, matte black, and carbon fiber." },
      { icon: Shield, title: "Discreet branding", description: "Subtle, elegant branding that speaks volumes without saying too much." },
      { icon: Globe, title: "Custom domain support", description: "Use your own domain for your profile link. Full brand control." },
      { icon: Headphones, title: "White-glove onboarding", description: "Personal setup assistance to ensure your profile is perfect from day one." },
      { icon: BarChart3, title: "Executive analytics", description: "Comprehensive analytics with export capabilities and team management features." },
      { icon: Crown, title: "Executive-grade NFC", description: "Extended range NFC chip for faster, more reliable connections every time." },
    ],
    specs: ["Luxury material options", "Extended-range NFC chip", "Custom domain support", "White-glove onboarding", "Executive analytics suite", "Dedicated account manager"],
  },
};
