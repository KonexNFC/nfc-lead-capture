import {
  Briefcase,
  Mail,
  Link as LinkIcon,
  Globe,
  Phone,
  MessageSquare,
  MessageCircle,
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
} from "react-icons/si";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { downloadVCard, type VCardData } from "@/lib/vcard";
import { socialHandleToUrl } from "@/lib/social-utils";
import type { Profile, ProfileBranding } from "@shared/schema";

type LayoutVariant = "corporate" | "personal" | "luxury" | "social";

interface ProfilePreviewProps {
  profile: Profile;
  mock?: boolean;
  onSaveContact?: () => void;
  extraActions?: React.ReactNode;
  layoutVariant?: LayoutVariant;
  headerStyle?: "left-aligned" | "banner" | "centered";
  socialLayout?: "icons" | "tiles";
}

function resolveAvatarSrc(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("/objects/")) return url;
  return `/objects/${url}`;
}

const SOCIAL_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  linkedin:  { icon: SiLinkedin,  color: "#0A66C2", label: "LinkedIn"  },
  x:         { icon: SiX,         color: "#14171A", label: "X"         },
  twitter:   { icon: SiX,         color: "#14171A", label: "X"         },
  instagram: { icon: SiInstagram, color: "#E4405F", label: "Instagram" },
  facebook:  { icon: SiFacebook,  color: "#1877F2", label: "Facebook"  },
  tiktok:    { icon: SiTiktok,    color: "#000000", label: "TikTok"    },
  youtube:   { icon: SiYoutube,   color: "#FF0000", label: "YouTube"   },
  snapchat:  { icon: SiSnapchat,  color: "#FFFC00", label: "Snapchat"  },
  github:    { icon: SiGithub,    color: "#181717", label: "GitHub"    },
  website:   { icon: Globe,       color: "#6366F1", label: "Website"   },
};

