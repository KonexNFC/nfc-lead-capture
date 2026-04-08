import { useState, useEffect } from "react";
import { useActiveProfile } from "@/hooks/use-active-profile";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Check, Palette, Smartphone, Monitor,
  AlertCircle, BookOpen, Globe, RotateCcw, Lock, Sparkles, Settings2, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  THEMES, DEFAULT_THEME_ID, getTheme, resolveCustomizations, buildThemeCssVars,
  type ThemeCustomizations, type ButtonStyle, type CardRadius,
  type FontStyle, type AvatarShape, type SectionDivider, type IconStyle,
  type BackgroundStyle, type ThemeConfig,
} from "@/lib/themes";
import { useUserPlan, isPlanAtLeast } from "@/lib/plan";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProfilePreview } from "@/components/profile-preview";
import type { ProfileBranding, Profile } from "@shared/schema";

// ─── Mini profile card thumbnail ─────────────────────────────────────────────

function ThemeCardThumbnail({ theme }: { theme: ThemeConfig }) {
  const { bg, accent, surface } = theme.preview;
  const textPrimary = theme.tokens["--theme-text-primary"];
  const textSec = theme.tokens["--theme-text-secondary"];
  const borderRadius = theme.tokens["--theme-border-radius"];
  const isLight = bg.startsWith("#f") || bg.startsWith("#e") || bg === "#ffffff";

  return (
    <div className="relative h-[120px] w-full overflow-hidden" style={{ backgroundColor: bg }}>
      {/* Ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${accent}35 0%, transparent 65%)`,
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center pt-4 px-4 gap-2">

        {/* Avatar ring */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${accent}cc 0%, ${accent}55 100%)`,
            border: `2px solid ${accent}`,
            boxShadow: `0 0 14px ${accent}50, 0 2px 8px rgba(0,0,0,0.25)`,
            flexShrink: 0,
          }}
        />

        {/* Name + title */}
        <div className="flex flex-col items-center gap-1">
          <div style={{ width: 68, height: 6, borderRadius: 99, backgroundColor: textPrimary, opacity: 0.8 }} />
          <div style={{ width: 48, height: 4, borderRadius: 99, backgroundColor: textSec, opacity: 0.45 }} />
        </div>

        {/* Social icons row */}
        <div className="flex items-center gap-2 mt-0.5">
          {[1, 0.65, 0.65, 0.65].map((op, i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundColor: `${accent}`,
                opacity: op,
                border: `1px solid ${accent}70`,
              }}
            />
          ))}
        </div>

        {/* CTA button */}
        <div
          style={{
            width: 80,
            height: 16,
            borderRadius,
            backgroundColor: accent,
            opacity: 0.95,
          }}
        />
      </div>

      {/* Light surface card watermark at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-6"
        style={{
          background: `linear-gradient(to top, ${surface}90, transparent)`,
        }}
      />
    </div>
  );
}

// ─── Themed preview wrapper ───────────────────────────────────────────────────

function ThemedPreviewWrapper({
  profile,
  themeId,
  customizations,
}: {
  profile: Profile;
  themeId: string;
  customizations: ThemeCustomizations;
}) {
  const theme = getTheme(themeId);
  const c = resolveCustomizations(theme, customizations);
  const cssVars = buildThemeCssVars(themeId, customizations);

  return (
    <div
      style={{
        ...cssVars,
        backgroundColor: theme.tokens["--theme-bg"],
        color: theme.tokens["--theme-text-primary"],
        minHeight: "100%",
        padding: "16px",
      }}
    >
      <ProfilePreview
        profile={profile}
        layoutVariant={c.layoutVariant}
        themeCustomizations={customizations}
        themeId={themeId}
      />
    </div>
  );
}

// ─── Option chips ─────────────────────────────────────────────────────────────

function OptionChips<T extends string>({
  label,
  value,
  options,
  onChange,
  renderOption,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; [k: string]: any }[];
  onChange: (v: T) => void;
  renderOption?: (opt: { value: T; label: string; [k: string]: any }) => React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium transition-all ${
              value === opt.value
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground bg-card/40"
            }`}
            data-testid={`customization-${label.toLowerCase().replace(/\s+/g, "-")}-${opt.value}`}
          >
            {renderOption ? renderOption(opt) : opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function CustomSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/40 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-card/60 hover:bg-card/90 transition-colors"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="px-3.5 py-3.5 space-y-4 bg-background/40">{children}</div>}
    </div>
  );
}

