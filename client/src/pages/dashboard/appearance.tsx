import { useState, useEffect } from "react";
import { useActiveProfile } from "@/hooks/use-active-profile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Palette, Smartphone, Monitor, AlertCircle } from "lucide-react";
import { THEMES, DEFAULT_THEME_ID, getTheme } from "@/lib/themes";
import type { ProfileBranding, Profile } from "@shared/schema";

// ---------------------------------------------------------------------------
// ThemeProfilePreview
// Renders a realistic profile card styled purely with theme tokens (inline
// styles), so switching themes gives instant visual feedback without touching
// CSS variables scoped to the dashboard's light/dark theme.
// ---------------------------------------------------------------------------
function ThemeProfilePreview({ profile, themeId }: { profile: Profile; themeId: string }) {
  const theme = getTheme(themeId);
  const t = theme.tokens;
  const branding = (profile.branding as ProfileBranding) || {};
  const links = (profile.links as Record<string, string>) || {};

  const photoSrc = profile.photoUrl
    ? profile.photoUrl.startsWith("http") ? profile.photoUrl
      : profile.photoUrl.startsWith("/objects/") ? profile.photoUrl
      : `/objects/${profile.photoUrl}`
    : undefined;

  const contactActions = [
    links.phone && { label: "Call", bg: "#22c55e20", color: "#16a34a" },
    links.whatsapp && { label: "WhatsApp", bg: "#22c55e20", color: "#16a34a" },
    links.sms && { label: "Text", bg: "#3b82f620", color: "#2563eb" },
    links.email && { label: "Email", bg: "#8b5cf620", color: "#7c3aed" },
  ].filter(Boolean);

  const radius = t["--theme-border-radius"];

  return (
    <div
      style={{
        backgroundColor: t["--theme-bg"],
        fontFamily: t["--theme-font-body"],
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px",
      }}
    >
      {/* Card */}
      <div
        style={{
          backgroundColor: t["--theme-surface"],
          borderRadius: "24px",
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: `1px solid ${t["--theme-text-secondary"]}22`,
        }}
      >
        {/* Header gradient */}
        <div
          style={{
            height: 80,
            background: `linear-gradient(135deg, ${t["--theme-accent"]}cc, ${t["--theme-accent"]}66)`,
            position: "relative",
          }}
        />

        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -40, position: "relative", zIndex: 1, paddingBottom: 12 }}>
          <div style={{ padding: 4, backgroundColor: t["--theme-surface"], borderRadius: "50%", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            <Avatar className="h-20 w-20">
              <AvatarImage src={photoSrc} alt={profile.name} className="object-cover" />
              <AvatarFallback style={{ backgroundColor: `${t["--theme-accent"]}22`, color: t["--theme-accent"], fontWeight: 700, fontSize: 28 }}>
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div style={{ textAlign: "center", marginTop: 10, paddingInline: 16 }}>
            <p style={{ fontFamily: t["--theme-font-heading"], fontWeight: 700, fontSize: 18, color: t["--theme-text-primary"], margin: 0 }}>
              {profile.name}
            </p>
            {profile.title && (
              <p style={{ fontSize: 13, color: t["--theme-text-secondary"], marginTop: 2 }}>
                {profile.title}
              </p>
            )}
            {profile.company && (
              <p style={{ fontSize: 12, color: t["--theme-accent"], fontWeight: 600, marginTop: 2 }}>
                {profile.company}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p style={{ fontSize: 12, color: t["--theme-text-secondary"], textAlign: "center", padding: "0 20px 12px", lineHeight: 1.5, margin: 0 }}>
            {profile.bio.length > 120 ? profile.bio.slice(0, 120) + "…" : profile.bio}
          </p>
        )}

        {/* Contact row */}
        {contactActions.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "0 16px 16px" }}>
            {contactActions.slice(0, 4).map((a: any) => (
              <div key={a.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: a.color, opacity: 0.7 }} />
                </div>
                <span style={{ fontSize: 9, color: t["--theme-text-secondary"], textTransform: "uppercase", letterSpacing: "0.05em" }}>{a.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Save Contact button */}
        <div style={{ padding: "0 16px 16px" }}>
          <div
            style={{
              backgroundColor: t["--theme-accent"],
              color: "#fff",
              borderRadius: radius,
              padding: "10px 0",
              textAlign: "center",
              fontSize: 13,
              fontWeight: 600,
              cursor: "default",
            }}
          >
            Save Contact
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AppearancePage
// ---------------------------------------------------------------------------
export default function AppearancePage() {
  const { activeProfile: profile, isLoading, updateProfile } = useActiveProfile();
  const { toast } = useToast();
  const [selectedThemeId, setSelectedThemeId] = useState(DEFAULT_THEME_ID);
  const [savedThemeId, setSavedThemeId] = useState(DEFAULT_THEME_ID);
  const [isSaving, setIsSaving] = useState(false);
  const [viewport, setViewport] = useState<"mobile" | "desktop">("mobile");

  useEffect(() => {
    if (profile) {
      const id = ((profile.branding as ProfileBranding) || {}).selectedThemeId || DEFAULT_THEME_ID;
      setSelectedThemeId(id);
      setSavedThemeId(id);
    }
  }, [profile]);

  const hasChanges = selectedThemeId !== savedThemeId;

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const branding = (profile.branding as ProfileBranding) || {};
      await updateProfile({ branding: { ...branding, selectedThemeId } });
      setSavedThemeId(selectedThemeId);
      toast({ title: "Theme saved", description: `${getTheme(selectedThemeId).name} is now live on your profile.` });
    } catch {
      toast({ title: "Save failed", description: "Could not save your theme. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedTheme = getTheme(selectedThemeId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 md:px-6 pt-6 pb-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Appearance</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pick a theme for your public profile. Preview updates instantly.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasChanges && (
            <span className="flex items-center gap-1 text-xs text-amber-500 font-medium" data-testid="text-unsaved-changes">
              <AlertCircle className="h-3.5 w-3.5" />
              Unsaved changes
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            size="sm"
            data-testid="button-save-theme"
          >
            {isSaving ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</> : "Save Theme"}
          </Button>
        </div>
      </div>

      {/* Body — two columns on lg+ */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

        {/* Left: Theme gallery */}
        <div className="lg:w-72 xl:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-border/50 overflow-y-auto p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Themes</p>
          {THEMES.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedThemeId(theme.id)}
                className={`w-full relative rounded-xl border-2 overflow-hidden text-left transition-all focus:outline-none ${
                  isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                }`}
                data-testid={`theme-card-${theme.id}`}
              >
                {/* Mini colour preview */}
                <div className="h-20 w-full flex flex-col justify-between p-3" style={{ backgroundColor: theme.preview.bg }}>
                  <div className="flex gap-1.5">
                    <div className="h-2 w-16 rounded-full opacity-60" style={{ backgroundColor: theme.tokens["--theme-text-primary"] }} />
                    <div className="h-2 w-10 rounded-full opacity-30" style={{ backgroundColor: theme.tokens["--theme-text-primary"] }} />
                  </div>
                  <div
                    className="h-6 w-full rounded"
                    style={{
                      backgroundColor: theme.preview.accent,
                      borderRadius: theme.tokens["--theme-border-radius"],
                    }}
                  />
                </div>

                <div className="px-3 py-2 bg-card border-t border-border/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{theme.name}</p>
                    <p className="text-[11px] text-muted-foreground">{theme.description}</p>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0 ml-2">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Live preview */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-muted/30">
          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background/60 backdrop-blur-sm shrink-0">
            <p className="text-xs text-muted-foreground">
              Preview — <span className="font-medium text-foreground">{selectedTheme.name}</span>
            </p>
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs transition-colors ${viewport === "mobile" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                data-testid="button-viewport-mobile"
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile
              </button>
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs transition-colors ${viewport === "desktop" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                data-testid="button-viewport-desktop"
              >
                <Monitor className="h-3.5 w-3.5" />
                Desktop
              </button>
            </div>
          </div>

          {/* Preview canvas */}
          <div className="flex-1 overflow-y-auto flex items-start justify-center p-6" style={{ backgroundColor: "#1a1a2e10" }}>
            {profile ? (
              <div
                style={{
                  width: viewport === "mobile" ? 375 : 600,
                  maxWidth: "100%",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
                  transition: "width 0.25s ease",
                }}
                data-testid="preview-container"
              >
                <ThemeProfilePreview profile={profile} themeId={selectedThemeId} />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No profile data available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
