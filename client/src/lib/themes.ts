// ─── Customization types ────────────────────────────────────────────────────

export type ButtonStyle = "filled" | "outline" | "pill";
export type CardRadius = "sharp" | "soft" | "rounded";
export type SpacingDensity = "compact" | "comfortable" | "spacious";
export type HeaderStyle = "centered" | "left-aligned" | "banner";
export type FontStyle = "modern" | "elegant" | "bold";

export interface ThemeCustomizations {
  accentColor?: string;
  buttonStyle?: ButtonStyle;
  cardRadius?: CardRadius;
  spacingDensity?: SpacingDensity;
  headerStyle?: HeaderStyle;
  fontStyle?: FontStyle;
}

export type CustomizationKey = keyof ThemeCustomizations;

// ─── Token types ─────────────────────────────────────────────────────────────

export interface ThemeTokens {
  "--theme-bg": string;
  "--theme-surface": string;
  "--theme-text-primary": string;
  "--theme-text-secondary": string;
  "--theme-accent": string;
  "--theme-border-radius": string;
  "--theme-font-heading": string;
  "--theme-font-body": string;
  "--theme-shadow": string;
  "--theme-header-gradient": string;
}

// ─── Theme config ─────────────────────────────────────────────────────────────

export type ThemePlan = "free" | "pro";

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  plan: ThemePlan;
  preview: { bg: string; accent: string; surface: string };
  tokens: ThemeTokens;
  supportedCustomizations: CustomizationKey[];
  defaultCustomizations: Required<ThemeCustomizations>;
}

// ─── Theme definitions ────────────────────────────────────────────────────────

export const THEMES: ThemeConfig[] = [
  {
    id: "minimal_corporate",
    name: "Minimal Corporate",
    description: "Clean, structured, and professional.",
    plan: "free",
    preview: { bg: "#f0f4f8", accent: "#1a56db", surface: "#ffffff" },
    tokens: {
      "--theme-bg": "#f0f4f8",
      "--theme-surface": "#ffffff",
      "--theme-text-primary": "#0f1923",
      "--theme-text-secondary": "#526070",
      "--theme-accent": "#1a56db",
      "--theme-border-radius": "6px",
      "--theme-font-heading": "Inter, system-ui, sans-serif",
      "--theme-font-body": "Inter, system-ui, sans-serif",
      "--theme-shadow": "0 1px 6px rgba(0,0,0,0.07)",
      "--theme-header-gradient": "linear-gradient(180deg, #e8eef6 0%, #f0f4f8 100%)",
    },
    supportedCustomizations: ["accentColor", "buttonStyle", "spacingDensity", "headerStyle"],
    defaultCustomizations: {
      accentColor: "#1a56db",
      buttonStyle: "filled",
      cardRadius: "soft",
      spacingDensity: "compact",
      headerStyle: "left-aligned",
      fontStyle: "modern",
    },
  },
  {
    id: "personal_brand",
    name: "Personal Brand",
    description: "Expressive, vibrant, and creator-led.",
    plan: "free",
    preview: { bg: "#ede9ff", accent: "#9333ea", surface: "#f5f0ff" },
    tokens: {
      "--theme-bg": "#ede9ff",
      "--theme-surface": "#f5f0ff",
      "--theme-text-primary": "#18181b",
      "--theme-text-secondary": "#6b5c8a",
      "--theme-accent": "#9333ea",
      "--theme-border-radius": "22px",
      "--theme-font-heading": "system-ui, sans-serif",
      "--theme-font-body": "system-ui, sans-serif",
      "--theme-shadow": "0 4px 24px rgba(147,51,234,0.15)",
      "--theme-header-gradient": "linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #e879f9 100%)",
    },
    supportedCustomizations: ["accentColor", "buttonStyle", "cardRadius", "headerStyle", "fontStyle"],
    defaultCustomizations: {
      accentColor: "#9333ea",
      buttonStyle: "pill",
      cardRadius: "rounded",
      spacingDensity: "comfortable",
      headerStyle: "banner",
      fontStyle: "modern",
    },
  },
  {
    id: "luxury_black",
    name: "Luxury Black",
    description: "Premium, elegant, and high-end.",
    plan: "pro",
    preview: { bg: "#0a0a0a", accent: "#c9a84c", surface: "#141414" },
    tokens: {
      "--theme-bg": "#080808",
      "--theme-surface": "#121212",
      "--theme-text-primary": "#f0ede6",
      "--theme-text-secondary": "#7a7060",
      "--theme-accent": "#c9a84c",
      "--theme-border-radius": "4px",
      "--theme-font-heading": "Georgia, 'Times New Roman', serif",
      "--theme-font-body": "Inter, system-ui, sans-serif",
      "--theme-shadow": "0 8px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.08)",
      "--theme-header-gradient": "linear-gradient(180deg, #1a1506 0%, #0a0a0a 100%)",
    },
    supportedCustomizations: ["accentColor", "buttonStyle", "cardRadius", "fontStyle"],
    defaultCustomizations: {
      accentColor: "#c9a84c",
      buttonStyle: "filled",
      cardRadius: "sharp",
      spacingDensity: "comfortable",
      headerStyle: "centered",
      fontStyle: "elegant",
    },
  },
];

export const DEFAULT_THEME_ID = "minimal_corporate";

// ─── Utilities ────────────────────────────────────────────────────────────────

export function getTheme(id?: string | null): ThemeConfig {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
}

export function resolveCustomizations(
  theme: ThemeConfig,
  saved?: ThemeCustomizations | Record<string, string> | null,
): Required<ThemeCustomizations> {
  return { ...theme.defaultCustomizations, ...(saved || {}) } as Required<ThemeCustomizations>;
}

/** Returns base theme CSS variable tokens (used by public profile). */
export function getThemeStyle(id?: string | null): Record<string, string> {
  return { ...getTheme(id).tokens };
}

/** Card radius string from customization value. */
export function cardRadiusPx(r: CardRadius): string {
  return r === "sharp" ? "4px" : r === "soft" ? "12px" : "24px";
}

/** Font family from font style. */
export function fontFamilyFromStyle(f: FontStyle): string {
  if (f === "elegant") return "Georgia, 'Times New Roman', serif";
  if (f === "bold") return "system-ui, 'Helvetica Neue', sans-serif";
  return "Inter, system-ui, sans-serif";
}

/** Spacing values from density. */
export function spacingValues(d: SpacingDensity) {
  if (d === "compact") return { px: 14, sectionGap: 8, bioGap: 6 };
  if (d === "spacious") return { px: 24, sectionGap: 20, bioGap: 16 };
  return { px: 18, sectionGap: 12, bioGap: 10 };
}
