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
          
          {/* Account list implementation would go here */}
          <div className="text-center py-8 text-muted-foreground">
            <Bank size={48} className="mx-auto mb-4 opacity-50" />
            <p>Account management interface coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Expenses</h3>
            <Button onClick={() => setShowAddExpense(true)} className="gap-2">
              <Plus size={16} />
              Add Expense
            </Button>
          </div>
          
          {/* Expense list implementation would go here */}
          <div className="text-center py-8 text-muted-foreground">
            <Receipt size={48} className="mx-auto mb-4 opacity-50" />
            <p>Expense management interface coming soon...</p>
          </div>
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
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPerson(ledger.person)}
                        className="gap-1"
                      >
                        <PencilSimple size={14} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeletePerson(ledger.person.id)}
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
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
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
                <Label>Initial Balance</Label>
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
                    onAddAccount(newAccount);
                    setShowAddAccount(false);
                    resetNewAccount();
                  }
                }}
                disabled={!newAccount.name.trim()}
                className="flex-1"
              >
                Add Account
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddAccount(false);
                  resetNewAccount();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Person Dialog */}
      <Dialog open={showAddPerson} onOpenChange={setShowAddPerson}>
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
    </div>
  );
}