/**
 * TopicRepository — data access layer for topics.
 * Uses AsyncStorage as the backing store.
 * Screens never touch storage directly — only call store actions.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Topic } from '@/types';

const TOPICS_KEY = '@studypro/topics';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;
}

type CreateTopicInput = Omit<Topic, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>;

export class TopicRepository {
  async loadAll(): Promise<Topic[]> {
    try {
      const raw = await AsyncStorage.getItem(TOPICS_KEY);
      return raw ? (JSON.parse(raw) as Topic[]) : [];
    } catch {
      return [];
    }
  }

  private async saveAll(topics: Topic[]): Promise<void> {
    await AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  }

  async getById(id: string): Promise<Topic | null> {
    const all = await this.loadAll();
    return all.find((t) => t.id === id) ?? null;
  }

  async create(data: CreateTopicInput): Promise<Topic> {
    const all = await this.loadAll();
    const now = Date.now();
    const topic: Topic = { ...data, id: generateId(), createdAt: now, updatedAt: now, isDeleted: false };
    await this.saveAll([...all, topic]);
    return topic;
  }

  async update(id: string, updates: Partial<Omit<Topic, 'id' | 'createdAt'>>): Promise<Topic | null> {
    const all = await this.loadAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updated: Topic = { ...all[idx], ...updates, updatedAt: Date.now() };
    all[idx] = updated;
    await this.saveAll(all);
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    await this.update(id, { isDeleted: true, deletedAt: Date.now() });
  }

  async restore(id: string): Promise<void> {
    await this.update(id, { isDeleted: false, deletedAt: undefined });
  }

  async permanentDelete(id: string): Promise<void> {
    const all = await this.loadAll();
    await this.saveAll(all.filter((t) => t.id !== id));
  }

  async emptyTrash(): Promise<void> {
    const all = await this.loadAll();
    await this.saveAll(all.filter((t) => !t.isDeleted));
  }

  async duplicate(id: string): Promise<Topic | null> {
    const original = await this.getById(id);
    if (!original) return null;
    return this.create({
      title: `${original.title} (Copy)`,
      content: original.content,
      tags: [...original.tags],
      folderId: original.folderId,
      isPinned: false,
      isArchived: false,
    });
  }
}

export const topicRepository = new TopicRepository();
