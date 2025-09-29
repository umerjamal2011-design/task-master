import React, { useState, useMemo } from 'react';
import { Person, Transaction, Account, ExpenseCategory, Expense, Transfer, PersonLedger } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  CurrencyDollar, 
  Plus, 
  Trash, 
  PencilSimple, 
  Bank, 
  Wallet, 
  CreditCard, 
  TrendUp, 
  TrendDown,
  ArrowRight,
  Receipt,
  Tag,
  Calendar,
  User,
  ChartPie,
  ListBullets,
  Coins,
  HandCoins
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface FinancialDashboardProps {
  // People & Transactions (existing)
  people: Person[];
  transactions: Transaction[];
  onAddPerson: (person: Omit<Person, 'id' | 'createdAt'>) => void;
  onUpdatePerson: (personId: string, updates: Partial<Person>) => void;
  onDeletePerson: (personId: string) => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onUpdateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (transactionId: string) => void;
  
  // Accounts & Expenses (new)
  accounts: Account[];
  expenseCategories: ExpenseCategory[];
  expenses: Expense[];
  transfers: Transfer[];
  onAddAccount: (account: Omit<Account, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  onUpdateAccount: (accountId: string, updates: Partial<Account>) => void;
  onDeleteAccount: (accountId: string) => void;
  onAddExpenseCategory: (category: Omit<ExpenseCategory, 'id' | 'createdAt'>) => void;
  onUpdateExpenseCategory: (categoryId: string, updates: Partial<ExpenseCategory>) => void;
  onDeleteExpenseCategory: (categoryId: string) => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onUpdateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  onDeleteExpense: (expenseId: string) => void;
  onAddTransfer: (transfer: Omit<Transfer, 'id' | 'createdAt'>) => void;
  onDeleteTransfer: (transferId: string) => void;
  
  defaultCurrency: string;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
];

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash', icon: <Wallet size={16} /> },
  { value: 'bank', label: 'Bank Account', icon: <Bank size={16} /> },
  { value: 'savings', label: 'Savings Account', icon: <Coins size={16} /> },
  { value: 'credit', label: 'Credit Card', icon: <CreditCard size={16} /> },
  { value: 'investment', label: 'Investment', icon: <TrendUp size={16} /> },
  { value: 'other', label: 'Other', icon: <CurrencyDollar size={16} /> },
];

const EXPENSE_TYPES = [
  { value: 'expense', label: 'Expense', icon: <TrendDown size={16} /> },
  { value: 'income', label: 'Income', icon: <TrendUp size={16} /> },
  { value: 'transfer', label: 'Transfer', icon: <ArrowRight size={16} /> },
];

const TRANSACTION_TYPES = [
  { value: 'loan_given', label: 'Loan Given', description: 'You lent money to them', icon: <HandCoins size={16} /> },
  { value: 'payment_received', label: 'Payment Received', description: 'They paid you back', icon: <TrendUp size={16} /> },
  { value: 'loan_taken', label: 'Loan Taken', description: 'You borrowed money from them', icon: <TrendDown size={16} /> },
  { value: 'payment_made', label: 'Payment Made', description: 'You paid them back', icon: <ArrowRight size={16} /> },
];

