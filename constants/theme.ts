/** Cosmic Design System — dual-theme token set for Study Pro */

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
export type SortOrder = 'updatedAt' | 'createdAt' | 'title' | 'pinned';
export type FilterView = 'all' | 'favorites' | 'recent' | 'archived' | 'trash';
export type CardDensity = 'comfortable' | 'compact';
export type AutosaveInterval = 'off' | '500' | '800' | '2000';
export type FontFamily = 'inter' | 'serif' | 'mono';
export type CornerStyle = 'rounded' | 'sharp';

export interface AppTheme {
  mode: 'dark' | 'light';
  colors: {
    background: string;
    surface: string;
    surfaceBorder: string;
    accent: string;
    accentGlow: string;
    textPrimary: string;
    textSecondary: string;
    danger: string;
    success: string;
    skeleton: string;
    skeletonHighlight: string;
    tabBar: string;
    tabBarBorder: string;
  };
  radius: { sm: number; md: number; lg: number; xl: number };
}

export const ACCENT_COLORS: Record<
  AccentColor,
  { dark: string; light: string; glowDark: string; glowLight: string; label: string }
> = {
  cyan:    { dark: '#00f2fe', light: '#0091b3', glowDark: 'rgba(0,242,254,0.35)',   glowLight: 'rgba(0,145,179,0.25)',   label: 'Cyan' },
  violet:  { dark: '#a78bfa', light: '#7c3aed', glowDark: 'rgba(167,139,250,0.35)', glowLight: 'rgba(124,58,237,0.25)',  label: 'Violet' },
  emerald: { dark: '#34d399', light: '#059669', glowDark: 'rgba(52,211,153,0.35)',  glowLight: 'rgba(5,150,105,0.25)',   label: 'Emerald' },
  amber:   { dark: '#fbbf24', light: '#d97706', glowDark: 'rgba(251,191,36,0.35)',  glowLight: 'rgba(217,119,6,0.25)',   label: 'Amber' },
  rose:    { dark: '#fb7185', light: '#e11d48', glowDark: 'rgba(251,113,133,0.35)', glowLight: 'rgba(225,29,72,0.25)',   label: 'Rose' },
};

export function buildTheme(
  effectiveMode: 'dark' | 'light',
  accentColor: AccentColor,
  cornerStyle: CornerStyle = 'rounded',
): AppTheme {
  const ac = ACCENT_COLORS[accentColor];
  const radii =
    cornerStyle === 'sharp'
      ? { sm: 4, md: 6, lg: 8, xl: 12 }
      : { sm: 8, md: 12, lg: 16, xl: 24 };

  if (effectiveMode === 'dark') {
    return {
      mode: 'dark',
      colors: {
        background: '#0f172a',
        surface: 'rgba(255,255,255,0.06)',
        surfaceBorder: 'rgba(255,255,255,0.12)',
        accent: ac.dark,
        accentGlow: ac.glowDark,
        textPrimary: '#f8fafc',
        textSecondary: '#94a3b8',
        danger: '#ff4d6d',
        success: '#22d3ee',
        skeleton: 'rgba(255,255,255,0.07)',
        skeletonHighlight: 'rgba(255,255,255,0.15)',
        tabBar: 'rgba(15,23,42,0.95)',
        tabBarBorder: 'rgba(255,255,255,0.08)',
      },
      radius: radii,
    };
  }

  return {
    mode: 'light',
    colors: {
      background: '#f4f6fb',
      surface: 'rgba(15,23,42,0.04)',
      surfaceBorder: 'rgba(15,23,42,0.10)',
      accent: ac.light,
      accentGlow: ac.glowLight,
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      danger: '#e0294f',
      success: '#0891b2',
      skeleton: 'rgba(15,23,42,0.06)',
      skeletonHighlight: 'rgba(15,23,42,0.14)',
      tabBar: 'rgba(244,246,251,0.95)',
      tabBarBorder: 'rgba(15,23,42,0.08)',
    },
    radius: radii,
  };
}
