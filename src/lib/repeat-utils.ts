import { Task } from '@/types';

/**
 * Calculate if a repeating task should appear on a specific date
 * @param task The original task with repeat settings
 * @param targetDate The date to check (YYYY-MM-DD format)
 * @returns boolean - whether the task should appear on this date
 */
export function shouldTaskAppearOnDate(task: Task, targetDate: string): boolean {
  if (!task.repeatType || !task.scheduledDate || task.isRepeatedInstance) {
    return false;
  }

  const taskDate = new Date(task.scheduledDate);
  const checkDate = new Date(targetDate);
  
  // If target date is before task's original date, task shouldn't appear
  if (checkDate < taskDate) {
    return false;
  }

  // If target date is the original date, task should appear
  if (targetDate === task.scheduledDate) {
    return true;
  }

  // If there's an end date and we're past it, task shouldn't appear
  if (task.repeatEndDate && checkDate > new Date(task.repeatEndDate)) {
    return false;
  }

  const daysBetween = Math.floor((checkDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
  const interval = task.repeatInterval || 1;

  switch (task.repeatType) {
    case 'daily':
      return daysBetween % interval === 0;
    
    case 'weekly':
      return daysBetween % (interval * 7) === 0;
    
    case 'monthly': {
      // Calculate months between dates
      const monthsBetween = (checkDate.getFullYear() - taskDate.getFullYear()) * 12 + 
                           (checkDate.getMonth() - taskDate.getMonth());
      
      // Check if it's the right interval and same day of month
      return monthsBetween % interval === 0 && checkDate.getDate() === taskDate.getDate();
    }
    
    case 'yearly': {
      // Calculate years between dates
      const yearsBetween = checkDate.getFullYear() - taskDate.getFullYear();
      
      // Check if it's the right interval, same month and day
      return yearsBetween % interval === 0 && 
             checkDate.getMonth() === taskDate.getMonth() && 
             checkDate.getDate() === taskDate.getDate();
    }
    
    default:
      return false;
  }
}

/**
 * Create a virtual task instance for a specific date
 * @param originalTask The original task with repeat settings
 * @param date The date for this instance (YYYY-MM-DD format)
 * @returns Task - A virtual task instance
 */
export function createVirtualTaskInstance(originalTask: Task, date: string): Task {
  return {
    ...originalTask,
    id: `${originalTask.id}-instance-${date}`,
    scheduledDate: date,
    isRepeatedInstance: true,
    originalTaskId: originalTask.id,
    completed: false, // Each instance starts as incomplete
    completedAt: undefined,
    createdAt: new Date().toISOString()
  };
}

/**
 * Get all tasks that should appear on a specific date, including virtual instances
 * @param tasks All tasks array
 * @param date The date to check (YYYY-MM-DD format)
 * @returns Task[] - Array of tasks (original + virtual instances)
 */
export function getTasksForDate(tasks: Task[], date: string): Task[] {
  const result: Task[] = [];
  
  tasks.forEach(task => {
    // Skip if this is already a repeated instance
    if (task.isRepeatedInstance) {
      return;
    }
    
    // For non-repeating tasks, include if scheduled for this date
    if (!task.repeatType && task.scheduledDate === date) {
      result.push(task);
    }
    
    // For repeating tasks, check if they should appear on this date
    if (task.repeatType && shouldTaskAppearOnDate(task, date)) {
      // If this is the original date, use the original task, otherwise create virtual instance
      if (task.scheduledDate === date) {
        result.push(task);
      } else {
        result.push(createVirtualTaskInstance(task, date));
      }
    }
  });
  
  return result;
}

/**
 * Get upcoming dates where a repeating task will appear
 * @param task The task with repeat settings
 * @param startDate Start date to check from (YYYY-MM-DD format)
 * @param limit Maximum number of dates to return
 * @returns string[] - Array of dates where task will appear
 */
export function getUpcomingDatesForTask(task: Task, startDate: string, limit: number = 10): string[] {
  if (!task.repeatType || !task.scheduledDate) {
    return task.scheduledDate ? [task.scheduledDate] : [];
  }

  const dates: string[] = [];
  const start = new Date(startDate);
  const taskStart = new Date(task.scheduledDate);
  const endDate = task.repeatEndDate ? new Date(task.repeatEndDate) : null;
  
  // Start from the later of startDate or task's original date
  let currentDate = new Date(Math.max(start.getTime(), taskStart.getTime()));
  
  // If we're starting after the task's original date, find the next valid occurrence
  if (currentDate > taskStart && !shouldTaskAppearOnDate(task, currentDate.toISOString().split('T')[0])) {
    const nextOccurrence = getNextOccurrence(task, currentDate);
    if (!nextOccurrence) return [];
    currentDate = nextOccurrence;
  }
  
  while (dates.length < limit && currentDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Stop if we've reached the end date
    if (endDate && currentDate > endDate) {
      break;
    }
    
    // Stop if we're too far in the future (1 year from start)
    const oneYearFromStart = new Date(start);
    oneYearFromStart.setFullYear(oneYearFromStart.getFullYear() + 1);
    if (currentDate > oneYearFromStart) {
      break;
    }
    
    dates.push(dateStr);
    const nextOccurrence = getNextOccurrence(task, currentDate);
    if (!nextOccurrence) break;
    currentDate = nextOccurrence;
  }
  
  return dates;
}

/**
 * Get the next occurrence of a repeating task after a given date
 * @param task The task with repeat settings
 * @param fromDate The date to find next occurrence from
 * @returns Date | null - The next occurrence date or null if no more
 */
function getNextOccurrence(task: Task, fromDate: Date): Date | null {
  if (!task.repeatType || !task.scheduledDate) {
    return null;
  }

  const interval = task.repeatInterval || 1;
  const nextDate = new Date(fromDate);

  switch (task.repeatType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (interval * 7));
      break;
    
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
    
    default:
      return null;
  }

  return nextDate;
}

/**
 * Check if a task is a repeating task (has repeat settings)
 * @param task The task to check
 * @returns boolean
 */
export function isRepeatingTask(task: Task): boolean {
  return !!(task.repeatType && task.scheduledDate && !task.isRepeatedInstance);
}

/**
 * Get the display title for a task instance
 * @param task The task (original or instance)
 * @returns string - The display title
 */
export function getTaskDisplayTitle(task: Task): string {
  if (task.isRepeatedInstance && task.scheduledDate) {
    const date = new Date(task.scheduledDate);
    const dateStr = date.toLocaleDateString();
    return `${task.title} (${dateStr})`;
  }
  
  return task.title;
}