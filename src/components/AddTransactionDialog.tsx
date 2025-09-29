import React, { useState } from 'react';
import { Person, Transaction } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from '@phosphor-icons/react';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: Person[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  defaultCurrency?: string;
  preselectedPersonId?: string;
}

export function AddTransactionDialog({ 
  open, 
  onOpenChange, 
  people, 
  onAddTransaction, 
  defaultCurrency = 'USD',
  preselectedPersonId 
}: AddTransactionDialogProps) {
  const [formData, setFormData] = useState({
    personId: preselectedPersonId || '',
    type: 'loan_given' as Transaction['type'],
    amount: '',
    currency: defaultCurrency,
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    category: ''
  });

  // Get selected person's preferred currency
  const selectedPerson = people.find(p => p.id === formData.personId);
  const personCurrency = selectedPerson?.preferredCurrency || defaultCurrency;

  React.useEffect(() => {
    if (preselectedPersonId) {
      setFormData(prev => ({ ...prev, personId: preselectedPersonId }));
    }
  }, [preselectedPersonId]);

  // Update currency when person changes
  React.useEffect(() => {
    if (selectedPerson) {
      setFormData(prev => ({ ...prev, currency: selectedPerson.preferredCurrency }));
    }
  }, [selectedPerson]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.personId || !formData.amount || parseFloat(formData.amount) <= 0) return;

    onAddTransaction({
      personId: formData.personId,
      type: formData.type,
      amount: parseFloat(formData.amount),
      currency: personCurrency, // Use person's preferred currency
      description: formData.description.trim() || undefined,
      date: formData.date,
      time: formData.time || undefined,
      category: formData.category.trim() || undefined
    });

    // Reset form using person's currency for new transactions
    const resetCurrency = selectedPerson?.preferredCurrency || defaultCurrency;
    setFormData({
      personId: preselectedPersonId || '',
      type: 'loan_given',
      amount: '',
      currency: resetCurrency,
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      category: ''
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    const selectedPerson = people.find(p => p.id === (preselectedPersonId || ''));
    const resetCurrency = selectedPerson?.preferredCurrency || defaultCurrency;
    
    setFormData({
      personId: preselectedPersonId || '',
      type: 'loan_given',
      amount: '',
      currency: resetCurrency,
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      category: ''
    });
    onOpenChange(false);
  };

  const transactionTypes = [
    { value: 'loan_given', label: 'Loan Given (You lent money)', color: 'text-red-600' },
    { value: 'payment_received', label: 'Payment Received (They paid you back)', color: 'text-green-600' },
    { value: 'loan_taken', label: 'Loan Taken (You borrowed money)', color: 'text-orange-600' },
    { value: 'payment_made', label: 'Payment Made (You paid them back)', color: 'text-blue-600' },
    { value: 'other', label: 'Other Transaction', color: 'text-gray-600' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={20} />
            Add Transaction
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="person">Person *</Label>
            <Select value={formData.personId} onValueChange={(value) => setFormData(prev => ({ ...prev, personId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a person" />
              </SelectTrigger>
              <SelectContent>
                {people.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Transaction['type'] }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className={type.color}>{type.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <div className="h-10 px-3 py-2 bg-muted border border-input rounded-md flex items-center text-sm">
                <span className="font-medium text-foreground">
                  {personCurrency}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({selectedPerson?.name}'s currency)
                </span>
              </div>
              {!selectedPerson && (
                <p className="text-xs text-muted-foreground">
                  Select a person to see their currency
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Food, Travel, Business"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add details about this transaction"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={!formData.personId || !formData.amount || parseFloat(formData.amount) <= 0} 
              className="flex-1"
            >
              Add Transaction
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}