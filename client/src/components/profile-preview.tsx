import {
  Briefcase,
  Mail,
  Link as LinkIcon,
  Globe,
  Phone,
  MessageSquare,
} from "lucide-react";
import {
  SiLinkedin,
  SiX,
  SiInstagram,
  SiFacebook,
  SiTiktok,
  SiYoutube,
  SiSnapchat,
  SiGithub,
  SiWhatsapp,
  SiTelegram,
} from "react-icons/si";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { downloadVCard, type VCardData } from "@/lib/vcard";
import { socialHandleToUrl } from "@/lib/social-utils";
import {
  resolveCustomizations,
  avatarShapeRadius,
  fontFamilyFromStyle,
  cardRadiusPx,
  getTheme,
  type ThemeCustomizations,
  type LayoutVariant,
  type AvatarShape,
  type IconStyle,
  type SectionDivider,
  type ButtonStyle,
  type CardRadius,
  type FontStyle,
} from "@/lib/themes";
import type { Profile, ProfileBranding } from "@shared/schema";

interface ProfilePreviewProps {
  profile: Profile;
  mock?: boolean;
  onSaveContact?: () => void;
  extraActions?: React.ReactNode;
  layoutVariant?: LayoutVariant;
  headerStyle?: "left-aligned" | "banner" | "centered";
  socialLayout?: "icons" | "tiles";
  themeCustomizations?: ThemeCustomizations;
  themeId?: string;
}

function resolveAvatarSrc(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("/objects/")) return url;
  return `/objects/${url}`;
}

const SOCIAL_CONFIG: Record<string, {
  icon: any;
  color: string;
  label: string;
  gradient?: string;
  textColor?: string;
}> = {
  linkedin:  { icon: SiLinkedin,  color: "#0A66C2", label: "LinkedIn"  },
  x:         { icon: SiX,         color: "#1D9BF0", label: "X"         },
  twitter:   { icon: SiX,         color: "#1D9BF0", label: "X"         },
  instagram: {
    icon: SiInstagram,
    color: "#E4405F",
    label: "Instagram",
    gradient: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
  },
  facebook:  { icon: SiFacebook,  color: "#1877F2", label: "Facebook"  },
  whatsapp:  { icon: SiWhatsapp,  color: "#25D366", label: "WhatsApp"  },
  telegram:  { icon: SiTelegram,  color: "#2CA5E0", label: "Telegram"  },
  tiktok:    { icon: SiTiktok,    color: "#010101", label: "TikTok"    },
  youtube:   { icon: SiYoutube,   color: "#FF0000", label: "YouTube"   },
  snapchat:  { icon: SiSnapchat,  color: "#FFFC00", label: "Snapchat", textColor: "#000000" },
  github:    { icon: SiGithub,    color: "#181717", label: "GitHub"    },
  website:   { icon: Globe,       color: "#6366F1", label: "Website"   },
};

/** Brand colors for each contact action */
const CONTACT_CONFIG: Record<string, { icon: any; bg: string; label: string }> = {
  phone:    { icon: Phone,         bg: "#25D366", label: "Call"     },
  sms:      { icon: MessageSquare, bg: "#007AFF", label: "Text"     },
  whatsapp: { icon: SiWhatsapp,    bg: "#25D366", label: "WhatsApp" },
  email:    { icon: Mail,          bg: "#0088CC", label: "Email"    },
};

// ─── Derived style helpers ─────────────────────────────────────────────────

function getButtonStyle(buttonStyle: ButtonStyle, cardRadius: CardRadius, accent: string): React.CSSProperties {
  const radius = buttonStyle === "pill"
    ? "999px"
    : cardRadius === "sharp" ? "4px"
    : cardRadius === "soft" ? "8px"
    : "12px";
  if (buttonStyle === "outline") {
    return { backgroundColor: "transparent", color: accent, border: `2px solid ${accent}`, borderRadius: radius };
  }
  return { backgroundColor: accent, color: "#fff", border: "none", borderRadius: radius };
}

