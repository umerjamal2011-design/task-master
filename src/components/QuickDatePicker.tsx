import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Sun, ClockCounterClockwise, CircleDashed } from '@phosphor-icons/react';

interface QuickDatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  className?: string;
}

export function QuickDatePicker({ selectedDate, onDateChange, className }: QuickDatePickerProps) {
  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextWeekend = () => {
    const now = new Date();
    const daysUntilSaturday = 6 - now.getDay(); // 0 = Sunday, 6 = Saturday
    const saturday = new Date();
    saturday.setDate(now.getDate() + daysUntilSaturday);
    return saturday.toISOString().split('T')[0];
  };

  const getNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  const getNextMonth = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getSelectedLabel = () => {
    if (!selectedDate) return 'No Date';
    
    const today = getToday();
    const tomorrow = getTomorrow();
    const nextWeekend = getNextWeekend();
    const nextWeek = getNextWeek();
    
    if (selectedDate === today) return 'Today';
    if (selectedDate === tomorrow) return 'Tomorrow';
    if (selectedDate === nextWeekend) return 'Next Weekend';
    if (selectedDate === nextWeek) return 'Next Week';
    
    return formatDateDisplay(selectedDate);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Dropdown Quick Date Options */}
      <Select value={selectedDate} onValueChange={onDateChange}>
        <SelectTrigger className="text-xs h-6">
          <SelectValue>
            {getSelectedLabel()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={getToday()}>
            Today - {formatDateDisplay(getToday())}
          </SelectItem>
          <SelectItem value={getTomorrow()}>
            Tomorrow - {formatDateDisplay(getTomorrow())}
          </SelectItem>
          <SelectItem value={getNextWeek()}>
            Next Week - {formatDateDisplay(getNextWeek())}
          </SelectItem>
          <SelectItem value={getNextWeekend()}>
            Next Weekend - {formatDateDisplay(getNextWeekend())}
          </SelectItem>
          <SelectItem value={getNextMonth()}>
            Next Month - {formatDateDisplay(getNextMonth())}
          </SelectItem>
          <SelectItem value="">
            No Date
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Date Picker - more compact */}
      <Input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-full text-foreground text-xs h-6"
        placeholder="Pick date"
      />
    </div>
  );
}