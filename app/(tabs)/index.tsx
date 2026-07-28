import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { SearchBar } from '@/components/SearchBar';
import { SkeletonCard } from '@/components/SkeletonCard';
import { TopicCard } from '@/components/TopicCard';
import { useTheme } from '@/context/ThemeContext';
import { useSettingsStore } from '@/store/settingsStore';
import { filterTopics, useTopicStore } from '@/store/topicStore';
import type { FilterView } from '@/constants/theme';
import type { Topic } from '@/types';

const FILTER_TABS: { key: FilterView; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all',      label: 'All',      icon: 'layers-outline' },
  { key: 'favorites',label: 'Pinned',   icon: 'pin-outline' },
  { key: 'recent',   label: 'Recent',   icon: 'time-outline' },
  { key: 'archived', label: 'Archived', icon: 'archive-outline' },
  { key: 'trash',    label: 'Trash',    icon: 'trash-outline' },
];

export default function HomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const allTopics  = useTopicStore((s) => s.topics);
  const isLoading  = useTopicStore((s) => s.isLoading);
  const loadTopics = useTopicStore((s) => s.loadTopics);
  const deleteTopic        = useTopicStore((s) => s.deleteTopic);
  const permanentDeleteTopic = useTopicStore((s) => s.permanentDeleteTopic);
  const togglePin  = useTopicStore((s) => s.togglePin);
  const emptyTrash = useTopicStore((s) => s.emptyTrash);

  const { sortOrder, filterView, setFilterView } = useSettingsStore();

  const topics = useMemo(
    () => filterTopics(allTopics, filterView, sortOrder, search),
    [allTopics, filterView, sortOrder, search],
  );

  const activeCount = useMemo(
    () => allTopics.filter((t) => !t.isDeleted && !t.isArchived).length,
    [allTopics],
  );

  useEffect(() => { loadTopics(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTopics();
    setRefreshing(false);
  }, [loadTopics]);

  const handleDelete = useCallback((id: string) => {
    if (filterView === 'trash') permanentDeleteTopic(id);
    else deleteTopic(id);
  }, [filterView, deleteTopic, permanentDeleteTopic]);

  const topWEB = Platform.select({ web: 67, default: 0 });
  const bottomWEB = Platform.select({ web: 34, default: 0 });
  const HEADER_H = 52;
  const contentPaddingBottom = insets.bottom + 90 + bottomWEB;

  const renderItem = useCallback(({ item }: { item: Topic }) => (
    <TopicCard
      topic={item}
      onPress={() => router.push(`/topic/${item.id}` as const)}
      onDelete={handleDelete}
      onPin={togglePin}
    />
  ), [handleDelete, togglePin]);

  const ListHeader = useMemo(() => (
    <View style={{ paddingTop: 8 }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <SearchBar value={search} onChangeText={setSearch} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTER_TABS.map((tab) => {
          const active = filterView === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilterView(tab.key)}
              style={[styles.filterTab, {
                backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                borderColor: active ? theme.colors.accent : theme.colors.surfaceBorder,
                borderRadius: theme.radius.md,
              }]}
            >
              <Ionicons name={tab.icon} size={13} color={active ? '#fff' : theme.colors.textSecondary} />
              <AppText size={13} weight="medium" style={{ color: active ? '#fff' : theme.colors.textSecondary }}>
                {tab.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {filterView === 'trash' && topics.length > 0 && (
        <TouchableOpacity
          style={[styles.emptyTrashBtn, { borderColor: theme.colors.danger }]}
          onPress={() =>
            Alert.alert('Empty Trash', 'Permanently delete all trashed notes?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Empty Trash', style: 'destructive', onPress: emptyTrash },
            ])
          }
        >
          <Ionicons name="trash" size={13} color={theme.colors.danger} />
          <AppText variant="danger" size={13} weight="medium">Empty Trash</AppText>
        </TouchableOpacity>
      )}
    </View>
  ), [search, filterView, topics.length, theme, setFilterView, emptyTrash]);

  const ListEmpty = useMemo(() => {
    if (isLoading) return (
      <>
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </>
    );
    return (
      <EmptyState
        icon={filterView === 'trash' ? 'trash-outline' : 'book-outline'}
        title={
          search ? 'No matching notes' :
          filterView === 'trash' ? 'Trash is empty' :
          filterView === 'favorites' ? 'No pinned notes' :
          filterView === 'archived' ? 'Nothing archived' :
          'No notes yet'
        }
        description={
          !search && filterView === 'all' ? 'Tap + to create your first note' : undefined
        }
      />
    );
  }, [isLoading, filterView, search]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + topWEB,
        height: insets.top + HEADER_H + topWEB,
        borderBottomColor: theme.colors.surfaceBorder,
        backgroundColor: theme.colors.background,
      }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <AppText weight="bold" size={22}>Study Pro</AppText>
            <View style={[styles.badge, { backgroundColor: `${theme.colors.accent}22` }]}>
              <AppText variant="accent" size={12} weight="semibold">{activeCount}</AppText>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={isLoading ? [] : topics}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {filterView !== 'trash' && (
        <FAB onPress={() => router.push('/topic/new')} bottom={24 + insets.bottom + bottomWEB} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, justifyContent: 'flex-end' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, paddingVertical: 6, gap: 5, borderWidth: StyleSheet.hairlineWidth },
  emptyTrashBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end', marginRight: 16, marginBottom: 8, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
});
