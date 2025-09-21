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

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PrayerSettings {
  enabled: boolean;
  location?: LocationData;
  lastUpdated?: string;
  method?: number; // Calculation method (1-12)
}

export interface AppState {
  tasks: Task[];
  categories: Category[];
}