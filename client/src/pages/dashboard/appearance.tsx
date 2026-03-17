import { useState, useEffect } from "react";
import { useActiveProfile } from "@/hooks/use-active-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Palette } from "lucide-react";
import { THEMES, DEFAULT_THEME_ID, getTheme } from "@/lib/themes";
import type { ProfileBranding } from "@shared/schema";

export default function AppearancePage() {
  const { activeProfile: profile, isLoading, updateProfile } = useActiveProfile();
  const { toast } = useToast();
  const [selectedThemeId, setSelectedThemeId] = useState(DEFAULT_THEME_ID);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const branding = (profile.branding as ProfileBranding) || {};
      setSelectedThemeId(branding.selectedThemeId || DEFAULT_THEME_ID);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const branding = (profile.branding as ProfileBranding) || {};
      await updateProfile({ branding: { ...branding, selectedThemeId } });
      toast({ title: "Saved", description: "Theme applied to your profile." });
    } catch {
      toast({ title: "Error", description: "Failed to save theme.", variant: "destructive" });
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

  const currentTheme = getTheme(selectedThemeId);
  const hasChanges = profile
    ? selectedThemeId !== (((profile.branding as ProfileBranding) || {}).selectedThemeId || DEFAULT_THEME_ID)
    : false;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose a theme for your public profile. More customisation options coming soon.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {THEMES.map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedThemeId(theme.id)}
              className={`relative rounded-xl border-2 overflow-hidden text-left transition-all focus:outline-none ${
                isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"
              }`}
              data-testid={`theme-card-${theme.id}`}
            >
              {/* Mini preview */}
              <div
                className="h-28 w-full flex flex-col gap-1.5 p-3"
                style={{ backgroundColor: theme.preview.bg }}
              >
                <div className="h-2.5 w-2/3 rounded-full" style={{ backgroundColor: theme.preview.surface === theme.preview.bg ? "#e5e7eb" : theme.preview.surface }} />
                <div className="h-2 w-1/2 rounded-full opacity-60" style={{ backgroundColor: theme.preview.surface === theme.preview.bg ? "#e5e7eb" : theme.preview.surface }} />
                <div className="mt-auto flex gap-1">
                  <div
                    className="h-5 flex-1 rounded"
                    style={{
                      backgroundColor: theme.preview.accent,
                      borderRadius: theme.tokens["--theme-border-radius"],
                    }}
                  />
                </div>
              </div>

              {/* Label */}
              <div className="px-3 py-2 border-t border-border bg-card">
                <p className="text-xs font-semibold text-foreground">{theme.name}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{theme.description}</p>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          data-testid="button-save-theme"
        >
          {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save Theme"}
        </Button>
        {!hasChanges && !isSaving && (
          <p className="text-xs text-muted-foreground">
            Currently using: <span className="font-medium">{currentTheme.name}</span>
          </p>
        )}
      </div>
    </div>
  );
}
