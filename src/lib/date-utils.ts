import { Task } from '@/types/index';

// Get relative date labels based on current time
export const getRelativeDateLabel = (date: string, currentTime: Date = new Date()): string => {
  if (!date) return '';
  
  const taskDate = new Date(date + 'T00:00:00'); // Ensure consistent parsing
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  
  // Compare dates
  if (taskDateOnly.getTime() === today.getTime()) {
    return 'Today';
  } else if (taskDateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else if (taskDateOnly.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else if (taskDateOnly < today) {
    // Past dates
    const daysDiff = Math.floor((today.getTime() - taskDateOnly.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      return `${daysDiff} day${daysDiff > 1 ? 's' : ''} ago`;
    } else if (daysDiff <= 30) {
      const weeksDiff = Math.floor(daysDiff / 7);
      return `${weeksDiff} week${weeksDiff > 1 ? 's' : ''} ago`;
    } else {
      return taskDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: taskDate.getFullYear() !== currentTime.getFullYear() ? 'numeric' : undefined
      });
    }
  } else {
    // Future dates
    const daysDiff = Math.floor((taskDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      return `In ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
    } else if (daysDiff <= 30) {
      const weeksDiff = Math.floor(daysDiff / 7);
      return `In ${weeksDiff} week${weeksDiff > 1 ? 's' : ''}`;
    } else {
      return taskDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: taskDate.getFullYear() !== currentTime.getFullYear() ? 'numeric' : undefined
      });
    }
  }
};

// Get time label with relative context
export const getRelativeTimeLabel = (time: string, date: string, currentTime: Date = new Date()): string => {
  if (!time || !date) return time || '';
  
  const taskDateTime = new Date(`${date}T${time}`);
  const now = currentTime;
  
  // Format time in user's preferred format
  const timeString = taskDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDateOnly = new Date(taskDateTime.getFullYear(), taskDateTime.getMonth(), taskDateTime.getDate());
  
  if (taskDateOnly.getTime() === today.getTime()) {
    // Today - show if it's passed or upcoming
    if (taskDateTime < now) {
      return `${timeString} (passed)`;
    } else {
      const minutesUntil = Math.floor((taskDateTime.getTime() - now.getTime()) / (1000 * 60));
      if (minutesUntil < 60) {
        return `${timeString} (in ${minutesUntil}m)`;
      } else if (minutesUntil < 120) {
        return `${timeString} (in 1h)`;
      } else {
        const hoursUntil = Math.floor(minutesUntil / 60);
        return `${timeString} (in ${hoursUntil}h)`;
      }
    }
  }
  
  return timeString;
};

// Check if a task is overdue
export const isTaskOverdue = (task: Task, currentTime: Date = new Date()): boolean => {
  if (!task.scheduledDate || task.completed) return false;
  
  const taskDate = new Date(task.scheduledDate + 'T00:00:00');
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  
  // If task has a specific time
  if (task.scheduledTime) {
    const taskDateTime = new Date(`${task.scheduledDate}T${task.scheduledTime}`);
    return taskDateTime < currentTime;
  }
  
  // If task only has a date, consider it overdue if the date has passed
  return taskDate < today;
};

// Get task status based on current time
export const getTaskStatus = (task: Task, currentTime: Date = new Date()): 'upcoming' | 'current' | 'overdue' | 'completed' => {
  if (task.completed) return 'completed';
  
  if (!task.scheduledDate) return 'upcoming';
  
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  const taskDate = new Date(task.scheduledDate + 'T00:00:00');
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  
  if (task.scheduledTime) {
    const taskDateTime = new Date(`${task.scheduledDate}T${task.scheduledTime}`);
    
    if (taskDateTime < currentTime) {
      return 'overdue';
    } else if (taskDateOnly.getTime() === today.getTime()) {
      // Today but not yet time
      return 'current';
    } else {
      return 'upcoming';
    }
  }
  
  if (taskDateOnly < today) {
    return 'overdue';
  } else if (taskDateOnly.getTime() === today.getTime()) {
    return 'current';
  } else {
    return 'upcoming';
  }
};

// Sort tasks by their scheduled time and status
export const sortTasksBySchedule = (tasks: Task[], currentTime: Date = new Date()): Task[] => {
  return [...tasks].sort((a, b) => {
    // Completed tasks go to the end
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // If both have scheduled dates
    if (a.scheduledDate && b.scheduledDate) {
      const dateComparison = a.scheduledDate.localeCompare(b.scheduledDate);
      if (dateComparison !== 0) return dateComparison;
      
      // If same date, sort by time
      if (a.scheduledTime && b.scheduledTime) {
        return a.scheduledTime.localeCompare(b.scheduledTime);
      }
      
      // Tasks with time come before tasks without time on same date
      if (a.scheduledTime && !b.scheduledTime) return -1;
      if (!a.scheduledTime && b.scheduledTime) return 1;
    }
    
    // If only one has a scheduled date, it comes first
    if (a.scheduledDate && !b.scheduledDate) return -1;
    if (!a.scheduledDate && b.scheduledDate) return 1;
    
    // Fall back to creation date
    return a.createdAt.localeCompare(b.createdAt);
  });
};