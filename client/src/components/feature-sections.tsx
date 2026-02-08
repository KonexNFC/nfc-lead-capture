import {
  Pencil,
  Palette,
  Languages,
  LayoutGrid,
  Play,
  Zap,
  Share2,
  Link2,
  CalendarDays,
  UserPlus,
  Star,
  SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  copy: string;
}

const features: Feature[] = [
  {
    icon: Pencil,
    title: "Dynamic, Edit-Anytime Profile",
    copy: "Change phone, email, role, links, photos, and copy in seconds \u2014 no reprints, ever.",
  },
  {
    icon: Palette,
    title: "Your Design",
    copy: "Choose your fonts, background colours, floating background design and more.",
  },
  {
    icon: Languages,
    title: "Add Your Language",
    copy: "All text & tabs can be customised. If your first language isn\u2019t English, no problem \u2014 personalise how you connect.",
  },
  {
    icon: LayoutGrid,
    title: "Custom Tiles",
    copy: "Add your own artwork & links to custom icons. Share PDFs, weblinks, menus, and more.",
  },
  {
    icon: Play,
    title: "Brand Videos",
    copy: "Embed your brand video from YouTube to personalise your landing page.",
  },
  {
    icon: Zap,
    title: "Smart Actions",
    copy: "Buttons that actually do things: call, SMS, WhatsApp with prefilled text, email compose, or open maps to your address.",
  },
  {
    icon: Share2,
    title: "Social Hub",
    copy: "All your channels in one place (LinkedIn, Instagram, TikTok, YouTube, X, Facebook). Followers go up; chasing links goes down.",
  },
  {
    icon: Link2,
    title: "Links, Files & Media",
    copy: "Add websites, landing pages, PDFs (price lists, brochures) and videos (intro, showreel, product demo).",
  },
  {
    icon: CalendarDays,
    title: "Booking & Calendar",
    copy: "Deep-link to Calendly, Google/Outlook calendars, or your booking app so meetings get scheduled on the spot.",
  },
  {
    icon: UserPlus,
    title: "Lead Generation",
    copy: "Generate leads in seconds with our Exchange Contact button.",
  },
  {
    icon: Star,
    title: "Reviews & Reputation",
    copy: "One-tap routes to Google Reviews / Trustpilot / TripAdvisor. Ask while the moment is hot.",
  },
  {
    icon: SlidersHorizontal,
    title: "Branding Controls",
    copy: "Fonts, colours, logos, hero image/video \u2014 make it unmistakably your brand.",
  },
];

export function FeatureSections() {
  return (
    <div className="w-full max-w-md mx-auto mt-10 mb-8" data-testid="feature-sections">
      <div className="rounded-md bg-zinc-950 text-white overflow-hidden">
        <div className="px-5 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white/90">Why KONEX?</h3>
          <p className="text-sm text-white/50 mt-1">Everything your paper card can't do.</p>
        </div>

        <div className="divide-y divide-white/10">
          {features.map((feature, i) => (
            <div
              key={i}
              className="flex items-start gap-4 px-5 py-4"
              data-testid={`feature-item-${i}`}
            >
              <div className="flex-shrink-0 mt-0.5 h-9 w-9 rounded-md bg-white/10 flex items-center justify-center">
                <feature.icon className="h-4.5 w-4.5 text-white/80" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white/90 leading-snug">{feature.title}</h4>
                <p className="text-sm text-white/50 leading-relaxed mt-1">{feature.copy}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 text-center">
          <p className="text-xs text-white/30">Powered by KONEX</p>
        </div>
      </div>
    </div>
  );
}
