import { useState, useEffect } from "react";
import { useActiveProfile } from "@/hooks/use-active-profile";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Check, Palette, Smartphone, Monitor,
  AlertCircle, BookOpen, Globe, RotateCcw, Lock, Sparkles, Settings2,
} from "lucide-react";
import {
  THEMES, DEFAULT_THEME_ID, getTheme, resolveCustomizations,
  cardRadiusPx, fontFamilyFromStyle, spacingValues,
  type ThemeCustomizations, type ButtonStyle, type CardRadius,
  type SpacingDensity, type HeaderStyle, type FontStyle,
} from "@/lib/themes";
import { useUserPlan, isPlanAtLeast } from "@/lib/plan";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import type { ProfileBranding, Profile } from "@shared/schema";

// ─── ThemeProfilePreview ──────────────────────────────────────────────────────

function ThemeProfilePreview({
  profile,
  themeId,
  customizations,
}: {
  profile: Profile;
  themeId: string;
  customizations: ThemeCustomizations;
}) {
  const theme = getTheme(themeId);
  const t = theme.tokens;
  const c = resolveCustomizations(theme, customizations);

  const branding = (profile.branding as ProfileBranding) || {};
  const links = (profile.links as Record<string, string>) || {};

  const photoSrc = profile.photoUrl
    ? profile.photoUrl.startsWith("http")
      ? profile.photoUrl
      : profile.photoUrl.startsWith("/objects/")
      ? profile.photoUrl
      : `/objects/${profile.photoUrl}`
    : undefined;

  // Resolved values from customizations
  const accent = c.accentColor || t["--theme-accent"];
  const cr = cardRadiusPx(c.cardRadius);
  const sp = spacingValues(c.spacingDensity);
  const headingFont = fontFamilyFromStyle(c.fontStyle);
  const bodyFont = t["--theme-font-body"];

  // Button styles
  const btnStyle: React.CSSProperties =
    c.buttonStyle === "outline"
      ? {
          backgroundColor: "transparent",
          color: accent,
          border: `1.5px solid ${accent}`,
          borderRadius: c.cardRadius === "sharp" ? "4px" : c.cardRadius === "soft" ? "8px" : "8px",
        }
      : c.buttonStyle === "pill"
      ? { backgroundColor: accent, color: "#fff", border: "none", borderRadius: "999px" }
      : { backgroundColor: accent, color: "#fff", border: "none", borderRadius: cr === "24px" ? "10px" : cr };

  const contactActions = [
    links.phone && { label: "Call" },
    links.whatsapp && { label: "WhatsApp" },
    links.sms && { label: "Text" },
    links.email && { label: "Email" },
  ].filter(Boolean);

  // ── Header: left-aligned layout ──────────────────────────────────────────
  if (c.headerStyle === "left-aligned") {
    const avatarPx = 52;
    return (
      <div
        style={{
          backgroundColor: t["--theme-bg"],
          fontFamily: bodyFont,
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          padding: sp.px,
          gap: sp.sectionGap,
        }}
      >
        {/* Thin accent strip */}
        <div style={{ height: 3, backgroundColor: accent, borderRadius: 2 }} />

        {/* Card */}
        <div
          style={{
            backgroundColor: t["--theme-surface"],
            borderRadius: cr,
            boxShadow: t["--theme-shadow"],
            border: `1px solid ${t["--theme-text-secondary"]}18`,
            overflow: "hidden",
          }}
        >
          {/* Avatar + identity row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: `${sp.px}px` }}>
            <div style={{ flexShrink: 0 }}>
              <Avatar style={{ width: avatarPx, height: avatarPx }}>
                <AvatarImage src={photoSrc} alt={profile.name} className="object-cover" />
                <AvatarFallback
                  style={{
                    backgroundColor: `${accent}18`,
                    color: accent,
                    fontWeight: 700,
                    fontSize: 18,
                    width: avatarPx,
                    height: avatarPx,
                  }}
                >
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: 15,
                  color: t["--theme-text-primary"],
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {profile.name}
              </p>
              {profile.title && (
                <p style={{ fontSize: 11, color: t["--theme-text-secondary"], margin: "2px 0 0", lineHeight: 1.3 }}>
                  {profile.title}
                </p>
              )}
              {profile.company && (
                <p style={{ fontSize: 10, color: accent, fontWeight: 600, margin: "1px 0 0", letterSpacing: "0.03em" }}>
                  {profile.company}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: `${t["--theme-text-secondary"]}14`, marginInline: sp.px }} />

          {/* Bio */}
          {profile.bio && (
            <p
              style={{
                fontSize: 11,
                color: t["--theme-text-secondary"],
                padding: `${sp.bioGap}px ${sp.px}px`,
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {profile.bio.length > 110 ? profile.bio.slice(0, 110) + "…" : profile.bio}
            </p>
          )}

          {/* Contact actions */}
          {contactActions.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: `0 ${sp.px}px ${sp.bioGap}px`,
                flexWrap: "wrap",
              }}
            >
              {contactActions.slice(0, 4).map((a: any) => (
                <div
                  key={a.label}
                  style={{
                    fontSize: 10,
                    color: t["--theme-text-secondary"],
                    backgroundColor: `${t["--theme-text-secondary"]}0e`,
                    border: `1px solid ${t["--theme-text-secondary"]}18`,
                    borderRadius: "4px",
                    padding: "2px 7px",
                    fontWeight: 500,
                  }}
                >
                  {a.label}
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ padding: `0 ${sp.px}px ${sp.px}px` }}>
            <div
              style={{
                ...btnStyle,
                padding: "9px 0",
                textAlign: "center",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
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

  // ── Header: banner layout ─────────────────────────────────────────────────
  if (c.headerStyle === "banner") {
    const bannerH = c.spacingDensity === "compact" ? 90 : c.spacingDensity === "spacious" ? 130 : 110;
    const avatarPx = c.spacingDensity === "compact" ? 68 : c.spacingDensity === "spacious" ? 88 : 80;
    const avatarOverlap = avatarPx / 2;
    return (
      <div
        style={{
          backgroundColor: t["--theme-bg"],
          fontFamily: bodyFont,
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          padding: sp.px,
          gap: sp.sectionGap,
        }}
      >
        <div
          style={{
            backgroundColor: t["--theme-surface"],
            borderRadius: cr,
            boxShadow: t["--theme-shadow"],
            overflow: "hidden",
          }}
        >
          {/* Banner */}
          <div
            style={{
              height: bannerH,
              background: t["--theme-header-gradient"],
              position: "relative",
            }}
          />
          {/* Avatar overlapping banner */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: -avatarOverlap,
              paddingBottom: sp.bioGap,
            }}
          >
            <div
              style={{
                padding: 3,
                backgroundColor: t["--theme-surface"],
                borderRadius: "50%",
                boxShadow: `0 4px 16px ${accent}30`,
              }}
            >
              <Avatar style={{ width: avatarPx, height: avatarPx }}>
                <AvatarImage src={photoSrc} alt={profile.name} className="object-cover" />
                <AvatarFallback
                  style={{
                    backgroundColor: `${accent}22`,
                    color: accent,
                    fontWeight: 700,
                    fontSize: avatarPx * 0.35,
                    width: avatarPx,
                    height: avatarPx,
                  }}
                >
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div style={{ textAlign: "center", marginTop: sp.bioGap, paddingInline: sp.px }}>
              <p
                style={{
                  fontFamily: headingFont,
                  fontWeight: 800,
                  fontSize: 20,
                  color: t["--theme-text-primary"],
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {profile.name}
              </p>
              {profile.title && (
                <p style={{ fontSize: 13, color: t["--theme-text-secondary"], margin: "4px 0 0" }}>
                  {profile.title}
                </p>
              )}
              {profile.company && (
                <p style={{ fontSize: 12, color: accent, fontWeight: 700, margin: "2px 0 0" }}>
                  {profile.company}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p
              style={{
                fontSize: 12,
                color: t["--theme-text-secondary"],
                textAlign: "center",
                padding: `0 ${sp.px}px ${sp.bioGap}px`,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {profile.bio.length > 120 ? profile.bio.slice(0, 120) + "…" : profile.bio}
            </p>
          )}

          {/* Contact actions */}
          {contactActions.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: sp.sectionGap, padding: `0 ${sp.px}px ${sp.bioGap}px` }}>
              {contactActions.slice(0, 4).map((a: any) => (
                <div key={a.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      backgroundColor: `${accent}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: accent, opacity: 0.75 }} />
                  </div>
                  <span style={{ fontSize: 9, color: t["--theme-text-secondary"], textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {a.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ padding: `0 ${sp.px}px ${sp.px}px` }}>
            <div
              style={{
                ...btnStyle,
                padding: "11px 0",
                textAlign: "center",
                fontSize: 13,
                fontWeight: 700,
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

  // ── Header: centered layout (default) ────────────────────────────────────
  const headerH = c.spacingDensity === "compact" ? 60 : c.spacingDensity === "spacious" ? 90 : 72;
  const avatarPx = c.spacingDensity === "compact" ? 60 : c.spacingDensity === "spacious" ? 84 : 72;
  const avatarOverlap = avatarPx / 2;

  return (
    <div
      style={{
        backgroundColor: t["--theme-bg"],
        fontFamily: bodyFont,
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        padding: sp.px,
        gap: sp.sectionGap,
      }}
    >
      <div
        style={{
          backgroundColor: t["--theme-surface"],
          borderRadius: cr,
          boxShadow: t["--theme-shadow"],
          border: `1px solid ${t["--theme-text-secondary"]}15`,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            height: headerH,
            background: t["--theme-header-gradient"],
          }}
        />

        {/* Avatar + identity */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: -avatarOverlap,
            paddingBottom: sp.bioGap,
          }}
        >
          <div
            style={{
              padding: 3,
              backgroundColor: t["--theme-surface"],
              borderRadius: "50%",
              boxShadow: `0 2px 12px rgba(0,0,0,0.18), 0 0 0 1px ${accent}30`,
            }}
          >
            <Avatar style={{ width: avatarPx, height: avatarPx }}>
              <AvatarImage src={photoSrc} alt={profile.name} className="object-cover" />
              <AvatarFallback
                style={{
                  backgroundColor: `${accent}22`,
                  color: accent,
                  fontWeight: 700,
                  fontSize: avatarPx * 0.35,
                  width: avatarPx,
                  height: avatarPx,
                }}
              >
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div style={{ textAlign: "center", marginTop: sp.bioGap, paddingInline: sp.px }}>
            <p
              style={{
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: 17,
                color: t["--theme-text-primary"],
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {profile.name}
            </p>
            {profile.title && (
              <p style={{ fontSize: 12, color: t["--theme-text-secondary"], margin: "3px 0 0" }}>
                {profile.title}
              </p>
            )}
            {profile.company && (
              <p style={{ fontSize: 11, color: accent, fontWeight: 600, margin: "2px 0 0", letterSpacing: "0.04em" }}>
                {profile.company}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p
            style={{
              fontSize: 11,
              color: t["--theme-text-secondary"],
              textAlign: "center",
              padding: `0 ${sp.px}px ${sp.bioGap}px`,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {profile.bio.length > 115 ? profile.bio.slice(0, 115) + "…" : profile.bio}
          </p>
        )}

        {/* Contact actions */}
        {contactActions.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: sp.sectionGap, padding: `0 ${sp.px}px ${sp.bioGap}px` }}>
            {contactActions.slice(0, 4).map((a: any) => (
              <div key={a.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: `${accent}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ width: 13, height: 13, borderRadius: "50%", backgroundColor: accent, opacity: 0.7 }} />
                </div>
                <span style={{ fontSize: 9, color: t["--theme-text-secondary"], textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ padding: `0 ${sp.px}px ${sp.px}px` }}>
          <div
            style={{
              ...btnStyle,
              padding: "10px 0",
              textAlign: "center",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.05em",
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

// ─── CustomizationPanel ───────────────────────────────────────────────────────

const BUTTON_STYLE_LABELS: Record<ButtonStyle, string> = {
  filled: "Filled",
  outline: "Outline",
  pill: "Pill",
};
const CARD_RADIUS_LABELS: Record<CardRadius, string> = {
  sharp: "Sharp",
  soft: "Soft",
  rounded: "Rounded",
};
const SPACING_LABELS: Record<SpacingDensity, string> = {
  compact: "Compact",
  comfortable: "Comfortable",
  spacious: "Spacious",
};
const HEADER_LABELS: Record<HeaderStyle, string> = {
  centered: "Centered",
  "left-aligned": "Left aligned",
  banner: "Banner",
};
const FONT_LABELS: Record<FontStyle, string> = {
  modern: "Modern",
  elegant: "Elegant",
  bold: "Bold",
};

function OptionRow<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  labels: Record<T, string>;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`text-[11px] px-2.5 py-1 rounded border font-medium transition-colors ${
              value === opt
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
            data-testid={`customization-${label.toLowerCase().replace(/\s/g, "-")}-${opt}`}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}

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
  const supported = theme.supportedCustomizations;
  const c = resolveCustomizations(theme, customizations);

  const update = (key: keyof ThemeCustomizations, val: string) =>
    onChange({ ...customizations, [key]: val });

  if (supported.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 px-1">
        <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customise</p>
      </div>

      {supported.includes("accentColor") && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Accent colour</p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={c.accentColor}
              onChange={(e) => update("accentColor", e.target.value)}
              className="h-7 w-10 rounded border border-border cursor-pointer bg-transparent p-0.5"
              data-testid="customization-accent-color"
            />
            <span className="text-xs text-muted-foreground font-mono">{c.accentColor}</span>
            <button
              type="button"
              onClick={() => update("accentColor", theme.defaultCustomizations.accentColor)}
              className="text-[10px] text-muted-foreground hover:text-foreground ml-auto"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {supported.includes("buttonStyle") && (
        <OptionRow
          label="Button style"
          value={c.buttonStyle}
          options={["filled", "outline", "pill"]}
          labels={BUTTON_STYLE_LABELS}
          onChange={(v) => update("buttonStyle", v)}
        />
      )}

      {supported.includes("cardRadius") && (
        <OptionRow
          label="Card radius"
          value={c.cardRadius}
          options={["sharp", "soft", "rounded"]}
          labels={CARD_RADIUS_LABELS}
          onChange={(v) => update("cardRadius", v)}
        />
      )}

      {supported.includes("spacingDensity") && (
        <OptionRow
          label="Spacing"
          value={c.spacingDensity}
          options={["compact", "comfortable", "spacious"]}
          labels={SPACING_LABELS}
          onChange={(v) => update("spacingDensity", v)}
        />
      )}

      {supported.includes("headerStyle") && (
        <OptionRow
          label="Header style"
          value={c.headerStyle}
          options={["centered", "left-aligned", "banner"]}
          labels={HEADER_LABELS}
          onChange={(v) => update("headerStyle", v)}
        />
      )}

      {supported.includes("fontStyle") && (
        <OptionRow
          label="Font style"
          value={c.fontStyle}
          options={["modern", "elegant", "bold"]}
          labels={FONT_LABELS}
          onChange={(v) => update("fontStyle", v)}
        />
      )}
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

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

// ─── AppearancePage ───────────────────────────────────────────────────────────

export default function AppearancePage() {
  const { activeProfile: profile, isLoading } = useActiveProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // workingId: theme selected in the UI (preview uses this)
  const [workingId, setWorkingId] = useState(DEFAULT_THEME_ID);
  // workingCustomizations: customizations being edited right now
  const [workingCustomizations, setWorkingCustomizations] = useState<ThemeCustomizations>({});
  // draftId / draftCustomizations: last saved draft
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftCustomizations, setDraftCustomizations] = useState<ThemeCustomizations>({});
  // liveId / liveCustomizations: published state
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
    // Reset customizations to the new theme's defaults when switching
    setWorkingCustomizations(getTheme(themeId).defaultCustomizations);
  };

  // Seed state from saved profile branding
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
      // Working state = draft if exists, else live
      setWorkingId(draft ?? published);
      setWorkingCustomizations(draft ? draftCust : liveCust);
    }
  }, [profile]);

  // Derived status
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

  // Save Draft — persists themeDraft + themeCustomizationsDraft without touching live
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
      toast({ title: "Draft saved", description: `${getTheme(workingId).name} saved as draft. Publish when you're ready.` });
    } catch {
      toast({ title: "Save failed", description: "Could not save draft. Please try again.", variant: "destructive" });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Publish — writes to selectedThemeId + themeCustomizations, clears draft
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
                  : <RotateCcw className="h-3.5 w-3.5 mr-1" />}
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
                : <><BookOpen className="h-3.5 w-3.5 mr-1.5" />Save Draft</>}
            </Button>

            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing || !canPublish}
              data-testid="button-publish-theme"
            >
              {isPublishing
                ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Publishing…</>
                : <><Globe className="h-3.5 w-3.5 mr-1.5" />Publish</>}
            </Button>
          </div>
        </div>

        {/* Live theme indicator */}
        <p className="text-xs text-muted-foreground mt-2">
          Currently live:{" "}
          <span className="font-medium text-foreground">{getTheme(liveId).name}</span>
          {draftId && draftId !== liveId && (
            <span className="ml-2 text-blue-500">· Draft: {getTheme(draftId).name}</span>
          )}
        </p>
      </div>

      {/* ── Body — two columns on lg+ ── */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

        {/* Left: Theme gallery + customization panel */}
        <div className="lg:w-72 xl:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-border/50 overflow-y-auto p-4 space-y-5">

          {/* Theme gallery */}
          <div className="space-y-3">
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

          {/* Divider */}
          <div className="border-t border-border/40" />

          {/* Customization panel */}
          <CustomizationPanel
            themeId={workingId}
            customizations={workingCustomizations}
            onChange={setWorkingCustomizations}
          />
        </div>

        {/* Right: Live preview */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-muted/30">
          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background/60 backdrop-blur-sm shrink-0">
            <p className="text-xs text-muted-foreground">
              Preview — <span className="font-medium text-foreground">{selectedTheme.name}</span>
              {(workingId !== liveId || custKey !== liveCustKey) && (
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
                <ThemeProfilePreview
                  profile={profile}
                  themeId={workingId}
                  customizations={workingCustomizations}
                />
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
