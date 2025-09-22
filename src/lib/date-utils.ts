import { Task } from '@/types/index';

// Get relative date labels based on current time
export const getRelativeDateLabel = (date: string, currentTime: Date = new Date()): string => {
  const taskDate = new Date(date);
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

// Get time label with minutes until/since for today's tasks
export const getTimeLabel = (time: string, currentTime: Date = new Date()): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const taskTime = new Date();
  taskTime.setHours(hours, minutes, 0, 0);
  
  const timeString = taskTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const timeDiff = taskTime.getTime() - currentTime.getTime();
  const minutesUntil = Math.round(timeDiff / (1000 * 60));
  
  if (Math.abs(minutesUntil) < 1) {
    return `${timeString} (now)`;
  } else if (minutesUntil > 0) {
    if (minutesUntil < 60) {
      return `${timeString} (in ${minutesUntil}m)`;
    } else if (minutesUntil < 24 * 60) {
      const hoursUntil = Math.floor(minutesUntil / 60);
      return `${timeString} (in ${hoursUntil}h)`;
    } else {
      return `${timeString}`;
    }
  } else {
    const minutesSince = Math.abs(minutesUntil);
    if (minutesSince < 60) {
      return `${timeString} (${minutesSince}m ago)`;
    } else if (minutesSince < 24 * 60) {
      const hoursSince = Math.floor(minutesSince / 60);
      return `${timeString} (${hoursSince}h ago)`;
    } else {
      return `${timeString}`;
    }
  }
};

// Check if a task is overdue
export const isTaskOverdue = (task: Task, currentTime: Date = new Date()): boolean => {
  if (!task.scheduledDate) return false;
  const taskDate = new Date(task.scheduledDate);
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  
  if (task.scheduledTime) {
    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const taskDateTime = new Date(taskDate);
    taskDateTime.setHours(hours, minutes, 0, 0);
    return taskDateTime < currentTime;
  }
  
  return taskDate < today;
};

// Get task status based on its scheduled date and time
export const getTaskStatus = (task: Task, currentTime: Date = new Date()): 'overdue' | 'current' | 'upcoming' => {
  if (!task.scheduledDate) return 'upcoming';
  
  const taskDate = new Date(task.scheduledDate);
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  
  if (task.scheduledTime && taskDateOnly.getTime() === today.getTime()) {
    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const taskDateTime = new Date(taskDate);
    taskDateTime.setHours(hours, minutes, 0, 0);
    
    if (taskDateTime < currentTime) {
      return 'overdue';
    } else if (taskDateOnly.getTime() === today.getTime()) {
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