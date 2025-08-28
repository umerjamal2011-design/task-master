export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  categoryId: string;
  createdAt: string;
  completedAt?: string;
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