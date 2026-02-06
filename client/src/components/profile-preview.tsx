import { 
  Briefcase
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Profile } from "@shared/schema";

interface ProfilePreviewProps {
  profile: Profile;
  mock?: boolean;
  onSaveContact?: () => void;
}

export function ProfilePreview({ profile, mock, onSaveContact }: ProfilePreviewProps) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className={`
        relative overflow-hidden bg-background border-border/50 shadow-2xl 
        rounded-[2rem] flex flex-col
        ${mock ? 'scale-90 opacity-90' : ''}
      `}>
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-br from-primary via-accent to-purple-500 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:10px_10px]" />
        </div>

        {/* Profile Content */}
        <div className="px-6 flex-1 flex flex-col items-center -mt-16 relative z-10 pb-6">
          <div className="p-1.5 bg-background rounded-full shadow-lg mb-4">
            <Avatar className="h-28 w-28 border-2 border-primary/10">
              <AvatarImage 
                src={profile.photoUrl ? (
                  profile.photoUrl.startsWith('http') ? profile.photoUrl : 
                  profile.photoUrl.startsWith('/objects/') ? profile.photoUrl :
                  `/objects/${profile.photoUrl}`
                ) : undefined} 
                alt={profile.name} 
                className="object-cover" 
              />
              <AvatarFallback className="text-2xl bg-secondary font-display font-bold text-primary" data-testid="avatar-fallback">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center space-y-1 mb-4">
            <h2 className="text-2xl font-bold font-display text-foreground" data-testid="text-profile-name">{profile.name}</h2>
            {profile.company && (
              <p className="text-sm text-primary font-medium" data-testid="text-profile-company">{profile.company}</p>
            )}
            {profile.title && (
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm font-medium">
                <Briefcase className="h-3.5 w-3.5" />
                <span data-testid="text-profile-title">{profile.title}</span>
              </div>
            )}
          </div>

          {/* Exchange Contact Button */}
          {onSaveContact && (
            <div className="w-full mb-4">
              <Button 
                className="w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/20" 
                size="lg"
                onClick={onSaveContact}
                data-testid="button-exchange-contact"
              >
                Exchange Contact
              </Button>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground text-center leading-relaxed px-2" data-testid="text-profile-bio">
              {profile.bio}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
