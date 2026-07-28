import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  bottom?: number;
}

export function FAB({ onPress, icon = 'add', bottom = 24 }: FABProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress();
  };

  return (
    <AnimatedTouchable
      style={[styles.fab, anim, { backgroundColor: theme.colors.accent, borderRadius: theme.radius.xl, bottom }]}
      onPress={handlePress}
      onPressIn={() => { scale.value = withSpring(0.88, { stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { stiffness: 300 }); }}
      activeOpacity={1}
    >
      <Ionicons name={icon} size={28} color="#fff" />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', right: 20, width: 58, height: 58, alignItems: 'center', justifyContent: 'center', elevation: 10, zIndex: 100 },
});
