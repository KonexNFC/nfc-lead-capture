import { 
  Briefcase, 
  MapPin, 
  Mail, 
  Link as LinkIcon, 
  Linkedin, 
  Github, 
  Twitter, 
  Instagram,
  Globe
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Profile } from "@shared/schema";

interface ProfilePreviewProps {
  profile: Profile;
  mock?: boolean;
}

export function ProfilePreview({ profile, mock }: ProfilePreviewProps) {
  const socialIcons: Record<string, any> = {
    linkedin: Linkedin,
    github: Github,
    twitter: Twitter,
    instagram: Instagram,
    website: Globe,
    email: Mail,
    snapchat: Globe,
    tiktok: Globe,
    youtube: Globe
  };

  const links = (profile.links as Record<string, string>) || {};

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000">
      <Card className={`
        relative overflow-hidden bg-background border-border/50 shadow-2xl 
        rounded-[2rem] h-[600px] flex flex-col
        ${mock ? 'scale-90 opacity-90' : 'transform-gpu transition-transform hover:scale-[1.01]'}
      `}>
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-br from-primary via-accent to-purple-500 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:10px_10px]" />
        </div>

        {/* Profile Content */}
        <div className="px-6 flex-1 flex flex-col items-center -mt-16 relative z-10">
          <div className="p-1.5 bg-background rounded-full shadow-lg mb-4">
            <Avatar className="h-28 w-28 border-2 border-primary/10">
              <AvatarImage 
                src={profile.photoUrl ? (profile.photoUrl.startsWith('http') ? profile.photoUrl : `/objects/uploads/${profile.photoUrl}`) : undefined} 
                alt={profile.name} 
                className="object-cover" 
              />
              <AvatarFallback className="text-2xl bg-secondary font-display font-bold text-primary">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center space-y-1 mb-6">
            <h2 className="text-2xl font-bold font-display text-foreground">{profile.name}</h2>
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm font-medium">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{profile.title}</span>
            </div>
            {profile.company && (
              <p className="text-sm text-primary font-medium">{profile.company}</p>
            )}
          </div>

          <div className="w-full space-y-3 flex-1 overflow-y-auto pb-6 scrollbar-hide">
            {profile.bio && (
              <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed px-2">
                {profile.bio}
              </p>
            )}

            <div className="grid grid-cols-4 gap-3 px-2">
              {Object.entries(links).map(([key, value]) => {
                if (!value) return null;
                const Icon = socialIcons[key] || LinkIcon;
                
                // Construct href based on type
                let href = value;
                if (key === 'email' && !value.startsWith('mailto:')) href = `mailto:${value}`;
                else if (key !== 'email' && !value.startsWith('http')) href = `https://${value}`;

                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25 group-hover:-translate-y-1">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{key}</span>
                  </a>
                );
              })}
            </div>
          </div>
          
          <div className="w-full pb-6 pt-2">
            <Button className="w-full rounded-xl h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30" size="lg">
              Save Contact
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
