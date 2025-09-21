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
    <div className={`space-y-3 ${className}`}>
      {/* Quick Date Options */}
      <div className="space-y-2">
        {quickOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedDate === option.value;
          
          return (
            <Button
              key={option.id}
              variant="ghost"
              onClick={() => onDateChange(option.value)}
              className={`w-full justify-between p-3 h-auto text-left ${
                isSelected 
                  ? 'bg-primary/15 border-primary/30 text-primary' 
                  : 'hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className="flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  {option.sublabel && (
                    <div className="text-xs text-muted-foreground">{option.sublabel}</div>
                  )}
                </div>
              </div>
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Custom Date Picker */}
      <div className="pt-2 border-t border-border">
        <label className="text-sm font-medium text-muted-foreground block mb-2">
          Custom Date
        </label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full text-foreground"
        />
      </div>
    </div>
  );
}