// ─── Customization controls ───────────────────────────────────────────────────

const BUTTON_STYLE_OPTIONS: { value: ButtonStyle; label: string }[] = [
  { value: "filled",  label: "Filled" },
  { value: "outline", label: "Outline" },
  { value: "pill",    label: "Pill" },
];
const CARD_RADIUS_OPTIONS: { value: CardRadius; label: string }[] = [
  { value: "sharp",   label: "Sharp" },
  { value: "soft",    label: "Soft" },
  { value: "rounded", label: "Rounded" },
];
const FONT_STYLE_OPTIONS: { value: FontStyle; label: string; sample: string }[] = [
  { value: "modern",  label: "Modern",  sample: "Inter" },
  { value: "elegant", label: "Elegant", sample: "Georgia" },
  { value: "bold",    label: "Bold",    sample: "Helvetica" },
];
const AVATAR_SHAPE_OPTIONS: { value: AvatarShape; label: string; radius: string }[] = [
  { value: "circle",   label: "Circle",   radius: "50%" },
  { value: "squircle", label: "Squircle", radius: "22%" },
  { value: "square",   label: "Square",   radius: "6px" },
];
const DIVIDER_OPTIONS: { value: SectionDivider; label: string }[] = [
  { value: "none",     label: "None" },
  { value: "line",     label: "Line" },
  { value: "gradient", label: "Gradient" },
];
const ICON_STYLE_OPTIONS: { value: IconStyle; label: string }[] = [
  { value: "solid",   label: "Solid" },
  { value: "outline", label: "Outline" },
  { value: "ghost",   label: "Ghost" },
];
const BG_STYLE_OPTIONS: { value: BackgroundStyle; label: string }[] = [
  { value: "flat",     label: "Flat" },
  { value: "gradient", label: "Gradient" },
  { value: "pattern",  label: "Pattern" },
];

const ACCENT_PRESETS = ["#1a56db","#c084fc","#c9a84c","#38bdf8","#ef4444","#22c55e","#f59e0b","#ec4899"];

