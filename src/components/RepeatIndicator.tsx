import React from 'react';
import { Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Repeat, Calendar } from '@phosphor-icons/react';
import { isRepeatingTask, getUpcomingDatesForTask } from '@/lib/repeat-utils';

interface RepeatIndicatorProps {
  task: Task;
  className?: string;
}

export function RepeatIndicator({ task, className = '' }: RepeatIndicatorProps) {
  if (!isRepeatingTask(task)) {
    return null;
  }

  const getRepeatText = (task: Task) => {
    if (!task.repeatType) return '';
    
    const interval = task.repeatInterval || 1;
    const intervalText = interval === 1 ? '' : ` ${interval}`;
    
    switch (task.repeatType) {
      case 'daily':
        return interval === 1 ? 'Daily' : `Every ${interval} days`;
      case 'weekly':
        return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
      case 'monthly':
        return interval === 1 ? 'Monthly' : `Every ${interval} months`;
      case 'yearly':
        return interval === 1 ? 'Yearly' : `Every ${interval} years`;
      default:
        return '';
    }
  };

  const nextOccurrences = getUpcomingDatesForTask(task, new Date().toISOString().split('T')[0], 3);
  const upcomingText = nextOccurrences.length > 0 ? 
    `Next: ${nextOccurrences.slice(0, 2).map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).join(', ')}` : 
    '';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Badge 
        variant="outline" 
        className="text-xs flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
        title={upcomingText}
      >
        <Repeat size={10} />
        {getRepeatText(task)}
      </Badge>
      {task.repeatEndDate && (
        <Badge 
          variant="outline" 
          className="text-xs flex items-center gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
          title={`Ends ${new Date(task.repeatEndDate).toLocaleDateString()}`}
        >
          <Calendar size={10} />
          Until {new Date(task.repeatEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Badge>
      )}
    </div>
  );
}