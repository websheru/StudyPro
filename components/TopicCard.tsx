import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { TagChip } from '@/components/TagChip';
import { useTheme } from '@/context/ThemeContext';
import { useSettingsStore } from '@/store/settingsStore';
import type { Topic } from '@/types';

function getRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

interface TopicCardProps {
  topic: Topic;
  onPress: () => void;
  onDelete: (id: string) => void;
  onPin?: (id: string) => void;
}

export function TopicCard({ topic, onPress, onDelete, onPin }: TopicCardProps) {
  const { theme } = useTheme();
  const { cardDensity, showWordCount } = useSettingsStore();
  const swipeRef = useRef<Swipeable>(null);
  const pad = cardDensity === 'compact' ? 12 : 16;
  const wc = wordCount(topic.content);
  const readTime = Math.max(1, Math.ceil(wc / 200));
  const excerpt = topic.content.replace(/\n+/g, ' ').trim().slice(0, 110);

  const renderRightActions = () => (
    <TouchableOpacity
      style={[styles.deleteBtn, { backgroundColor: theme.colors.danger, borderRadius: theme.radius.lg }]}
      onPress={() => {
        swipeRef.current?.close();
        Alert.alert('Move to Trash?', `"${topic.title || 'Untitled'}" will be moved to trash.`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(topic.id) },
        ]);
      }}
    >
      <Ionicons name="trash-outline" size={22} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions} rightThreshold={40} overshootRight={false}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={() => onPin?.(topic.id)}
        style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: topic.isPinned ? `${theme.colors.accent}60` : theme.colors.surfaceBorder, borderRadius: theme.radius.lg, padding: pad }]}
        activeOpacity={0.82}
      >
        {topic.isPinned && (
          <View style={styles.pinBadge}>
            <Ionicons name="pin" size={12} color={theme.colors.accent} />
          </View>
        )}
        <AppText weight="semibold" size={16} numberOfLines={1} style={{ paddingRight: topic.isPinned ? 20 : 0, marginBottom: 4 }}>
          {topic.title || 'Untitled'}
        </AppText>
        {excerpt.length > 0 && (
          <AppText variant="secondary" size={13} numberOfLines={cardDensity === 'compact' ? 1 : 2} style={{ lineHeight: 19, marginBottom: 8 }}>
            {excerpt}
          </AppText>
        )}
        {topic.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {topic.tags.slice(0, 3).map((tag) => <TagChip key={tag} label={tag} small />)}
          </View>
        )}
        <View style={styles.footer}>
          {showWordCount ? (
            <AppText variant="secondary" size={11}>{wc} words · {readTime} min</AppText>
          ) : <View />}
          <AppText variant="secondary" size={11}>{getRelativeTime(topic.updatedAt)}</AppText>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 10, borderWidth: StyleSheet.hairlineWidth },
  pinBadge: { position: 'absolute', top: 12, right: 12, zIndex: 1 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deleteBtn: { width: 72, justifyContent: 'center', alignItems: 'center', marginBottom: 10, marginRight: 16 },
});
