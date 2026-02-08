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
    <section id="why-konex" className="py-24 bg-background border-b border-border/50" data-testid="feature-sections">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Why KONEX?</h2>
          <p className="text-muted-foreground text-lg">Everything your paper card can't do.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
          {features.map((feature, i) => (
            <div
              key={i}
              className="flex items-start gap-4"
              data-testid={`feature-item-${i}`}
            >
              <div className="flex-shrink-0 h-11 w-11 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <feature.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold leading-snug mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
