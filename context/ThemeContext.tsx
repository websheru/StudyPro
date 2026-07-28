import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, buildTheme } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';

interface ThemeContextValue {
  theme: AppTheme;
  effectiveMode: 'dark' | 'light';
  fontScale: number;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: buildTheme('dark', 'cyan'),
  effectiveMode: 'dark',
  fontScale: 1,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const accentColor = useSettingsStore((s) => s.accentColor);
  const fontScale = useSettingsStore((s) => s.fontScale);
  const cornerStyle = useSettingsStore((s) => s.cornerStyle);

  const effectiveMode: 'dark' | 'light' = useMemo(() => {
    if (themeMode === 'system') return colorScheme === 'dark' ? 'dark' : 'light';
    return themeMode;
  }, [themeMode, colorScheme]);

  const theme = useMemo(
    () => buildTheme(effectiveMode, accentColor, cornerStyle),
    [effectiveMode, accentColor, cornerStyle],
  );

  const value = useMemo(
    () => ({ theme, effectiveMode, fontScale }),
    [theme, effectiveMode, fontScale],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
