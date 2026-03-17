import { useState, useEffect } from "react";
import { useActiveProfile } from "@/hooks/use-active-profile";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Check, Palette, Smartphone, Monitor,
  AlertCircle, BookOpen, Globe, RotateCcw, Lock, Sparkles
} from "lucide-react";
import { THEMES, DEFAULT_THEME_ID, getTheme } from "@/lib/themes";
import { useUserPlan, isPlanAtLeast } from "@/lib/plan";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import type { ProfileBranding, Profile } from "@shared/schema";

// ---------------------------------------------------------------------------
// ThemeProfilePreview — renders a styled profile card with theme tokens
// directly as inline styles so switching themes gives instant feedback.
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
        <div
          style={{
            height: 80,
            background: `linear-gradient(135deg, ${t["--theme-accent"]}cc, ${t["--theme-accent"]}66)`,
          }}
        />
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
              <p style={{ fontSize: 13, color: t["--theme-text-secondary"], marginTop: 2 }}>{profile.title}</p>
            )}
            {profile.company && (
              <p style={{ fontSize: 12, color: t["--theme-accent"], fontWeight: 600, marginTop: 2 }}>{profile.company}</p>
            )}
          </div>
        </div>

        {profile.bio && (
          <p style={{ fontSize: 12, color: t["--theme-text-secondary"], textAlign: "center", padding: "0 20px 12px", lineHeight: 1.5, margin: 0 }}>
            {profile.bio.length > 120 ? profile.bio.slice(0, 120) + "…" : profile.bio}
          </p>
        )}

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
// StatusBadge — small inline indicator shown in the header
// ---------------------------------------------------------------------------
type StatusKind = "unsaved" | "draft_ready" | "live";
function StatusBadge({ kind }: { kind: StatusKind }) {
  if (kind === "unsaved") {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-500 font-medium" data-testid="text-unsaved-changes">
        <AlertCircle className="h-3.5 w-3.5" />
        Unsaved changes
      </span>
    );
  }
  if (kind === "draft_ready") {
    return (
      <span className="flex items-center gap-1 text-xs text-blue-500 font-medium" data-testid="text-draft-ready">
        <BookOpen className="h-3.5 w-3.5" />
        Draft saved — not yet published
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-green-500 font-medium" data-testid="text-status-live">
      <Globe className="h-3.5 w-3.5" />
      Live
    </span>
  );
}

