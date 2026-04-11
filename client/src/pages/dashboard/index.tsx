import { useActiveProfile } from "@/hooks/use-active-profile";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { QRCodeSVG } from "qrcode.react";
import { 
  ArrowRight, 
  Users, 
  Share2, 
  Edit3, 
  ExternalLink, 
  Download,
  Copy,
  Eye,
  Nfc,
  CreditCard,
  CheckCircle2,
  Circle,
  X,
  Camera,
  Briefcase,
  Phone,
  Link2,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Card as CardType, Lead, Profile } from "@shared/schema";
import { useState } from "react";

// ─── Profile Completion ────────────────────────────────────────────────────────

interface CompletionStep {
  key: string;
  label: string;
  done: boolean;
  href: string;
  icon: React.ReactNode;
  points: number;
}

function getCompletionSteps(profile: Profile): CompletionStep[] {
  const links = (profile.links || {}) as Record<string, string>;
  const hasContact = !!(links.phone || links.email || links.whatsapp);
  const hasSocial = !!(links.linkedin || links.instagram || links.twitter || links.x || links.facebook || links.tiktok || links.youtube || links.github);

  return [
    { key: "photo",   label: "Add a profile photo",        done: !!profile.photoUrl,  href: "/dashboard/edit",       icon: <Camera className="h-4 w-4" />,    points: 20 },
    { key: "title",   label: "Add your job title",          done: !!profile.title,     href: "/dashboard/edit",       icon: <Briefcase className="h-4 w-4" />, points: 15 },
    { key: "company", label: "Add your company name",       done: !!profile.company,   href: "/dashboard/edit",       icon: <Briefcase className="h-4 w-4" />, points: 10 },
    { key: "bio",     label: "Write a short bio",           done: !!profile.bio,       href: "/dashboard/edit",       icon: <Edit3 className="h-4 w-4" />,     points: 15 },
    { key: "contact", label: "Add a contact link",          done: hasContact,          href: "/dashboard/edit",       icon: <Phone className="h-4 w-4" />,     points: 20 },
    { key: "social",  label: "Connect a social profile",    done: hasSocial,           href: "/dashboard/edit",       icon: <Link2 className="h-4 w-4" />,     points: 10 },
    { key: "appear",  label: "Customise your appearance",   done: !!(profile.branding?.selectedThemeId || profile.branding?.primaryColor), href: "/dashboard/appearance", icon: <Sparkles className="h-4 w-4" />, points: 10 },
  ];
}

function getCompletionScore(steps: CompletionStep[]): number {
  return steps.filter((s) => s.done).reduce((sum, s) => sum + s.points, 0);
}

// ─── Onboarding Checklist Card ─────────────────────────────────────────────────

