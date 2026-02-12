import { useMyProfile } from "@/hooks/use-profiles";
import { useLeads } from "@/hooks/use-leads";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeSVG } from "qrcode.react";
import { 
  ArrowRight, 
  Users, 
  Share2, 
  Edit3, 
  ExternalLink, 
  Download,
  Copy,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { toast } = useToast();

  if (profileLoading || leadsLoading) {
    return <DashboardSkeleton />;
  }

  // If no profile, prompt to create one
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
        <Link href="/dashboard/edit">
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
          <Button variant="outline" onClick={handleCopyLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Link href={`/u/${profile.slug}`}>
            <Button>
              View Public Card
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Profile Views Card */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.views || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total profile taps
            </p>
          </CardContent>
        </Card>

        {/* Leads Card */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Contacts captured
            </p>
            <div className="mt-4 pt-4 border-t border-border/50">
              <Link href="/dashboard/leads" className="text-sm text-primary hover:underline flex items-center">
                View all leads <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Card */}
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
              <Button size="sm" variant="secondary" onClick={handleDownloadQr}>
                <Download className="h-3 w-3 mr-2" />
                Download PNG
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Status Card */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
            <div className={`h-2 w-2 rounded-full ${profile ? 'bg-green-500' : 'bg-yellow-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate mb-1">{profile.title || "No Title"}</div>
            <p className="text-sm text-muted-foreground truncate mb-4">{profile.company || "No Company"}</p>
            <Link href="/dashboard/edit">
              <Button variant="outline" size="sm" className="w-full">
                <Edit3 className="h-3 w-3 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
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
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
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
