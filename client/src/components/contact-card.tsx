import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { downloadVCard, type VCardData } from "@/lib/vcard";
import { 
  Phone, 
  MessageSquare, 
  MessageCircle, 
  Mail, 
  Globe, 
  Download,
  Check
} from "lucide-react";
import { SiFacebook, SiX, SiLinkedin, SiInstagram, SiTiktok } from "react-icons/si";
import type { Profile } from "@shared/schema";

interface ContactCardProps {
  profile: Profile;
  onClose?: () => void;
}

export function ContactCard({ profile, onClose }: ContactCardProps) {
  const links = (profile.links || {}) as Record<string, string>;
  
  const phone = links.phone;
  const whatsapp = links.whatsapp;
  const email = links.email;
  const website = links.website;
  const facebook = links.facebook;
  const x = links.x || links.twitter;
  const instagram = links.instagram;
  const linkedin = links.linkedin;
  const tiktok = links.tiktok;

  const handleSaveContact = () => {
    const vcardData: VCardData = {
      name: profile.name,
      title: profile.title || undefined,
      company: profile.company || undefined,
      phone: phone,
      whatsapp: whatsapp,
      email: email,
      website: website,
      facebook: facebook,
      x: x,
      instagram: instagram,
      linkedin: linkedin,
      tiktok: tiktok,
      photoUrl: profile.photoUrl || undefined,
    };
    downloadVCard(vcardData);
  };

  const formatPhoneForDisplay = (phoneNum: string) => {
    return phoneNum;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const ActionButton = ({ 
    icon: Icon, 
    label, 
    href, 
    color = "default",
    testId
  }: { 
    icon: React.ElementType; 
    label: string; 
    href: string; 
    color?: string;
    testId: string;
  }) => (
    <a 
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="flex flex-col items-center gap-1"
      data-testid={testId}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
        color === "primary" ? "bg-primary text-primary-foreground" :
        color === "green" ? "bg-green-500 text-white" :
        "bg-muted hover-elevate"
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </a>
  );

  return (
    <div className="flex flex-col items-center py-4 space-y-6" data-testid="contact-card">
      {/* Success indicator */}
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Check className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">Contact shared successfully!</span>
      </div>

      {/* Contact Card */}
      <Card className="w-full max-w-sm border-border/50 overflow-hidden">
        <CardContent className="p-0">
          {/* Header with Avatar and Name */}
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 p-6 text-center">
            <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-background shadow-lg">
              {profile.photoUrl ? (
                <AvatarImage src={profile.photoUrl} alt={profile.name} />
              ) : null}
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold" data-testid="contact-card-name">{profile.name}</h3>
            {(profile.title || profile.company) && (
              <p className="text-sm text-muted-foreground mt-1" data-testid="contact-card-title">
                {profile.title}{profile.title && profile.company ? ' · ' : ''}{profile.company}
              </p>
            )}
            {phone && (
              <p className="text-sm text-muted-foreground mt-2 font-mono" data-testid="contact-card-phone">
                {formatPhoneForDisplay(phone)}
              </p>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="p-4 border-t border-border/50">
            <div className="flex justify-center gap-6 flex-wrap">
              {phone && (
                <ActionButton 
                  icon={MessageSquare} 
                  label="Message" 
                  href={`sms:${phone}`}
                  testId="action-message"
                />
              )}
              {phone && (
                <ActionButton 
                  icon={Phone} 
                  label="Call" 
                  href={`tel:${phone}`}
                  color="primary"
                  testId="action-call"
                />
              )}
              {whatsapp && (
                <ActionButton 
                  icon={MessageCircle} 
                  label="WhatsApp" 
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  color="green"
                  testId="action-whatsapp"
                />
              )}
              {email && (
                <ActionButton 
                  icon={Mail} 
                  label="Email" 
                  href={`mailto:${email}`}
                  testId="action-email"
                />
              )}
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="border-t border-border/50">
            {website && (
              <ContactDetail 
                icon={Globe} 
                label="Website" 
                value={website.replace(/^https?:\/\//, '')} 
                href={website.startsWith('http') ? website : `https://${website}`}
                testId="detail-website"
              />
            )}
            {facebook && (
              <ContactDetail 
                icon={SiFacebook} 
                label="Facebook" 
                value={extractHandle(facebook)} 
                href={facebook.startsWith('http') ? facebook : `https://${facebook}`}
                color="#1877F2"
                testId="detail-facebook"
              />
            )}
            {x && (
              <ContactDetail 
                icon={SiX} 
                label="X" 
                value={extractHandle(x)} 
                href={x.startsWith('http') ? x : `https://${x}`}
                color="#000000"
                testId="detail-x"
              />
            )}
            {linkedin && (
              <ContactDetail 
                icon={SiLinkedin} 
                label="LinkedIn" 
                value={extractHandle(linkedin)} 
                href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
                color="#0A66C2"
                testId="detail-linkedin"
              />
            )}
            {instagram && (
              <ContactDetail 
                icon={SiInstagram} 
                label="Instagram" 
                value={extractHandle(instagram)} 
                href={instagram.startsWith('http') ? instagram : `https://${instagram}`}
                color="#E4405F"
                testId="detail-instagram"
              />
            )}
            {tiktok && (
              <ContactDetail 
                icon={SiTiktok} 
                label="TikTok" 
                value={extractHandle(tiktok)} 
                href={tiktok.startsWith('http') ? tiktok : `https://${tiktok}`}
                testId="detail-tiktok"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Contact CTA */}
      <div className="w-full max-w-sm space-y-3">
        <Button 
          size="lg" 
          className="w-full h-14 text-base font-semibold shadow-lg"
          onClick={handleSaveContact}
          data-testid="button-save-contact"
        >
          <Download className="mr-2 h-5 w-5" />
          Save Contact
        </Button>
        {onClose && (
          <Button 
            variant="outline" 
            size="lg"
            className="w-full h-12"
            onClick={onClose}
            data-testid="button-done"
          >
            Done
          </Button>
        )}
      </div>
    </div>
  );
}

function ContactDetail({ 
  icon: Icon, 
  label, 
  value, 
  href,
  color,
  testId
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  href: string;
  color?: string;
  testId: string;
}) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 px-4 py-3 hover-elevate transition-colors border-b border-border/30 last:border-b-0"
      data-testid={testId}
    >
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={color ? { backgroundColor: color } : undefined}
      >
        <Icon className={`w-4 h-4 ${color ? 'text-white' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </a>
  );
}

function extractHandle(url: string): string {
  try {
    if (url.startsWith('http')) {
      const parsed = new URL(url);
      const path = parsed.pathname.replace(/^\/+|\/+$/g, '');
      return path ? `@${path.split('/').pop()}` : url;
    }
    return url.startsWith('@') ? url : `@${url}`;
  } catch {
    return url;
  }
}
