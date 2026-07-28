/**
 * Topic Editor / Detail screen.
 * Supports view + edit mode, autosave, markdown preview,
 * word count, tag management, undo/redo, and an export bottom-sheet.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, ScrollView,
  StyleSheet, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/context/ThemeContext';
import { useSettingsStore } from '@/store/settingsStore';
import { useTopicStore } from '@/store/topicStore';

// ─── helpers ────────────────────────────────────────────────────────────────

function wordCount(text: string) { return text.trim().split(/\s+/).filter(Boolean).length; }
function readTime(wc: number) { return Math.max(1, Math.ceil(wc / 200)); }

// ─── Markdown preview ────────────────────────────────────────────────────────

function MarkdownLine({ line, theme }: { line: string; theme: any }) {
  if (line.startsWith('# ')) return <AppText weight="bold" size={22} style={styles.mdH1}>{line.slice(2)}</AppText>;
  if (line.startsWith('## ')) return <AppText weight="bold" size={18} style={styles.mdH2}>{line.slice(3)}</AppText>;
  if (line.startsWith('### ')) return <AppText weight="semibold" size={16} style={styles.mdH3}>{line.slice(4)}</AppText>;
  if (/^[-*]\s/.test(line)) return (
    <View style={styles.mdBulletRow}>
      <AppText variant="accent" size={15} style={{ marginTop: 2 }}>•</AppText>
      <AppText size={15} style={styles.mdBulletText}>{line.slice(2)}</AppText>
    </View>
  );
  if (/^- \[[ x]\]/.test(line)) {
    const checked = line.startsWith('- [x]');
    return (
      <View style={styles.mdBulletRow}>
        <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={16} color={checked ? theme.colors.accent : theme.colors.textSecondary} style={{ marginTop: 2 }} />
        <AppText size={15} variant={checked ? 'secondary' : 'primary'} style={[styles.mdBulletText, checked && { textDecorationLine: 'line-through' as const }]}>{line.slice(6)}</AppText>
      </View>
    );
  }
  if (line.trim() === '') return <View style={{ height: 8 }} />;
  return <AppText size={15} style={styles.mdPara}>{line}</AppText>;
}

function MarkdownPreview({ content, theme }: { content: string; theme: any }) {
  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
      {content.split('\n').map((line, i) => <MarkdownLine key={i} line={line} theme={theme} />)}
    </View>
  );
}

// ─── Tag editor ──────────────────────────────────────────────────────────────

function TagEditor({ tags, onChange, theme }: { tags: string[]; onChange: (tags: string[]) => void; theme: any }) {
  const [input, setInput] = useState('');
  const addTag = () => {
    const t = input.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };
  return (
    <View style={[styles.tagEditorRow, { borderBottomColor: theme.colors.surfaceBorder }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagScroll}>
        {tags.map((tag) => (
          <TouchableOpacity key={tag} onPress={() => onChange(tags.filter((x) => x !== tag))} style={[styles.tagChip, { backgroundColor: `${theme.colors.accent}22`, borderColor: `${theme.colors.accent}55`, borderRadius: theme.radius.sm }]}>
            <AppText variant="accent" size={12} weight="medium">{tag}</AppText>
            <Ionicons name="close" size={11} color={theme.colors.accent} />
          </TouchableOpacity>
        ))}
        <TextInput value={input} onChangeText={setInput} onSubmitEditing={addTag} onBlur={addTag} placeholder="Add tag…" placeholderTextColor={theme.colors.textSecondary} returnKeyType="done" style={[styles.tagInput, { color: theme.colors.textPrimary, fontFamily: 'Inter_400Regular' }]} />
      </ScrollView>
    </View>
  );
}

// ─── Action sheet ────────────────────────────────────────────────────────────

function ActionSheet({ visible, onClose, onExportPDF, onShareText, onDuplicate, onDelete, onArchive, onRestore, isArchived, isDeleted, theme }: {
  visible: boolean; onClose: () => void; onExportPDF: () => void; onShareText: () => void;
  onDuplicate: () => void; onDelete: () => void; onArchive: () => void; onRestore: () => void;
  isArchived: boolean; isDeleted: boolean; theme: any;
}) {
  const insets = useSafeAreaInsets();
  const actions = [
    { icon: 'document-text-outline' as const, label: 'Export as PDF', onPress: onExportPDF },
    { icon: 'share-outline' as const, label: 'Share as Text', onPress: onShareText },
    { icon: 'copy-outline' as const, label: 'Duplicate', onPress: onDuplicate },
    ...(isDeleted
      ? [{ icon: 'arrow-undo-outline' as const, label: 'Restore from Trash', onPress: onRestore }]
      : isArchived
      ? [{ icon: 'archive-outline' as const, label: 'Unarchive', onPress: onArchive }]
      : [{ icon: 'archive-outline' as const, label: 'Archive', onPress: onArchive }]),
    { icon: 'trash-outline' as const, label: isDeleted ? 'Delete Permanently' : 'Move to Trash', onPress: onDelete, danger: true },
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />
      <View style={[styles.sheet, { backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.surfaceBorder, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.sheetHandle, { backgroundColor: theme.colors.surfaceBorder }]} />
        <AppText weight="semibold" size={16} style={styles.sheetTitle}>Note Actions</AppText>
        {actions.map((a) => (
          <TouchableOpacity key={a.label} onPress={() => { onClose(); setTimeout(a.onPress, 300); }} style={[styles.sheetRow, { borderTopColor: theme.colors.surfaceBorder }]}>
            <Ionicons name={a.icon} size={20} color={a.danger ? theme.colors.danger : theme.colors.accent} />
            <AppText size={15} variant={a.danger ? 'danger' : 'primary'} style={{ marginLeft: 12 }}>{a.label}</AppText>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={onClose} style={[styles.sheetRow, { borderTopColor: theme.colors.surfaceBorder, marginTop: 4 }]}>
          <Ionicons name="close-circle-outline" size={20} color={theme.colors.textSecondary} />
          <AppText size={15} variant="secondary" style={{ marginLeft: 12 }}>Cancel</AppText>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Main editor ─────────────────────────────────────────────────────────────

const AUTOSAVE_DELAYS: Record<string, number | null> = { off: null, '500': 500, '800': 800, '2000': 2000 };
const MAX_UNDO = 50;

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { autosaveInterval, markdownPreview } = useSettingsStore();

  const getTopic = useTopicStore((s) => s.getById);
  const updateTopic = useTopicStore((s) => s.updateTopic);
  const deleteTopic = useTopicStore((s) => s.deleteTopic);
  const permanentDeleteTopic = useTopicStore((s) => s.permanentDeleteTopic);
  const restoreTopic = useTopicStore((s) => s.restoreTopic);
  const duplicateTopic = useTopicStore((s) => s.duplicateTopic);
  const toggleArchive = useTopicStore((s) => s.toggleArchive);

  const topic = getTopic(id ?? '');

  const [title, setTitle] = useState(topic?.title ?? '');
  const [content, setContent] = useState(topic?.content ?? '');
  const [tags, setTags] = useState<string[]>(topic?.tags ?? []);
  const [saved, setSaved] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const [showPreview, setShowPreview] = useState(markdownPreview);

  const undoStack = useRef<{ title: string; content: string }[]>([]);
  const redoStack = useRef<{ title: string; content: string }[]>([]);
  const lastSnapshot = useRef({ title, content });

  const pushUndo = useCallback(() => {
    const snap = lastSnapshot.current;
    if (snap.title !== title || snap.content !== content) {
      undoStack.current = [...undoStack.current.slice(-MAX_UNDO), snap];
      redoStack.current = [];
      lastSnapshot.current = { title, content };
    }
  }, [title, content]);

  const handleUndo = useCallback(() => {
    if (!undoStack.current.length) return;
    const prev = undoStack.current.pop()!;
    redoStack.current.push({ title, content });
    setTitle(prev.title); setContent(prev.content);
    lastSnapshot.current = prev; setSaved(false);
  }, [title, content]);

  const handleRedo = useCallback(() => {
    if (!redoStack.current.length) return;
    const next = redoStack.current.pop()!;
    undoStack.current.push({ title, content });
    setTitle(next.title); setContent(next.content);
    lastSnapshot.current = next; setSaved(false);
  }, [title, content]);

  const doSave = useCallback(async () => {
    if (!id) return;
    await updateTopic(id, { title, content, tags });
    setSaved(true);
  }, [id, title, content, tags, updateTopic]);

  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const delay = AUTOSAVE_DELAYS[autosaveInterval];
    if (delay === null) return;
    setSaved(false);
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(doSave, delay);
    return () => { if (autosaveRef.current) clearTimeout(autosaveRef.current); };
  }, [title, content, tags, doSave, autosaveInterval]);

  const wc = useMemo(() => wordCount(content), [content]);
  const rt = readTime(wc);

  const topWEB = Platform.select({ web: 67, default: 0 });
  const bottomWEB = Platform.select({ web: 34, default: 0 });
  const HEADER_H = 56;

  const handleExportPDF = useCallback(async () => {
    if (Platform.OS === 'web') { Alert.alert('Mobile only', 'PDF export requires Expo Go.'); return; }
    try {
      const Print = await import('expo-print');
      const Sharing = await import('expo-sharing');
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:0 auto;color:#1a202c}h1{font-size:28px;margin-bottom:8px}pre{white-space:pre-wrap;font-size:15px;line-height:1.7}.footer{margin-top:60px;border-top:1px solid #e2e8f0;padding-top:12px;color:#94a3b8;font-size:12px;text-align:center}</style></head><body><h1>${title || 'Untitled'}</h1><p style="color:#64748b;font-size:13px">${new Date().toLocaleDateString()} | ${wc} words | ${rt} min read</p><pre>${content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre><div class="footer">Exported from Study Pro · © 2026 Narpat Prihar</div></body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share PDF' });
    } catch (e) { Alert.alert('Export failed', String(e)); }
  }, [title, content, wc, rt]);

  const handleShareText = useCallback(async () => {
    if (Platform.OS === 'web') { Alert.alert('Mobile only', 'Sharing requires Expo Go.'); return; }
    try {
      const Sharing = await import('expo-sharing');
      const FileSystem = await import('expo-file-system/legacy');
      const text = `${title}\n${'─'.repeat(40)}\n${content}\n\nExported from Study Pro`;
      const uri = `${FileSystem.cacheDirectory}studypro-note.txt`;
      await FileSystem.writeAsStringAsync(uri, text, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(uri, { mimeType: 'text/plain', dialogTitle: 'Share Note' });
    } catch (e) { Alert.alert('Share failed', String(e)); }
  }, [title, content]);

  const handleDuplicate = useCallback(async () => {
    if (!id) return;
    await doSave();
    const dup = await duplicateTopic(id);
    if (dup) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.replace(`/topic/${dup.id}` as const); }
  }, [id, doSave, duplicateTopic]);

  const handleDelete = useCallback(() => {
    if (!id) return;
    const isDeleted = topic?.isDeleted ?? false;
    Alert.alert(isDeleted ? 'Delete Permanently?' : 'Move to Trash?', isDeleted ? 'This note will be permanently deleted.' : `"${title || 'Untitled'}" will be moved to the trash.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: isDeleted ? 'Delete' : 'Trash', style: 'destructive', onPress: async () => { if (isDeleted) await permanentDeleteTopic(id); else await deleteTopic(id); router.back(); } },
    ]);
  }, [id, topic, title, deleteTopic, permanentDeleteTopic]);

  const handleRestore = useCallback(async () => {
    if (!id) return;
    await restoreTopic(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [id, restoreTopic]);

  const handleArchive = useCallback(async () => {
    if (!id) return;
    await toggleArchive(id);
    router.back();
  }, [id, toggleArchive]);

  if (!topic) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <AppText variant="secondary">Note not found.</AppText>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <AppText variant="accent">Go back</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  const isReadOnly = topic.isDeleted;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + topWEB, height: insets.top + HEADER_H + topWEB, borderBottomColor: theme.colors.surfaceBorder, backgroundColor: theme.colors.background }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => { if (!saved) doSave(); router.back(); }} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
          <View style={styles.headerMeta}>
            <AppText variant="secondary" size={11}>{wc} words · {rt} min</AppText>
            <View style={[styles.savedBadge, { backgroundColor: saved ? `${theme.colors.success}22` : `${theme.colors.danger}22` }]}>
              <View style={[styles.savedDot, { backgroundColor: saved ? theme.colors.success : theme.colors.danger }]} />
              <AppText variant={saved ? 'success' : 'danger'} size={11} weight="medium">{saved ? 'Saved' : 'Unsaved'}</AppText>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleUndo} style={styles.headerBtn}>
              <Ionicons name="arrow-undo-outline" size={20} color={undoStack.current.length ? theme.colors.textPrimary : theme.colors.surfaceBorder} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRedo} style={styles.headerBtn}>
              <Ionicons name="arrow-redo-outline" size={20} color={redoStack.current.length ? theme.colors.textPrimary : theme.colors.surfaceBorder} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPreview((p) => !p)} style={styles.headerBtn}>
              <Ionicons name={showPreview ? 'eye-off-outline' : 'eye-outline'} size={20} color={showPreview ? theme.colors.accent : theme.colors.textPrimary} />
            </TouchableOpacity>
            {!isReadOnly && (
              <TouchableOpacity onPress={doSave} style={styles.headerBtn}>
                <Ionicons name="checkmark-done" size={22} color={theme.colors.accent} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowSheet(true)} style={styles.headerBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={insets.top + HEADER_H + topWEB}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 40 + bottomWEB }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TextInput value={title} onChangeText={(t) => { pushUndo(); setTitle(t); setSaved(false); }} placeholder="Title" placeholderTextColor={theme.colors.textSecondary} multiline editable={!isReadOnly} style={[styles.titleInput, { color: theme.colors.textPrimary, fontFamily: 'Inter_700Bold', borderBottomColor: theme.colors.surfaceBorder }]} />
          {!isReadOnly && <TagEditor tags={tags} onChange={(t) => { setTags(t); setSaved(false); }} theme={theme} />}
          {topic.isDeleted && (
            <View style={[styles.deletedBanner, { backgroundColor: `${theme.colors.danger}18`, borderColor: `${theme.colors.danger}44` }]}>
              <Ionicons name="trash-outline" size={14} color={theme.colors.danger} />
              <AppText variant="danger" size={13} style={{ marginLeft: 6 }}>This note is in the trash. Restore or delete it permanently.</AppText>
            </View>
          )}
          {showPreview ? (
            <MarkdownPreview content={content} theme={theme} />
          ) : (
            <TextInput value={content} onChangeText={(t) => { pushUndo(); setContent(t); setSaved(false); }} placeholder={isReadOnly ? '(empty)' : 'Start writing…\n\nTips: Use # for headings, - for bullets, **bold**, *italic*'} placeholderTextColor={theme.colors.textSecondary} multiline editable={!isReadOnly} textAlignVertical="top" style={[styles.contentInput, { color: theme.colors.textPrimary, fontFamily: 'Inter_400Regular' }]} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ActionSheet visible={showSheet} onClose={() => setShowSheet(false)} onExportPDF={handleExportPDF} onShareText={handleShareText} onDuplicate={handleDuplicate} onDelete={handleDelete} onArchive={handleArchive} onRestore={handleRestore} isArchived={topic.isArchived} isDeleted={topic.isDeleted} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, justifyContent: 'flex-end' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 8, gap: 4 },
  headerBtn: { padding: 6 },
  headerMeta: { flex: 1, alignItems: 'center', gap: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  savedDot: { width: 6, height: 6, borderRadius: 3 },
  titleInput: { fontSize: 26, fontWeight: '700', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 60 },
  contentInput: { fontSize: 15, lineHeight: 24, paddingHorizontal: 20, paddingTop: 16, minHeight: 400 },
  tagEditorRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  tagScroll: { paddingHorizontal: 16, gap: 6, flexDirection: 'row', alignItems: 'center' },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1 },
  tagInput: { fontSize: 13, minWidth: 80, paddingVertical: 4 },
  deletedBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, padding: 10, borderRadius: 8, borderWidth: 1 },
  mdH1: { marginBottom: 8, marginTop: 12 },
  mdH2: { marginBottom: 6, marginTop: 10 },
  mdH3: { marginBottom: 4, marginTop: 8 },
  mdPara: { lineHeight: 24, marginBottom: 4 },
  mdBulletRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  mdBulletText: { flex: 1, lineHeight: 24 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  sheetTitle: { paddingHorizontal: 20, paddingVertical: 12 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderTopWidth: StyleSheet.hairlineWidth },
});
