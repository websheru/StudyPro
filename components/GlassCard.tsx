import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';

interface GlassCardProps extends ViewProps {
  padding?: number;
  noBorder?: boolean;
}

export function GlassCard({ children, style, padding = 0, noBorder = false, ...props }: GlassCardProps) {
  const { theme } = useTheme();
  const r = theme.radius.lg;
  return (
    <View
      style={[styles.container, { borderRadius: r, borderColor: noBorder ? 'transparent' : theme.colors.surfaceBorder, borderWidth: noBorder ? 0 : StyleSheet.hairlineWidth }, style]}
      {...props}
    >
      {Platform.OS !== 'web' && (
        <BlurView tint={theme.mode === 'dark' ? 'dark' : 'light'} intensity={65} style={[StyleSheet.absoluteFill, { borderRadius: r }]} />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.surface, borderRadius: r }]} />
      <View style={{ padding, position: 'relative' }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden' },
});
