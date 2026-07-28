import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSettingsStore } from '@/store/settingsStore';

const FONT_FAMILIES = {
  inter: { regular: 'Inter_400Regular', medium: 'Inter_500Medium', semibold: 'Inter_600SemiBold', bold: 'Inter_700Bold' },
  serif: { regular: 'serif', medium: 'serif', semibold: 'serif', bold: 'serif' },
  mono: { regular: 'monospace', medium: 'monospace', semibold: 'monospace', bold: 'monospace' },
} as const;

interface AppTextProps extends TextProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'success';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  size?: number;
}

export function AppText({ children, style, variant = 'primary', weight = 'regular', size, ...props }: AppTextProps) {
  const { theme, fontScale } = useTheme();
  const fontFamily = useSettingsStore((s) => s.fontFamily);

  const colorMap: Record<NonNullable<AppTextProps['variant']>, string> = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    accent: theme.colors.accent,
    danger: theme.colors.danger,
    success: theme.colors.success,
  };

  const flatStyle = StyleSheet.flatten(style);
  const baseSize = size ?? flatStyle?.fontSize ?? 15;
  const scaledSize = baseSize * fontScale;
  const fontFamilyName = FONT_FAMILIES[fontFamily][weight];

  return (
    <Text
      style={[{ color: colorMap[variant], fontFamily: fontFamilyName }, style, { fontSize: scaledSize }]}
      {...props}
    >
      {children}
    </Text>
  );
}
