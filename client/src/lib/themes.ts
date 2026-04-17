// ─── Customization types ────────────────────────────────────────────────────

export type ButtonStyle = "filled" | "outline" | "pill";
export type CardRadius = "sharp" | "soft" | "rounded";
export type SpacingDensity = "compact" | "comfortable" | "spacious";
export type HeaderStyle = "centered" | "left-aligned" | "banner";
export type FontStyle = "modern" | "elegant" | "bold";
export type SocialLayout = "icons" | "tiles";
export type LayoutVariant = "corporate" | "personal" | "luxury" | "social";
export type AvatarShape = "circle" | "square" | "squircle";
export type SectionDivider = "none" | "line" | "gradient";
export type IconStyle = "solid" | "outline" | "ghost";
export type BackgroundStyle = "flat" | "gradient" | "pattern";

export interface ThemeCustomizations {
  accentColor?: string;
  backgroundStyle?: BackgroundStyle;
  buttonStyle?: ButtonStyle;
  fontStyle?: FontStyle;
  avatarShape?: AvatarShape;
  cardRadius?: CardRadius;
  sectionDivider?: SectionDivider;
  iconStyle?: IconStyle;
  // Internal / structural (not shown as user-facing controls)
  spacingDensity?: SpacingDensity;
  headerStyle?: HeaderStyle;
  socialLayout?: SocialLayout;
  layoutVariant?: LayoutVariant;
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
    supportedCustomizations: [
      "accentColor", "backgroundStyle", "buttonStyle", "fontStyle",
      "avatarShape", "cardRadius", "sectionDivider", "iconStyle",
    ],
    defaultCustomizations: {
      accentColor: "#1a56db",
      backgroundStyle: "flat",
      buttonStyle: "filled",
      fontStyle: "modern",
      avatarShape: "circle",
      cardRadius: "soft",
      sectionDivider: "line",
      iconStyle: "solid",
      spacingDensity: "compact",
      headerStyle: "left-aligned",
      socialLayout: "icons",
      layoutVariant: "corporate",
    },
  },
  {
    id: "personal_brand",
    name: "Personal Brand",
    description: "Bold, dark, and creator-led.",
    plan: "free",
    preview: { bg: "#100820", accent: "#c084fc", surface: "#1e1035" },
    tokens: {
      "--theme-bg": "#100820",
      "--theme-surface": "#1e1035",
      "--theme-text-primary": "#f0ebff",
      "--theme-text-secondary": "#b09fd4",
      "--theme-accent": "#c084fc",
      "--theme-border-radius": "20px",
      "--theme-font-heading": "system-ui, sans-serif",
      "--theme-font-body": "system-ui, sans-serif",
      "--theme-shadow": "0 8px 40px rgba(192,132,252,0.18)",
      "--theme-header-gradient": "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #c026d3 100%)",
    },
    supportedCustomizations: [
      "accentColor", "backgroundStyle", "buttonStyle", "fontStyle",
      "avatarShape", "cardRadius", "sectionDivider", "iconStyle",
    ],
    defaultCustomizations: {
      accentColor: "#c084fc",
      backgroundStyle: "gradient",
      buttonStyle: "pill",
      fontStyle: "bold",
      avatarShape: "circle",
      cardRadius: "rounded",
      sectionDivider: "gradient",
      iconStyle: "solid",
      spacingDensity: "comfortable",
      headerStyle: "banner",
      socialLayout: "icons",
      layoutVariant: "personal",
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
    supportedCustomizations: [
      "accentColor", "backgroundStyle", "buttonStyle", "fontStyle",
      "avatarShape", "cardRadius", "sectionDivider", "iconStyle",
    ],
    defaultCustomizations: {
      accentColor: "#c9a84c",
      backgroundStyle: "flat",
      buttonStyle: "filled",
      fontStyle: "elegant",
      avatarShape: "circle",
      cardRadius: "sharp",
      sectionDivider: "gradient",
      iconStyle: "outline",
      spacingDensity: "comfortable",
      headerStyle: "centered",
      socialLayout: "icons",
      layoutVariant: "luxury",
    },
  },
  {
    id: "social_hub",
    name: "Social Hub",
    description: "Dark, tile-based layout built for social-first creators.",
    plan: "pro",
    preview: { bg: "#0d0d0d", accent: "#38bdf8", surface: "#161616" },
    tokens: {
      "--theme-bg": "#0d0d0d",
      "--theme-surface": "#161616",
      "--theme-text-primary": "#ffffff",
      "--theme-text-secondary": "#888888",
      "--theme-accent": "#38bdf8",
      "--theme-border-radius": "20px",
      "--theme-font-heading": "Inter, system-ui, sans-serif",
      "--theme-font-body": "Inter, system-ui, sans-serif",
      "--theme-shadow": "0 8px 48px rgba(0,0,0,0.8)",
      "--theme-header-gradient": "linear-gradient(180deg, #1a1a2e 0%, #0d0d0d 100%)",
    },
    supportedCustomizations: [
      "accentColor", "backgroundStyle", "buttonStyle", "fontStyle",
      "avatarShape", "cardRadius", "sectionDivider", "iconStyle",
    ],
    defaultCustomizations: {
      accentColor: "#38bdf8",
      backgroundStyle: "gradient",
      buttonStyle: "pill",
      fontStyle: "modern",
      avatarShape: "squircle",
      cardRadius: "rounded",
      sectionDivider: "none",
      iconStyle: "solid",
      spacingDensity: "comfortable",
      headerStyle: "banner",
      socialLayout: "tiles",
      layoutVariant: "social",
    },
  },
  {
    id: "rose_gold",
    name: "Rose Gold",
    description: "Warm, luxurious, and elegantly refined.",
    plan: "pro",
    preview: { bg: "#1a0e12", accent: "#e8917a", surface: "#231118" },
    tokens: {
      "--theme-bg": "#1a0e12",
      "--theme-surface": "#231118",
      "--theme-text-primary": "#f5ede8",
      "--theme-text-secondary": "#9a7a70",
      "--theme-accent": "#e8917a",
      "--theme-border-radius": "18px",
      "--theme-font-heading": "Georgia, 'Times New Roman', serif",
      "--theme-font-body": "Inter, system-ui, sans-serif",
      "--theme-shadow": "0 8px 32px rgba(232,145,122,0.14)",
      "--theme-header-gradient": "linear-gradient(135deg, #4a1525 0%, #2c1018 100%)",
    },
    supportedCustomizations: [
      "accentColor", "backgroundStyle", "buttonStyle", "fontStyle",
      "avatarShape", "cardRadius", "sectionDivider", "iconStyle",
    ],
    defaultCustomizations: {
      accentColor: "#e8917a",
      backgroundStyle: "gradient",
      buttonStyle: "pill",
      fontStyle: "elegant",
      avatarShape: "circle",
      cardRadius: "rounded",
      sectionDivider: "gradient",
      iconStyle: "outline",
      spacingDensity: "comfortable",
      headerStyle: "centered",
      socialLayout: "icons",
      layoutVariant: "luxury",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Deep, calm, and powerfully composed.",
    plan: "pro",
    preview: { bg: "#040d1a", accent: "#0ea5e9", surface: "#071528" },
    tokens: {
      "--theme-bg": "#040d1a",
      "--theme-surface": "#071528",
      "--theme-text-primary": "#e8f4fd",
      "--theme-text-secondary": "#6a8fa8",
      "--theme-accent": "#0ea5e9",
      "--theme-border-radius": "12px",
      "--theme-font-heading": "Inter, system-ui, sans-serif",
      "--theme-font-body": "Inter, system-ui, sans-serif",
      "--theme-shadow": "0 8px 40px rgba(14,165,233,0.15)",
      "--theme-header-gradient": "linear-gradient(180deg, #0c2a4a 0%, #040d1a 100%)",
    },
    supportedCustomizations: [
      "accentColor", "backgroundStyle", "buttonStyle", "fontStyle",
      "avatarShape", "cardRadius", "sectionDivider", "iconStyle",
    ],
    defaultCustomizations: {
      accentColor: "#0ea5e9",
      backgroundStyle: "gradient",
      buttonStyle: "filled",
      fontStyle: "modern",
      avatarShape: "squircle",
      cardRadius: "soft",
      sectionDivider: "line",
      iconStyle: "solid",
      spacingDensity: "comfortable",
      headerStyle: "banner",
      socialLayout: "icons",
      layoutVariant: "personal",
    },
  },
  {
    id: "neon_night",
    name: "Neon Night",
    description: "Dark, electric, and unmistakably bold.",
    plan: "pro",
    preview: { bg: "#030603", accent: "#39d353", surface: "#070f07" },
    tokens: {
      "--theme-bg": "#030603",
      "--theme-surface": "#070f07",
      "--theme-text-primary": "#e8fce8",
      "--theme-text-secondary": "#4a7a50",
      "--theme-accent": "#39d353",
      "--theme-border-radius": "8px",
      "--theme-font-heading": "'Helvetica Neue', system-ui, sans-serif",
      "--theme-font-body": "Inter, system-ui, sans-serif",
      "--theme-shadow": "0 8px 40px rgba(57,211,83,0.2)",
      "--theme-header-gradient": "linear-gradient(180deg, #0a200c 0%, #030603 100%)",
    },
    supportedCustomizations: [
      "accentColor", "backgroundStyle", "buttonStyle", "fontStyle",
      "avatarShape", "cardRadius", "sectionDivider", "iconStyle",
    ],
    defaultCustomizations: {
      accentColor: "#39d353",
      backgroundStyle: "flat",
      buttonStyle: "outline",
      fontStyle: "bold",
      avatarShape: "square",
      cardRadius: "sharp",
      sectionDivider: "line",
      iconStyle: "outline",
      spacingDensity: "compact",
      headerStyle: "left-aligned",
      socialLayout: "icons",
      layoutVariant: "corporate",
    },
  },
];

export const DEFAULT_THEME_ID = "social_hub";

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

/** Avatar border-radius from shape. */
export function avatarShapeRadius(s: AvatarShape): string {
  return s === "square" ? "6px" : s === "squircle" ? "22%" : "50%";
}

/** Font family from font style. */
export function fontFamilyFromStyle(f: FontStyle): string {
  if (f === "elegant") return "Georgia, 'Times New Roman', serif";
  if (f === "bold") return "'Helvetica Neue', system-ui, sans-serif";
  return "Inter, system-ui, sans-serif";
}

/** Spacing values from density. */
export function spacingValues(d: SpacingDensity) {
  if (d === "compact") return { px: 14, sectionGap: 8, bioGap: 6 };
  if (d === "spacious") return { px: 24, sectionGap: 20, bioGap: 16 };
  return { px: 18, sectionGap: 12, bioGap: 10 };
}

/**
 * Converts a hex color string to an HSL CSS variable triple (no hsl() wrapper).
 * e.g. "#1a56db" → "218 73% 47%"
 * Tailwind uses `hsl(var(--primary) / alpha)` so variables must be triples.
 */
export function hexToHslVar(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) throw new Error("Invalid hex");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0;
  let h = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Builds the complete set of CSS variables to apply to a theme container.
 * Use this in both the appearance preview wrapper and the public profile page
 * to guarantee preview == reality.
 */
export function buildThemeCssVars(
  themeId: string | null | undefined,
  customizations: ThemeCustomizations | Record<string, string> | null | undefined,
): Record<string, string> {
  const theme = getTheme(themeId);
  const c = resolveCustomizations(theme, customizations);
  const tt = theme.tokens;
  const finalAccent = c.accentColor || tt["--theme-accent"];

  const vars: Record<string, string> = {
    // Direct theme tokens
    "--theme-bg": tt["--theme-bg"],
    "--theme-surface": tt["--theme-surface"],
    "--theme-text-primary": tt["--theme-text-primary"],
    "--theme-text-secondary": tt["--theme-text-secondary"],
    "--theme-accent": finalAccent,
    "--theme-border-radius": cardRadiusPx(c.cardRadius),
    "--theme-font-heading": fontFamilyFromStyle(c.fontStyle),
    "--theme-font-body": tt["--theme-font-body"],
    "--theme-shadow": tt["--theme-shadow"],
    "--theme-header-gradient": tt["--theme-header-gradient"],
    // Card radius shorthand
    "--card-radius": cardRadiusPx(c.cardRadius),
  };

  // Bridge hex tokens → Tailwind HSL variables
  try {
    vars["--background"]         = hexToHslVar(tt["--theme-surface"]);
    vars["--card"]               = hexToHslVar(tt["--theme-surface"]);
    vars["--card-foreground"]    = hexToHslVar(tt["--theme-text-primary"]);
    vars["--foreground"]         = hexToHslVar(tt["--theme-text-primary"]);
    vars["--muted-foreground"]   = hexToHslVar(tt["--theme-text-secondary"]);
    vars["--primary"]            = hexToHslVar(finalAccent);
    vars["--primary-foreground"] = "0 0% 100%";
    vars["--accent"]             = hexToHslVar(finalAccent);
    vars["--border"]             = hexToHslVar(tt["--theme-text-secondary"]);
  } catch {
    // Non-hex token — safe to skip
  }

  return vars;
}