export function FinancialDashboard({
  people,
  transactions,
  onAddPerson,
  onUpdatePerson,
  onDeletePerson,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  accounts,
  expenseCategories,
  expenses,
  transfers,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onAddExpenseCategory,
  onUpdateExpenseCategory,
  onDeleteExpenseCategory,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddTransfer,
  onDeleteTransfer,
  defaultCurrency
}: FinancialDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'expenses' | 'people'>('overview');
  
  // Account management states
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'bank' as Account['type'],
    balance: 0,
    currency: defaultCurrency,
    description: '',
    accountNumber: '',
    bankName: '',
    isActive: true,
    color: '#3B82F6'
  });

  // Expense category management states
  const [showAddExpenseCategory, setShowAddExpenseCategory] = useState(false);
  const [editingExpenseCategory, setEditingExpenseCategory] = useState<ExpenseCategory | null>(null);
  const [newExpenseCategory, setNewExpenseCategory] = useState({
    name: '',
    color: '#10B981',
    icon: '🛒',
    budget: 0,
    currency: defaultCurrency,
    isActive: true
  });

  // Expense management states
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: 0,
    currency: defaultCurrency,
    categoryId: '',
    accountId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    type: 'expense' as Expense['type'],
    tags: [] as string[],
    location: ''
  });

  // Transfer states
  const [showAddTransfer, setShowAddTransfer] = useState(false);
  const [newTransfer, setNewTransfer] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    currency: defaultCurrency,
    exchangeRate: 1,
    fee: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5)
  });

  // Transaction management states (missing)
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    personId: '',
    amount: 0,
    currency: defaultCurrency,
    type: 'loan_given' as Transaction['type'],
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    category: ''
  });

  // Person management states (existing)
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [newPerson, setNewPerson] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    preferredCurrency: defaultCurrency
  });

  // Calculate financial summaries
  const accountSummary = useMemo(() => {
    const activeAccounts = accounts.filter(acc => acc.isActive);
    
    const summary = {
      totalCash: 0,
      totalBank: 0,
      totalSavings: 0,
      totalCredit: 0,
      totalInvestment: 0,
      totalOther: 0,
      netWorth: 0
    };

    activeAccounts.forEach(account => {
      const amount = account.balance || 0;
      switch (account.type) {
        case 'cash':
          summary.totalCash += amount;
          break;
        case 'bank':
          summary.totalBank += amount;
          break;
        case 'savings':
          summary.totalSavings += amount;
          break;
        case 'credit':
          summary.totalCredit += amount; // Credit balances might be negative
          break;
        case 'investment':
          summary.totalInvestment += amount;
          break;
        default:
          summary.totalOther += amount;
      }
      summary.netWorth += amount;
    });

    return summary;
  }, [accounts]);

  const expenseSummary = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const monthlyExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));
    
    const totalExpenses = monthlyExpenses
      .filter(exp => exp.type === 'expense')
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const totalIncome = monthlyExpenses
      .filter(exp => exp.type === 'income')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const categoryTotals = monthlyExpenses
      .filter(exp => exp.type === 'expense')
      .reduce((acc, exp) => {
        if (!acc[exp.categoryId]) {
          acc[exp.categoryId] = 0;
        }
        acc[exp.categoryId] += exp.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const category = expenseCategories.find(c => c.id === categoryId);
        return {
          categoryId,
          categoryName: category?.name || 'Unknown',
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalExpenses,
      totalIncome,
      netFlow: totalIncome - totalExpenses,
      topCategories
    };
  }, [expenses, expenseCategories]);

  // Calculate person ledgers (existing functionality)
  const personLedgers = useMemo(() => {
    return people.map(person => {
      const personTransactions = transactions.filter(t => t.personId === person.id);
      
      let balance = 0;
      let totalGiven = 0;
      let totalReceived = 0;
      let totalLent = 0;
      let totalPaid = 0;

      personTransactions.forEach(transaction => {
        switch (transaction.type) {
          case 'loan_given':
            balance += transaction.amount; // They owe you
            totalGiven += transaction.amount;
            break;
          case 'payment_received':
            balance -= transaction.amount; // They paid you back
            totalReceived += transaction.amount;
            break;
          case 'loan_taken':
            balance -= transaction.amount; // You owe them
            totalLent += transaction.amount;
            break;
          case 'payment_made':
            balance += transaction.amount; // You paid them back
            totalPaid += transaction.amount;
            break;
        }
      });

      return {
        person,
        transactions: personTransactions,
        balance,
        totalGiven,
        totalReceived,
        totalLent,
        totalPaid
      } as PersonLedger;
    });
  }, [people, transactions]);

  const formatCurrency = (amount: number, currency: string = defaultCurrency) => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    return `${currencyInfo?.symbol || currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getAccountIcon = (type: Account['type']) => {
    return ACCOUNT_TYPES.find(t => t.value === type)?.icon || <CurrencyDollar size={16} />;
  };

  const resetNewAccount = () => {
    setNewAccount({
      name: '',
      type: 'bank',
      balance: 0,
      currency: defaultCurrency,
      description: '',
      accountNumber: '',
      bankName: '',
      isActive: true,
      color: '#3B82F6'
    });
  };

  const resetNewExpenseCategory = () => {
    setNewExpenseCategory({
      name: '',
      color: '#10B981',
      icon: '🛒',
      budget: 0,
      currency: defaultCurrency,
      isActive: true
    });
  };

  const resetNewExpense = () => {
    setNewExpense({
      title: '',
      amount: 0,
      currency: defaultCurrency,
      categoryId: '',
      accountId: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      type: 'expense',
      tags: [],
      location: ''
    });
  };

  const resetNewTransfer = () => {
    setNewTransfer({
      fromAccountId: '',
      toAccountId: '',
      amount: 0,
      currency: defaultCurrency,
      exchangeRate: 1,
      fee: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5)
    });
  };

  const resetNewTransaction = () => {
    setNewTransaction({
      personId: '',
      amount: 0,
      currency: defaultCurrency,
      type: 'loan_given',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      category: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial Dashboard</h2>
          <p className="text-muted-foreground">Manage your accounts, expenses, and financial relationships</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="gap-2">
            <ChartPie size={16} />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <Bank size={16} />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <Receipt size={16} />
            <span className="hidden sm:inline">Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="people" className="gap-2">
            <User size={16} />
            <span className="hidden sm:inline">People</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <TrendUp size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Net Worth</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(accountSummary.netWorth)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <TrendUp size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Income</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(expenseSummary.totalIncome)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-500/10">
                    <TrendDown size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Expenses</div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(expenseSummary.totalExpenses)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${expenseSummary.netFlow >= 0 
              ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800'
              : 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800'
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${expenseSummary.netFlow >= 0 ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                    {expenseSummary.netFlow >= 0 
                      ? <TrendUp size={20} className="text-green-600 dark:text-green-400" />
                      : <TrendDown size={20} className="text-orange-600 dark:text-orange-400" />
                    }
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Net Flow</div>
                    <div className={`text-lg font-bold ${expenseSummary.netFlow >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {formatCurrency(expenseSummary.netFlow)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button onClick={() => setShowAddAccount(true)} className="gap-2">
              <Plus size={16} />
              Add Account
            </Button>
            <Button onClick={() => setShowAddExpense(true)} className="gap-2" variant="outline">
              <Plus size={16} />
              Add Expense
            </Button>
            <Button onClick={() => setShowAddTransfer(true)} className="gap-2" variant="outline">
              <ArrowRight size={16} />
              Transfer
            </Button>
            <Button onClick={() => setShowAddPerson(true)} className="gap-2" variant="outline">
              <Plus size={16} />
              Add Person
            </Button>
          </div>

          {/* Account Balances Overview */}
          {accounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bank size={20} />
                  Account Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accounts.filter(acc => acc.isActive).map(account => (
                    <div key={account.id} className="p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getAccountIcon(account.type)}
                          <span className="font-medium text-sm">{account.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {account.type}
                        </Badge>
                      </div>
                      <div className="text-lg font-bold" style={{ color: account.color }}>
                        {formatCurrency(account.balance, account.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Expense Categories */}
          {expenseSummary.topCategories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartPie size={20} />
                  Top Expense Categories This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseSummary.topCategories.map(category => (
                    <div key={category.categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium">{category.categoryName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {category.percentage.toFixed(1)}%
                        </span>
                        <span className="text-sm font-bold">
                          {formatCurrency(category.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Additional tabs would be implemented here */}
        <TabsContent value="accounts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Accounts</h3>
            <Button onClick={() => setShowAddAccount(true)} className="gap-2">
              <Plus size={16} />
              Add Account
            </Button>
          </div>
          
          {accounts.length > 0 ? (
            <div className="grid gap-4">
              {accounts.map(account => (
                <Card key={account.id} className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: `${account.color || '#3B82F6'}20` }}>
                          {getAccountIcon(account.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{account.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {account.type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {account.currency}
                            </span>
                            {!account.isActive && (
                              <Badge variant="destructive" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: account.color || '#3B82F6' }}>
                          {formatCurrency(account.balance, account.currency)}
                        </div>
                        {account.bankName && (
                          <div className="text-sm text-muted-foreground">
                            {account.bankName}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {(account.description || account.accountNumber) && (
                    <CardContent className="pt-0">
                      {account.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {account.description}
                        </p>
                      )}
                      {account.accountNumber && (
                        <p className="text-xs text-muted-foreground">
                          Account: {account.accountNumber}
                        </p>
                      )}
                    </CardContent>
                  )}
                  
                  <CardContent className="pt-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingAccount(account);
                          setNewAccount({
                            name: account.name,
                            type: account.type,
                            balance: account.balance,
                            currency: account.currency,
                            description: account.description || '',
                            accountNumber: account.accountNumber || '',
                            bankName: account.bankName || '',
                            isActive: account.isActive,
                            color: account.color || '#3B82F6'
                          });
                          setShowAddAccount(true);
                        }}
                        className="gap-1"
                      >
                        <PencilSimple size={14} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onUpdateAccount(account.id, { isActive: !account.isActive });
                        }}
                        className="gap-1"
                      >
                        {account.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete account "${account.name}"? This action cannot be undone.`)) {
                            onDeleteAccount(account.id);
                          }
                        }}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash size={14} />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bank size={64} className="mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No accounts yet</h3>
              <p className="text-muted-foreground mb-4">Add your first account to start tracking your finances</p>
              <Button onClick={() => setShowAddAccount(true)} className="gap-2">
                <Plus size={16} />
                Add Your First Account
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Expenses</h3>
            <Button onClick={() => setShowAddExpense(true)} className="gap-2">
              <Plus size={16} />
              Add Expense
            </Button>
          </div>
          
          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag size={20} />
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenseCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {expenseCategories.filter(cat => cat.isActive).map(category => (
                    <div key={category.id} className="p-3 rounded-lg border bg-card/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                      </div>
                      {category.budget && category.budget > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Budget: {formatCurrency(category.budget, category.currency)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No expense categories created yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt size={20} />
                Recent Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length > 0 ? (
                <div className="space-y-3">
                  {expenses
                    .sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00')).getTime() - new Date(a.date + ' ' + (a.time || '00:00')).getTime())
                    .slice(0, 10)
                    .map(expense => {
                      const category = expenseCategories.find(c => c.id === expense.categoryId);
                      const account = accounts.find(a => a.id === expense.accountId);
                      
                      return (
                        <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{category?.icon || '💰'}</span>
                              <div>
                                <div className="font-medium text-sm">{expense.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {category?.name || 'Unknown'} • {new Date(expense.date).toLocaleDateString()}
                                  {account && ` • ${account.name}`}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${expense.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                              {expense.type === 'expense' ? '-' : '+'}
                              {formatCurrency(expense.amount, expense.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {expense.type}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
                  <p className="text-muted-foreground mb-4">Start tracking your expenses to get insights</p>
                  <Button onClick={() => setShowAddExpense(true)} className="gap-2">
                    <Plus size={16} />
                    Add Your First Expense
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="people" className="space-y-6">
          {/* Existing people management UI would go here */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Financial Relationships</h3>
            <Button onClick={() => setShowAddPerson(true)} className="gap-2">
              <Plus size={16} />
              Add Person
            </Button>
          </div>

          {personLedgers.length > 0 ? (
            <div className="grid gap-4">
              {personLedgers.map(ledger => (
                <Card key={ledger.person.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{ledger.person.name}</CardTitle>
                        {ledger.person.phone && (
                          <p className="text-sm text-muted-foreground">{ledger.person.phone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          ledger.balance > 0 ? 'text-green-600' : 
                          ledger.balance < 0 ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {formatCurrency(Math.abs(ledger.balance), ledger.person.preferredCurrency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ledger.balance > 0 ? 'They owe you' : 
                           ledger.balance < 0 ? 'You owe them' : 'Settled'}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-muted-foreground">Given</div>
                        <div className="font-bold text-blue-600">
                          {formatCurrency(ledger.totalGiven, ledger.person.preferredCurrency)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground">Received</div>
                        <div className="font-bold text-green-600">
                          {formatCurrency(ledger.totalReceived, ledger.person.preferredCurrency)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground">Borrowed</div>
                        <div className="font-bold text-orange-600">
                          {formatCurrency(ledger.totalLent, ledger.person.preferredCurrency)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground">Paid Back</div>
                        <div className="font-bold text-purple-600">
                          {formatCurrency(ledger.totalPaid, ledger.person.preferredCurrency)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Transactions for this person */}
                    {ledger.transactions.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium mb-3">Recent Transactions</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {ledger.transactions
                            .sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00')).getTime() - new Date(a.date + ' ' + (a.time || '00:00')).getTime())
                            .slice(0, 5)
                            .map(transaction => (
                              <div key={transaction.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium capitalize">
                                      {transaction.type.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(transaction.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {transaction.description && (
                                    <div className="text-xs text-muted-foreground truncate">
                                      {transaction.description}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className={`text-sm font-bold ${
                                    transaction.type === 'loan_given' || transaction.type === 'payment_made' ? 'text-green-600' : 'text-blue-600'
                                  }`}>
                                    {formatCurrency(transaction.amount, transaction.currency)}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingTransaction(transaction);
                                        setNewTransaction({
                                          personId: transaction.personId,
                                          amount: transaction.amount,
                                          currency: transaction.currency,
                                          type: transaction.type,
                                          description: transaction.description || '',
                                          date: transaction.date,
                                          time: transaction.time || '',
                                          category: transaction.category || ''
                                        });
                                        setShowAddTransaction(true);
                                      }}
                                      className="h-6 w-6 p-0"
                                    >
                                      <PencilSimple size={12} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        if (confirm('Are you sure you want to delete this transaction?')) {
                                          onDeleteTransaction(transaction.id);
                                        }
                                      }}
                                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash size={12} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {ledger.transactions.length > 5 && (
                            <div className="text-xs text-muted-foreground text-center pt-2">
                              +{ledger.transactions.length - 5} more transactions
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setNewTransaction(prev => ({
                            ...prev,
                            personId: ledger.person.id,
                            currency: ledger.person.preferredCurrency
                          }));
                          setShowAddTransaction(true);
                        }}
                        className="gap-1"
                      >
                        <Plus size={14} />
                        Add Transaction
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPerson(ledger.person);
                          setNewPerson({
                            name: ledger.person.name,
                            phone: ledger.person.phone || '',
                            email: ledger.person.email || '',
                            notes: ledger.person.notes || '',
                            preferredCurrency: ledger.person.preferredCurrency
                          });
                        }}
                        className="gap-1"
                      >
                        <PencilSimple size={14} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${ledger.person.name}? This will also delete all their transactions.`)) {
                            onDeletePerson(ledger.person.id);
                          }
                        }}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash size={14} />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HandCoins size={64} className="mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No financial relationships yet</h3>
              <p className="text-muted-foreground mb-4">Add people to track loans, payments, and financial dealings</p>
              <Button onClick={() => setShowAddPerson(true)} className="gap-2">
                <Plus size={16} />
                Add Your First Person
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Account Dialog */}
      <Dialog open={showAddAccount} onOpenChange={(open) => {
        setShowAddAccount(open);
        if (!open) {
          setEditingAccount(null);
          resetNewAccount();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Account Name</Label>
              <Input
                value={newAccount.name}
                onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Primary Checking"
                maxLength={50}
              />
            </div>
            
            <div>
              <Label>Account Type</Label>
              <Select value={newAccount.type} onValueChange={(value) => setNewAccount(prev => ({ ...prev, type: value as Account['type'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Balance</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={newAccount.currency} onValueChange={(value) => setNewAccount(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(newAccount.type === 'bank' || newAccount.type === 'savings') && (
              <>
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={newAccount.bankName}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="e.g., Chase Bank"
                  />
                </div>
                <div>
                  <Label>Account Number (Optional)</Label>
                  <Input
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="e.g., ****1234"
                  />
                </div>
              </>
            )}

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={newAccount.description}
                onChange={(e) => setNewAccount(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about this account"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => {
                  if (newAccount.name.trim()) {
                    if (editingAccount) {
                      onUpdateAccount(editingAccount.id, newAccount);
                      setEditingAccount(null);
                    } else {
                      onAddAccount(newAccount);
                    }
                    setShowAddAccount(false);
                    resetNewAccount();
                  }
                }}
                disabled={!newAccount.name.trim()}
                className="flex-1"
              >
                {editingAccount ? 'Update Account' : 'Add Account'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddAccount(false);
                  setEditingAccount(null);
                  resetNewAccount();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpense} onOpenChange={(open) => {
        setShowAddExpense(open);
        if (!open) {
          setEditingExpense(null);
          resetNewExpense();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={newExpense.title}
                onChange={(e) => setNewExpense(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Coffee, Groceries, Salary"
                maxLength={100}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={newExpense.type} onValueChange={(value) => setNewExpense(prev => ({ ...prev, type: value as Expense['type'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Category</Label>
                <Select value={newExpense.categoryId} onValueChange={(value) => setNewExpense(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.filter(cat => cat.isActive).map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Account</Label>
                <Select value={newExpense.accountId} onValueChange={(value) => setNewExpense(prev => ({ ...prev, accountId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(acc => acc.isActive).map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          {getAccountIcon(account.type)}
                          {account.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Time (Optional)</Label>
                <Input
                  type="time"
                  value={newExpense.time}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about this expense"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => {
                  if (newExpense.title.trim() && newExpense.amount > 0) {
                    if (editingExpense) {
                      onUpdateExpense(editingExpense.id, newExpense);
                      setEditingExpense(null);
                    } else {
                      onAddExpense(newExpense);
                    }
                    setShowAddExpense(false);
                    resetNewExpense();
                  }
                }}
                disabled={!newExpense.title.trim() || newExpense.amount <= 0}
                className="flex-1"
              >
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddExpense(false);
                  setEditingExpense(null);
                  resetNewExpense();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Person Dialog */}
      <Dialog open={showAddPerson || editingPerson !== null} onOpenChange={(open) => {
        setShowAddPerson(open);
        if (!open) {
          setEditingPerson(null);
          setNewPerson({
            name: '',
            phone: '',
            email: '',
            notes: '',
            preferredCurrency: defaultCurrency
          });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPerson ? 'Edit Person' : 'Add New Person'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={newPerson.name}
                onChange={(e) => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
                maxLength={100}
              />
            </div>
            
            <div>
              <Label>Phone</Label>
              <Input
                value={newPerson.phone}
                onChange={(e) => setNewPerson(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newPerson.email}
                onChange={(e) => setNewPerson(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <Label>Preferred Currency</Label>
              <Select value={newPerson.preferredCurrency} onValueChange={(value) => setNewPerson(prev => ({ ...prev, preferredCurrency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={newPerson.notes}
                onChange={(e) => setNewPerson(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this person"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => {
                  if (newPerson.name.trim()) {
                    if (editingPerson) {
                      onUpdatePerson(editingPerson.id, newPerson);
                      setEditingPerson(null);
                    } else {
                      onAddPerson(newPerson);
                    }
                    setShowAddPerson(false);
                    setNewPerson({
                      name: '',
                      phone: '',
                      email: '',
                      notes: '',
                      preferredCurrency: defaultCurrency
                    });
                  }
                }}
                disabled={!newPerson.name.trim()}
                className="flex-1"
              >
                {editingPerson ? 'Update Person' : 'Add Person'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddPerson(false);
                  setEditingPerson(null);
                  setNewPerson({
                    name: '',
                    phone: '',
                    email: '',
                    notes: '',
                    preferredCurrency: defaultCurrency
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransaction} onOpenChange={(open) => {
        setShowAddTransaction(open);
        if (!open) {
          setEditingTransaction(null);
          resetNewTransaction();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Person *</Label>
              <Select value={newTransaction.personId} onValueChange={(value) => setNewTransaction(prev => ({ ...prev, personId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {people.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        {person.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Transaction Type *</Label>
              <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction(prev => ({ ...prev, type: value as Transaction['type'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={newTransaction.currency} onValueChange={(value) => setNewTransaction(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Time (Optional)</Label>
                <Input
                  type="time"
                  value={newTransaction.time}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Category (Optional)</Label>
              <Input
                value={newTransaction.category}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Groceries, Rent, Business"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What was this transaction for?"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => {
                  if (newTransaction.personId && newTransaction.amount > 0) {
                    if (editingTransaction) {
                      onUpdateTransaction(editingTransaction.id, newTransaction);
                      setEditingTransaction(null);
                    } else {
                      onAddTransaction(newTransaction);
                    }
                    setShowAddTransaction(false);
                    resetNewTransaction();
                  }
                }}
                disabled={!newTransaction.personId || newTransaction.amount <= 0}
                className="flex-1"
              >
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddTransaction(false);
                  setEditingTransaction(null);
                  resetNewTransaction();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}