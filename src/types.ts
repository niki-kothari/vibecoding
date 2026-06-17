export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate?: string;
  createdAt: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  notes?: string;
  completedAt?: string;
}

export interface HydrationLog {
  date: string;
  count: number;
}

export type TodoFilter = 'all' | 'active' | 'completed';

export type TodoSort = 'created-desc' | 'created-asc' | 'due-date' | 'priority' | 'user';

export const CATEGORIES = ['All', 'Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Other'] as const;
