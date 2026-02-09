import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { downloadVCard, type VCardData } from "@/lib/vcard";
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Download,
  Globe,
  Building2,
  Briefcase,
  ExternalLink
} from "lucide-react";
import type { Profile } from "@shared/schema";

interface ContactCardProps {
  profile: Profile;
  onClose?: () => void;
  showSuccessBanner?: boolean;
}

export function ContactCard({ profile, onClose, showSuccessBanner = true }: ContactCardProps) {
  const links = (profile.links || {}) as Record<string, string>;
  
  const phone = links.phone;
  const whatsapp = links.whatsapp;
  const email = links.email;
  const website = links.website;

  const handleSaveContact = () => {
    const vcardData: VCardData = {
      name: profile.name,
      title: profile.title || undefined,
      company: profile.company || undefined,
      phone: phone,
      whatsapp: whatsapp,
      email: email,
      website: website,
      photoUrl: profile.photoUrl || undefined,
    };
    downloadVCard(vcardData);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const photoSrc = profile.photoUrl
    ? profile.photoUrl.startsWith('http') ? profile.photoUrl
      : profile.photoUrl.startsWith('/objects/') ? profile.photoUrl
      : `/objects/${profile.photoUrl}`
    : undefined;

  const hasQuickActions = phone || whatsapp || email;

  const contactRows: { icon: React.ElementType; label: string; value: string; href: string; color?: string; testId: string }[] = [];

  if (phone) {
    contactRows.push({ icon: Phone, label: "mobile", value: phone, href: `tel:${phone}`, color: "#34C759", testId: "contact-row-phone" });
  }
  if (whatsapp) {
    contactRows.push({ icon: MessageCircle, label: "WhatsApp", value: whatsapp, href: `https://wa.me/${whatsapp.replace(/\D/g, '')}`, color: "#25D366", testId: "contact-row-whatsapp" });
  }
  if (email) {
    contactRows.push({ icon: Mail, label: "email", value: email, href: `mailto:${email}`, color: "#007AFF", testId: "contact-row-email" });
  }
  if (website) {
    const url = website.startsWith('http') ? website : `https://${website}`;
    contactRows.push({ icon: Globe, label: "website", value: website.replace(/^https?:\/\//, ''), href: url, color: "#5856D6", testId: "contact-row-website" });
  }

  return (
    <div className="flex flex-col" data-testid="contact-card">
      {showSuccessBanner && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-md px-4 py-3 mb-4 flex items-center gap-3" data-testid="contact-success-banner">
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">Contact shared successfully</span>
        </div>
      )}

      <div className="bg-muted/40 rounded-md overflow-hidden border border-border/50">
        <div className="flex items-center gap-4 p-5">
          <Avatar className="w-16 h-16 ring-2 ring-background shadow-md flex-shrink-0" data-testid="contact-avatar">
            {photoSrc ? <AvatarImage src={photoSrc} alt={profile.name} className="object-cover" /> : null}
            <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-tight truncate" data-testid="contact-card-name">{profile.name}</h3>
            {profile.title && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5" data-testid="contact-card-title">
                <Briefcase className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{profile.title}</span>
              </p>
            )}
            {profile.company && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5" data-testid="contact-card-company">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{profile.company}</span>
              </p>
            )}
          </div>
        </div>

        {hasQuickActions && (
          <div className="flex border-t border-border/50">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-opacity hover:opacity-70 active:opacity-50 border-r border-border/50 last:border-r-0"
                data-testid="action-call"
              >
                <Phone className="h-5 w-5 text-green-500" />
                <span className="text-[11px] font-medium text-muted-foreground">Call</span>
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-opacity hover:opacity-70 active:opacity-50 border-r border-border/50 last:border-r-0"
                data-testid="action-whatsapp"
              >
                <MessageCircle className="h-5 w-5 text-green-600" />
                <span className="text-[11px] font-medium text-muted-foreground">WhatsApp</span>
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-opacity hover:opacity-70 active:opacity-50 border-r border-border/50 last:border-r-0"
                data-testid="action-email"
              >
                <Mail className="h-5 w-5 text-blue-500" />
                <span className="text-[11px] font-medium text-muted-foreground">Email</span>
              </a>
            )}
          </div>
        )}
      </div>

      {contactRows.length > 0 && (
        <div className="mt-3 bg-muted/40 rounded-md overflow-hidden border border-border/50">
          {contactRows.map((row, i) => (
            <a
              key={row.testId}
              href={row.href}
              target={row.href.startsWith('http') ? '_blank' : undefined}
              rel={row.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`flex items-center gap-3 px-4 py-3 transition-opacity hover:opacity-70 active:opacity-50 ${i < contactRows.length - 1 ? 'border-b border-border/30' : ''}`}
              data-testid={row.testId}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: row.color }}>
                <row.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">{row.label}</p>
                <p className="text-sm font-medium truncate">{row.value}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <Button 
          size="lg" 
          className="w-full font-semibold shadow-lg"
          onClick={handleSaveContact}
          data-testid="button-save-contact"
        >
          <Download className="mr-2 h-5 w-5" />
          Save to Contacts
        </Button>
        {onClose && (
          <Button 
            variant="ghost" 
            size="lg"
            className="w-full"
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