function OnboardingChecklist({ profile }: { profile: Profile }) {
  const STORAGE_KEY = `konex-onboarding-dismissed-${profile.id}`;
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
  });

  const steps = getCompletionSteps(profile);
  const score = getCompletionScore(steps);
  const allDone = score === 100;

  if (dismissed) return null;

  const handleDismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setDismissed(true);
  };

  return (
    <Card className="border-border/50 shadow-sm" data-testid="card-onboarding">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">
              {allDone ? "Profile complete! 🎉" : "Get started with KONEX"}
            </CardTitle>
            <CardDescription className="mt-1">
              {allDone
                ? "Your profile is fully set up and ready to impress."
                : `${score}% complete — finish setting up your profile to make the best impression.`}
            </CardDescription>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
            data-testid="button-dismiss-onboarding"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Progress value={score} className="h-1.5 mt-3" />
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-2">
          {steps.map((step) => (
            <Link key={step.key} href={step.done ? "#" : step.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  step.done
                    ? "opacity-50 cursor-default"
                    : "hover:bg-muted/50 cursor-pointer"
                }`}
                data-testid={`onboarding-step-${step.key}`}
              >
                {step.done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className={step.done ? "line-through text-muted-foreground" : "text-foreground"}>
                  {step.label}
                </span>
                {!step.done && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Completion Score Card ─────────────────────────────────────────────────────

function CompletionScoreCard({ profile }: { profile: Profile }) {
  const steps = getCompletionSteps(profile);
  const score = getCompletionScore(steps);
  const remaining = steps.filter((s) => !s.done);

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow" data-testid="card-completion-score">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="text-sm font-medium">Profile Score</CardTitle>
        <div
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            score === 100
              ? "bg-green-500/15 text-green-400"
              : score >= 60
              ? "bg-blue-500/15 text-blue-400"
              : "bg-amber-500/15 text-amber-400"
          }`}
        >
          {score === 100 ? "Complete" : score >= 60 ? "Good" : "Starter"}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">{score}%</div>
        <Progress value={score} className="h-1.5 mb-3" />
        {remaining.length > 0 ? (
          <Link href="/dashboard/edit">
            <p className="text-xs text-primary hover:underline flex items-center">
              {remaining.length} step{remaining.length !== 1 ? "s" : ""} remaining
              <ArrowRight className="h-3 w-3 ml-1" />
            </p>
          </Link>
        ) : (
          <p className="text-xs text-green-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> All steps complete
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { activeProfile: profile, isLoading: profileLoading } = useActiveProfile();
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads", profile?.id],
    queryFn: async () => {
      const url = profile?.id ? `/api/leads?profileId=${profile.id}` : "/api/leads";
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!profile,
  });
  const { data: userCards } = useQuery<CardType[]>({
    queryKey: ["/api/cards/my"],
  });
  const { toast } = useToast();

  const totalNfcTaps = userCards?.reduce((sum, c) => sum + (c.tapCount || 0), 0) || 0;
  const activeCards = userCards?.filter(c => c.status === "active").length || 0;

  if (profileLoading || leadsLoading) {
    return <DashboardSkeleton />;
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Edit3 className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold font-display">Let's set up your profile</h2>
          <p className="text-muted-foreground">You haven't created your digital business card yet. Create one now to start sharing.</p>
        </div>
        <Link href="/dashboard/edit?new=1">
          <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">Create Profile</Button>
        </Link>
      </div>
    );
  }

  const profileUrl = `https://konexnfc.com/u/${profile.slug}`;
  const recentLeads = leads?.slice(0, 5) || [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({ title: "Copied!", description: "Profile link copied to clipboard." });
  };

  const handleDownloadQr = () => {
    const svg = document.getElementById("qr-code");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${profile.slug}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            <AvatarImage 
              src={profile.photoUrl ? (
                profile.photoUrl.startsWith('http') ? profile.photoUrl : 
                profile.photoUrl.startsWith('/objects/') ? profile.photoUrl :
                `/objects/${profile.photoUrl}`
              ) : undefined} 
              alt={profile.name}
              className="object-cover" 
            />
            <AvatarFallback className="text-xl bg-secondary font-display font-bold text-primary">
              {profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile.name}.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleCopyLink} data-testid="button-copy-link">
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Link href={`/u/${profile.slug}`}>
            <Button data-testid="button-view-card">
              View Public Card
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist profile={profile} />

      {/* Stat Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Profile Views */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.views || 0}</div>
            <p className="text-xs text-muted-foreground">Total profile taps</p>
          </CardContent>
        </Card>

        {/* Leads */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Contacts captured</p>
            <div className="mt-4 pt-4 border-t border-border/50">
              <Link href="/dashboard/leads" className="text-sm text-primary hover:underline flex items-center">
                View all leads <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Your QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="bg-white p-2 rounded-lg border">
              <QRCodeSVG 
                id="qr-code"
                value={profileUrl} 
                size={80}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-tight">
                Scan to view profile.<br/>Good for print & display.
              </p>
              <Button size="sm" variant="secondary" onClick={handleDownloadQr} data-testid="button-download-qr">
                <Download className="h-3 w-3 mr-2" />
                Download PNG
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* NFC Taps */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">NFC Taps</CardTitle>
            <Nfc className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-nfc-taps">{totalNfcTaps}</div>
            <p className="text-xs text-muted-foreground">Total card taps</p>
            <div className="mt-4 pt-4 border-t border-border/50">
              <Link href="/dashboard/cards" className="text-sm text-primary hover:underline flex items-center">
                {activeCards} active card{activeCards !== 1 ? "s" : ""} <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion Score */}
        <CompletionScoreCard profile={profile} />
      </div>

      {/* Recent Leads */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>People who shared their info with you recently.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Share2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No leads yet. Share your card to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead: Lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50" data-testid={`row-lead-${lead.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.company || lead.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(lead.createdAt!).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
