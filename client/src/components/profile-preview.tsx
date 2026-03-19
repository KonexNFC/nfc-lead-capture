import { 
  Briefcase, 
  Mail, 
  Link as LinkIcon, 
  Globe,
  Phone,
  MessageSquare,
  MessageCircle
} from "lucide-react";
import { 
  SiLinkedin, 
  SiX, 
  SiInstagram, 
  SiFacebook, 
  SiTiktok, 
  SiYoutube, 
  SiSnapchat,
  SiGithub
} from "react-icons/si";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { downloadVCard, type VCardData } from "@/lib/vcard";
import { socialHandleToUrl } from "@/lib/social-utils";
import type { Profile, ProfileBranding } from "@shared/schema";

interface ProfilePreviewProps {
  profile: Profile;
  mock?: boolean;
  onSaveContact?: () => void;
  extraActions?: React.ReactNode;
  headerStyle?: "left-aligned" | "banner" | "centered";
}

export function ProfilePreview({ profile, mock, onSaveContact, extraActions, headerStyle = "banner" }: ProfilePreviewProps) {
  const branding = (profile.branding as ProfileBranding) || {};
  const coverSrc = branding.coverUrl
    ? branding.coverUrl.startsWith("http") ? branding.coverUrl
      : branding.coverUrl.startsWith("/objects/") ? branding.coverUrl
      : `/objects/${branding.coverUrl}`
    : null;
  const socialConfig: Record<string, { icon: any; color: string; label: string }> = {
    linkedin: { icon: SiLinkedin, color: "#0A66C2", label: "LinkedIn" },
    x: { icon: SiX, color: "#14171A", label: "X" },
    twitter: { icon: SiX, color: "#14171A", label: "X" },
    instagram: { icon: SiInstagram, color: "#E4405F", label: "Instagram" },
    facebook: { icon: SiFacebook, color: "#1877F2", label: "Facebook" },
    tiktok: { icon: SiTiktok, color: "#000000", label: "TikTok" },
    youtube: { icon: SiYoutube, color: "#FF0000", label: "YouTube" },
    snapchat: { icon: SiSnapchat, color: "#FFFC00", label: "Snapchat" },
    github: { icon: SiGithub, color: "#181717", label: "GitHub" },
    website: { icon: Globe, color: "#6366F1", label: "Website" },
  };

  const links = (profile.links as Record<string, string>) || {};
  const contactKeys = new Set(['phone', 'whatsapp', 'sms', 'email']);
  const socialLinks = Object.entries(links).filter(([key]) => !contactKeys.has(key));

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000">
      <Card
        className={`
          relative overflow-hidden bg-background border-border/50 shadow-2xl 
          rounded-[2rem] min-h-[600px] flex flex-col
          ${mock ? 'scale-90 opacity-90' : 'transform-gpu transition-transform hover:scale-[1.01]'}
        `}
        style={{ borderRadius: "var(--card-radius, 2rem)" }}
      >
        {/* ── Header: varies by theme layout ── */}
        {/* Always show cover photo if set, regardless of headerStyle */}
        {coverSrc ? (
          <div className="relative">
            <div className="w-full h-28">
              <img src={coverSrc} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <div className="flex flex-col items-center -mt-14 relative z-10 px-6">
              <div className="p-1.5 bg-background rounded-full shadow-lg mb-3">
                <Avatar className="h-24 w-24 border-2 border-primary/10">
                  <AvatarImage src={profile.photoUrl ? (profile.photoUrl.startsWith('http') ? profile.photoUrl : profile.photoUrl.startsWith('/objects/') ? profile.photoUrl : `/objects/${profile.photoUrl}`) : undefined} alt={profile.name} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-secondary font-display font-bold text-primary">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className={`space-y-1 mb-4 ${headerStyle === "left-aligned" ? "self-start text-left" : "text-center"}`}>
                <h2 className="text-2xl font-bold font-display text-foreground">{profile.name}</h2>
                <div className={`flex items-center gap-1.5 text-muted-foreground text-sm font-medium ${headerStyle === "left-aligned" ? "" : "justify-center"}`}>
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{profile.title}</span>
                </div>
                {profile.company && <p className="text-sm text-primary font-semibold">{profile.company}</p>}
              </div>
            </div>
          </div>
        ) : headerStyle === "left-aligned" ? (
          /* ── Left-aligned: no banner, avatar + info in a horizontal row ── */
          <div className="px-5 pt-6 pb-4 flex items-center gap-4 border-b border-border/30">
            <div className="shrink-0">
              <Avatar className="h-[4.5rem] w-[4.5rem] border-2 border-primary/20">
                <AvatarImage src={profile.photoUrl ? (profile.photoUrl.startsWith('http') ? profile.photoUrl : profile.photoUrl.startsWith('/objects/') ? profile.photoUrl : `/objects/${profile.photoUrl}`) : undefined} alt={profile.name} className="object-cover" />
                <AvatarFallback className="text-xl bg-secondary font-display font-bold text-primary">{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold font-display text-foreground leading-tight truncate">{profile.name}</h2>
              {profile.title && (
                <div className="flex items-center gap-1 text-muted-foreground text-sm mt-0.5">
                  <Briefcase className="h-3 w-3 shrink-0" />
                  <span className="truncate">{profile.title}</span>
                </div>
              )}
              {profile.company && <p className="text-sm text-primary font-semibold mt-0.5 truncate">{profile.company}</p>}
            </div>
          </div>
        ) : headerStyle === "centered" ? (
          /* ── Centered: compact gradient strip, avatar centered below ── */
          <>
            <div className="h-16 relative shrink-0">
              <div className="absolute inset-0" style={{ background: "var(--theme-header-gradient, linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent))))" }} />
            </div>
            <div className="px-6 flex flex-col items-center -mt-10 relative z-10">
              <Avatar className="h-20 w-20 border-[3px] border-background shadow-lg mb-3">
                <AvatarImage src={profile.photoUrl ? (profile.photoUrl.startsWith('http') ? profile.photoUrl : profile.photoUrl.startsWith('/objects/') ? profile.photoUrl : `/objects/${profile.photoUrl}`) : undefined} alt={profile.name} className="object-cover" />
                <AvatarFallback className="text-xl bg-secondary font-display font-bold text-primary">{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center space-y-0.5 mb-5">
                <h2 className="text-xl font-bold font-display text-foreground tracking-tight">{profile.name}</h2>
                {profile.title && (
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                    <Briefcase className="h-3 w-3" />
                    <span>{profile.title}</span>
                  </div>
                )}
                {profile.company && <p className="text-sm text-primary font-semibold mt-1">{profile.company}</p>}
              </div>
            </div>
          </>
        ) : (
          /* ── Banner (default): tall gradient header, large overlapping avatar ── */
          <>
            <div className="h-32 relative">
              <div className="absolute inset-0" style={{ background: "var(--theme-header-gradient, linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent))))" }} />
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:10px_10px]" />
            </div>
            <div className="px-6 flex flex-col items-center -mt-16 relative z-10">
              <div className="p-1.5 bg-background rounded-full shadow-lg mb-4">
                <Avatar className="h-28 w-28 border-2 border-primary/10">
                  <AvatarImage src={profile.photoUrl ? (profile.photoUrl.startsWith('http') ? profile.photoUrl : profile.photoUrl.startsWith('/objects/') ? profile.photoUrl : `/objects/${profile.photoUrl}`) : undefined} alt={profile.name} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-secondary font-display font-bold text-primary">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center space-y-1 mb-6">
                <h2 className="text-2xl font-bold font-display text-foreground">{profile.name}</h2>
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm font-medium">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{profile.title}</span>
                </div>
                {profile.company && <p className="text-sm text-primary font-semibold">{profile.company}</p>}
              </div>
            </div>
          </>
        )}

        {/* Profile Content */}
        <div className="px-6 flex-1 flex flex-col items-center relative z-10">

          <div className="w-full space-y-3 flex-1 overflow-y-auto pb-6 scrollbar-hide">
            {profile.bio && (
              <p className={`text-sm text-muted-foreground mb-6 leading-relaxed px-2 ${headerStyle === "left-aligned" ? "text-left" : "text-center"}`}>
                {profile.bio}
              </p>
            )}

            {(links.phone || links.whatsapp || links.sms || links.email) && (
              <div className="flex items-center justify-center gap-3 px-2 mb-3">
                {links.phone && (
                  <a href={`tel:${links.phone}`} className="flex flex-col items-center gap-1.5 group">
                    <div className="h-11 w-11 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 transition-all group-hover:bg-green-500 group-hover:text-white">
                      <Phone className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">Call</span>
                  </a>
                )}
                {(links.sms || links.phone) && (
                  <a href={`sms:${links.sms || links.phone}`} className="flex flex-col items-center gap-1.5 group">
                    <div className="h-11 w-11 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 transition-all group-hover:bg-blue-500 group-hover:text-white">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">Text</span>
                  </a>
                )}
                {links.whatsapp && (
                  <a href={`https://wa.me/${links.whatsapp.replace(/[^0-9+]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                    <div className="h-11 w-11 rounded-full bg-green-600/10 flex items-center justify-center text-green-700 transition-all group-hover:bg-green-600 group-hover:text-white">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">WhatsApp</span>
                  </a>
                )}
                {links.email && (
                  <a href={`mailto:${links.email}`} className="flex flex-col items-center gap-1.5 group">
                    <div className="h-11 w-11 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-700 transition-all group-hover:bg-blue-600 group-hover:text-white">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">Email</span>
                  </a>
                )}
              </div>
            )}

            {socialLinks.length > 0 && (
            <div className="grid grid-cols-4 gap-3 px-2">
              {socialLinks.map(([key, value]) => {
                if (!value) return null;
                const config = socialConfig[key] || { icon: LinkIcon, color: "#6B7280", label: key };
                const Icon = config.icon;
                
                const href = socialHandleToUrl(key, value);

                const isSnapchat = key === "snapchat";

                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div 
                      className="h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:shadow-lg group-hover:-translate-y-1"
                      style={{ backgroundColor: config.color, color: isSnapchat ? "#000" : "#fff" }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{config.label}</span>
                  </a>
                );
              })}
            </div>
            )}
          </div>
        </div>

        <div className="w-full px-6 pb-5 pt-2 mt-auto flex flex-col gap-3">
          <div className={extraActions ? "grid grid-cols-2 gap-3 items-stretch" : ""}>
            <Button 
              className="w-full rounded-xl min-h-[48px] h-auto text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30" 
              size="lg"
              onClick={() => {
                const links = (profile.links as Record<string, string>) || {};
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
              }}
              data-testid="button-save-contact"
            >
              Save Contact
            </Button>
            {extraActions}
          </div>
        </div>

      </Card>
    </div>
  );
}
