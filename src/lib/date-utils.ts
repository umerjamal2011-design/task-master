import { Task } from '@/types/index';

  const taskDate = new Date(date);
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.g
  const yesterday = new Date(today
  
  tomorrow.setDate(today.getDate() + 1);
  
  } else if (taskDateOnly.getTime() 
  } else if (taskDateOnly.getTime() === t
  
    if (daysAgo > 0 && daysAgo <= 7
    } else if (daysAgo < 0 && Math.abs(d
  
        weekday: 'short',
        day: 'numer
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
  
};

// Get a human-readable time label for a task
export const getTimeLabel = (date: string, time: string, currentTime: Date = new Date()): string => {
  const taskDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  const taskDateTime = new Date(taskDate);
    if (minutesSince < 60) {
  
  const timeString = taskDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
      return `${timeSt
    hour12: true
  
  
  const minutesUntil = Math.floor((taskDateTime.getTime() - currentTime.getTime()) / (1000 * 60));
  
  if (minutesUntil > 0) {
    if (minutesUntil < 60) {
  const today = new Date(currentTime.getFullYear(),
    } else if (minutesUntil < 24 * 60) {
      const hoursUntil = Math.floor(minutesUntil / 60);
      return `${timeString} (in ${hoursUntil}h)`;
    const ta
      return `${timeString}`;
    r
  } else if (minutesUntil < 0) {
  return taskDateOnly < today;
    if (minutesSince < 60) {
    // Completed tasks go to the end
    if (!a.completed && b.completed) ret
    // Sort by scheduled date first
      const dateComparison = a.scheduledDate.local
      if (da
      // If dates are same an
     

  

  

    if (!a.scheduledDate && b
    // Both have no scheduled date, sort by creation time
  });

















































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