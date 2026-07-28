import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

function SkeletonRect({ w, h, style }: { w: number | `${number}%`; h: number; style?: object }) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.45);
  useEffect(() => { opacity.value = withRepeat(withTiming(1, { duration: 750 }), -1, true); }, [opacity]);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[{ width: w as number, height: h, backgroundColor: theme.colors.skeleton, borderRadius: 6 }, anim, style]} />
  );
}

export function SkeletonCard() {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder, borderRadius: theme.radius.lg }]}>
      <SkeletonRect w="62%" h={18} />
      <View style={{ height: 8 }} />
      <SkeletonRect w="92%" h={13} />
      <View style={{ height: 5 }} />
      <SkeletonRect w="78%" h={13} />
      <View style={{ height: 14 }} />
      <View style={styles.footer}>
        <SkeletonRect w={56} h={20} />
        <SkeletonRect w={76} h={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, marginHorizontal: 16, marginBottom: 10, borderWidth: StyleSheet.hairlineWidth },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
