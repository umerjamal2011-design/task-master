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
  order?: number; // For custom ordering
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

// Financial Management Types
export interface Person {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  lastTransactionAt?: string;
}

export interface Transaction {
  id: string;
  personId: string;
  type: 'loan_given' | 'loan_taken' | 'payment_received' | 'payment_made' | 'other';
  amount: number;
  currency: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:mm format
  createdAt: string;
  attachments?: string[]; // File paths or URLs
  category?: string; // Optional categorization
}

export interface PersonLedger {
  person: Person;
  transactions: Transaction[];
  balance: number; // Positive means they owe you, negative means you owe them
  totalGiven: number; // Total amount you've given them
  totalReceived: number; // Total amount you've received from them
  totalLent: number; // Total amount they've lent you
  totalPaid: number; // Total amount you've paid them back
}