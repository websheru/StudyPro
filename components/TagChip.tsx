import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/context/ThemeContext';

interface TagChipProps {
  label: string;
  onRemove?: () => void;
  small?: boolean;
}

export function TagChip({ label, onRemove, small = false }: TagChipProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: `${theme.colors.accent}1A`, borderColor: `${theme.colors.accent}40`, borderRadius: small ? 4 : 6, paddingHorizontal: small ? 6 : 9, paddingVertical: small ? 2 : 4 }]}>
      <AppText variant="accent" size={small ? 11 : 12} weight="medium">{label}</AppText>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <AppText variant="accent" size={11}> ×</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
});
