import React from 'react';
import { Task } from '@/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Repeat, X } from '@phosphor-icons/react';

interface RepeatSettingsProps {
  task?: Partial<Task>;
  onRepeatChange: (repeatSettings: {
    repeatType: Task['repeatType'];
    repeatInterval: number;
    repeatEndDate?: string;
  }) => void;
  className?: string;
}

export function RepeatSettings({ task, onRepeatChange, className }: RepeatSettingsProps) {
  const repeatType = task?.repeatType || null;
  const repeatInterval = task?.repeatInterval || 1;
  const repeatEndDate = task?.repeatEndDate || '';

  const handleRepeatTypeChange = (type: string) => {
    const newType = type === 'none' ? null : type as Task['repeatType'];
    onRepeatChange({
      repeatType: newType,
      repeatInterval: repeatInterval,
      repeatEndDate: newType ? repeatEndDate : undefined
    });
  };

  const handleIntervalChange = (interval: number) => {
    onRepeatChange({
      repeatType: repeatType,
      repeatInterval: interval,
      repeatEndDate: repeatEndDate
    });
  };

  const handleEndDateChange = (endDate: string) => {
    onRepeatChange({
      repeatType: repeatType,
      repeatInterval: repeatInterval,
      repeatEndDate: endDate || undefined
    });
  };

  const getRepeatLabel = () => {
    if (!repeatType || repeatType === null) return 'No repeat';
    
    const intervalText = repeatInterval === 1 ? '' : `every ${repeatInterval} `;
    const typeText = {
      daily: `${intervalText}day${repeatInterval > 1 ? 's' : ''}`,
      weekly: `${intervalText}week${repeatInterval > 1 ? 's' : ''}`,
      monthly: `${intervalText}month${repeatInterval > 1 ? 's' : ''}`,
      yearly: `${intervalText}year${repeatInterval > 1 ? 's' : ''}`
    };

    return `Repeat ${typeText[repeatType]}`;
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Compact header with repeat toggle */}
      <div className="flex items-center gap-1.5">
        <Repeat size={12} className="text-muted-foreground" />
        <Select 
          value={repeatType || 'none'} 
          onValueChange={handleRepeatTypeChange}
        >
          <SelectTrigger className="text-xs h-6 w-24">
            <SelectValue placeholder="No repeat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>

        {/* Interval setting - inline when repeat is enabled */}
        {repeatType && repeatType !== null && (
          <>
            <span className="text-xs text-muted-foreground">every</span>
            <Input
              type="number"
              min={1}
              max={365}
              value={repeatInterval}
              onChange={(e) => handleIntervalChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-10 text-xs h-6 px-1 text-center"
            />
            <span className="text-xs text-muted-foreground">
              {repeatType === 'daily' && (repeatInterval === 1 ? 'd' : 'days')}
              {repeatType === 'weekly' && (repeatInterval === 1 ? 'w' : 'wks')}
              {repeatType === 'monthly' && (repeatInterval === 1 ? 'm' : 'mos')}
              {repeatType === 'yearly' && (repeatInterval === 1 ? 'y' : 'yrs')}
            </span>
          </>
        )}
      </div>

      {/* End date - compact format */}
      {repeatType && repeatType !== null && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground text-xs">until:</span>
          <Input
            type="date"
            value={repeatEndDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="flex-1 text-xs h-6"
            placeholder="Never"
          />
          {repeatEndDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEndDateChange('')}
              className="h-6 w-6 p-0 flex-shrink-0"
              title="Remove end date"
            >
              <X size={10} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}