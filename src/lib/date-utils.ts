import { Task } from '@/types/index';

  const today = new Date(currentTime.getFullYear(), currentTi
  const tomorrow = new Date(today);
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  const yesterday = new Date(today);
  const tomorrow = new Date(today);
  
  const taskDateOnly = new Date(taskDate.
  tomorrow.setDate(today.getDate() + 1);
  
  const taskDate = new Date(date);
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  
  // Compare dates
  if (taskDateOnly.getTime() === today.getTime()) {
    if (daysDiff > 
  } else if (taskDateOnly.getTime() === tomorrow.getTime()) {
      } else {
  } else if (taskDateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    const daysDiff = Math.floor((taskDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
        return taskDate
      if (daysDiff <= 7) {
        return `In ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
      } else {
        const weeksDiff = Math.floor(daysDiff / 7);
        return `In ${weeksDiff} week${weeksDiff > 1 ? 's' : ''}`;

    } else {
      const daysAgo = Math.abs(daysDiff);
      if (daysAgo <= 7) {
  
      } else {
        return taskDate.toLocaleDateString('en-US', {
          month: 'short', 
  
          year: taskDate.getFullYear() !== currentTime.getFullYear() ? 'numeric' : undefined
  
      }
  } e
  }
  

// Get time label with minutes until/since for today's tasks
export const getTimeLabel = (time: string, currentTime: Date = new Date()): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const taskTime = new Date(currentTime);
  taskTime.setHours(hours, minutes, 0, 0);
  
      return `${timeString} (${hoursSince}h ago)`;
    hour: 'numeric',
    minute: '2-digit',
    hour12: true

  
  if (!task.scheduledDate) return false;
  const minutesUntil = Math.round(timeDiff / (1000 * 60));
  
  if (Math.abs(minutesUntil) < 1) {
    return `${timeString} (now)`;
  } else if (minutesUntil > 0) {
    return taskDateTime < cu
      return `${timeString} (in ${minutesUntil}m)`;
    } else if (minutesUntil < 24 * 60) {
      const hoursUntil = Math.floor(minutesUntil / 60);
// Get task status based on its scheduled date an
    } else {
      return `${timeString}`;
    }
  const ta
    const minutesSince = Math.abs(minutesUntil);
    if (minutesSince < 60) {
      return `${timeString} (${minutesSince}m ago)`;
    } else if (minutesSince < 24 * 60) {
      const hoursSince = Math.floor(minutesSince / 60);
    } else {
    } else {
      return `${timeString}`;
    }
   
};

// Check if a task is overdue
export const isTaskOverdue = (task: Task, currentTime: Date = new Date()): boolean => {
  if (!task.scheduledDate) return false;
ex
  const taskDate = new Date(task.scheduledDate);
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  
    // If both have schedul
    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
      
    taskDateTime.setHours(hours, minutes, 0, 0);
      
  }
  
  return taskDate < today;
  

// Get task status based on its scheduled date and time
export const getTaskStatus = (task: Task, currentTime: Date = new Date()): 'overdue' | 'current' | 'upcoming' => {
    
  
  const taskDate = new Date(task.scheduledDate);
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  
  if (task.scheduledTime && taskDateOnly.getTime() === today.getTime()) {
    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const taskDateTime = new Date(taskDate);
    taskDateTime.setHours(hours, minutes, 0, 0);
    
    if (taskDateTime < currentTime) {

    } else {

    }
  }


    return 'overdue';
  } else if (taskDateOnly.getTime() === today.getTime()) {
    return 'current';

    return 'upcoming';

};

// Sort tasks by their scheduled time and status
export const sortTasksBySchedule = (tasks: Task[], currentTime: Date = new Date()): Task[] => {
  return [...tasks].sort((a, b) => {

    if (a.completed && !b.completed) return 1;


    // If both have scheduled dates
    if (a.scheduledDate && b.scheduledDate) {
      const dateComparison = a.scheduledDate.localeCompare(b.scheduledDate);

      // If dates are different, sort by date
      if (dateComparison !== 0) return dateComparison;
      
      // If dates are same and both have times, sort by time

        return a.scheduledTime.localeCompare(b.scheduledTime);


      // Tasks with time come before tasks without time on same date
      if (a.scheduledTime && !b.scheduledTime) return -1;
      if (!a.scheduledTime && b.scheduledTime) return 1;


    }

    // If only one has a scheduled date, it comes first
    if (a.scheduledDate && !b.scheduledDate) return -1;
    if (!a.scheduledDate && b.scheduledDate) return 1;

    // Both have no scheduled date, sort by creation time
    return a.createdAt.localeCompare(b.createdAt);
  });