export function ProfilePreview({
  profile,
  mock,
  extraActions,
  layoutVariant,
  headerStyle,
  socialLayout,
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

  const variant: LayoutVariant =
    layoutVariant ??
    (socialLayout === "tiles"
      ? "social"
      : headerStyle === "left-aligned"
      ? "corporate"
      : headerStyle === "centered"
      ? "luxury"
      : "personal");

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
          style={{ borderRadius: "var(--card-radius, 8px)" }}
        >
          {/* Compact header row */}
          <div className="px-5 pt-5 pb-4 flex items-center gap-3.5 border-b border-border/40">
            <Avatar className="h-14 w-14 shrink-0 border border-border/60">
              <AvatarImage src={resolveAvatarSrc(profile.photoUrl)} alt={profile.name} className="object-cover" />
              <AvatarFallback className="text-base bg-secondary font-bold text-primary">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-foreground leading-tight truncate">{profile.name}</h2>
              {profile.title && (
                <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                  <Briefcase className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{profile.title}</span>
                </div>
              )}
              {profile.company && (
                <p className="text-xs text-primary font-semibold mt-0.5 truncate">{profile.company}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-5 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
            {profile.bio && (
              <p className="text-xs text-muted-foreground leading-relaxed pt-3 pb-2 text-left">{profile.bio}</p>
            )}

            <div className="border-t border-border/30 my-2" />

            {/* Contact — small circles */}
            {(links.phone || links.whatsapp || links.sms || links.email) && (
              <div className="flex items-center gap-3 py-2">
                {links.phone && (
                  <a href={`tel:${links.phone}`} className="flex flex-col items-center gap-1 group">
                    <div className="h-9 w-9 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-all">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] text-muted-foreground">Call</span>
                  </a>
                )}
                {(links.sms || links.phone) && (
                  <a href={`sms:${links.sms || links.phone}`} className="flex flex-col items-center gap-1 group">
                    <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] text-muted-foreground">Text</span>
                  </a>
                )}
                {links.whatsapp && (
                  <a href={`https://wa.me/${links.whatsapp.replace(/[^0-9+]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
                    <div className="h-9 w-9 rounded-full bg-green-600/10 flex items-center justify-center text-green-700 group-hover:bg-green-600 group-hover:text-white transition-all">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] text-muted-foreground">WA</span>
                  </a>
                )}
                {links.email && (
                  <a href={`mailto:${links.email}`} className="flex flex-col items-center gap-1 group">
                    <div className="h-9 w-9 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] text-muted-foreground">Email</span>
                  </a>
                )}
              </div>
            )}

            {/* Social grid — tight */}
            {socialLinks.length > 0 && (
              <>
                <div className="border-t border-border/30 my-2" />
                <div className="grid grid-cols-4 gap-2 py-2">
                  {socialLinks.map(([key, value]) => {
                    const config = SOCIAL_CONFIG[key] || { icon: LinkIcon, color: "#6B7280", label: key };
                    const Icon = config.icon;
                    return (
                      <a key={key} href={socialHandleToUrl(key, value)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center transition-all group-hover:-translate-y-0.5" style={{ backgroundColor: config.color, color: key === "snapchat" ? "#000" : "#fff" }}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[8px] uppercase tracking-wide font-semibold text-muted-foreground">{config.label}</span>
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* CTA — inline row, small */}
          <div className="px-5 pb-4 pt-2 mt-auto">
            <div className={extraActions ? "grid grid-cols-2 gap-2" : ""}>
              <Button size="sm" className="w-full h-10 text-xs font-semibold rounded-lg" onClick={saveContact} data-testid="button-save-contact">
                Save Contact
              </Button>
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
          className={`relative overflow-hidden bg-background border border-border/20 shadow-[0_24px_80px_rgba(0,0,0,0.7)] min-h-[640px] flex flex-col ${mock ? "scale-90 opacity-90" : ""}`}
          style={{ borderRadius: "var(--card-radius, 4px)" }}
        >
          {/* Cinematic header with embedded avatar */}
          <div className="relative h-48 shrink-0 overflow-hidden">
            {coverSrc && (
              <img src={coverSrc} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0" style={{ background: "var(--theme-header-gradient, linear-gradient(180deg, #1a1506 0%, #0a0a0a 100%))" }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
            {/* Avatar framed with accent gradient ring */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
              <div className="p-[2px] rounded-full" style={{ background: `linear-gradient(135deg, var(--theme-accent, #c9a84c) 0%, transparent 70%)` }}>
                <div className="p-[2px] bg-background rounded-full">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={resolveAvatarSrc(profile.photoUrl)} alt={profile.name} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-secondary font-bold text-primary">{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>

          {/* Identity — centered, dramatic */}
          <div className="pt-16 pb-5 px-8 text-center">
            <h2 className="text-xl font-bold tracking-[0.05em] text-foreground mb-1">{profile.name}</h2>
            {profile.title && (
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">{profile.title}</p>
            )}
            {profile.company && (
              <p className="text-sm font-semibold mt-1.5" style={{ color: "var(--theme-accent, hsl(var(--primary)))" }}>
                {profile.company}
              </p>
            )}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border/30" />
              <div className="h-[3px] w-6 rounded-full" style={{ backgroundColor: "var(--theme-accent, hsl(var(--primary)))" }} />
              <div className="h-px flex-1 bg-border/30" />
            </div>
          </div>

          {/* Content */}
          <div className="px-8 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
            {profile.bio && (
              <p className="text-sm text-muted-foreground text-center leading-loose tracking-wide mb-7">{profile.bio}</p>
            )}

            {/* Contact — minimal bordered circles */}
            {(links.phone || links.whatsapp || links.sms || links.email) && (
              <div className="flex items-center justify-center gap-6 mb-7">
                {links.phone && (
                  <a href={`tel:${links.phone}`} className="flex flex-col items-center gap-1.5 group">
                    <div className="h-10 w-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-all">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Call</span>
                  </a>
                )}
                {(links.sms || links.phone) && (
                  <a href={`sms:${links.sms || links.phone}`} className="flex flex-col items-center gap-1.5 group">
                    <div className="h-10 w-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-all">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Text</span>
                  </a>
                )}
                {links.whatsapp && (
                  <a href={`https://wa.me/${links.whatsapp.replace(/[^0-9+]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                    <div className="h-10 w-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-all">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground">WA</span>
                  </a>
                )}
                {links.email && (
                  <a href={`mailto:${links.email}`} className="flex flex-col items-center gap-1.5 group">
                    <div className="h-10 w-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-all">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Email</span>
                  </a>
                )}
              </div>
            )}

            {/* Social — elegant compact */}
            {socialLinks.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {socialLinks.map(([key, value]) => {
                  const config = SOCIAL_CONFIG[key] || { icon: LinkIcon, color: "#6B7280", label: key };
                  const Icon = config.icon;
                  return (
                    <a key={key} href={socialHandleToUrl(key, value)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
                      <div className="h-10 w-10 rounded-sm flex items-center justify-center transition-all group-hover:opacity-85" style={{ backgroundColor: config.color, color: key === "snapchat" ? "#000" : "#fff" }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[7px] uppercase tracking-widest text-muted-foreground">{config.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* CTA — stacked, premium */}
          <div className="px-8 pb-8 pt-3 mt-auto flex flex-col gap-2.5">
            <Button
              size="lg"
              className="w-full h-12 text-sm font-semibold tracking-widest rounded-none border-0"
              style={{ backgroundColor: "var(--theme-accent, hsl(var(--primary)))", color: "#000" }}
              onClick={saveContact}
              data-testid="button-save-contact"
            >
              SAVE CONTACT
            </Button>
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
    return (
      <div className="w-full max-w-sm mx-auto">
        <Card
          className={`relative overflow-hidden bg-background shadow-2xl min-h-[600px] flex flex-col border-border/30 ${mock ? "scale-90 opacity-90" : ""}`}
          style={{ borderRadius: "var(--card-radius, 20px)" }}
        >
          {/* Banner */}
          <div className="relative">
            <div className="w-full h-32">
              {coverSrc ? (
                <img src={coverSrc} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0" style={{ background: "var(--theme-header-gradient, linear-gradient(180deg, #1a1a2e 0%, #0d0d0d 100%))" }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <div className="flex flex-col items-center -mt-14 relative z-10 px-6">
              <div className="p-1 bg-background rounded-full shadow-lg mb-3">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={resolveAvatarSrc(profile.photoUrl)} alt={profile.name} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-secondary font-bold text-primary">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center space-y-0.5 mb-4">
                <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
                {profile.title && (
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                    <Briefcase className="h-3 w-3" />
                    <span>{profile.title}</span>
                  </div>
                )}
                {profile.company && (
                  <p className="text-sm font-semibold" style={{ color: "var(--theme-accent, hsl(var(--primary)))" }}>{profile.company}</p>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
            {profile.bio && (
              <p className="text-sm text-muted-foreground text-center leading-relaxed mb-5">{profile.bio}</p>
            )}

            {/* Contact — solid coloured circles */}
            {(links.phone || links.whatsapp || links.sms || links.email) && (
              <div className="flex items-center justify-center gap-4 mb-5">
                {links.phone && (
                  <a href={`tel:${links.phone}`} className="flex flex-col items-center gap-2 group">
                    <div className="h-14 w-14 rounded-full bg-[#1a4731] flex items-center justify-center text-[#25d366] group-hover:brightness-110 transition-all"><Phone className="h-6 w-6" /></div>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Call</span>
                  </a>
                )}
                {(links.sms || links.phone) && (
                  <a href={`sms:${links.sms || links.phone}`} className="flex flex-col items-center gap-2 group">
                    <div className="h-14 w-14 rounded-full bg-[#1a2d4a] flex items-center justify-center text-[#4a9eff] group-hover:brightness-110 transition-all"><MessageSquare className="h-6 w-6" /></div>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Text</span>
                  </a>
                )}
                {links.whatsapp && (
                  <a href={`https://wa.me/${links.whatsapp.replace(/[^0-9+]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                    <div className="h-14 w-14 rounded-full bg-[#1a4731] flex items-center justify-center text-[#25d366] group-hover:brightness-110 transition-all"><MessageCircle className="h-6 w-6" /></div>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">WhatsApp</span>
                  </a>
                )}
                {links.email && (
                  <a href={`mailto:${links.email}`} className="flex flex-col items-center gap-2 group">
                    <div className="h-14 w-14 rounded-full bg-[#1a2d4a] flex items-center justify-center text-[#4a9eff] group-hover:brightness-110 transition-all"><Mail className="h-6 w-6" /></div>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Email</span>
                  </a>
                )}
              </div>
            )}

            {/* Social — large brand tiles */}
            {socialLinks.length > 0 && (
              <div className="grid grid-cols-4 gap-2.5 mb-4">
                {socialLinks.map(([key, value]) => {
                  const config = SOCIAL_CONFIG[key] || { icon: LinkIcon, color: "#6B7280", label: key };
                  const Icon = config.icon;
                  return (
                    <a key={key} href={socialHandleToUrl(key, value)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                      <div className="h-14 w-14 rounded-2xl flex items-center justify-center group-hover:brightness-110 group-hover:-translate-y-0.5 transition-all" style={{ backgroundColor: config.color, color: key === "snapchat" ? "#000" : "#fff" }}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">{config.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="px-5 pb-5 pt-2 mt-auto">
            <div className={extraActions ? "grid grid-cols-2 gap-3" : ""}>
              <Button size="lg" className="w-full h-12 text-sm font-semibold rounded-xl" onClick={saveContact} data-testid="button-save-contact">
                Save Contact
              </Button>
              {extraActions}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PERSONAL — expressive, large avatar, generous spacing (default)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm mx-auto">
      <Card
        className={`relative overflow-hidden bg-background border-border/40 shadow-2xl min-h-[640px] flex flex-col ${mock ? "scale-90 opacity-90" : "transform-gpu transition-transform hover:scale-[1.01]"}`}
        style={{ borderRadius: "var(--card-radius, 2rem)" }}
      >
        {/* Tall expressive gradient header */}
        <div className="h-44 relative shrink-0">
          {coverSrc ? (
            <img src={coverSrc} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          ) : null}
          <div
            className="absolute inset-0"
            style={{ background: "var(--theme-header-gradient, linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent))))" }}
          />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:10px_10px]" />
        </div>

        {/* Large avatar — prominent, with primary glow ring */}
        <div className="px-6 flex flex-col items-center -mt-16 relative z-10">
          <div
            className="p-[3px] bg-background rounded-full mb-4"
            style={{ boxShadow: "0 0 0 3px hsl(var(--primary)/0.3), 0 8px 32px rgba(0,0,0,0.25)" }}
          >
            <Avatar className="h-28 w-28 border-2 border-background">
              <AvatarImage src={resolveAvatarSrc(profile.photoUrl)} alt={profile.name} className="object-cover" />
              <AvatarFallback className="text-3xl bg-secondary font-bold text-primary">{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center space-y-1 mb-5">
            <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
            {profile.title && (
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{profile.title}</span>
              </div>
            )}
            {profile.company && <p className="text-sm text-primary font-semibold">{profile.company}</p>}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
          {profile.bio && (
            <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6 px-2">{profile.bio}</p>
          )}

          {/* Contact — medium circles */}
          {(links.phone || links.whatsapp || links.sms || links.email) && (
            <div className="flex items-center justify-center gap-4 mb-5">
              {links.phone && (
                <a href={`tel:${links.phone}`} className="flex flex-col items-center gap-1.5 group">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-all"><Phone className="h-5 w-5" /></div>
                  <span className="text-[10px] text-muted-foreground">Call</span>
                </a>
              )}
              {(links.sms || links.phone) && (
                <a href={`sms:${links.sms || links.phone}`} className="flex flex-col items-center gap-1.5 group">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all"><MessageSquare className="h-5 w-5" /></div>
                  <span className="text-[10px] text-muted-foreground">Text</span>
                </a>
              )}
              {links.whatsapp && (
                <a href={`https://wa.me/${links.whatsapp.replace(/[^0-9+]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                  <div className="h-12 w-12 rounded-full bg-green-600/10 flex items-center justify-center text-green-700 group-hover:bg-green-600 group-hover:text-white transition-all"><MessageCircle className="h-5 w-5" /></div>
                  <span className="text-[10px] text-muted-foreground">WhatsApp</span>
                </a>
              )}
              {links.email && (
                <a href={`mailto:${links.email}`} className="flex flex-col items-center gap-1.5 group">
                  <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-all"><Mail className="h-5 w-5" /></div>
                  <span className="text-[10px] text-muted-foreground">Email</span>
                </a>
              )}
            </div>
          )}

          {/* Social — standard tiles */}
          {socialLinks.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-4">
              {socialLinks.map(([key, value]) => {
                const config = SOCIAL_CONFIG[key] || { icon: LinkIcon, color: "#6B7280", label: key };
                const Icon = config.icon;
                return (
                  <a key={key} href={socialHandleToUrl(key, value)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:shadow-lg group-hover:-translate-y-1" style={{ backgroundColor: config.color, color: key === "snapchat" ? "#000" : "#fff" }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{config.label}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA — stacked full-width pill buttons */}
        <div className="px-6 pb-6 pt-2 mt-auto flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full h-14 text-sm font-semibold rounded-full shadow-lg shadow-primary/20"
            onClick={saveContact}
            data-testid="button-save-contact"
          >
            Save Contact
          </Button>
          {extraActions && <div className="w-full">{extraActions}</div>}
        </div>
      </Card>
    </div>
  );
}
