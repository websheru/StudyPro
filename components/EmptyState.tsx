import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/context/ThemeContext';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({ icon = 'book-outline', title, description }: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: `${theme.colors.accent}1A`, borderRadius: theme.radius.xl }]}>
        <Ionicons name={icon} size={44} color={theme.colors.accent} />
      </View>
      <AppText weight="semibold" size={17} style={styles.title}>{title}</AppText>
      {description && <AppText variant="secondary" size={14} style={styles.desc}>{description}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 60, gap: 10 },
  iconWrap: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  title: { textAlign: 'center' },
  desc: { textAlign: 'center', lineHeight: 22 },
});
