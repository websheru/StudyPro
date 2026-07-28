/**
 * New Topic screen — modal presentation.
 * Creates a blank topic in the store and immediately navigates
 * to the editor screen so the user works in one consistent UI.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/context/ThemeContext';
import { useTopicStore } from '@/store/topicStore';

const TEMPLATES = [
  {
    id: 'blank',
    label: 'Blank',
    icon: 'document-outline' as const,
    title: '',
    content: '',
  },
  {
    id: 'cornell',
    label: 'Cornell Notes',
    icon: 'grid-outline' as const,
    title: 'Cornell Notes',
    content: `# Main Topic\n\n## Cue Column\n- Key question or keyword 1\n- Key question or keyword 2\n- Key question or keyword 3\n\n## Notes Column\nWrite your detailed notes here. Expand on each cue. Include examples, explanations, and diagrams.\n\n---\n\n## Summary\nWrite a brief summary of the main ideas in this section. Review and revise after class.`,
  },
  {
    id: 'outline',
    label: 'Bullet Outline',
    icon: 'list-outline' as const,
    title: 'Outline',
    content: `# Topic Title\n\n## I. Main Point\n- Supporting detail\n- Supporting detail\n  - Sub-point\n\n## II. Main Point\n- Supporting detail\n- Supporting detail\n\n## III. Main Point\n- Supporting detail\n- Supporting detail\n\n---\n## Key Takeaways\n- \n- \n- `,
  },
];

export default function NewTopicScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const addTopic = useTopicStore((s) => s.addTopic);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [quickTitle, setQuickTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const titleRef = useRef<TextInput>(null);

  const topWEB = Platform.select({ web: 67, default: 0 });
  const bottomWEB = Platform.select({ web: 34, default: 0 });

  useEffect(() => {
    // Auto-focus title after mount
    const t = setTimeout(() => titleRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const template = TEMPLATES.find((t) => t.id === selectedTemplate)!;
      const topic = await addTopic({
        title: quickTitle.trim() || template.title || 'Untitled',
        content: template.content,
        tags: [],
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Navigate to editor — replace so back goes to home
      router.replace(`/topic/${topic.id}` as const);
    } catch {
      setCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + topWEB,
            borderBottomColor: theme.colors.surfaceBorder,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <AppText weight="semibold" size={17} style={{ flex: 1, textAlign: 'center' }}>
            New Note
          </AppText>

          <TouchableOpacity
            onPress={handleCreate}
            disabled={creating}
            style={[
              styles.createBtn,
              {
                backgroundColor: theme.colors.accent,
                borderRadius: theme.radius.md,
                opacity: creating ? 0.6 : 1,
              },
            ]}
          >
            <AppText size={14} weight="semibold" style={{ color: '#fff' }}>
              {creating ? 'Creating…' : 'Create'}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 + bottomWEB }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title field */}
          <AppText variant="secondary" size={12} weight="semibold" style={styles.sectionLabel}>
            TITLE
          </AppText>
          <TextInput
            ref={titleRef}
            value={quickTitle}
            onChangeText={setQuickTitle}
            placeholder="What are you studying?"
            placeholderTextColor={theme.colors.textSecondary}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
            style={[
              styles.titleInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.surfaceBorder,
                borderRadius: theme.radius.md,
                color: theme.colors.textPrimary,
                fontFamily: 'Inter_600SemiBold',
              },
            ]}
          />

          {/* Template picker */}
          <AppText
            variant="secondary"
            size={12}
            weight="semibold"
            style={[styles.sectionLabel, { marginTop: 24 }]}
          >
            TEMPLATE
          </AppText>
          <View style={styles.templateGrid}>
            {TEMPLATES.map((t) => {
              const active = selectedTemplate === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setSelectedTemplate(t.id)}
                  style={[
                    styles.templateCard,
                    {
                      backgroundColor: active ? `${theme.colors.accent}18` : theme.colors.surface,
                      borderColor: active ? theme.colors.accent : theme.colors.surfaceBorder,
                      borderRadius: theme.radius.lg,
                    },
                  ]}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.templateIcon,
                      { backgroundColor: active ? `${theme.colors.accent}30` : theme.colors.surfaceBorder },
                    ]}
                  >
                    <Ionicons
                      name={t.icon}
                      size={22}
                      color={active ? theme.colors.accent : theme.colors.textSecondary}
                    />
                  </View>
                  <AppText
                    size={13}
                    weight={active ? 'semibold' : 'regular'}
                    variant={active ? 'accent' : 'primary'}
                    style={{ marginTop: 8, textAlign: 'center' }}
                  >
                    {t.label}
                  </AppText>
                  {active && (
                    <View style={[styles.activeCheck, { backgroundColor: theme.colors.accent }]}>
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Preview snippet */}
          {selectedTemplate !== 'blank' && (
            <>
              <AppText
                variant="secondary"
                size={12}
                weight="semibold"
                style={[styles.sectionLabel, { marginTop: 24 }]}
              >
                PREVIEW
              </AppText>
              <View
                style={[
                  styles.previewBox,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.surfaceBorder,
                    borderRadius: theme.radius.md,
                  },
                ]}
              >
                <AppText
                  variant="secondary"
                  size={12}
                  style={{ fontFamily: 'monospace', lineHeight: 18 }}
                  numberOfLines={8}
                >
                  {TEMPLATES.find((t) => t.id === selectedTemplate)?.content ?? ''}
                </AppText>
              </View>
            </>
          )}

          {/* Shortcut tip */}
          <View style={styles.tipRow}>
            <Ionicons name="information-circle-outline" size={14} color={theme.colors.textSecondary} />
            <AppText variant="secondary" size={12} style={{ marginLeft: 6, flex: 1 }}>
              Tip: Use # for headings, **bold**, *italic*, and - for bullet lists in the editor.
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerBtn: { padding: 4 },
  createBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  sectionLabel: { marginBottom: 8, letterSpacing: 0.6 },
  titleInput: {
    fontSize: 17,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  templateGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  templateCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderWidth: 1.5,
    position: 'relative',
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBox: {
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    opacity: 0.7,
  },
});
