import React, { useState, useMemo } from 'react';
import { Person, Transaction, PersonLedger } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, TrendUp, TrendDown, CurrencyDollar, Users, Receipt, MagnifyingGlass, Plus, ArrowUpRight, ArrowDownRight } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonLedgerView } from './PersonLedgerView';
import { AddPersonDialog } from './AddPersonDialog';
import { AddTransactionDialog } from './AddTransactionDialog';

interface FinancialDashboardProps {
  people: Person[];
  transactions: Transaction[];
  onAddPerson: (person: Omit<Person, 'id' | 'createdAt'>) => void;
  onUpdatePerson: (personId: string, updates: Partial<Person>) => void;
  onDeletePerson: (personId: string) => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onUpdateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (transactionId: string) => void;
  defaultCurrency?: string;
}

export function FinancialDashboard({
  people,
  transactions,
  onAddPerson,
  onUpdatePerson,
  onDeletePerson,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  defaultCurrency = 'USD'
}: FinancialDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'people' | 'transactions'>('overview');

  // Calculate ledgers for each person
  const personLedgers = useMemo((): PersonLedger[] => {
    return people.map(person => {
      const personTransactions = transactions.filter(tx => tx.personId === person.id);
      
      let balance = 0;
      let totalGiven = 0;
      let totalReceived = 0;
      let totalLent = 0;
      let totalPaid = 0;

      personTransactions.forEach(tx => {
        switch (tx.type) {
          case 'loan_given':
            balance += tx.amount; // They owe you
            totalGiven += tx.amount;
            break;
          case 'payment_received':
            balance -= tx.amount; // They paid you back
            totalReceived += tx.amount;
            break;
          case 'loan_taken':
            balance -= tx.amount; // You owe them
            totalLent += tx.amount;
            break;
          case 'payment_made':
            balance += tx.amount; // You paid them back
            totalPaid += tx.amount;
            break;
          case 'other':
            // For other transactions, positive means they owe you, negative means you owe them
            // This can be customized based on the description
            break;
        }
      });

      return {
        person,
        transactions: personTransactions.sort((a, b) => 
          new Date(b.date + ' ' + (b.time || '00:00')).getTime() - 
          new Date(a.date + ' ' + (a.time || '00:00')).getTime()
        ),
        balance,
        totalGiven,
        totalReceived,
        totalLent,
        totalPaid
      };
    });
  }, [people, transactions]);

  // Filter people based on search
  const filteredLedgers = useMemo(() => {
    if (!searchQuery.trim()) return personLedgers;
    
    const query = searchQuery.toLowerCase();
    return personLedgers.filter(ledger => 
      ledger.person.name.toLowerCase().includes(query) ||
      ledger.person.phone?.toLowerCase().includes(query) ||
      ledger.person.email?.toLowerCase().includes(query)
    );
  }, [personLedgers, searchQuery]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalOwedToYou = personLedgers.reduce((sum, ledger) => sum + Math.max(0, ledger.balance), 0);
    const totalYouOwe = personLedgers.reduce((sum, ledger) => sum + Math.max(0, -ledger.balance), 0);
    const netPosition = totalOwedToYou - totalYouOwe;
    const totalTransactions = transactions.length;
    const activeRelationships = personLedgers.filter(ledger => ledger.balance !== 0).length;

    return {
      totalOwedToYou,
      totalYouOwe,
      netPosition,
      totalTransactions,
      activeRelationships,
      totalPeople: people.length
    };
  }, [personLedgers, transactions]);

  const formatCurrency = (amount: number, currency: string = defaultCurrency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const selectedLedger = selectedPersonId 
    ? personLedgers.find(ledger => ledger.person.id === selectedPersonId)
    : null;

  if (selectedLedger) {
    return (
      <PersonLedgerView
        ledger={selectedLedger}
        onBack={() => setSelectedPersonId(null)}
        onAddTransaction={(transaction) => {
          onAddTransaction({
            ...transaction,
            personId: selectedLedger.person.id
          });
        }}
        onUpdateTransaction={onUpdateTransaction}
        onDeleteTransaction={onDeleteTransaction}
        onUpdatePerson={onUpdatePerson}
        formatCurrency={formatCurrency}
        defaultCurrency={defaultCurrency}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Dealings</h1>
          <p className="text-muted-foreground">Manage loans and payments with people</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddPerson(true)}
            className="gap-2"
            variant="outline"
          >
            <UserPlus size={18} />
            Add Person
          </Button>
          <Button
            onClick={() => setShowAddTransaction(true)}
            className="gap-2"
          >
            <Plus size={18} />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <CurrencyDollar size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="people" className="gap-2">
            <Users size={16} />
            People ({people.length})
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <Receipt size={16} />
            Transactions ({transactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Owed to You</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {formatCurrency(overallStats.totalOwedToYou)}
                    </p>
                  </div>
                  <ArrowUpRight size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">You Owe</p>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                      {formatCurrency(overallStats.totalYouOwe)}
                    </p>
                  </div>
                  <ArrowDownRight size={24} className="text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className={`${overallStats.netPosition >= 0 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${overallStats.netPosition >= 0 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : 'text-orange-700 dark:text-orange-300'
                    }`}>
                      Net Position
                    </p>
                    <p className={`text-2xl font-bold ${overallStats.netPosition >= 0 
                      ? 'text-blue-800 dark:text-blue-200' 
                      : 'text-orange-800 dark:text-orange-200'
                    }`}>
                      {overallStats.netPosition >= 0 ? '+' : ''}{formatCurrency(overallStats.netPosition)}
                    </p>
                  </div>
                  <TrendUp size={24} className={`${overallStats.netPosition >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-orange-600 dark:text-orange-400'
                  }`} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Dealings</p>
                    <p className="text-2xl font-bold text-foreground">
                      {overallStats.activeRelationships}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of {overallStats.totalPeople} people
                    </p>
                  </div>
                  <Users size={24} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt size={20} />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Add your first transaction to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions
                    .sort((a, b) => 
                      new Date(b.date + ' ' + (b.time || '00:00')).getTime() - 
                      new Date(a.date + ' ' + (a.time || '00:00')).getTime()
                    )
                    .slice(0, 5)
                    .map(transaction => {
                      const person = people.find(p => p.id === transaction.personId);
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{person?.name || 'Unknown Person'}</span>
                              <Badge variant={
                                transaction.type === 'loan_given' ? 'default' :
                                transaction.type === 'payment_received' ? 'secondary' :
                                transaction.type === 'loan_taken' ? 'outline' :
                                'destructive'
                              }>
                                {transaction.type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${
                              transaction.type === 'loan_given' || transaction.type === 'payment_made' 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {transaction.type === 'loan_given' || transaction.type === 'payment_made' ? '-' : '+'}
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="people" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* People List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredLedgers.map(ledger => (
                <motion.div
                  key={ledger.person.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-accent/5"
                    onClick={() => setSelectedPersonId(ledger.person.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{ledger.person.name}</h3>
                          {ledger.person.phone && (
                            <p className="text-sm text-muted-foreground">{ledger.person.phone}</p>
                          )}
                        </div>
                        <Badge variant={ledger.balance === 0 ? 'outline' : ledger.balance > 0 ? 'default' : 'secondary'}>
                          {ledger.balance === 0 ? 'Settled' : ledger.balance > 0 ? 'Owes You' : 'You Owe'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Balance:</span>
                          <span className={`font-semibold ${
                            ledger.balance === 0 ? 'text-muted-foreground' :
                            ledger.balance > 0 ? 'text-green-600 dark:text-green-400' : 
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {ledger.balance === 0 ? 'Settled' : 
                              (ledger.balance > 0 ? '+' : '') + formatCurrency(ledger.balance)
                            }
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Transactions: {ledger.transactions.length}</span>
                          {ledger.person.lastTransactionAt && (
                            <span>
                              Last: {new Date(ledger.person.lastTransactionAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredLedgers.length === 0 && people.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users size={48} className="mx-auto mb-2 opacity-50" />
              <p>No people found matching "{searchQuery}"</p>
            </div>
          )}

          {people.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users size={64} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No people added yet</h3>
              <p className="mb-4">Add people to start tracking your financial dealings</p>
              <Button onClick={() => setShowAddPerson(true)} className="gap-2">
                <UserPlus size={18} />
                Add Your First Person
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No transactions recorded yet</p>
                  <p className="text-sm">Add your first transaction to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions
                    .sort((a, b) => 
                      new Date(b.date + ' ' + (b.time || '00:00')).getTime() - 
                      new Date(a.date + ' ' + (a.time || '00:00')).getTime()
                    )
                    .map(transaction => {
                      const person = people.find(p => p.id === transaction.personId);
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{person?.name || 'Unknown Person'}</span>
                              <Badge variant={
                                transaction.type === 'loan_given' ? 'default' :
                                transaction.type === 'payment_received' ? 'secondary' :
                                transaction.type === 'loan_taken' ? 'outline' :
                                'destructive'
                              }>
                                {transaction.type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            {transaction.description && (
                              <p className="text-sm text-muted-foreground mb-1">
                                {transaction.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                {new Date(transaction.date).toLocaleDateString()}
                                {transaction.time && ` at ${transaction.time}`}
                              </span>
                              <span>Currency: {transaction.currency}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${
                              transaction.type === 'loan_given' || transaction.type === 'payment_made' 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {transaction.type === 'loan_given' || transaction.type === 'payment_made' ? '-' : '+'}
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Person Dialog */}
      <AddPersonDialog
        open={showAddPerson}
        onOpenChange={setShowAddPerson}
        onAddPerson={onAddPerson}
      />

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        people={people}
        onAddTransaction={onAddTransaction}
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
}