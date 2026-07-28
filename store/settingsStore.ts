import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AccentColor, AutosaveInterval, CardDensity, CornerStyle,
  FilterView, FontFamily, SortOrder, ThemeMode,
} from '@/constants/theme';

interface SettingsState {
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  themeMode: ThemeMode;
  accentColor: AccentColor;
  fontScale: number;
  fontFamily: FontFamily;
  cardDensity: CardDensity;
  cornerStyle: CornerStyle;
  sortOrder: SortOrder;
  filterView: FilterView;
  showWordCount: boolean;
  autosaveInterval: AutosaveInterval;
  markdownPreview: boolean;
  spellcheck: boolean;
  appLockEnabled: boolean;
  autoLockTiming: string;
  hidePreviewsInSwitcher: boolean;
  studyReminderEnabled: boolean;
  reviewReminderEnabled: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setFontScale: (scale: number) => void;
  setFontFamily: (family: FontFamily) => void;
  setCardDensity: (density: CardDensity) => void;
  setCornerStyle: (style: CornerStyle) => void;
  setSortOrder: (order: SortOrder) => void;
  setFilterView: (view: FilterView) => void;
  setShowWordCount: (show: boolean) => void;
  setAutosaveInterval: (interval: AutosaveInterval) => void;
  setMarkdownPreview: (enabled: boolean) => void;
  setSpellcheck: (enabled: boolean) => void;
  setAppLockEnabled: (enabled: boolean) => void;
  setAutoLockTiming: (timing: string) => void;
  setHidePreviewsInSwitcher: (hide: boolean) => void;
  setStudyReminderEnabled: (enabled: boolean) => void;
  setReviewReminderEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),
      themeMode: 'system',
      accentColor: 'cyan',
      fontScale: 1,
      fontFamily: 'inter',
      cardDensity: 'comfortable',
      cornerStyle: 'rounded',
      sortOrder: 'updatedAt',
      filterView: 'all',
      showWordCount: true,
      autosaveInterval: '800',
      markdownPreview: false,
      spellcheck: true,
      appLockEnabled: false,
      autoLockTiming: '5min',
      hidePreviewsInSwitcher: false,
      studyReminderEnabled: false,
      reviewReminderEnabled: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setFontScale: (fontScale) => set({ fontScale }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setCardDensity: (cardDensity) => set({ cardDensity }),
      setCornerStyle: (cornerStyle) => set({ cornerStyle }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setFilterView: (filterView) => set({ filterView }),
      setShowWordCount: (showWordCount) => set({ showWordCount }),
      setAutosaveInterval: (autosaveInterval) => set({ autosaveInterval }),
      setMarkdownPreview: (markdownPreview) => set({ markdownPreview }),
      setSpellcheck: (spellcheck) => set({ spellcheck }),
      setAppLockEnabled: (appLockEnabled) => set({ appLockEnabled }),
      setAutoLockTiming: (autoLockTiming) => set({ autoLockTiming }),
      setHidePreviewsInSwitcher: (hidePreviewsInSwitcher) => set({ hidePreviewsInSwitcher }),
      setStudyReminderEnabled: (studyReminderEnabled) => set({ studyReminderEnabled }),
      setReviewReminderEnabled: (reviewReminderEnabled) => set({ reviewReminderEnabled }),
    }),
    {
      name: '@studypro/settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => { state?._setHasHydrated(true); },
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([k, v]) => !k.startsWith('_') && typeof v !== 'function'),
        ) as Partial<SettingsState>,
    },
  ),
);