function SectionDividerEl({ type, accent }: { type: SectionDivider; accent: string }) {
  if (type === "none") return null;
  if (type === "gradient") {
    return (
      <div style={{
        height: 1,
        margin: "4px 0",
        background: `linear-gradient(90deg, transparent 0%, ${accent}80 50%, transparent 100%)`,
      }} />
    );
  }
  return <div className="border-t border-border/30 my-2" />;
}

function ContactIconWrap({
  iconStyle,
  accent,
  bg,
  children,
  size = "md",
  borderRadius = "50%",
}: {
  iconStyle: IconStyle;
  accent: string;
  bg: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  borderRadius?: string;
}) {
  const dim = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-14 w-14" : "h-12 w-12";
  if (iconStyle === "outline") {
    return (
      <div
        className={`${dim} flex items-center justify-center transition-all group-hover:opacity-80`}
        style={{ border: `2px solid ${bg}`, color: bg, backgroundColor: "transparent", borderRadius }}
      >
        {children}
      </div>
    );
  }
  if (iconStyle === "ghost") {
    return (
      <div
        className={`${dim} flex items-center justify-center transition-all group-hover:opacity-80`}
        style={{ backgroundColor: `${bg}22`, color: bg, borderRadius }}
      >
        {children}
      </div>
    );
  }
  // solid — always white icon on brand-colored rounded square
  return (
    <div
      className={`${dim} flex items-center justify-center transition-all group-hover:opacity-90`}
      style={{ backgroundColor: bg, color: "#fff", borderRadius }}
    >
      {children}
    </div>
  );
}

