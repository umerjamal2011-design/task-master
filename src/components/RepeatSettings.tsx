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
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Repeat size={16} className="text-muted-foreground" />
        <Label className="text-sm font-medium">Repeat</Label>
      </div>

      <div className="space-y-3">
        <Select 
          value={repeatType || 'none'} 
          onValueChange={handleRepeatTypeChange}
        >
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="No repeat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No repeat</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>

        {repeatType && repeatType !== null && (
          <>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground flex-shrink-0">Every</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={repeatInterval}
                onChange={(e) => handleIntervalChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-sm"
              />
              <span className="text-sm text-muted-foreground">
                {repeatType === 'daily' && (repeatInterval === 1 ? 'day' : 'days')}
                {repeatType === 'weekly' && (repeatInterval === 1 ? 'week' : 'weeks')}
                {repeatType === 'monthly' && (repeatInterval === 1 ? 'month' : 'months')}
                {repeatType === 'yearly' && (repeatInterval === 1 ? 'year' : 'years')}
              </span>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">End repeat (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={repeatEndDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="flex-1 text-sm"
                  placeholder="Never"
                />
                {repeatEndDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEndDateChange('')}
                    className="h-9 w-9 p-0 flex-shrink-0"
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground p-2 bg-secondary/30 rounded-md">
              {getRepeatLabel()}
              {repeatEndDate && ` until ${new Date(repeatEndDate).toLocaleDateString()}`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}