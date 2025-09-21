import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [basedOn, setBasedOn] = useState<'scheduled' | 'completed'>('scheduled');
  const [customInterval, setCustomInterval] = useState(repeatInterval);
  const [customUnit, setCustomUnit] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(repeatType || 'daily');
  const [endType, setEndType] = useState<'never' | 'date'>(repeatEndDate ? 'date' : 'never');
  const [endDate, setEndDate] = useState(repeatEndDate);

  // Initialize custom settings when task changes
  useEffect(() => {
    setCustomInterval(repeatInterval);
    setCustomUnit(repeatType || 'daily');
    setEndType(repeatEndDate ? 'date' : 'never');
    setEndDate(repeatEndDate);
  }, [repeatInterval, repeatType, repeatEndDate]);

  const handleRepeatTypeChange = (type: string) => {
    if (type === 'custom') {
      setShowCustomSettings(true);
      return;
    }
    
    const newType = type === 'none' ? null : type as Task['repeatType'];
    setShowCustomSettings(false);
    onRepeatChange({
      repeatType: newType,
      repeatInterval: repeatInterval,
      repeatEndDate: newType ? repeatEndDate : undefined
    });
  };

  const handleCustomRepeatApply = () => {
    onRepeatChange({
      repeatType: customUnit,
      repeatInterval: customInterval,
      repeatEndDate: endType === 'date' ? endDate : undefined
    });
    setShowCustomSettings(false);
  };

  const handleCustomRepeatCancel = () => {
    setShowCustomSettings(false);
    // Reset custom settings to current values
    setCustomInterval(repeatInterval);
    setCustomUnit(repeatType || 'daily');
    setEndType(repeatEndDate ? 'date' : 'never');
    setEndDate(repeatEndDate);
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
      {!showCustomSettings ? (
        <>
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
                <SelectItem value="custom">Custom...</SelectItem>
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
        </>
      ) : (
        /* Custom Repeat Settings Panel */
        <div className="space-y-3 p-3 border rounded-lg bg-secondary/20">
          <div className="flex items-center gap-2 mb-2">
            <Repeat size={12} className="text-muted-foreground" />
            <span className="text-xs font-medium">Custom Repeat</span>
          </div>
          
          {/* Based on */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Based on</Label>
            <RadioGroup value={basedOn} onValueChange={(value: 'scheduled' | 'completed') => setBasedOn(value)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="scheduled" id="scheduled" className="h-3 w-3" />
                <Label htmlFor="scheduled" className="text-xs">Scheduled date</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="completed" className="h-3 w-3" />
                <Label htmlFor="completed" className="text-xs">Completed date</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Every */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Every</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={365}
                value={customInterval}
                onChange={(e) => setCustomInterval(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-xs h-6 px-2 text-center"
              />
              <Select value={customUnit} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setCustomUnit(value)}>
                <SelectTrigger className="text-xs h-6 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Day</SelectItem>
                  <SelectItem value="weekly">Week</SelectItem>
                  <SelectItem value="monthly">Month</SelectItem>
                  <SelectItem value="yearly">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Ends */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Ends</Label>
            <RadioGroup value={endType} onValueChange={(value: 'never' | 'date') => setEndType(value)} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="never" className="h-3 w-3" />
                <Label htmlFor="never" className="text-xs">Never</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="date" id="date" className="h-3 w-3" />
                <Label htmlFor="date" className="text-xs">On date</Label>
              </div>
            </RadioGroup>
            
            {endType === 'date' && (
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs h-6 ml-5"
              />
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCustomRepeatApply} size="sm" className="h-6 text-xs px-3">
              Apply
            </Button>
            <Button onClick={handleCustomRepeatCancel} variant="outline" size="sm" className="h-6 text-xs px-3">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}