/** Renders a social icon tile with gradient or solid brand background */
function SocialIconTile({
  config,
  borderRadius,
  size = "md",
}: {
  config: { icon: any; color: string; gradient?: string; textColor?: string };
  borderRadius: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = config.icon;
  const dim = size === "sm" ? "h-10 w-10" : size === "lg" ? "h-14 w-14" : "h-12 w-12";
  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  return (
    <div
      className={`${dim} flex items-center justify-center group-hover:brightness-110 group-hover:-translate-y-0.5 transition-all`}
      style={{
        background: config.gradient || config.color,
        color: config.textColor || "#fff",
        borderRadius,
      }}
    >
      <Icon className={iconSize} />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function ProfilePreview({
  profile,
  mock,
  extraActions,
  layoutVariant,
  themeCustomizations,
  themeId,
}: ProfilePreviewProps) {
  const branding = (profile.branding as ProfileBranding) || {};
  const coverSrc = branding.coverUrl
    ? branding.coverUrl.startsWith("http") || branding.coverUrl.startsWith("/objects/")
      ? branding.coverUrl
      : `/objects/${branding.coverUrl}`
    : null;

  const links = (profile.links as Record<string, string>) || {};
  const contactKeys = new Set(["phone", "whatsapp", "sms", "email"]);
  const socialLinks = Object.entries(links).filter(([key, val]) => !contactKeys.has(key) && val);

  // Resolve the current theme for this profile
  const effectiveThemeId = themeId || branding.selectedThemeId;
  const theme = getTheme(effectiveThemeId);
  const c = resolveCustomizations(theme, themeCustomizations ?? null);

  const variant: LayoutVariant = layoutVariant ?? c.layoutVariant ?? "social";
  const accent = c.accentColor || theme.tokens["--theme-accent"];
  const avatarRadius = avatarShapeRadius(c.avatarShape);
  const buttonSty = getButtonStyle(c.buttonStyle, c.cardRadius, accent);
  const headingFont = fontFamilyFromStyle(c.fontStyle);
  const crPx = cardRadiusPx(c.cardRadius);

  const saveContact = () => {
    const vcardData: VCardData = {
      name: profile.name,
      title: profile.title || undefined,
      company: profile.company || undefined,
      phone: links.phone,
      whatsapp: links.whatsapp,
      email: links.email,
      website: links.website,
      photoUrl: profile.photoUrl || undefined,
    };
    downloadVCard(vcardData);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CORPORATE — compact, structured, professional
  // ─────────────────────────────────────────────────────────────────────────
  if (variant === "corporate") {
    return (
      <div className="w-full max-w-sm mx-auto">
        <Card
          className={`relative overflow-hidden bg-background border border-border/60 shadow-sm min-h-[520px] flex flex-col ${mock ? "scale-90 opacity-90" : ""}`}
          style={{ borderRadius: crPx }}
        >
          {/* Accent strip at top */}
          <div style={{ height: 3, backgroundColor: accent, borderRadius: `${crPx} ${crPx} 0 0` }} />

          {/* Compact header row */}
          <div className="px-5 pt-4 pb-4 flex items-center gap-3.5 border-b border-border/40">
            <Avatar
              className="h-14 w-14 shrink-0"
              style={{ borderRadius: avatarRadius, overflow: "hidden", border: `2px solid ${accent}30` }}
            >
              <AvatarImage src={resolveAvatarSrc(profile.photoUrl)} alt={profile.name} className="object-cover" style={{ borderRadius: avatarRadius }} />
              <AvatarFallback className="text-base font-bold" style={{ borderRadius: avatarRadius, backgroundColor: `${accent}18`, color: accent }}>
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-foreground leading-tight truncate" style={{ fontFamily: headingFont }}>
                {profile.name}
              </h2>
              {profile.title && (
                <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                  <Briefcase className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{profile.title}</span>
                </div>
              )}
              {profile.company && (
                <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: accent }}>{profile.company}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-5 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
            {profile.bio && (
              <p className="text-xs text-muted-foreground leading-relaxed pt-3 pb-1 text-left">{profile.bio}</p>
            )}

            <SectionDividerEl type={c.sectionDivider} accent={accent} />

            {/* Contact — small circles */}
            {(links.phone || links.whatsapp || links.sms || links.email) && (
              <div className="flex items-center gap-3 py-2">
                {links.phone && (
                  <a href={`tel:${links.phone}`} className="flex flex-col items-center gap-1 group">
                    <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#25D366" size="sm" borderRadius={crPx}>
                      <Phone className="h-4 w-4" />
                    </ContactIconWrap>
                    <span className="text-[9px] text-muted-foreground">Call</span>
                  </a>
                )}
                {(links.sms || links.phone) && (
                  <a href={`sms:${links.sms || links.phone}`} className="flex flex-col items-center gap-1 group">
                    <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#0088CC" size="sm" borderRadius={crPx}>
                      <MessageSquare className="h-4 w-4" />
                    </ContactIconWrap>
                    <span className="text-[9px] text-muted-foreground">Text</span>
                  </a>
                )}
                {links.whatsapp && (
                  <a href={`https://wa.me/${links.whatsapp.replace(/[^0-9+]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
                    <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#25D366" size="sm" borderRadius={crPx}>
                      <SiWhatsapp className="h-4 w-4" />
                    </ContactIconWrap>
                    <span className="text-[9px] text-muted-foreground">WA</span>
                  </a>
                )}
                {links.email && (
                  <a href={`mailto:${links.email}`} className="flex flex-col items-center gap-1 group">
                    <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#0088CC" size="sm" borderRadius={crPx}>
                      <Mail className="h-4 w-4" />
                    </ContactIconWrap>
                    <span className="text-[9px] text-muted-foreground">Email</span>
                  </a>
                )}
              </div>
            )}

            <SectionDividerEl type={c.sectionDivider} accent={accent} />

            {/* Social grid — tight */}
            {socialLinks.length > 0 && (
              <div className="grid grid-cols-4 gap-2 py-2">
                {socialLinks.map(([key, value]) => {
                  const config = SOCIAL_CONFIG[key] || { icon: LinkIcon, color: "#6B7280", label: key };
                  return (
                    <a key={key} href={socialHandleToUrl(key, value)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
                      <SocialIconTile config={config} borderRadius={crPx} size="sm" />
                      <span className="text-[8px] uppercase tracking-wide font-semibold text-muted-foreground">{config.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="px-5 pb-4 pt-2 mt-auto">
            <div className={extraActions ? "grid grid-cols-2 gap-2" : ""}>
              <button
                className="w-full h-10 text-xs font-semibold tracking-wide transition-opacity hover:opacity-90"
                style={buttonSty}
                onClick={saveContact}
                data-testid="button-save-contact"
              >
                Save Contact
              </button>
              {extraActions}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LUXURY — cinematic, premium, dramatic spacing
  // ─────────────────────────────────────────────────────────────────────────
  if (variant === "luxury") {
    return (
      <div className="w-full max-w-sm mx-auto">
        <Card
          className={`relative overflow-hidden bg-background border border-border/20 min-h-[640px] flex flex-col ${mock ? "scale-90 opacity-90" : ""}`}
          style={{ borderRadius: crPx, boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}
        >
          {/* Cinematic header with embedded avatar */}
          <div className="relative h-48 shrink-0 overflow-hidden">
            {coverSrc && (
              <img src={coverSrc} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0" style={{ background: theme.tokens["--theme-header-gradient"] }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
            {/* Avatar framed with accent gradient ring */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
              <div className="p-[2px]" style={{ background: `linear-gradient(135deg, ${accent} 0%, transparent 70%)`, borderRadius: avatarRadius === "50%" ? "50%" : avatarRadius }}>
                <div className="p-[2px] bg-background" style={{ borderRadius: avatarRadius === "50%" ? "50%" : avatarRadius }}>
                  <Avatar className="h-24 w-24" style={{ borderRadius: avatarRadius, overflow: "hidden" }}>
                    <AvatarImage src={resolveAvatarSrc(profile.photoUrl)} alt={profile.name} className="object-cover" style={{ borderRadius: avatarRadius }} />
                    <AvatarFallback className="text-2xl font-bold" style={{ borderRadius: avatarRadius, backgroundColor: `${accent}22`, color: accent }}>
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>

          {/* Identity — centered, dramatic */}
          <div className="pt-16 pb-5 px-8 text-center">
            <h2 className="text-xl font-bold tracking-[0.05em] text-foreground mb-1" style={{ fontFamily: headingFont }}>
              {profile.name}
            </h2>
            {profile.title && (
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">{profile.title}</p>
            )}
            {profile.company && (
              <p className="text-sm font-semibold mt-1.5" style={{ color: accent }}>
                {profile.company}
              </p>
            )}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border/30" />
              <div className="h-[3px] w-6 rounded-full" style={{ backgroundColor: accent }} />
              <div className="h-px flex-1 bg-border/30" />
            </div>
          </div>

          {/* Content */}
          <div className="px-8 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
            {profile.bio && (
              <p className="text-sm text-muted-foreground text-center leading-loose tracking-wide mb-7">{profile.bio}</p>
            )}

            {/* Contact — icon-style aware */}
            {(links.phone || links.whatsapp || links.sms || links.email) && (
              <div className="flex items-center justify-center gap-6 mb-7">
                {links.phone && (
                  <a href={`tel:${links.phone}`} className="flex flex-col items-center gap-1.5 group">
                    <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#25D366" size="sm" borderRadius={crPx}>
                      <Phone className="h-4 w-4" />
                    </ContactIconWrap>
                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Call</span>
                  </a>
                )}
                {(links.sms || links.phone) && (
                  <a href={`sms:${links.sms || links.phone}`} className="flex flex-col items-center gap-1.5 group">
                    <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#0088CC" size="sm" borderRadius={crPx}>
                      <MessageSquare className="h-4 w-4" />
                    </ContactIconWrap>
                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Text</span>
                  </a>
                )}
                {links.whatsapp && (
                  <a href={`https://wa.me/${links.whatsapp.replace(/[^0-9+]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                    <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#25D366" size="sm" borderRadius={crPx}>
                      <SiWhatsapp className="h-4 w-4" />
                    </ContactIconWrap>
                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground">WA</span>
                  </a>
                )}
                {links.email && (
                  <a href={`mailto:${links.email}`} className="flex flex-col items-center gap-1.5 group">
                    <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#0088CC" size="sm" borderRadius={crPx}>
                      <Mail className="h-4 w-4" />
                    </ContactIconWrap>
                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Email</span>
                  </a>
                )}
              </div>
            )}

            {/* Social — elegant compact */}
            {socialLinks.length > 0 && (
              <>
                <SectionDividerEl type={c.sectionDivider} accent={accent} />
                <div className="grid grid-cols-4 gap-2 mb-4 mt-2">
                  {socialLinks.map(([key, value]) => {
                    const config = SOCIAL_CONFIG[key] || { icon: LinkIcon, color: "#6B7280", label: key };
                    return (
                      <a key={key} href={socialHandleToUrl(key, value)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
                        <SocialIconTile config={config} borderRadius={crPx === "24px" ? "6px" : crPx} size="sm" />
                        <span className="text-[7px] uppercase tracking-widest text-muted-foreground">{config.label}</span>
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* CTA — premium */}
          <div className="px-8 pb-8 pt-3 mt-auto flex flex-col gap-2.5">
            <button
              className="w-full h-12 text-xs font-semibold tracking-[0.12em] uppercase transition-opacity hover:opacity-90"
              style={buttonSty}
              onClick={saveContact}
              data-testid="button-save-contact"
            >
              Save Contact
            </button>
            {extraActions}
          </div>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SOCIAL HUB — dark, tile-based, creator-style
  // ─────────────────────────────────────────────────────────────────────────
  if (variant === "social") {
    const tileLayout = c.socialLayout === "tiles";
    return (
      <div className="w-full max-w-sm mx-auto">
        <Card
          className={`relative overflow-hidden bg-background shadow-2xl min-h-[600px] flex flex-col border-border/30 ${mock ? "scale-90 opacity-90" : ""}`}
          style={{ borderRadius: crPx }}
        >
          {/* Banner */}
          <div className="relative">
            <div className="w-full h-32">
              {coverSrc ? (
                <img src={coverSrc} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0" style={{ background: theme.tokens["--theme-header-gradient"] }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <div className="flex flex-col items-center -mt-14 relative z-10 px-6">
              <div className="p-1 bg-background shadow-lg mb-3" style={{ borderRadius: avatarRadius === "50%" ? "50%" : avatarRadius }}>
                <Avatar
                  className="h-24 w-24"
                  style={{ borderRadius: avatarRadius, overflow: "hidden", border: `2px solid ${accent}30` }}
                >
                  <AvatarImage src={resolveAvatarSrc(profile.photoUrl)} alt={profile.name} className="object-cover" style={{ borderRadius: avatarRadius }} />
                  <AvatarFallback className="text-2xl font-bold" style={{ borderRadius: avatarRadius, backgroundColor: `${accent}22`, color: accent }}>
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center space-y-0.5 mb-4">
                <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: headingFont }}>{profile.name}</h2>
                {profile.title && (
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                    <Briefcase className="h-3 w-3" />
                    <span>{profile.title}</span>
                  </div>
                )}
                {profile.company && (
                  <p className="text-sm font-semibold" style={{ color: accent }}>{profile.company}</p>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
            {profile.bio && (
              <p className="text-sm text-muted-foreground text-center leading-relaxed mb-5">{profile.bio}</p>
            )}

            {/* Contact */}
            {(links.phone || links.whatsapp || links.sms || links.email) && (
              <div className="flex items-center justify-center gap-4 mb-5">
                {links.phone && (
                  <a href={`tel:${links.phone}`} className="flex flex-col items-center gap-2 group">
                    <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#25D366" size="lg" borderRadius={crPx}>
                      <Phone className="h-6 w-6" />
                    </ContactIconWrap>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Call</span>
                  </a>
                )}
                {(links.sms || links.phone) && (
                  <a href={`sms:${links.sms || links.phone}`} className="flex flex-col items-center gap-2 group">
                    <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#0088CC" size="lg" borderRadius={crPx}>
                      <MessageSquare className="h-6 w-6" />
                    </ContactIconWrap>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Text</span>
                  </a>
                )}
                {links.whatsapp && (
                  <a href={`https://wa.me/${links.whatsapp.replace(/[^0-9+]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                    <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#25D366" size="lg" borderRadius={crPx}>
                      <SiWhatsapp className="h-6 w-6" />
                    </ContactIconWrap>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">WhatsApp</span>
                  </a>
                )}
                {links.email && (
                  <a href={`mailto:${links.email}`} className="flex flex-col items-center gap-2 group">
                    <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#0088CC" size="lg" borderRadius={crPx}>
                      <Mail className="h-6 w-6" />
                    </ContactIconWrap>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Email</span>
                  </a>
                )}
              </div>
            )}

            <SectionDividerEl type={c.sectionDivider} accent={accent} />

            {/* Social — tiles or icons */}
            {socialLinks.length > 0 && (
              tileLayout ? (
                <div className="grid grid-cols-2 gap-2.5 mb-4 mt-2">
                  {socialLinks.map(([key, value]) => {
                    const config = SOCIAL_CONFIG[key] || { icon: LinkIcon, color: "#6B7280", label: key };
                    const Icon = config.icon;
                    return (
                      <a
                        key={key}
                        href={socialHandleToUrl(key, value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl group hover:brightness-110 transition-all"
                        style={{ backgroundColor: `${config.color}22`, border: `1px solid ${config.color}30` }}
                      >
                        <div
                          className="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center"
                          style={{
                            background: config.gradient || config.color,
                            color: config.textColor || "#fff",
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">{config.label}</span>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2.5 mb-4 mt-2">
                  {socialLinks.map(([key, value]) => {
                    const config = SOCIAL_CONFIG[key] || { icon: LinkIcon, color: "#6B7280", label: key };
                    return (
                      <a key={key} href={socialHandleToUrl(key, value)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                        <SocialIconTile config={config} borderRadius="16px" size="lg" />
                        <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">{config.label}</span>
                      </a>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* CTA */}
          <div className="px-5 pb-5 pt-2 mt-auto">
            <div className={extraActions ? "grid grid-cols-2 gap-3" : ""}>
              <button
                className="w-full h-12 text-sm font-semibold transition-opacity hover:opacity-90"
                style={buttonSty}
                onClick={saveContact}
                data-testid="button-save-contact"
              >
                Save Contact
              </button>
              {extraActions}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PERSONAL BRAND — expressive, large avatar, generous spacing (default)
  // ─────────────────────────────────────────────────────────────────────────
  const bgGradient = c.backgroundStyle === "gradient"
    ? `linear-gradient(135deg, ${accent}40 0%, ${theme.tokens["--theme-bg"]} 60%)`
    : c.backgroundStyle === "pattern"
    ? theme.tokens["--theme-bg"]
    : undefined;

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card
        className={`relative overflow-hidden bg-background border-border/40 shadow-2xl min-h-[640px] flex flex-col ${mock ? "scale-90 opacity-90" : "transform-gpu transition-transform hover:scale-[1.01]"}`}
        style={{ borderRadius: crPx }}
      >
        {/* Tall expressive gradient header */}
        <div className="h-44 relative shrink-0">
          {coverSrc ? (
            <img src={coverSrc} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          ) : null}
          <div
            className="absolute inset-0"
            style={{ background: bgGradient || theme.tokens["--theme-header-gradient"] }}
          />
          {c.backgroundStyle === "pattern" && (
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:10px_10px]" />
          )}
        </div>

        {/* Large avatar */}
        <div className="px-6 flex flex-col items-center -mt-16 relative z-10">
          <div
            className="bg-background mb-4"
            style={{
              padding: 3,
              borderRadius: avatarRadius === "50%" ? "50%" : avatarRadius,
              boxShadow: `0 0 0 3px ${accent}40, 0 8px 32px rgba(0,0,0,0.25)`,
            }}
          >
            <Avatar
              className="h-28 w-28"
              style={{ borderRadius: avatarRadius, overflow: "hidden", border: "2px solid transparent" }}
            >
              <AvatarImage src={resolveAvatarSrc(profile.photoUrl)} alt={profile.name} className="object-cover" style={{ borderRadius: avatarRadius }} />
              <AvatarFallback className="text-3xl font-bold" style={{ borderRadius: avatarRadius, backgroundColor: `${accent}22`, color: accent }}>
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center space-y-1 mb-5">
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: headingFont }}>{profile.name}</h2>
            {profile.title && (
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{profile.title}</span>
              </div>
            )}
            {profile.company && <p className="text-sm font-semibold" style={{ color: accent }}>{profile.company}</p>}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
          {profile.bio && (
            <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6 px-2">{profile.bio}</p>
          )}

          <SectionDividerEl type={c.sectionDivider} accent={accent} />

          {/* Contact */}
          {(links.phone || links.whatsapp || links.sms || links.email) && (
            <div className="flex items-center justify-center gap-4 mb-5 mt-2">
              {links.phone && (
                <a href={`tel:${links.phone}`} className="flex flex-col items-center gap-1.5 group">
                  <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#25D366" size="md" borderRadius={crPx}>
                    <Phone className="h-5 w-5" />
                  </ContactIconWrap>
                  <span className="text-[10px] text-muted-foreground">Call</span>
                </a>
              )}
              {(links.sms || links.phone) && (
                <a href={`sms:${links.sms || links.phone}`} className="flex flex-col items-center gap-1.5 group">
                  <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#0088CC" size="md" borderRadius={crPx}>
                    <MessageSquare className="h-5 w-5" />
                  </ContactIconWrap>
                  <span className="text-[10px] text-muted-foreground">Text</span>
                </a>
              )}
              {links.whatsapp && (
                <a href={`https://wa.me/${links.whatsapp.replace(/[^0-9+]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                  <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#25D366" size="md" borderRadius={crPx}>
                    <SiWhatsapp className="h-5 w-5" />
                  </ContactIconWrap>
                  <span className="text-[10px] text-muted-foreground">WhatsApp</span>
                </a>
              )}
              {links.email && (
                <a href={`mailto:${links.email}`} className="flex flex-col items-center gap-1.5 group">
                  <ContactIconWrap iconStyle={c.iconStyle} accent={accent} bg="#0088CC" size="md" borderRadius={crPx}>
                    <Mail className="h-5 w-5" />
                  </ContactIconWrap>
                  <span className="text-[10px] text-muted-foreground">Email</span>
                </a>
              )}
            </div>
          )}

          <SectionDividerEl type={c.sectionDivider} accent={accent} />

          {/* Social */}
          {socialLinks.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4 mt-2">
              {socialLinks.map(([key, value]) => {
                const config = SOCIAL_CONFIG[key] || { icon: LinkIcon, color: "#6B7280", label: key };
                return (
                  <a key={key} href={socialHandleToUrl(key, value)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                    <SocialIconTile config={config} borderRadius={crPx} size="md" />
                    <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">{config.label}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-2 mt-auto">
          <div className={extraActions ? "grid grid-cols-2 gap-3" : ""}>
            <button
              className="w-full h-12 text-sm font-semibold tracking-wide transition-opacity hover:opacity-90"
              style={buttonSty}
              onClick={saveContact}
              data-testid="button-save-contact"
            >
              Save Contact
            </button>
            {extraActions}
          </div>
        </div>
      </Card>
    </div>
  );
}
