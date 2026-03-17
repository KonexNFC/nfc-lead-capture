export interface ThemeTokens {
  "--theme-bg": string;
  "--theme-surface": string;
  "--theme-text-primary": string;
  "--theme-text-secondary": string;
  "--theme-accent": string;
  "--theme-border-radius": string;
  "--theme-font-heading": string;
  "--theme-font-body": string;
}

export type ThemePlan = "free" | "pro";

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  plan: ThemePlan;
  preview: { bg: string; accent: string; surface: string };
  tokens: ThemeTokens;
}

export const THEMES: ThemeConfig[] = [
  {
    id: "minimal_corporate",
    name: "Minimal Corporate",
    description: "Clean, professional, and timeless.",
    plan: "free" as ThemePlan,
    preview: { bg: "#f8f9fa", accent: "#1a73e8", surface: "#ffffff" },
    tokens: {
      "--theme-bg": "#f8f9fa",
      "--theme-surface": "#ffffff",
      "--theme-text-primary": "#111827",
      "--theme-text-secondary": "#6b7280",
      "--theme-accent": "#1a73e8",
      "--theme-border-radius": "12px",
      "--theme-font-heading": "Inter, system-ui, sans-serif",
      "--theme-font-body": "Inter, system-ui, sans-serif",
    },
  },
  {
    id: "luxury_black",
    name: "Luxury Black",
    description: "Sophisticated and bold. For high-end brands.",
    plan: "pro" as ThemePlan,
    preview: { bg: "#0a0a0a", accent: "#c9a84c", surface: "#1a1a1a" },
    tokens: {
      "--theme-bg": "#0a0a0a",
      "--theme-surface": "#1a1a1a",
      "--theme-text-primary": "#f5f5f0",
      "--theme-text-secondary": "#9a9a8e",
      "--theme-accent": "#c9a84c",
      "--theme-border-radius": "4px",
      "--theme-font-heading": "Georgia, 'Times New Roman', serif",
      "--theme-font-body": "Inter, system-ui, sans-serif",
    },
  },
  {
    id: "personal_brand",
    name: "Personal Brand",
    description: "Bold, vibrant, and expressive.",
    plan: "free" as ThemePlan,
    preview: { bg: "#fafafa", accent: "#7c3aed", surface: "#ffffff" },
    tokens: {
      "--theme-bg": "#fafafa",
      "--theme-surface": "#ffffff",
      "--theme-text-primary": "#18181b",
      "--theme-text-secondary": "#71717a",
      "--theme-accent": "#7c3aed",
      "--theme-border-radius": "24px",
      "--theme-font-heading": "system-ui, sans-serif",
      "--theme-font-body": "system-ui, sans-serif",
    },
  },
];

export const DEFAULT_THEME_ID = "minimal_corporate";

export function getTheme(id?: string | null): ThemeConfig {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
}

export function getThemeStyle(id?: string | null): Record<string, string> {
  return { ...getTheme(id).tokens };
}