function CustomizationPanel({
  themeId,
  customizations,
  onChange,
}: {
  themeId: string;
  customizations: ThemeCustomizations;
  onChange: (updated: ThemeCustomizations) => void;
}) {
  const theme = getTheme(themeId);
  const c = resolveCustomizations(theme, customizations);
  const accent = c.accentColor || theme.tokens["--theme-accent"];

  const update = <K extends keyof ThemeCustomizations>(key: K, val: ThemeCustomizations[K]) =>
    onChange({ ...customizations, [key]: val });

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 px-0.5 pb-0.5">
        <Settings2 className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-foreground/70">Customise</p>
      </div>

      {/* Colours */}
      <CustomSection title="Colours">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Accent colour</p>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <input
                type="color"
                value={accent}
                onChange={(e) => update("accentColor", e.target.value)}
                className="h-9 w-14 rounded-lg border border-border/60 cursor-pointer bg-transparent p-0.5"
                data-testid="customization-accent-color"
              />
            </div>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">{accent}</span>
            </div>
            <button
              type="button"
              onClick={() => update("accentColor", theme.defaultCustomizations.accentColor)}
              className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0"
            >
              Reset
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {ACCENT_PRESETS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => update("accentColor", col)}
                title={col}
                className="transition-transform hover:scale-125 focus:outline-none"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  backgroundColor: col,
                  border: accent === col ? "3px solid white" : "2px solid transparent",
                  outline: accent === col ? `2px solid ${col}` : "none",
                  boxShadow: accent === col ? `0 0 0 1px ${col}` : "none",
                }}
                data-testid={`accent-preset-${col.replace("#","")}`}
              />
            ))}
          </div>
        </div>

        <OptionChips
          label="Background style"
          value={c.backgroundStyle}
          options={BG_STYLE_OPTIONS}
          onChange={(v) => update("backgroundStyle", v)}
        />
      </CustomSection>

      {/* Typography */}
      <CustomSection title="Typography">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Font style</p>
          <div className="grid grid-cols-3 gap-1.5">
            {FONT_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("fontStyle", opt.value)}
                className={`py-3 rounded-xl border-2 text-center transition-all ${
                  c.fontStyle === opt.value
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/40 bg-card/40"
                }`}
                data-testid={`customization-font-style-${opt.value}`}
              >
                <span
                  className="block text-base font-semibold"
                  style={{
                    color: c.fontStyle === opt.value ? accent : undefined,
                    fontFamily:
                      opt.sample === "Georgia" ? "Georgia, serif"
                      : opt.sample === "Helvetica" ? "'Helvetica Neue', sans-serif"
                      : "Inter, sans-serif",
                  }}
                >
                  Aa
                </span>
                <span className="block text-[10px] mt-0.5 text-muted-foreground font-normal">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </CustomSection>

      {/* Layout */}
      <CustomSection title="Layout">
        {/* Button style */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Button shape</p>
          <div className="flex gap-2">
            {BUTTON_STYLE_OPTIONS.map((opt) => {
              const isActive = c.buttonStyle === opt.value;
              const radius = opt.value === "pill" ? "999px" : c.cardRadius === "sharp" ? "4px" : "8px";
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("buttonStyle", opt.value)}
                  className={`flex-1 py-2.5 text-[11px] font-semibold transition-all border-2 ${
                    isActive ? "border-primary" : "border-border/50 hover:border-primary/40 bg-card/40"
                  }`}
                  style={{
                    borderRadius: radius,
                    backgroundColor: isActive ? `${accent}18` : undefined,
                    color: isActive ? accent : undefined,
                  }}
                  data-testid={`customization-button-style-${opt.value}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo shape */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Photo shape</p>
          <div className="flex gap-2">
            {AVATAR_SHAPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("avatarShape", opt.value)}
                className={`flex-1 py-3 flex flex-col items-center gap-2 border-2 rounded-xl transition-all ${
                  c.avatarShape === opt.value ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/40 bg-card/40"
                }`}
                data-testid={`customization-avatar-shape-${opt.value}`}
              >
                <div
                  className="h-7 w-7"
                  style={{
                    borderRadius: opt.radius,
                    background: c.avatarShape === opt.value
                      ? `linear-gradient(135deg, ${accent}cc, ${accent}55)`
                      : "hsl(var(--muted-foreground)/0.3)",
                  }}
                />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <OptionChips
          label="Card radius"
          value={c.cardRadius}
          options={CARD_RADIUS_OPTIONS}
          onChange={(v) => update("cardRadius", v)}
        />
      </CustomSection>

      {/* Details */}
      <CustomSection title="Details" defaultOpen={false}>
        <OptionChips
          label="Section dividers"
          value={c.sectionDivider}
          options={DIVIDER_OPTIONS}
          onChange={(v) => update("sectionDivider", v)}
        />
        <OptionChips
          label="Icon style"
          value={c.iconStyle}
          options={ICON_STYLE_OPTIONS}
          onChange={(v) => update("iconStyle", v)}
        />
      </CustomSection>
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

type StatusKind = "unsaved" | "draft_ready" | "live";
function StatusBadge({ kind }: { kind: StatusKind }) {
  if (kind === "unsaved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-500 font-medium" data-testid="text-unsaved-changes">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Unsaved changes
      </span>
    );
  }
  if (kind === "draft_ready") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-blue-400 font-medium" data-testid="text-draft-ready">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        Draft saved
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium" data-testid="text-status-live">
      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Live
    </span>
  );
}

// ─── Mobile device frame ──────────────────────────────────────────────────────

function DeviceFrame({ children, mode }: { children: React.ReactNode; mode: "mobile" | "desktop" }) {
  if (mode === "desktop") {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 700,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.3), 0 2px 16px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        data-testid="preview-container"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#1a1a24] border-b border-white/5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          <div className="flex-1 mx-2 bg-white/5 rounded h-5 flex items-center px-2">
            <div className="h-1 w-20 rounded bg-white/20" />
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        width: 375,
        maxWidth: "100%",
        borderRadius: 42,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 2px 16px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.12)",
        border: "8px solid #1a1a24",
        background: "#1a1a24",
        transition: "all 0.3s ease",
      }}
      data-testid="preview-container"
    >
      {/* Notch */}
      <div className="flex justify-center py-2 bg-[#1a1a24]">
        <div className="h-5 w-24 rounded-full bg-black" />
      </div>
      {/* Screen */}
      <div style={{ borderRadius: 4, overflow: "hidden" }}>
        {children}
      </div>
      {/* Home indicator */}
      <div className="flex justify-center py-2.5 bg-[#1a1a24]">
        <div className="h-1 w-24 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

// ─── AppearancePage ───────────────────────────────────────────────────────────

export default function AppearancePage() {
  const { activeProfile: profile, isLoading } = useActiveProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [workingId, setWorkingId] = useState(DEFAULT_THEME_ID);
  const [workingCustomizations, setWorkingCustomizations] = useState<ThemeCustomizations>({});
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftCustomizations, setDraftCustomizations] = useState<ThemeCustomizations>({});
  const [liveId, setLiveId] = useState(DEFAULT_THEME_ID);
  const [liveCustomizations, setLiveCustomizations] = useState<ThemeCustomizations>({});

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
    setWorkingCustomizations(getTheme(themeId).defaultCustomizations);
  };

  useEffect(() => {
    if (profile) {
      const b = (profile.branding as ProfileBranding) || {};
      const published = b.selectedThemeId || DEFAULT_THEME_ID;
      const draft = b.themeDraft || null;
      const liveCust = (b.themeCustomizations as ThemeCustomizations) || {};
      const draftCust = (b.themeCustomizationsDraft as ThemeCustomizations) || {};
      setLiveId(published);
      setLiveCustomizations(liveCust);
      setDraftId(draft);
      setDraftCustomizations(draftCust);
      setWorkingId(draft ?? published);
      setWorkingCustomizations(draft ? draftCust : liveCust);
    }
  }, [profile]);

  const custKey = JSON.stringify(workingCustomizations);
  const draftCustKey = JSON.stringify(draftCustomizations);
  const liveCustKey = JSON.stringify(liveCustomizations);
  const lastSavePointId = draftId ?? liveId;
  const lastSavePointCust = draftId ? draftCustKey : liveCustKey;
  const hasUnsaved = workingId !== lastSavePointId || custKey !== lastSavePointCust;
  const draftAheadOfLive = !!draftId && (draftId !== liveId || draftCustKey !== liveCustKey);
  const status: StatusKind = hasUnsaved ? "unsaved" : draftAheadOfLive ? "draft_ready" : "live";

  const canSaveDraft = hasUnsaved;
  const canPublish = workingId !== liveId || custKey !== liveCustKey || draftAheadOfLive;
  const canReset = workingId !== liveId || custKey !== liveCustKey || !!draftId;

  const callUpdate = async (data: Record<string, unknown>) => {
    await apiRequest("PUT", `/api/profiles/${profile!.id}`, data);
    queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
  };

  const handleSaveDraft = async () => {
    if (!profile) return;
    setIsSavingDraft(true);
    try {
      const b = (profile.branding as ProfileBranding) || {};
      await callUpdate({
        branding: {
          ...b,
          themeDraft: workingId,
          themeCustomizationsDraft: workingCustomizations,
        },
      });
      setDraftId(workingId);
      setDraftCustomizations(workingCustomizations);
      toast({ title: "Draft saved", description: `${getTheme(workingId).name} saved as draft. Publish when ready.` });
    } catch {
      toast({ title: "Save failed", description: "Could not save draft. Please try again.", variant: "destructive" });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!profile) return;
    setIsPublishing(true);
    try {
      const b = (profile.branding as ProfileBranding) || {};
      const themeToPublish = workingId;
      const custToPublish = workingCustomizations;
      await callUpdate({
        branding: {
          ...b,
          selectedThemeId: themeToPublish,
          themeCustomizations: custToPublish,
          themeDraft: undefined,
          themeCustomizationsDraft: undefined,
          themePublishedAt: new Date().toISOString(),
        },
      });
      setLiveId(themeToPublish);
      setLiveCustomizations(custToPublish);
      setDraftId(null);
      setDraftCustomizations({});
      setWorkingId(themeToPublish);
      setWorkingCustomizations(custToPublish);
      toast({ title: "Published!", description: `${getTheme(themeToPublish).name} is now live on your public profile.` });
    } catch {
      toast({ title: "Publish failed", description: "Could not publish. Please try again.", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReset = async () => {
    if (!profile) return;
    setWorkingId(liveId);
    setWorkingCustomizations(liveCustomizations);
    if (draftId) {
      setIsResetting(true);
      try {
        const b = (profile.branding as ProfileBranding) || {};
        await callUpdate({
          branding: { ...b, themeDraft: undefined, themeCustomizationsDraft: undefined },
        });
        setDraftId(null);
        setDraftCustomizations({});
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
      <div className="px-5 md:px-6 pt-5 pb-4 border-b border-border/50 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Palette className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">Appearance</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Design your public profile. Save a draft to refine, publish when ready.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <StatusBadge kind={status} />

            {canReset && (
              <Button variant="ghost" size="sm" onClick={handleReset} disabled={isResetting} data-testid="button-reset-theme">
                {isResetting
                  ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  : <RotateCcw className="h-3.5 w-3.5 mr-1" />}
                Reset
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSavingDraft || !canSaveDraft} data-testid="button-save-draft">
              {isSavingDraft
                ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
                : <><BookOpen className="h-3.5 w-3.5 mr-1.5" />Save Draft</>}
            </Button>

            <Button size="sm" onClick={handlePublish} disabled={isPublishing || !canPublish} data-testid="button-publish-theme">
              {isPublishing
                ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Publishing…</>
                : <><Globe className="h-3.5 w-3.5 mr-1.5" />Publish</>}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>Live:</span>
          <span className="font-medium text-foreground">{getTheme(liveId).name}</span>
          {draftId && draftId !== liveId && (
            <>
              <span>·</span>
              <span className="text-blue-400">Draft: {getTheme(draftId).name}</span>
            </>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

        {/* Left panel: theme gallery + customizations */}
        <div className="lg:w-[300px] xl:w-[320px] shrink-0 border-b lg:border-b-0 lg:border-r border-border/40 overflow-y-auto">

          {/* Theme gallery */}
          <div className="p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-0.5 pb-1">Themes</p>

            <div className="grid grid-cols-2 gap-2">
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
                    className={`relative rounded-xl border-2 overflow-hidden text-left transition-all focus:outline-none group ${
                      isLocked
                        ? "border-border/60 opacity-90 cursor-pointer"
                        : isWorking
                        ? "border-primary ring-2 ring-primary/25 shadow-lg"
                        : "border-border/50 hover:border-primary/50 hover:shadow-md"
                    }`}
                    data-testid={`theme-card-${theme.id}`}
                  >
                    {/* Thumbnail */}
                    <ThemeCardThumbnail theme={theme} />

                    {/* Lock overlay */}
                    {isLocked && (
                      <div className="absolute inset-0" style={{ height: 120 }}>
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center">
                          <div className="flex items-center gap-1.5 bg-background/95 border border-border/60 rounded-full px-2.5 py-1 shadow">
                            <Lock className="h-3 w-3 text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Pro</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Check mark for selected */}
                    {!isLocked && isWorking && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}

                    {/* Info footer */}
                    <div className="px-2.5 py-2 border-t border-border/30 bg-card/80 backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{theme.name}</p>
                        <div className="flex gap-1 shrink-0">
                          {isLocked && (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">Pro</span>
                          )}
                          {!isLocked && isLive && !isDraft && (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Live</span>
                          )}
                          {!isLocked && isDraft && !isLive && (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded-full">Draft</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{theme.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-4 border-t border-border/30" />

          {/* Customization panel */}
          <div className="p-4 pb-8 space-y-2.5">
            <CustomizationPanel
              themeId={workingId}
              customizations={workingCustomizations}
              onChange={setWorkingCustomizations}
            />
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/40 bg-background/70 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Preview —
              </p>
              <p className="text-xs font-semibold text-foreground">{selectedTheme.name}</p>
              {(workingId !== liveId || custKey !== liveCustKey) && (
                <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">draft</span>
              )}
            </div>

            <div className="flex rounded-lg border border-border/60 overflow-hidden bg-card/40">
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewport === "mobile"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                data-testid="button-viewport-mobile"
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile
              </button>
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewport === "desktop"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                data-testid="button-viewport-desktop"
              >
                <Monitor className="h-3.5 w-3.5" />
                Desktop
              </button>
            </div>
          </div>

          {/* Preview canvas */}
          <div
            className="flex-1 overflow-y-auto flex items-start justify-center p-8"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          >
            {profile ? (
              <DeviceFrame mode={viewport}>
                <ThemedPreviewWrapper
                  profile={profile}
                  themeId={workingId}
                  customizations={workingCustomizations}
                />
              </DeviceFrame>
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
              Upgrade your plan to unlock premium themes, advanced customisations, and more.
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
              data-testid="button-cancel-upgrade"
            >
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
