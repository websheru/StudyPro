import React, { useCallback, useState } from 'react';
import {
  Alert, Platform, ScrollView, StyleSheet,
  Switch, Text, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { useTheme } from '@/context/ThemeContext';
import { ACCENT_COLORS } from '@/constants/theme';
import type { AccentColor, AutosaveInterval, CardDensity, CornerStyle, FilterView, FontFamily, SortOrder, ThemeMode } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';
import { useTopicStore } from '@/store/topicStore';
import { topicRepository } from '@/lib/repository';

function SectionHeader({ title }: { title: string }) {
  return (
    <AppText variant="secondary" weight="semibold" size={11} style={{ paddingHorizontal: 20, marginBottom: 8, letterSpacing: 0.8, textTransform: 'uppercase' }}>
      {title}
    </AppText>
  );
}

function Row({ label, description, right, onPress, danger = false, isLast = false }: {
  label: string; description?: string; right?: React.ReactNode; onPress?: () => void; danger?: boolean; isLast?: boolean;
}) {
  const { theme } = useTheme();
  const inner = (
    <View style={[styles.row, !isLast && { borderBottomColor: theme.colors.surfaceBorder, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={{ flex: 1, marginRight: right ? 12 : 0 }}>
        <AppText size={15} variant={danger ? 'danger' : 'primary'}>{label}</AppText>
        {description ? <AppText size={12} variant="secondary" style={{ marginTop: 2, lineHeight: 17 }}>{description}</AppText> : null}
      </View>
      {right}
    </View>
  );
  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{inner}</TouchableOpacity> : inner;
}

function Seg<T extends string>({ options, value, onChange }: { options: { label: string; value: T }[]; value: T; onChange: (v: T) => void }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.seg, { borderColor: theme.colors.surfaceBorder, borderRadius: theme.radius.sm }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity key={o.value} onPress={() => onChange(o.value)} style={[styles.segItem, { backgroundColor: active ? theme.colors.accent : 'transparent', borderRadius: theme.radius.sm - 2 }]}>
            <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: active ? '#fff' : theme.colors.textSecondary }}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const FONT_SCALE_STEPS = [{ label: 'S', value: 0.85 }, { label: 'Aa', value: 1.0 }, { label: 'A+', value: 1.15 }, { label: 'A++', value: 1.3 }, { label: 'A+++', value: 1.5 }];

function FontScalePicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { theme } = useTheme();
  return (
    <View style={styles.scaleRow}>
      {FONT_SCALE_STEPS.map((s) => {
        const active = Math.abs(value - s.value) < 0.01;
        return (
          <TouchableOpacity key={s.value} onPress={() => onChange(s.value)} style={[styles.scaleBtn, { backgroundColor: active ? theme.colors.accent : theme.colors.surface, borderColor: active ? theme.colors.accent : theme.colors.surfaceBorder, borderRadius: theme.radius.sm }]}>
            <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: active ? '#fff' : theme.colors.textSecondary }}>{s.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AccentPicker({ value, onChange }: { value: AccentColor; onChange: (v: AccentColor) => void }) {
  const { theme } = useTheme();
  const accents = Object.keys(ACCENT_COLORS) as AccentColor[];
  return (
    <View style={styles.accentRow}>
      {accents.map((a) => {
        const c = ACCENT_COLORS[a][theme.mode];
        const active = a === value;
        return (
          <TouchableOpacity key={a} onPress={() => onChange(a)} style={[styles.swatch, { backgroundColor: c, borderWidth: active ? 2.5 : 1.5, borderColor: active ? theme.colors.textPrimary : 'transparent', borderRadius: 20 }]} accessibilityLabel={`Accent color: ${a}`} />
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useSettingsStore();
  const [exportBusy, setExportBusy] = useState(false);

  const topWEB = Platform.select({ web: 67, default: 0 });
  const bottomWEB = Platform.select({ web: 34, default: 0 });

  const handleExport = useCallback(async () => {
    if (Platform.OS === 'web') { Alert.alert('Mobile only', 'Export requires the Expo Go app.'); return; }
    setExportBusy(true);
    try {
      const FileSystem = await import('expo-file-system/legacy');
      const Sharing = await import('expo-sharing');
      const { topics } = useTopicStore.getState();
      const exportData = { version: 1, topics: topics.filter((t) => !t.isDeleted), exportedAt: new Date().toISOString() };
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
      const filename = `studypro-backup-${dateStr}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2), { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Export Study Pro Backup' });
    } catch (e) {
      Alert.alert('Export failed', String(e));
    } finally {
      setExportBusy(false);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (Platform.OS === 'web') { Alert.alert('Mobile only', 'Import requires the Expo Go app.'); return; }
    try {
      const DocumentPicker = await import('expo-document-picker');
      const FileSystem = await import('expo-file-system/legacy');
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', '*/*'], copyToCacheDirectory: true });
      if (result.canceled) return;
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
      const data = JSON.parse(content);
      if (!data.topics || !Array.isArray(data.topics)) throw new Error('Invalid backup file');
      const valid = (data.topics as Record<string, unknown>[]).filter((t) => typeof t.title === 'string');
      Alert.alert('Import Backup', `Found ${valid.length} notes. Merge with existing data?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import', onPress: async () => {
            for (const t of valid) {
              if (!t.isDeleted) {
                await topicRepository.create({ title: (t.title as string) || '', content: (t.content as string) || '', tags: Array.isArray(t.tags) ? (t.tags as string[]) : [], folderId: t.folderId as string | undefined, isPinned: Boolean(t.isPinned), isArchived: Boolean(t.isArchived) });
              }
            }
            await useTopicStore.getState().loadTopics();
            Alert.alert('Done', `Imported ${valid.length} notes`);
          },
        },
      ]);
    } catch (e) {
      Alert.alert('Import failed', String(e));
    }
  }, []);

  const handleBiometricToggle = useCallback(async () => {
    if (Platform.OS === 'web') { Alert.alert('Mobile only', 'Biometric lock requires a real Android device.'); return; }
    try {
      const LocalAuth = await import('expo-local-authentication');
      const supported = await LocalAuth.hasHardwareAsync();
      const enrolled = await LocalAuth.isEnrolledAsync();
      if (!supported || !enrolled) { Alert.alert('Not available', 'Biometric authentication is not set up on this device.'); return; }
      if (!s.appLockEnabled) {
        const result = await LocalAuth.authenticateAsync({ promptMessage: 'Confirm to enable lock', cancelLabel: 'Cancel' });
        if (result.success) s.setAppLockEnabled(true);
      } else {
        s.setAppLockEnabled(false);
      }
    } catch { Alert.alert('Error', 'Could not access biometric authentication.'); }
  }, [s]);

  const topicCount = useTopicStore((st) => st.topics.filter((t) => !t.isDeleted).length);
  const trashedCount = useTopicStore((st) => st.topics.filter((t) => t.isDeleted).length);

  const themeOpts: { label: string; value: ThemeMode }[] = [{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }];
  const densityOpts: { label: string; value: CardDensity }[] = [{ label: 'Comfortable', value: 'comfortable' }, { label: 'Compact', value: 'compact' }];
  const cornerOpts: { label: string; value: CornerStyle }[] = [{ label: 'Rounded', value: 'rounded' }, { label: 'Sharp', value: 'sharp' }];
  const familyOpts: { label: string; value: FontFamily }[] = [{ label: 'Inter', value: 'inter' }, { label: 'Serif', value: 'serif' }, { label: 'Mono', value: 'mono' }];
  const sortOpts: { label: string; value: SortOrder }[] = [{ label: 'Modified', value: 'updatedAt' }, { label: 'Created', value: 'createdAt' }, { label: 'Title', value: 'title' }, { label: 'Pinned', value: 'pinned' }];
  const filterOpts: { label: string; value: FilterView }[] = [{ label: 'All', value: 'all' }, { label: 'Pinned', value: 'favorites' }, { label: 'Recent', value: 'recent' }];
  const autosaveOpts: { label: string; value: AutosaveInterval }[] = [{ label: 'Off', value: 'off' }, { label: '500ms', value: '500' }, { label: '800ms', value: '800' }, { label: '2s', value: '2000' }];
  const autoLockOpts: { label: string; value: string }[] = [{ label: 'Immediately', value: 'immediately' }, { label: '1 min', value: '1min' }, { label: '5 min', value: '5min' }, { label: 'Never', value: 'never' }];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + topWEB, height: insets.top + 52 + topWEB, borderBottomColor: theme.colors.surfaceBorder, backgroundColor: theme.colors.background }]}>
        <AppText weight="bold" size={22} style={styles.headerTitle}>Settings</AppText>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 90 + bottomWEB }} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Appearance" />
        <GlassCard style={styles.card}>
          <Row label="Theme" right={<Seg options={themeOpts} value={s.themeMode} onChange={s.setThemeMode} />} />
          <Row label="Accent Color" right={<AccentPicker value={s.accentColor} onChange={s.setAccentColor} />} />
          <Row label="Font Size" description="Live preview: The quick brown fox jumps" right={<FontScalePicker value={s.fontScale} onChange={s.setFontScale} />} />
          <Row label="Font Family" right={<Seg options={familyOpts} value={s.fontFamily} onChange={s.setFontFamily} />} />
          <Row label="Card Density" right={<Seg options={densityOpts} value={s.cardDensity} onChange={s.setCardDensity} />} />
          <Row label="Corner Style" right={<Seg options={cornerOpts} value={s.cornerStyle} onChange={s.setCornerStyle} />} isLast />
        </GlassCard>

        <View style={{ height: 20 }} />
        <SectionHeader title="Organization" />
        <GlassCard style={styles.card}>
          <Row label="Sort Order" right={<Seg options={sortOpts} value={s.sortOrder} onChange={s.setSortOrder} />} />
          <Row label="Default View" right={<Seg options={filterOpts} value={s.filterView} onChange={s.setFilterView} />} />
          <Row label="Word Count & Reading Time" description="Show on note cards" right={<Switch value={s.showWordCount} onValueChange={s.setShowWordCount} trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.accent }} thumbColor="#fff" />} isLast />
        </GlassCard>

        <View style={{ height: 20 }} />
        <SectionHeader title="Editor" />
        <GlassCard style={styles.card}>
          <Row label="Autosave" right={<Seg options={autosaveOpts} value={s.autosaveInterval} onChange={s.setAutosaveInterval} />} />
          <Row label="Markdown Preview" description="Preview formatted content while writing" right={<Switch value={s.markdownPreview} onValueChange={s.setMarkdownPreview} trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.accent }} thumbColor="#fff" />} />
          <Row label="Spellcheck" right={<Switch value={s.spellcheck} onValueChange={s.setSpellcheck} trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.accent }} thumbColor="#fff" />} isLast />
        </GlassCard>

        <View style={{ height: 20 }} />
        <SectionHeader title="Privacy & Security" />
        <GlassCard style={styles.card}>
          <Row label="App Lock" description="Require biometric to open" right={<Switch value={s.appLockEnabled} onValueChange={handleBiometricToggle} trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.accent }} thumbColor="#fff" />} />
          <Row label="Auto-Lock" right={<Seg options={autoLockOpts} value={s.autoLockTiming} onChange={s.setAutoLockTiming} />} />
          <Row label="Hide Previews" description="Hide note content in app switcher" right={<Switch value={s.hidePreviewsInSwitcher} onValueChange={s.setHidePreviewsInSwitcher} trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.accent }} thumbColor="#fff" />} isLast />
        </GlassCard>

        <View style={{ height: 20 }} />
        <SectionHeader title="Data Management" />
        <GlassCard style={styles.card}>
          <Row label={exportBusy ? 'Exporting…' : 'Export All Notes (JSON)'} description="Share backup to Files, Drive, etc." right={<Ionicons name="share-outline" size={18} color={theme.colors.accent} />} onPress={handleExport} />
          <Row label="Import Backup" description="Merge from a JSON backup file" right={<Ionicons name="download-outline" size={18} color={theme.colors.accent} />} onPress={handleImport} />
          <Row label="Storage Usage" description={`${topicCount} notes · ${trashedCount} in trash`} right={<Ionicons name="server-outline" size={18} color={theme.colors.textSecondary} />} />
          <Row label="Empty Trash" description={`Permanently delete ${trashedCount} trashed notes`} danger right={<Ionicons name="trash-outline" size={18} color={theme.colors.danger} />} onPress={() => Alert.alert('Empty Trash', 'Permanently delete all trashed notes?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Empty Trash', style: 'destructive', onPress: () => useTopicStore.getState().emptyTrash() }])} isLast />
        </GlassCard>

        <View style={{ height: 20 }} />
        <SectionHeader title="Notifications" />
        <GlassCard style={styles.card}>
          <Row label="Daily Study Reminder" description="Reminder to review your notes" right={<Switch value={s.studyReminderEnabled} onValueChange={s.setStudyReminderEnabled} trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.accent }} thumbColor="#fff" />} />
          <Row label="Review Reminder" description="Nudge for notes not opened in 7+ days" right={<Switch value={s.reviewReminderEnabled} onValueChange={s.setReviewReminderEnabled} trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.accent }} thumbColor="#fff" />} isLast />
        </GlassCard>

        <View style={{ height: 20 }} />
        <SectionHeader title="About" />
        <GlassCard style={styles.card}>
          <Row label="Version" description="1.0.0 (Build 1)" right={<AppText variant="secondary" size={13}>1.0.0</AppText>} />
          <Row label="Rate Study Pro" right={<Ionicons name="star-outline" size={18} color={theme.colors.accent} />} onPress={() => Alert.alert('Thank you!', 'App Store rating coming when published.')} />
          <Row label="Send Feedback" right={<Ionicons name="mail-outline" size={18} color={theme.colors.accent} />} onPress={() => Alert.alert('Feedback', 'feedback@studypro.app')} />
          <Row label="Open Source Licenses" right={<Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />} onPress={() => Alert.alert('Licenses', 'React Native, Expo, Zustand, and other open-source libraries.')} isLast />
        </GlassCard>

        <View style={styles.footer}>
          <AppText variant="secondary" size={12} style={{ textAlign: 'center' }}>© 2026 Developed by Narpat Prihar</AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, justifyContent: 'flex-end' },
  headerTitle: { paddingHorizontal: 20, paddingBottom: 12 },
  card: { marginHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, minHeight: 52 },
  seg: { flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, padding: 2, gap: 2 },
  segItem: { paddingHorizontal: 8, paddingVertical: 4 },
  scaleRow: { flexDirection: 'row', gap: 4 },
  scaleBtn: { paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1 },
  accentRow: { flexDirection: 'row', gap: 8 },
  swatch: { width: 26, height: 26 },
  footer: { paddingVertical: 32, paddingHorizontal: 20 },
});
