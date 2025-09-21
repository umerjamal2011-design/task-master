export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  categoryId: string;
  createdAt: string;
  completedAt?: string;
  parentId?: string; // For sub-tasks
  scheduledDate?: string; // YYYY-MM-DD format
  scheduledTime?: string; // HH:mm format
  priority?: 'low' | 'medium' | 'high';
  subtasks?: Task[]; // Computed field for UI
  // Repetition settings
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  repeatInterval?: number; // Every N days/weeks/months/years
  repeatEndDate?: string; // When to stop repeating
  originalTaskId?: string; // For repeated instances, reference to original
  isRepeatedInstance?: boolean; // True if this is a repeated task instance
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface AppState {
  tasks: Task[];
  categories: Category[];
}