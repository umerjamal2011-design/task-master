import { Task } from '@/types/index';

// Get a human-readable date label for a task
export const getDateLabel = (date: string, currentTime: Date = new Date()): string => {
  const taskDate = new Date(date);
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  const yesterday = new Date(today);
  const tomorrow = new Date(today);
  
  yesterday.setDate(today.getDate() - 1);
  tomorrow.setDate(today.getDate() + 1);
  
  if (taskDateOnly.getTime() === today.getTime()) {
    return 'Today';
  } else if (taskDateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else if (taskDateOnly.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    const daysAgo = Math.floor((today.getTime() - taskDateOnly.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo > 0 && daysAgo <= 7) {
      return `${daysAgo} days ago`;
    } else if (daysAgo < 0 && Math.abs(daysAgo) <= 7) {
      return `In ${Math.abs(daysAgo)} days`;
    } else {
      return taskDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: taskDate.getFullYear() !== currentTime.getFullYear() ? 'numeric' : undefined
      });
    }
  }
};

// Get a human-readable time label for a task
export const getTimeLabel = (date: string, time: string, currentTime: Date = new Date()): string => {
  const taskDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  const taskDateTime = new Date(taskDate);
  taskDateTime.setHours(hours, minutes, 0, 0);
  
  const timeString = taskDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const minutesUntil = Math.floor((taskDateTime.getTime() - currentTime.getTime()) / (1000 * 60));
  
  if (minutesUntil > 0) {
    if (minutesUntil < 60) {
      return `${timeString} (in ${minutesUntil}m)`;
    } else if (minutesUntil < 24 * 60) {
      const hoursUntil = Math.floor(minutesUntil / 60);
      return `${timeString} (in ${hoursUntil}h)`;
    } else {
      return `${timeString}`;
    }
  } else if (minutesUntil < 0) {
    const minutesSince = Math.abs(minutesUntil);
    if (minutesSince < 60) {
      return `${timeString} (${minutesSince}m ago)`;
    } else if (minutesSince < 24 * 60) {
      const hoursSince = Math.floor(minutesSince / 60);
      return `${timeString} (${hoursSince}h ago)`;
    } else {
      return `${timeString}`;
    }
  } else {
    return `${timeString} (now)`;
  }
};

// Check if a task date is overdue (past today)
export const isTaskOverdue = (date: string, currentTime: Date = new Date()): boolean => {
  const taskDate = new Date(date);
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  
  return taskDateOnly < today;
};

// Get task status for visual feedback
export const getTaskStatus = (task: Task, currentTime: Date = new Date()): 'completed' | 'overdue' | 'upcoming' | 'current' => {
  if (task.completed) return 'completed';
  
  if (!task.scheduledDate) return 'current';
  
  const isOverdue = isTaskOverdue(task.scheduledDate, currentTime);
  if (isOverdue) return 'overdue';
  
  const taskDate = new Date(task.scheduledDate);
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  
  if (taskDateOnly.getTime() === today.getTime()) {
    return 'current';
  } else {
    return 'upcoming';
  }
};

// Sort tasks for daily view
export const sortTasksForDailyView = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // Completed tasks go to the end
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;

    // Sort by scheduled date first
    if (a.scheduledDate && b.scheduledDate) {
      const dateComparison = a.scheduledDate.localeCompare(b.scheduledDate);
      
      if (dateComparison !== 0) return dateComparison;

      // If dates are same and both have times, sort by time
      if (a.scheduledTime && b.scheduledTime) {
        return a.scheduledTime.localeCompare(b.scheduledTime);
      }

      // Tasks with time come before tasks without time on same date
      if (a.scheduledTime && !b.scheduledTime) return -1;
      if (!a.scheduledTime && b.scheduledTime) return 1;

      return 0;
    }

    // If only one has a scheduled date, it comes first
    if (a.scheduledDate && !b.scheduledDate) return -1;
    if (!a.scheduledDate && b.scheduledDate) return 1;

    // Both have no scheduled date, sort by creation time
    return a.createdAt.localeCompare(b.createdAt);
  });
};