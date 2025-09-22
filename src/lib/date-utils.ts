import { Task } from '@/types/index';

// Get relative date labels based on current time
export const getRelativeDateLabel = (date: string, currentTime: Date = new Date()): string => {
  const yesterday = new
  
  
  
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
    hour: 'numeric',
    hour12: true
  
  const t
  if 
    if (ta
    } else {
      if (minutesUntil < 60) {
      } else if (minutes
      } else {
        return `${timeString} (i
    }
  
};
// Check if a task is overdue
  if (!task.scheduledDat
  const taskDate = new 
  
  if (tas
    r
  
  

export const getTaskStatus = (task: Tas
  
  
  
  
    const taskDateTime = n
  
    } else if (taskDateOnly.getTime() === t
      return 'current';
      return 'upcomi
  }
  if (taskDateOn
  } e
  
  }

ex
    // Completed tasks go to the end
    if (!a.completed && b.completed) return -1
    // If both have scheduled
      const dateComparison = a.schedul
      
      if (a.scheduledTime && b.scheduledTime) {
      }
      // Tasks with time come before tasks without ti
      if (!a.scheduledTime && b.schedu
    
    if (a.sche
    
    return a.createdAt.localeCompare(b.createdAt);
};










































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