// ---------------------------------------------------------------------------
// AppearancePage
// ---------------------------------------------------------------------------
export default function AppearancePage() {
  const { activeProfile: profile, isLoading } = useActiveProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // workingId: what the user has selected in the UI right now (preview uses this)
  const [workingId, setWorkingId] = useState(DEFAULT_THEME_ID);
  // draftId: last saved draft (branding.themeDraft) — undefined/null if none
  const [draftId, setDraftId] = useState<string | null>(null);
  // liveId: published theme (branding.selectedThemeId) — what the public profile shows
  const [liveId, setLiveId] = useState(DEFAULT_THEME_ID);

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [viewport, setViewport] = useState<"mobile" | "desktop">("mobile");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [lockedThemeName, setLockedThemeName] = useState("");

  const userPlan = useUserPlan();

  const handleThemeSelect = (themeId: string) => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (!theme) return;
    if (!isPlanAtLeast(userPlan, theme.plan)) {
      setLockedThemeName(theme.name);
      setUpgradeModalOpen(true);
      return;
    }
    setWorkingId(themeId);
  };

  useEffect(() => {
    if (profile) {
      const b = (profile.branding as ProfileBranding) || {};
      const published = b.selectedThemeId || DEFAULT_THEME_ID;
      const draft = b.themeDraft || null;
      setLiveId(published);
      setDraftId(draft);
      setWorkingId(draft ?? published);
    }
  }, [profile]);

  // Derived status
  const lastSavePoint = draftId ?? liveId;
  const hasUnsaved = workingId !== lastSavePoint;
  const draftAheadOfLive = !!draftId && draftId !== liveId;
  const status: StatusKind = hasUnsaved ? "unsaved" : draftAheadOfLive ? "draft_ready" : "live";

  const canSaveDraft = hasUnsaved && workingId !== liveId;
  const canPublish = workingId !== liveId || draftAheadOfLive;
  const canReset = workingId !== liveId || !!draftId;

  const callUpdate = async (data: Record<string, unknown>) => {
    await apiRequest("PUT", `/api/profiles/${profile!.id}`, data);
    queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
  };

  // Save Draft — persists themeDraft without touching selectedThemeId
  const handleSaveDraft = async () => {
    if (!profile) return;
    setIsSavingDraft(true);
    try {
      const b = (profile.branding as ProfileBranding) || {};
      await callUpdate({ branding: { ...b, themeDraft: workingId } });
      setDraftId(workingId);
      toast({ title: "Draft saved", description: `${getTheme(workingId).name} saved as draft. Publish when you're ready.` });
    } catch {
      toast({ title: "Save failed", description: "Could not save draft. Please try again.", variant: "destructive" });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Publish — pushes working theme to selectedThemeId, clears themeDraft
  const handlePublish = async () => {
    if (!profile) return;
    setIsPublishing(true);
    try {
      const b = (profile.branding as ProfileBranding) || {};
      const themeToPublish = workingId;
      await callUpdate({
        branding: {
          ...b,
          selectedThemeId: themeToPublish,
          themeDraft: undefined,
          themePublishedAt: new Date().toISOString(),
        },
      });
      setLiveId(themeToPublish);
      setDraftId(null);
      setWorkingId(themeToPublish);
      toast({ title: "Published", description: `${getTheme(themeToPublish).name} is now live on your public profile.` });
    } catch {
      toast({ title: "Publish failed", description: "Could not publish. Please try again.", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  // Reset — discards working + saved draft, reverts to live
  const handleReset = async () => {
    if (!profile) return;
    setWorkingId(liveId);
    if (draftId) {
      setIsResetting(true);
      try {
        const b = (profile.branding as ProfileBranding) || {};
        await callUpdate({ branding: { ...b, themeDraft: undefined } });
        setDraftId(null);
        toast({ title: "Reset", description: "Draft discarded. Showing your published theme." });
      } catch {
        toast({ title: "Reset failed", description: "Could not discard draft.", variant: "destructive" });
      } finally {
        setIsResetting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedTheme = getTheme(workingId);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-4 md:px-6 pt-6 pb-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">Appearance</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Design your public profile. Save a draft to refine, publish when ready.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <StatusBadge kind={status} />

            {canReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isResetting}
                data-testid="button-reset-theme"
              >
                {isResetting
                  ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  : <RotateCcw className="h-3.5 w-3.5 mr-1" />
                }
                Reset
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || !canSaveDraft}
              data-testid="button-save-draft"
            >
              {isSavingDraft
                ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
                : <><BookOpen className="h-3.5 w-3.5 mr-1.5" />Save Draft</>
              }
            </Button>

            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing || !canPublish}
              data-testid="button-publish-theme"
            >
              {isPublishing
                ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Publishing…</>
                : <><Globe className="h-3.5 w-3.5 mr-1.5" />Publish</>
              }
            </Button>
          </div>
        </div>

        {/* Live theme indicator */}
        <p className="text-xs text-muted-foreground mt-2">
          Currently live:{" "}
          <span className="font-medium text-foreground">{getTheme(liveId).name}</span>
          {draftId && draftId !== liveId && (
            <span className="ml-2 text-blue-500">
              · Draft: {getTheme(draftId).name}
            </span>
          )}
        </p>
      </div>

      {/* ── Body — two columns on lg+ ── */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

        {/* Left: Theme gallery */}
        <div className="lg:w-72 xl:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-border/50 overflow-y-auto p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Themes</p>
          {THEMES.map((theme) => {
            const isWorking = workingId === theme.id;
            const isDraft = draftId === theme.id;
            const isLive = liveId === theme.id;
            const isLocked = !isPlanAtLeast(userPlan, theme.plan);
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleThemeSelect(theme.id)}
                className={`w-full relative rounded-xl border-2 overflow-hidden text-left transition-all focus:outline-none ${
                  isLocked
                    ? "border-border opacity-80 cursor-pointer"
                    : isWorking
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
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
                    className="h-6 w-full"
                    style={{ backgroundColor: theme.preview.accent, borderRadius: theme.tokens["--theme-border-radius"] }}
                  />
                  {/* Lock overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 h-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                      <div className="flex items-center gap-1.5 bg-background/90 border border-border rounded-full px-2.5 py-1 shadow-sm">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Pro</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-3 py-2 bg-card border-t border-border/40 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{theme.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{theme.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {isLocked && (
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                        Pro
                      </span>
                    )}
                    {!isLocked && isLive && !isDraft && (
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                        Live
                      </span>
                    )}
                    {!isLocked && isDraft && !isLive && (
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                    {!isLocked && isWorking && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
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
              {workingId !== liveId && (
                <span className="ml-1.5 text-amber-500">(draft)</span>
              )}
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
                <ThemeProfilePreview profile={profile} themeId={workingId} />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No profile data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md" data-testid="modal-upgrade">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <DialogTitle>Unlock Premium Themes</DialogTitle>
            </div>
            <DialogDescription className="text-sm leading-relaxed">
              <strong className="text-foreground">{lockedThemeName}</strong> is a Pro theme.
              Upgrade your plan to access premium themes, advanced customisation, and more — and make your profile truly stand out.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              className="flex-1"
              onClick={() => { setUpgradeModalOpen(false); window.location.href = "/konex-cards"; }}
              data-testid="button-upgrade-plan"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Upgrade plan
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setUpgradeModalOpen(false)}
              data-testid="button-upgrade-later"
            >
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
