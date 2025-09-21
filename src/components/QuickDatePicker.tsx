import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const quickOptions = [
    {
      id: 'today',
      label: 'Today',
      sublabel: 'Sun',
      icon: Calendar,
      value: getToday()
    },
    {
      id: 'tomorrow',
      label: 'Tomorrow',
      sublabel: 'Mon',
      icon: Sun,
      value: getTomorrow()
    },
    {
      id: 'weekend',
      label: 'Next weekend',
      sublabel: formatDateDisplay(getNextWeekend()),
      icon: ClockCounterClockwise,
      value: getNextWeekend()
    },
    {
      id: 'no-date',
      label: 'No Date',
      sublabel: '',
      icon: CircleDashed,
      value: ''
    }
  ];

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Compact Quick Date Options */}
      <div className="flex flex-wrap gap-1">
        {quickOptions.slice(0, 2).map((option) => { // Only show Today/Tomorrow
          const Icon = option.icon;
          const isSelected = selectedDate === option.value;
          
          return (
            <Button
              key={option.id}
              variant="ghost"
              size="sm"
              onClick={() => onDateChange(option.value)}
              className={`h-6 px-2 text-xs ${
                isSelected 
                  ? 'bg-primary/15 border-primary/30 text-primary border' 
                  : 'hover:bg-secondary/50'
              }`}
            >
              <Icon size={10} className="mr-1" />
              {option.label}
            </Button>
          );
        })}
        {/* Compact No Date button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange('')}
          className={`h-6 px-2 text-xs ${
            selectedDate === '' 
              ? 'bg-primary/15 border-primary/30 text-primary border' 
              : 'hover:bg-secondary/50'
          }`}
        >
          <CircleDashed size={10} className="mr-1" />
          Clear
        </Button>
      </div>

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