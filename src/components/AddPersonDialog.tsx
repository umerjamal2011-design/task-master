import React, { useState } from 'react';
import { Person } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, CurrencyDollar } from '@phosphor-icons/react';

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPerson: (person: Omit<Person, 'id' | 'createdAt'>) => void;
  defaultCurrency?: string;
}

export function AddPersonDialog({ open, onOpenChange, onAddPerson, defaultCurrency = 'USD' }: AddPersonDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    preferredCurrency: defaultCurrency
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    onAddPerson({
      name: formData.name.trim(),
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      preferredCurrency: formData.preferredCurrency
    });

    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      notes: '',
      preferredCurrency: defaultCurrency
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      notes: '',
      preferredCurrency: defaultCurrency
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={20} />
            Add New Person
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter person's name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="flex items-center gap-2">
              <CurrencyDollar size={16} />
              Preferred Currency *
            </Label>
            <Select value={formData.preferredCurrency} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredCurrency: value }))}>
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
              All transactions with this person will be in this currency
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this person"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={!formData.name.trim()} className="flex-1">
              Add Person
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