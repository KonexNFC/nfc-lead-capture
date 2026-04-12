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

import cardBasicImg      from "@assets/Konex_Basic_Card_1776031961806.png";
import cardPremiumSilver from "@assets/Konex_Premium_Card_1776031961806.png";
import cardPremiumBlack  from "@assets/Konex_Premium_Black_Card_1776031961806.png";
import cardPremiumCopper from "@assets/Konex_Premium_Card_Cooper_1776031961807.png";
import cardEliteCarbon   from "@assets/Konex_Elite_Card_1776031961806.png";
import cardEliteGold     from "@assets/Konex_Elite_Gold_Card_1776031961805.png";
import cardEliteCarbonGold from "@assets/ChatGPT_Image_Apr_12,_2026,_11_10_59_PM_1776031961801.png";

export type KonexTierId = "basic" | "premium" | "elite";

export interface CardVariant {
  label: string;
  image: string;
  swatch: string;
  sku: string;
}

export interface TierDetail {
  id: KonexTierId;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  heroDescription: string;
  icon: typeof Sparkles;
  image: string;
  variants: CardVariant[];
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
    price: "£19.99",
    priceNote: "One-time purchase",
    heroDescription:
      "The KONEX Basic is your entry into modern networking. A clean, professional NFC card that lets you share your digital profile with a single tap. No frills, just results.",
    icon: Sparkles,
    image: cardBasicImg,
    variants: [
      { label: "Matte Black", image: cardBasicImg, swatch: "#1a1a1a", sku: "KONEX-BASIC" },
    ],
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
    price: "£49.99",
    priceNote: "One-time purchase",
    heroDescription:
      "The KONEX Premium is for professionals who want to stand out. Choose from three stunning metal finishes — silver, stealth black, or copper — each with micro-logo engraving and advanced analytics.",
    icon: Crown,
    image: cardPremiumSilver,
    variants: [
      { label: "Silver",  image: cardPremiumSilver, swatch: "#C0C0C0", sku: "KONEX-PREMIUM" },
      { label: "Black",   image: cardPremiumBlack,  swatch: "#1a1a1a", sku: "KONEX-PREMIUM-BLACK" },
      { label: "Copper",  image: cardPremiumCopper, swatch: "#B87333", sku: "KONEX-PREMIUM-COPPER" },
    ],
    accent: "text-accent",
    accentBg: "bg-accent/10",
    gradientFrom: "from-accent/15",
    gradientTo: "to-accent/5",
    features: [
      { icon: Shield, title: "Brushed metal finish", description: "Premium brushed metal construction in silver, black, or copper — choose what suits your style." },
      { icon: Paintbrush, title: "Micro-logo engraving", description: "Your logo or initials laser-engraved on the card for a personal touch." },
      { icon: CreditCard, title: "Ultra-slim feel", description: "Thinner than a credit card yet incredibly durable. Fits perfectly in any wallet." },
      { icon: BarChart3, title: "Advanced analytics", description: "Track profile views, lead conversions, and engagement metrics in your dashboard." },
      { icon: Headphones, title: "Priority support", description: "Direct access to our support team with faster response times." },
      { icon: RefreshCw, title: "Unlimited updates", description: "Change your profile as often as you like. Your card is always current." },
    ],
    specs: ["Brushed metal finish (3 colours)", "NFC Type A chip", "Laser-engraved logo", "Ultra-slim profile", "Advanced analytics dashboard", "Priority support channel"],
  },

  elite: {
    id: "elite",
    name: "KONEX Elite",
    tagline: "For those who move differently.",
    price: "£79.99",
    priceNote: "One-time purchase",
    heroDescription:
      "The KONEX Elite is the ultimate networking statement. Choose carbon fibre, brushed gold, or the exclusive carbon-gold edition. White-glove onboarding and executive features included.",
    icon: Gem,
    image: cardEliteCarbon,
    variants: [
      { label: "Carbon",       image: cardEliteCarbon,     swatch: "#2a2a2a", sku: "KONEX-ELITE" },
      { label: "Gold",         image: cardEliteGold,       swatch: "#D4AF37", sku: "KONEX-ELITE-GOLD" },
      { label: "Carbon Gold",  image: cardEliteCarbonGold, swatch: "#8B6914", sku: "KONEX-ELITE-CARBON-GOLD" },
    ],
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10",
    gradientFrom: "from-amber-500/15",
    gradientTo: "to-amber-500/5",
    features: [
      { icon: Gem, title: "Luxury finishes", description: "Carbon fibre with gold border, brushed gold metal, or the exclusive carbon-gold edition." },
      { icon: Shield, title: "Discreet branding", description: "Subtle, elegant branding that speaks volumes without saying too much." },
      { icon: Globe, title: "Custom domain support", description: "Use your own domain for your profile link. Full brand control." },
      { icon: Headphones, title: "White-glove onboarding", description: "Personal setup assistance to ensure your profile is perfect from day one." },
      { icon: BarChart3, title: "Executive analytics", description: "Comprehensive analytics with export capabilities and team management features." },
      { icon: Crown, title: "Executive-grade NFC", description: "Extended range NFC chip for faster, more reliable connections every time." },
    ],
    specs: ["3 luxury finish options", "Extended-range NFC chip", "Custom domain support", "White-glove onboarding", "Executive analytics suite", "Dedicated account manager"],
  },
};

export { cardBasicImg, cardPremiumSilver, cardEliteCarbon };
