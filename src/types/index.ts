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
  preferredCurrency: string; // Each person has a single currency for all transactions
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

// Account Management Types
export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'savings' | 'credit' | 'investment' | 'other';
  balance: number;
  currency: string;
  description?: string;
  accountNumber?: string; // For bank accounts
  bankName?: string; // For bank accounts
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
  color?: string; // For visual identification
}

// Expense Tracking Types
export interface ExpenseCategory {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  budget?: number; // Monthly budget for this category
  currency: string;
  createdAt: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  categoryId: string;
  accountId?: string; // Which account was used for payment
  description?: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:mm format
  type: 'expense' | 'income' | 'transfer';
  tags?: string[]; // Optional tags for better categorization
  receipt?: string; // File path or URL to receipt
  location?: string; // Where the expense occurred
  createdAt: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number; // Every N periods
    endDate?: string; // When to stop recurring
  };
}

// Transfer between accounts
export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  exchangeRate?: number; // If transferring between different currencies
  fee?: number; // Transfer fee
  description?: string;
  date: string;
  time?: string;
  createdAt: string;
}

// Budget tracking
export interface Budget {
  id: string;
  name: string;
  categoryIds: string[]; // Which expense categories this budget covers
  amount: number;
  currency: string;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

// Financial Summary interfaces
export interface AccountSummary {
  totalCash: number;
  totalBank: number;
  totalSavings: number;
  totalCredit: number;
  totalInvestment: number;
  netWorth: number;
  currency: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalIncome: number;
  netFlow: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }>;
}