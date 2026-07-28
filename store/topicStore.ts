import { create } from 'zustand';
import type { Topic } from '@/types';
import { topicRepository } from '@/lib/repository';

interface TopicState {
  topics: Topic[];
  isLoading: boolean;
  error: string | null;
  loadTopics: () => Promise<void>;
  addTopic: (data: Pick<Topic, 'title' | 'content' | 'tags'> & Partial<Pick<Topic, 'folderId'>>) => Promise<Topic>;
  updateTopic: (id: string, updates: Partial<Topic>) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  restoreTopic: (id: string) => Promise<void>;
  permanentDeleteTopic: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  duplicateTopic: (id: string) => Promise<Topic | null>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  getById: (id: string) => Topic | undefined;
}

export const useTopicStore = create<TopicState>((set, get) => ({
  topics: [],
  isLoading: false,
  error: null,

  loadTopics: async () => {
    set({ isLoading: true, error: null });
    try {
      const all = await topicRepository.loadAll();
      set({ topics: all, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: String(e) });
    }
  },

  addTopic: async (data) => {
    const topic = await topicRepository.create({ ...data, isPinned: false, isArchived: false });
    set((s) => ({ topics: [...s.topics, topic] }));
    return topic;
  },

  updateTopic: async (id, updates) => {
    const updated = await topicRepository.update(id, updates);
    if (updated) set((s) => ({ topics: s.topics.map((t) => (t.id === id ? updated : t)) }));
  },

  deleteTopic: async (id) => {
    await topicRepository.softDelete(id);
    const deletedAt = Date.now();
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id === id ? { ...t, isDeleted: true, deletedAt, updatedAt: deletedAt } : t,
      ),
    }));
  },

  restoreTopic: async (id) => {
    await topicRepository.restore(id);
    set((s) => ({
      topics: s.topics.map((t) => (t.id === id ? { ...t, isDeleted: false, deletedAt: undefined } : t)),
    }));
  },

  permanentDeleteTopic: async (id) => {
    await topicRepository.permanentDelete(id);
    set((s) => ({ topics: s.topics.filter((t) => t.id !== id) }));
  },

  emptyTrash: async () => {
    await topicRepository.emptyTrash();
    set((s) => ({ topics: s.topics.filter((t) => !t.isDeleted) }));
  },

  duplicateTopic: async (id) => {
    const dup = await topicRepository.duplicate(id);
    if (dup) set((s) => ({ topics: [...s.topics, dup] }));
    return dup;
  },

  togglePin: async (id) => {
    const topic = get().topics.find((t) => t.id === id);
    if (topic) await get().updateTopic(id, { isPinned: !topic.isPinned });
  },

  toggleArchive: async (id) => {
    const topic = get().topics.find((t) => t.id === id);
    if (topic) await get().updateTopic(id, { isArchived: !topic.isArchived });
  },

  getById: (id) => get().topics.find((t) => t.id === id),
}));

export function filterTopics(topics: Topic[], filter: string, sort: string, search: string): Topic[] {
  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  let filtered = topics.filter((t) => {
    if (filter === 'trash') return t.isDeleted;
    if (t.isDeleted) return false;
    if (filter === 'all') return !t.isArchived;
    if (filter === 'favorites') return t.isPinned && !t.isArchived;
    if (filter === 'recent') return !t.isArchived && now - t.updatedAt < SEVEN_DAYS;
    if (filter === 'archived') return t.isArchived;
    return !t.isArchived;
  });

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  return [...filtered].sort((a, b) => {
    if (sort === 'pinned') {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    }
    if (sort === 'title') return a.title.localeCompare(b.title);
    if (sort === 'createdAt') return b.createdAt - a.createdAt;
    return b.updatedAt - a.updatedAt;
  });
}
