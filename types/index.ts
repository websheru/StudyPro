/** Core domain types for Study Pro */

export interface Topic {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folderId?: string;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: number;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  order: number;
}

export type SortOrder = 'updatedAt' | 'createdAt' | 'title' | 'pinned';
export type FilterView = 'all' | 'favorites' | 'recent' | 'archived' | 'trash';
