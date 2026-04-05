import { Button } from "@/components/ui/button";
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  ExternalLink,
  CalendarDays,
  Star,
  FileText,
  LayoutGrid,
  Link2,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import type { Profile, ProfileModules, ProfileBranding, ProfileTextOverrides, ProfileTile, ProfileReview } from "@shared/schema";

interface ProfileModulesRendererProps {
  profile: Profile;
  brandColor?: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function ensureUrl(url: string): string {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

const reviewPlatformLabels: Record<string, string> = {
  google: "Google Reviews",
  trustpilot: "Trustpilot",
  tripadvisor: "TripAdvisor",
  yelp: "Yelp",
  other: "Leave a Review",
};

const tileIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  menu: LayoutGrid,
  link: Link2,
  custom: ExternalLink,
};

const DEFAULT_MODULE_ORDER = ["smart-actions", "tiles", "video", "booking", "reviews"];

function SmartActionsModule({ links, modules }: { links: Record<string, string>; modules: ProfileModules }) {
  const smsNumber = links.sms || links.phone;
  const hasSmartActions = links.phone || links.whatsapp || smsNumber || links.email || modules.address;
  if (!hasSmartActions) return null;

  return (
    <div className="space-y-2" data-testid="module-smart-actions">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {links.phone && (
          <Button variant="outline" className="justify-start gap-2" asChild data-testid="action-call">
            <a href={`tel:${links.phone}`}>
              <Phone className="h-4 w-4" />
              Call
            </a>
          </Button>
        )}
        {smsNumber && (
          <Button variant="outline" className="justify-start gap-2" asChild data-testid="action-sms">
            <a href={`sms:${smsNumber}`}>
              <MessageSquare className="h-4 w-4" />
              Text
            </a>
          </Button>
        )}
        {links.whatsapp && (
          <Button variant="outline" className="justify-start gap-2" asChild data-testid="action-whatsapp">
            <a href={`https://wa.me/${links.whatsapp.replace(/[^0-9+]/g, "")}`} target="_blank" rel="noopener noreferrer">
              <SiWhatsapp className="h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        )}
        {links.email && (
          <Button variant="outline" className="justify-start gap-2" asChild data-testid="action-email">
            <a href={`mailto:${links.email}`}>
              <Mail className="h-4 w-4" />
              Email
            </a>
          </Button>
        )}
        {modules.address && (
          <Button variant="outline" className="justify-start gap-2 col-span-2" asChild data-testid="action-directions">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(modules.address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin className="h-4 w-4" />
              Directions
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

function TilesModule({ modules }: { modules: ProfileModules }) {
  if (!modules.tiles || modules.tiles.length === 0) return null;

  return (
    <div className="space-y-2" data-testid="module-tiles">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
        Links & Resources
      </h3>
      <div className="space-y-2">
        {modules.tiles.map((tile) => {
          if (!tile.url) return null;
          const TileIcon = tileIcons[tile.type] || ExternalLink;
          return (
            <a
              key={tile.id}
              href={ensureUrl(tile.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-md border border-border/50 bg-background hover-elevate transition-colors"
              data-testid={`tile-${tile.id}`}
            >
              <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <TileIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{tile.title || "Untitled"}</p>
                {tile.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{tile.subtitle}</p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

function VideoModule({ modules }: { modules: ProfileModules }) {
  const hasUpload = !!modules.videoObjectPath;
  const hasYoutube = !!modules.videoUrl;
  if (!hasUpload && !hasYoutube) return null;

  if (hasUpload) {
    const src = modules.videoObjectPath!.startsWith("http") || modules.videoObjectPath!.startsWith("/")
      ? modules.videoObjectPath!
      : `/objects/${modules.videoObjectPath}`;
    return (
      <div className="space-y-2" data-testid="module-video">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
          Video
        </h3>
        <video
          src={src}
          controls
          playsInline
          className="w-full rounded-md border border-border/50"
          data-testid="video-uploaded"
        />
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(modules.videoUrl!);
  if (!embedUrl) return null;

  return (
    <div className="space-y-2" data-testid="module-video">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
        Video
      </h3>
      <div className="relative w-full rounded-md overflow-hidden border border-border/50" style={{ paddingTop: "56.25%" }}>
        <iframe
          src={embedUrl}
          title="Brand Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          data-testid="video-embed"
        />
      </div>
    </div>
  );
}

function BookingModule({ modules, brandColor }: { modules: ProfileModules; brandColor?: string }) {
  if (!modules.bookingUrl) return null;

  return (
    <div className="space-y-2" data-testid="module-booking">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
        Booking
      </h3>
      <Button
        className="w-full gap-2"
        style={brandColor ? { backgroundColor: brandColor, color: "#fff", borderColor: brandColor } : undefined}
        asChild
        data-testid="button-booking"
      >
        <a href={ensureUrl(modules.bookingUrl)} target="_blank" rel="noopener noreferrer">
          <CalendarDays className="h-4 w-4" />
          {modules.bookingLabel || "Book a Meeting"}
        </a>
      </Button>
    </div>
  );
}

function ReviewsModule({ modules }: { modules: ProfileModules }) {
  if (!modules.reviews || modules.reviews.length === 0) return null;

  return (
    <div className="space-y-2" data-testid="module-reviews">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
        Reviews
      </h3>
      <div className="space-y-2">
        {modules.reviews.map((review) => {
          if (!review.url) return null;
          return (
            <Button
              key={review.id}
              variant="outline"
              className="w-full justify-start gap-2"
              asChild
              data-testid={`review-${review.id}`}
            >
              <a href={ensureUrl(review.url)} target="_blank" rel="noopener noreferrer">
                <Star className="h-4 w-4 text-yellow-500" />
                {review.label || reviewPlatformLabels[review.platform] || "Leave a Review"}
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

const moduleComponents: Record<string, (props: { links: Record<string, string>; modules: ProfileModules; brandColor?: string }) => JSX.Element | null> = {
  "smart-actions": ({ links, modules }) => <SmartActionsModule links={links} modules={modules} />,
  "tiles": ({ modules }) => <TilesModule modules={modules} />,
  "video": ({ modules }) => <VideoModule modules={modules} />,
  "booking": ({ modules, brandColor }) => <BookingModule modules={modules} brandColor={brandColor} />,
  "reviews": ({ modules }) => <ReviewsModule modules={modules} />,
};

export function ProfileModulesRenderer({ profile, brandColor }: ProfileModulesRendererProps) {
  const links = (profile.links || {}) as Record<string, string>;
  const modules = (profile.modules as ProfileModules) || {};
  const enabled = modules.enabled || {};
  const order = modules.order && modules.order.length > 0 ? modules.order : DEFAULT_MODULE_ORDER;

  const orderedModules = order.filter((key) => {
    if (enabled[key] === false) return false;
    // Smart Actions defaults to OFF — only show if explicitly enabled
    if (key === "smart-actions" && enabled[key] !== true) return false;
    return true;
  });

  return (
    <div className="w-full max-w-md mx-auto mt-6 space-y-4" data-testid="profile-modules">
      {orderedModules.map((key) => {
        const renderFn = moduleComponents[key];
        if (!renderFn) return null;
        return <div key={key}>{renderFn({ links, modules, brandColor })}</div>;
      })}
    </div>
  );
}
