import React, { useState } from 'react';
import { PersonLedger, Transaction, Person } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, PencilSimple, Trash, Phone, Envelope, NotePencil, Receipt, TrendUp, TrendDown, CurrencyDollar } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddTransactionDialog } from './AddTransactionDialog';

interface PersonLedgerViewProps {
  ledger: PersonLedger;
  onBack: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'personId'>) => void;
  onUpdateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onUpdatePerson: (personId: string, updates: Partial<PersonLedger['person']>) => void;
  onDeletePerson: (personId: string) => void;
  formatCurrency: (amount: number, person?: Person) => string;
  defaultCurrency: string;
}

export function PersonLedgerView({
  ledger,
  onBack,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onUpdatePerson,
  onDeletePerson,
  formatCurrency,
  defaultCurrency
}: PersonLedgerViewProps) {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showEditPerson, setShowEditPerson] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [personData, setPersonData] = useState({
    name: ledger.person.name,
    phone: ledger.person.phone || '',
    email: ledger.person.email || '',
    notes: ledger.person.notes || '',
    preferredCurrency: ledger.person.preferredCurrency || 'USD'
  });

  const handleUpdatePerson = () => {
    onUpdatePerson(ledger.person.id, {
      name: personData.name.trim(),
      phone: personData.phone.trim() || undefined,
      email: personData.email.trim() || undefined,
      notes: personData.notes.trim() || undefined,
      preferredCurrency: personData.preferredCurrency
    });
    setShowEditPerson(false);
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'loan_given': return <TrendDown size={16} className="text-red-600" />;
      case 'payment_received': return <TrendUp size={16} className="text-green-600" />;
      case 'loan_taken': return <TrendUp size={16} className="text-orange-600" />;
      case 'payment_made': return <TrendDown size={16} className="text-blue-600" />;
      default: return <Receipt size={16} className="text-gray-600" />;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'loan_given': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'payment_received': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'loan_taken': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'payment_made': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getAmountDisplay = (transaction: Transaction) => {
    const isOutgoing = transaction.type === 'loan_given' || transaction.type === 'payment_made';
    const sign = isOutgoing ? '-' : '+';
    const colorClass = isOutgoing 
      ? 'text-red-600 dark:text-red-400' 
      : 'text-green-600 dark:text-green-400';
    
    return (
      <span className={`font-semibold ${colorClass}`}>
        {sign}{formatCurrency(transaction.amount, ledger.person)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{ledger.person.name}</h1>
          <p className="text-muted-foreground">Financial Ledger</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEditPerson(true)}
            className="gap-2"
          >
            <PencilSimple size={16} />
            Edit Info
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${ledger.person.name}? This will also delete all their transactions and cannot be undone.`)) {
                onDeletePerson(ledger.person.id);
                onBack(); // Go back to the main view after deletion
              }
            }}
            className="gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash size={16} />
            Delete Person
          </Button>
          <Button
            onClick={() => setShowAddTransaction(true)}
            className="gap-2"
          >
            <Plus size={16} />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Person Info & Balance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Person Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ledger.person.phone && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-muted-foreground" />
                <span className="text-sm">{ledger.person.phone}</span>
              </div>
            )}
            {ledger.person.email && (
              <div className="flex items-center gap-2">
                <Envelope size={16} className="text-muted-foreground" />
                <span className="text-sm">{ledger.person.email}</span>
              </div>
            )}
            {ledger.person.preferredCurrency && (
              <div className="flex items-center gap-2">
                <CurrencyDollar size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">{ledger.person.preferredCurrency}</span>
                <span className="text-xs text-muted-foreground">(Default Currency)</span>
              </div>
            )}
            {ledger.person.notes && (
              <div className="flex items-start gap-2">
                <NotePencil size={16} className="text-muted-foreground mt-0.5" />
                <span className="text-sm">{ledger.person.notes}</span>
              </div>
            )}
            {!ledger.person.phone && !ledger.person.email && !ledger.person.notes && (
              <p className="text-sm text-muted-foreground italic">No additional information</p>
            )}
          </CardContent>
        </Card>

        {/* Current Balance */}
        <Card className={`${
          ledger.balance === 0 ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800' :
          ledger.balance > 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
          'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <CardHeader>
            <CardTitle className="text-lg">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                ledger.balance === 0 ? 'text-muted-foreground' :
                ledger.balance > 0 ? 'text-green-600 dark:text-green-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {ledger.balance === 0 ? 'Settled' : 
                  (ledger.balance > 0 ? '+' : '') + formatCurrency(ledger.balance, ledger.person)
                }
              </div>
              <Badge variant={
                ledger.balance === 0 ? 'outline' :
                ledger.balance > 0 ? 'default' : 'secondary'
              }>
                {ledger.balance === 0 ? 'All Settled' :
                 ledger.balance > 0 ? 'They Owe You' : 'You Owe Them'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Given:</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {formatCurrency(ledger.totalGiven, ledger.person)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Received:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(ledger.totalReceived, ledger.person)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Borrowed:</span>
              <span className="font-medium text-orange-600 dark:text-orange-400">
                {formatCurrency(ledger.totalLent, ledger.person)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Paid:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {formatCurrency(ledger.totalPaid, ledger.person)}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Transactions:</span>
              <span>{ledger.transactions.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt size={20} />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ledger.transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt size={48} className="mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Add your first transaction to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {ledger.transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${getTransactionColor(transaction.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTransactionIcon(transaction.type)}
                          <Badge variant="outline">
                            {transaction.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {transaction.category && (
                            <Badge variant="secondary" className="text-xs">
                              {transaction.category}
                            </Badge>
                          )}
                        </div>
                        
                        {transaction.description && (
                          <p className="text-sm mb-2">{transaction.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {new Date(transaction.date).toLocaleDateString()}
                            {transaction.time && ` at ${transaction.time}`}
                          </span>
                          <span>Currency: {transaction.currency}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {getAmountDisplay(transaction)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTransaction(transaction)}
                            className="h-8 w-8 p-0"
                          >
                            <PencilSimple size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this transaction?')) {
                                onDeleteTransaction(transaction.id);
                              }
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        people={[ledger.person]}
        onAddTransaction={onAddTransaction}
        defaultCurrency={defaultCurrency}
        preselectedPersonId={ledger.person.id}
      />

      {/* Edit Person Dialog */}
      <Dialog open={showEditPerson} onOpenChange={setShowEditPerson}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PencilSimple size={20} />
              Edit Person Information
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={personData.name}
                onChange={(e) => setPersonData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={personData.phone}
                onChange={(e) => setPersonData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={personData.email}
                onChange={(e) => setPersonData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-currency" className="flex items-center gap-2">
                <CurrencyDollar size={16} />
                Preferred Currency *
              </Label>
              <Select 
                value={personData.preferredCurrency} 
                onValueChange={(value) => setPersonData(prev => ({ ...prev, preferredCurrency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CNY', 'PKR', 'BDT', 'SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR'].map(currency => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                ⚠️ Changing currency will affect how all transactions with this person are displayed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                rows={3}
                value={personData.notes}
                onChange={(e) => setPersonData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdatePerson} disabled={!personData.name.trim()} className="flex-1">
                Update
              </Button>
              <Button variant="outline" onClick={() => setShowEditPerson(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}