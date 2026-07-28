import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reloadAppAsync } from 'expo';

export type ErrorFallbackProps = { error: Error; resetError: () => void };

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const insets = useSafeAreaInsets();

  const handleRestart = async () => {
    try { await reloadAppAsync(); } catch { resetError(); }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error.message}</Text>
      <Pressable onPress={handleRestart} style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}>
        <Text style={styles.buttonText}>Restart App</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#0f172a' },
  title: { fontSize: 22, fontWeight: '700', color: '#f8fafc', marginBottom: 12, textAlign: 'center' },
  message: { fontSize: 14, color: '#94a3b8', marginBottom: 32, textAlign: 'center', lineHeight: 20 },
  button: { backgroundColor: '#00f2fe', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: '#0f172a', fontWeight: '700', fontSize: 15 },
});
